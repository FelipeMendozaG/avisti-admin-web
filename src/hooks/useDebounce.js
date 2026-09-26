import { useEffect, useState } from 'react'

// Delays updating the returned value until `value` has been stable for `delayMs`.
export function useDebounce(value, delayMs = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delayMs)
    return () => clearTimeout(timer)
  }, [value, delayMs])

  return debouncedValue
}
