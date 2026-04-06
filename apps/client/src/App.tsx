import { useEffect, useState } from 'react';

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
    <main className="app">
      <h1>LLM Viz</h1>
      <p>Server-backed data loaded via HTTP.</p>
      {error ? <p className="error">{error}</p> : null}
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <strong>{item.name}</strong>: {item.value}
          </li>
        ))}
      </ul>
    </main>
  );
}
