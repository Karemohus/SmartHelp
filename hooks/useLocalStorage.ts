

import { useState, useEffect } from 'react';

/**
 * Checks if an object is a valid file attachment.
 * @param obj The object to check.
 */
const isAttachment = (obj: any): boolean => obj && typeof obj === 'object' && 'name' in obj && 'type' in obj && 'dataUrl' in obj;

/**
 * Strips large, non-serializable, or performance-impacting data from the state
 * before it's written to localStorage. This is crucial for performance.
 * @param key The localStorage key.
 * @param data The data object to be sanitized.
 */
function stripLargeData(key: string, data: any): any {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  const processItem = (item: any) => {
    // Return non-objects as-is
    if (typeof item !== 'object' || item === null) return item;
    
    const newItem = { ...item };

    // List of all possible attachment keys in any object
    const attachmentKeys: (keyof any)[] = ['attachment', 'userAttachment', 'adminAttachment', 'supervisorAttachment'];

    attachmentKeys.forEach(attKey => {
      if (isAttachment(newItem[attKey])) {
        newItem[attKey] = { ...newItem[attKey] };
        delete newItem[attKey].dataUrl;
      }
    });

    if (Array.isArray(newItem.photos)) {
      newItem.photos = newItem.photos.map((p: any) => {
        if (isAttachment(p)) {
          const newP = { ...p };
          delete newP.dataUrl;
          return newP;
        }
        return p;
      });
    }
    return newItem;
  };

  // Process arrays of items (e.g., tickets, faqs)
  const keysToProcessAsArrays: string[] = ['smartfaq_faqs', 'smartfaq_tickets', 'smartfaq_promotions', 'smartfaq_vehicles', 'smartfaq_vehicleLicenses', 'smartfaq_violations'];
  if (keysToProcessAsArrays.includes(key)) {
    return Array.isArray(data) ? data.map(processItem) : data;
  }

  // Handle specific one-off cases like siteConfig logo
  if (key === 'smartfaq_siteConfig' && data.logo) {
    return { ...data, logo: null }; // Don't save the logo data to localStorage
  }

  return data;
}


// A custom hook to synchronize state with localStorage.
function useLocalStorage<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  
  // This function reads the value from localStorage.
  // It runs only once at the beginning to avoid performance issues.
  const readValue = (): T => {
    // We can't access `window` on the server, so we check for it.
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      // If a value exists in localStorage, parse it. Otherwise, use the initial value.
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // If parsing fails, log a warning and return the initial value.
      console.warn(`Error reading localStorage key “${key}”:`, error);
      return initialValue;
    }
  };

  // State to store our value. We initialize it with the value from localStorage.
  const [storedValue, setStoredValue] = useState<T>(readValue);

  // This is a wrapper around the normal `setStoredValue`.
  // It updates both the component's state and the value in localStorage.
  const setValue: React.Dispatch<React.SetStateAction<T>> = (value) => {
    if (typeof window === 'undefined') {
      console.warn(`Tried to set localStorage key “${key}” even though no window was found.`);
      return;
    }
    
    try {
      // Allow value to be a function, just like with regular useState.
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Update the component's state with the full data (including dataUrls).
      // This ensures the UI remains responsive and shows previews immediately.
      setStoredValue(valueToStore);

      // IMPORTANT: Strip large data BEFORE writing to localStorage for performance.
      const strippedValueForStorage = stripLargeData(key, valueToStore);
      
      // Save the sanitized value to localStorage.
      window.localStorage.setItem(key, JSON.stringify(strippedValueForStorage));

    } catch (error) {
      console.warn(`Error setting localStorage key “${key}”:`, error);
      // Handle the specific error when storage is full.
      if (error instanceof DOMException && (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
        window.dispatchEvent(new CustomEvent('storage_error', {
          detail: {
            message: 'Could not save. Storage is full. Try using smaller files or removing unneeded data.'
          }
        }));
      }
    }
  };

  // This effect listens for changes in other browser tabs.
  // If the data changes elsewhere, it updates this tab's state.
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue) {
         setStoredValue(JSON.parse(event.newValue));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return [storedValue, setValue];
}

export default useLocalStorage;