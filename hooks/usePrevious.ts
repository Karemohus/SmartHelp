
import { useRef, useEffect } from 'react';

/**
 * A custom hook that returns the previous value of a variable.
 * This is useful for comparing props or state between renders.
 * @param value The value to track.
 * @returns The value from the previous render.
 */
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);
  
  // Store current value in ref after the render is committed.
  useEffect(() => {
    ref.current = value;
  }, [value]); // Only re-run if value changes

  // Return previous value (happens before update in useEffect).
  return ref.current;
}

export default usePrevious;
