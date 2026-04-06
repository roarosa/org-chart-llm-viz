import { useEffect, useState } from 'react';
import { ChatResponse, Employee, ListView, Message } from '@/types';
import { ChatWindow } from '@/components/layout/ChatWindow';
import { DataDisplay } from '@/components/layout/DataDisplay';
import { Section } from '@/components/ui/section';

export function App() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! How can I help you today?' },
  ]);
  const [view, setView] = useState<ListView | undefined>();
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const response = await fetch('/api/employees');
        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`);
        }
        const payload = (await response.json()) as { employees: Employee[] };
        setView({
          type: 'list',
          title: 'All employees',
          data: payload.employees,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    };

    void loadEmployees();
  }, []);

  const sendMessage = async (message: string) => {
    const nextMessages = [...messages, { role: 'user', content: message } satisfies Message];
    setMessages(nextMessages);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nextMessages),
      });
      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const payload = (await response.json()) as ChatResponse;
      setMessages((currentMessages) => [
        ...currentMessages,
        { role: 'assistant', content: payload.response },
      ]);
      if (payload.view) {
        setView(payload.view);
      }
      setError(undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  return (
    <main className="bg-[radial-gradient(circle_at_top,_hsl(var(--muted))_0%,_hsl(var(--background))_55%)] p-4 text-foreground lg:h-screen lg:overflow-hidden lg:p-6">
      <div className="flex flex-col gap-4 lg:h-full lg:min-h-0 lg:flex-row lg:gap-6">
        <Section className="lg:min-h-0 lg:max-w-sm lg:flex-1 p-6">
          <ChatWindow messages={messages} sendMessage={sendMessage} />
        </Section>
        <Section className="min-w-0 flex-1 lg:min-h-0 lg:overflow-hidden">
          <DataDisplay data={view?.data} error={error} title={view?.title ?? 'Employees'} />
        </Section>
      </div>
    </main>
  );
}
