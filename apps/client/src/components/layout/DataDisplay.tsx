import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ListView } from '@/types';
import { motion, useReducedMotion } from 'motion/react';

type DataDisplayProps =
  | {
      data?: ListView['data'];
      title: string;
      viewId: number;
      error?: string;
    }
  | {
      title?: undefined;
      data?: undefined;
      viewId?: undefined;
      error?: string;
    };

export function DataDisplay({ title, data, viewId, error }: DataDisplayProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="flex flex-col gap-8 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:pr-1">
      <div className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-neutral-500">
          visualization
        </p>
        <div className="space-y-2">
          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            {title}
          </h1>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-destructive-300 bg-destructive-500/10 px-4 py-3 text-sm text-destructive-500">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {data?.map((employee, index) => (
          <motion.div
            key={`${viewId}-${index}`}
            initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.96 }}
            animate={prefersReducedMotion ? {} : { opacity: 1, scale: 1 }}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : {
                    duration: 0.32,
                    delay: index * 0.05,
                    ease: [0.22, 1, 0.36, 1],
                  }
            }
          >
            <Card className="rounded-2xl bg-neutral-50 transition-colors hover:bg-neutral-100">
              <CardHeader className="pb-4">
                <p className="text-sm text-neutral-500">Employee {employee.id}</p>
                <CardTitle className="text-xl">{employee.full_name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="tracking-tight">{employee.title}</p>
                <p className="tracking-tight text-sm">{employee.department}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
