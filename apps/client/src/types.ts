export type Employee = {
  id: number;
  full_name: string;
  work_email: string;
  title: string;
  department: string;
  manager_id: number | null;
  start_date: string;
  work_location: string;
};

export type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export type ListView = {
  type: 'list';
  title: string;
  data: Employee[];
};

export type ChatResponse = {
  response: string;
  view?: ListView | null;
};
