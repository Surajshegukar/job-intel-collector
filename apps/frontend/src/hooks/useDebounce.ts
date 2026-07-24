import { useState, useEffect } from 'react';

/**
 * Delays updating a value until the user has stopped changing it for `delay` ms.
 * Replaces the manual setTimeout/clearTimeout pattern spread across pages.
 *
 * @example
 * const [search, setSearch] = useState('');
 * const debouncedSearch = useDebounce(search, 400);
 * // use debouncedSearch in API calls
 */
export function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
