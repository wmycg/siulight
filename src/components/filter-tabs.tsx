import { createContext, useContext, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
const FilterContext = createContext({ value: '', onValueChange: (_value: string) => {} });
/** A button group for filtering the same collection, without fictitious tab panels. */
export function FilterTabs({
  value,
  onValueChange,
  children,
}: {
  value: string;
  onValueChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <FilterContext.Provider value={{ value, onValueChange }}>{children}</FilterContext.Provider>
  );
}
export function FilterTabsList({
  children,
  label = '筛选内容',
}: {
  children: ReactNode;
  label?: string;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="filter-tablist inline-flex h-11 items-center gap-1 rounded-full bg-muted p-1 text-muted-foreground"
    >
      {children}
    </div>
  );
}
export function FilterTabsTrigger({ value, children }: { value: string; children: ReactNode }) {
  const context = useContext(FilterContext);
  return (
    <button
      type="button"
      aria-pressed={context.value === value}
      onClick={() => context.onValueChange(value)}
      className={cn(
        'filter-tab inline-flex h-9 items-center justify-center whitespace-nowrap rounded-full px-4 text-sm transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring',
        context.value === value && 'bg-background text-foreground shadow-sm',
      )}
    >
      {children}
    </button>
  );
}
