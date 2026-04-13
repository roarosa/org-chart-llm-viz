import json

from openai import OpenAI
from sqlalchemy.engine import Connection

from server.config import Settings
from server.db import get_employees, search_employees
from server.types import ChatResponse, Employee, ListView, Message, ModelOutput, SearchPeopleArgs

SYSTEM_PROMPT = """
You are an assistant for an employee directory. You take user questions and response
with a JSON that provides text answers and optionally a helpful visualization.
Use the search_people tool whenever the user asks about employees, people, titles, departments,
locations, managers, or dates. Never invent employee records or counts.
Keep answers concise and grounded in the tool results.
Only respond to the user's original question, do not suggest follow-up questions.

# Output
Output your response as JSON. If the answer to the user involves a set of people, then include
a view object with a list of employee ids and a descriptive title. 

## Requirements
* Only include ids that you have received from the search_people tool
* Include a reasoning string that explains why you gave the answer
* The response will be rendered in a chat without markdown formatting, so only include plain text
* Don't include lists of employees in the text response. Only include aggregate data like the counts
and reference the returned visualzation if relevant.
* The only view type supported is "list". If you return a view then it must include this.

## Format
{
    "response": string, // The text answer to the user's question.
    "reasoning": string, // The reasoning that led you to the answer and view
    "view": null | {
        "type": "list",
        "title": string, // A descriptive title for the view.
        "data": int[], // A list of employee ids.
    },
}
""".strip()

SEARCH_PEOPLE_TOOL = {
    "type": "function",
    "name": "search_people",
    "description": (
        "Search employees by fuzzy full name matching and filter by available employee fields. "
        "You can search by name, email, title, department, manager, location, and start date. If "
        "a filter is not relevant, set it to null instead of an empty value."
    ),
    "parameters": {
        "type": "object",
        "properties": {
            "name_query": {
                "type": ["string", "null"],
                "description": "Fuzzy name search against full_name.",
            },
            "employee_id": {"type": ["integer", "null"]},
            "work_email": {"type": ["string", "null"]},
            "title": {"type": ["string", "null"]},
            "department": {"type": ["string", "null"]},
            "manager_id": {"type": ["integer", "null"]},
            "work_location": {"type": ["string", "null"]},
            "start_date_on_or_after": {
                "type": ["string", "null"],
                "description": "Inclusive ISO date filter in YYYY-MM-DD format.",
            },
            "start_date_on_or_before": {
                "type": "string",
                "description": "Inclusive ISO date filter in YYYY-MM-DD format.",
            },
            "limit": {
                "type": ["integer", "null"],
                "minimum": 1,
                "maximum": 100,
                "description": "Maximum number of employees to return.",
            },
        },
        "required": [],
        "additionalProperties": False,
    },
}


class OpenAIChatService:
    def __init__(self, settings: Settings, connection: Connection):
        if not settings.openai_api_key:
            raise ValueError("OPENAI_API_KEY is required to use /api/chat.")

        self._client = OpenAI(api_key=settings.openai_api_key)
        self._connection = connection
        self._model = settings.openai_model

    def run(self, messages: list[Message]) -> ChatResponse:
        input_items = [self._message_to_input_item(message) for message in messages]

        while True:
            print("Chat loop:\n", input_items)
            request_kwargs = {
                "model": self._model,
                "input": input_items,
                "instructions": SYSTEM_PROMPT,
                "tools": [SEARCH_PEOPLE_TOOL],
            }

            response = self._client.responses.create(**request_kwargs)
            input_items += response.output

            tool_outputs: list[dict[str, str]] = []
            for output_item in response.output:
                if output_item.type != "function_call":
                    continue

                tool_result = self._execute_tool(output_item.name, output_item.arguments)
                tool_outputs.append(
                    {
                        "type": "function_call_output",
                        "call_id": output_item.call_id,
                        "output": tool_result,
                    }
                )

            if not tool_outputs:
                results = None
                try:
                    results = ModelOutput.model_validate_json(response.output_text)
                except json.JSONDecodeError:
                    print(f"Invalid JSON response:\n{response.output_text}")
                    return ChatResponse(
                        response="I failed to process your request. :(",
                        view=None,
                    )

                employees = [
                    Employee(**employee)
                    for employee in get_employees(self._connection, results.view.data)
                ]
                result_view = ListView(type="list", title=results.view.title, data=employees)
                print("Successful model output:\n", json.dumps(results.model_dump(), indent=2))
                return ChatResponse(
                    response=results.response,
                    view=result_view,
                )

            input_items += tool_outputs

    def _message_to_input_item(self, message: Message) -> dict[str, object]:
        content_type = "input_text" if message.role == "user" else "output_text"
        return {
            "type": "message",
            "role": message.role,
            "content": [{"type": content_type, "text": message.content}],
        }

    def _execute_tool(self, tool_name: str, arguments_json: str) -> str:
        if tool_name != "search_people":
            raise ValueError(f"Unsupported tool call: {tool_name}")

        args = SearchPeopleArgs.model_validate_json(arguments_json)
        employees = [
            Employee(**employee)
            for employee in search_employees(
                self._connection,
                name_query=args.name_query,
                employee_id=args.employee_id,
                work_email=args.work_email,
                title=args.title,
                department=args.department,
                manager_id=args.manager_id,
                work_location=args.work_location,
                start_date_on_or_after=args.start_date_on_or_after,
                start_date_on_or_before=args.start_date_on_or_before,
                limit=args.limit,
            )
        ]

        output = json.dumps(
            {
                "count": len(employees),
                "employees": [employee.model_dump() for employee in employees],
            }
        )
        return output
