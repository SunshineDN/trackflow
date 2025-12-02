import { useState, useEffect, Dispatch, SetStateAction } from 'react';

type Deserializer<T> = (value: string) => T;

export function usePersistentState<T>(
  key: string,
  initialValue: T,
  deserializer?: Deserializer<T>
): [T, Dispatch<SetStateAction<T>>] {
  const [state, setState] = useState<T>(initialValue);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const storedValue = localStorage.getItem(key);
      if (storedValue !== null) {
        if (deserializer) {
          setState(deserializer(storedValue));
        } else {
          setState(JSON.parse(storedValue));
        }
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
    } finally {
      setIsHydrated(true);
    }
  }, [key, deserializer]);

  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem(key, JSON.stringify(state));
      } catch (error) {
        console.error(`Error writing localStorage key "${key}":`, error);
      }
    }
  }, [key, state, isHydrated]);

  return [state, setState];
}
