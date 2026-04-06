import { useEffect, useState } from 'react';
import { Employee, Message } from '@/types';
import { ChatWindow } from '@/components/layout/ChatWindow';
import { DataDisplay } from '@/components/layout/DataDisplay';
import { Section } from '@/components/ui/section';

export function App() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! How can I help you today?' },
    { role: 'user', content: 'How many employees are in the Engineering department?' },
    {
      role: 'assistant',
      content:
        "There are 10 employees in the Engineering department. I've included a list of their cards.",
    },
  ]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const response = await fetch('/api/employees');
        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`);
        }
        const payload = (await response.json()) as { employees: Employee[] };
        setEmployees(payload.employees);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    };

    void loadEmployees();
  }, []);

  const sendMessage = (message: string) => {
    setMessages((messages) => [...messages, { role: 'user', content: message }]);
  };

  return (
    <main className="h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_hsl(var(--muted))_0%,_hsl(var(--background))_55%)] p-4 text-foreground lg:p-6">
      <div className="flex h-full min-h-0 flex-col gap-4 lg:flex-row lg:gap-6">
        <Section className="lg:max-w-sm lg:flex-1 p-6">
          <ChatWindow messages={messages} sendMessage={sendMessage} />
        </Section>
        <Section className="min-h-0 min-w-0 flex-1 overflow-hidden">
          <DataDisplay employees={employees} error={error} />
        </Section>
      </div>
    </main>
  );
}
