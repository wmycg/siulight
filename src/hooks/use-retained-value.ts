import { useState } from 'react';

/** Keep dialog content mounted while Radix plays its closing animation. */
export function useRetainedValue<T>(value: T | null) {
  const [last, setLast] = useState(value);
  if (value !== null && value !== last) setLast(value);
  return value ?? last;
}
