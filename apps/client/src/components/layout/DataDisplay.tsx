import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ListView } from '@/types';

type DataDisplayProps = {
  title: string;
  data?: ListView['data'];
  error?: string;
};

export function DataDisplay({ title, data, error }: DataDisplayProps) {
  return (
    <div className="flex flex-col gap-8 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:pr-1">
      <div className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">
          visualization
        </p>
        <div className="space-y-2">
          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            {title}
          </h1>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {data?.map((employee) => (
          <Card
            key={employee.id}
            className="rounded-2xl bg-background transition-colors hover:bg-accent"
          >
            <CardHeader className="pb-4">
              <p className="text-sm text-muted-foreground">Employee {employee.id}</p>
              <CardTitle className="text-xl">{employee.full_name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="tracking-tight">{employee.title}</p>
              <p className="tracking-tight text-sm">{employee.department}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
