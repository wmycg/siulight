import * as React from 'react';
import { cn } from '@/lib/utils';
export function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'flex min-h-28 w-full rounded-lg border border-input bg-background px-3 py-3 text-base outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/20 md:text-sm',
        className,
      )}
      {...props}
    />
  );
}
