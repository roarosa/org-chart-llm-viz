import * as React from 'react';

import { cn } from '@/lib/utils';

const Section = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex flex-col rounded-3xl border bg-card/90 p-8 shadow-sm backdrop-blur',
        className,
      )}
      {...props}
    />
  ),
);
Section.displayName = 'Section';

export { Section };
