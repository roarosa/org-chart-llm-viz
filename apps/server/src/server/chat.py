import json

from openai import OpenAI
from sqlalchemy.engine import Connection

from server.config import Settings
from server.db import search_employees
from server.types import ChatResponse, Employee, ListView, Message, SearchPeopleArgs

SYSTEM_PROMPT = """
You are an assistant for an employee directory.
Use the search_people tool whenever the user asks about employees, people, titles, departments,
locations, managers, or dates. Never invent employee records or counts.
Keep answers concise and grounded in the tool results.
Only respond to the user's original question, do not suggest follow-up questions.
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
        latest_view: ListView | None = None
        # previous_response_id: str | None = None

        while True:
            print("~~~~INPUT ITEMS~~~~\n", input_items)
            request_kwargs = {
                "model": self._model,
                "input": input_items,
                "instructions": SYSTEM_PROMPT,
                "tools": [SEARCH_PEOPLE_TOOL],
            }
            # if previous_response_id is not None:
            #     request_kwargs["previous_response_id"] = previous_response_id

            response = self._client.responses.create(**request_kwargs)
            input_items += response.output
            # previous_response_id = response.id

            tool_outputs: list[dict[str, str]] = []
            for output_item in response.output:
                if output_item.type != "function_call":
                    continue

                tool_result = self._execute_tool(output_item.name, output_item.arguments)
                if tool_result.view is not None:
                    latest_view = tool_result.view

                tool_outputs.append(
                    {
                        "type": "function_call_output",
                        "call_id": output_item.call_id,
                        "output": tool_result.output,
                    }
                )

            if not tool_outputs:
                return ChatResponse(
                    response=response.output_text
                    or "I couldn't produce a response from the employee data.",
                    view=latest_view,
                )

            input_items += tool_outputs

    def _message_to_input_item(self, message: Message) -> dict[str, object]:
        content_type = "input_text" if message.role == "user" else "output_text"
        return {
            "type": "message",
            "role": message.role,
            "content": [{"type": content_type, "text": message.content}],
        }

    def _execute_tool(self, tool_name: str, arguments_json: str) -> "_ToolResult":
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

        title_parts = ["Employee results"]
        if args.department:
            title_parts = [f"{args.department} employees"]
        elif args.name_query:
            title_parts = [f"People matching '{args.name_query}'"]

        view = ListView(type="list", title=title_parts[0], data=employees)
        output = json.dumps(
            {
                "count": len(employees),
                "employees": [employee.model_dump() for employee in employees],
                "title": view.title,
            }
        )
        return _ToolResult(output=output, view=view)


class _ToolResult:
    def __init__(self, *, output: str, view: ListView | None = None):
        self.output = output
        self.view = view
