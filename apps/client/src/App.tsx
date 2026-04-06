import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Item = {
  id: number;
  name: string;
  value: number;
};

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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_hsl(var(--muted))_0%,_hsl(var(--background))_55%)] px-4 py-12 text-foreground">
      <section className="mx-auto flex max-w-4xl flex-col gap-8 rounded-3xl border bg-card/90 p-8 shadow-sm backdrop-blur sm:p-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">
              Frontend
            </p>
            <div className="space-y-2">
              <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
                LLM Viz
              </h1>
              <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
                Sample data loaded from the server.
              </p>
            </div>
          </div>
          <Button size="lg">Button example</Button>
        </div>

        {error ? (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Card
              key={item.id}
              className="rounded-2xl bg-background transition-colors hover:bg-accent"
            >
              <CardHeader className="pb-4">
                <p className="text-sm text-muted-foreground">Item {item.id}</p>
                <CardTitle className="text-xl">{item.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold tracking-tight">{item.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
