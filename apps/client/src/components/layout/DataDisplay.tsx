import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Employee } from '@/types';

type DataDisplayProps = {
  employees: Employee[];
  error: string | null;
};

export function DataDisplay({ employees, error }: DataDisplayProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-8 overflow-y-auto pr-1">
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
        {employees.map((employee) => (
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
