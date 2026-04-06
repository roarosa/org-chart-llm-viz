import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export type Item = {
  id: number;
  name: string;
  value: number;
};

type DataDisplayProps = {
  items: Item[];
  error: string | null;
};

export function DataDisplay({ items, error }: DataDisplayProps) {
  return (
    <div className="flex flex-col gap-8">
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

      {error ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
    </div>
  );
}
