import * as React from 'react';
import * as Primitive from '@radix-ui/react-tabs';
import { cn } from '@/lib/utils';
export const Tabs = Primitive.Root;
export function TabsList({ className, ...props }: React.ComponentProps<typeof Primitive.List>) {
  return (
    <Primitive.List
      className={cn(
        'inline-flex h-11 items-center gap-1 rounded-full bg-muted p-1 text-muted-foreground',
        className,
      )}
      {...props}
    />
  );
}
export function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof Primitive.Trigger>) {
  return (
    <Primitive.Trigger
      className={cn(
        'inline-flex h-9 items-center justify-center whitespace-nowrap rounded-full px-4 text-sm transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm',
        className,
      )}
      {...props}
    />
  );
}
export function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof Primitive.Content>) {
  return <Primitive.Content className={cn('outline-none', className)} {...props} />;
}
