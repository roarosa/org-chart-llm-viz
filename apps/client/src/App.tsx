import { useEffect, useState } from 'react';
import { ChatWindow } from '@/components/layout/ChatWindow';
import { DataDisplay, type Item } from '@/components/layout/DataDisplay';
import { Section } from '@/components/ui/section';

export function App() {
  const [items, setItems] = useState<Item[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadItems = async () => {
      try {
        const response = await fetch('/api/items');
        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`);
        }
        const payload = (await response.json()) as { items: Item[] };
        setItems(payload.items);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    };

    void loadItems();
  }, []);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_hsl(var(--muted))_0%,_hsl(var(--background))_55%)] p-4 text-foreground lg:p-6">
      <div className="flex min-h-[calc(100vh-2rem)] flex-col gap-4 lg:min-h-[calc(100vh-3rem)] lg:flex-row lg:gap-6">
        <Section className="lg:max-w-sm lg:flex-1 p-6">
          <ChatWindow />
        </Section>
        <Section className="min-w-0 flex-1">
          <DataDisplay items={items} error={error} />
        </Section>
      </div>
    </main>
  );
}
