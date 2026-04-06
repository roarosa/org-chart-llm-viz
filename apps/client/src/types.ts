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
