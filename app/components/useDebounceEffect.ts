import { useEffect, useCallback } from 'react'

function debounce<T extends (...args: any[]) => any>(fn: T, ms: number) {
  let timer: NodeJS.Timeout

  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      fn(...args)
    }, ms)
  }
}

export function useDebounceEffect(
  fn: () => void,
  waitTime: number,
  deps: any[],
) {
  const debouncedFn = useCallback(debounce(fn, waitTime), [fn, waitTime]);

  useEffect(() => {
    debouncedFn();
  }, [debouncedFn, ...deps]);
} 