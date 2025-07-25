import { useEffect, useCallback } from 'react';

function debounce<T extends (...args: any[]) => any>(fn: T, ms: number): (...args: Parameters<T>) => void {
  let timer: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn(...args);
    }, ms);
  };
}

export function useDebounceEffect(
  fn: () => void,
  waitTime: number,
  deps: any[],
) {
  const callback = useCallback(fn, deps);
  const debouncedFn = useCallback(debounce(callback, waitTime), [callback, waitTime]);

  useEffect(() => {
    debouncedFn();
  }, [debouncedFn]);
} 