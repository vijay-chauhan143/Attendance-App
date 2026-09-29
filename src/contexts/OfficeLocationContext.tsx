import {
    createContext,
    PropsWithChildren,
    useCallback,
    useContext,
    useEffect,
    useState,
} from 'react';

import { OFFICE_LOCATION } from '@/constants/officeLocation';
import {
    getOfficeLocation,
    resetOfficeLocation as resetStoredOfficeLocation,
    saveOfficeLocation as saveStoredOfficeLocation,
} from '@/services/officeLocationService';
import type { OfficeLocation } from '@/types/officeLocation';

type OfficeLocationContextValue = {
  officeLocation: OfficeLocation;
  isLoading: boolean;
  error: string | null;
  saveOfficeLocation: (location: OfficeLocation) => Promise<void>;
  resetOfficeLocation: () => Promise<void>;
};

const OfficeLocationContext =
  createContext<OfficeLocationContextValue | undefined>(undefined);

export function OfficeLocationProvider({
  children,
}: PropsWithChildren) {
  const [officeLocation, setOfficeLocation] =
    useState<OfficeLocation>(OFFICE_LOCATION);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadOfficeLocation = async () => {
      try {
        const savedLocation = await getOfficeLocation();
        if (isMounted) {
          setOfficeLocation(savedLocation);
        }
      } catch {
        if (isMounted) {
          setError('Unable to load the saved office location.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void Promise.resolve().then(loadOfficeLocation);

    return () => {
      isMounted = false;
    };
  }, []);

  const saveOfficeLocation = useCallback(
    async (location: OfficeLocation) => {
      await saveStoredOfficeLocation(location);
      setOfficeLocation(location);
      setError(null);
    },
    [],
  );

  const resetOfficeLocation = useCallback(async () => {
    await resetStoredOfficeLocation();
    setOfficeLocation({ ...OFFICE_LOCATION });
    setError(null);
  }, []);

  return (
    <OfficeLocationContext.Provider
      value={{
        officeLocation,
        isLoading,
        error,
        saveOfficeLocation,
        resetOfficeLocation,
      }}
    >
      {children}
    </OfficeLocationContext.Provider>
  );
}

export function useOfficeLocation(): OfficeLocationContextValue {
  const context = useContext(OfficeLocationContext);

  if (!context) {
    throw new Error(
      'useOfficeLocation must be used within an OfficeLocationProvider.',
    );
  }

  return context;
}