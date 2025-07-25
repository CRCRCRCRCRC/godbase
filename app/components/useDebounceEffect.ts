import { useEffect, useRef } from 'react';

export function useDebounceEffect(
  fn: () => void,
  waitTime: number,
  deps: any[],
) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    // Clear the previous timeout on re-render
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      fn();
    }, waitTime);

    // Cleanup function to clear timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fn, waitTime, ...deps]);
} 