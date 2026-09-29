import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';

import {
  areLocationServicesEnabled,
  CurrentLocation,
  getCurrentLocation,
  getForegroundLocationPermission,
  LOCATION_SERVICES_DISABLED_MESSAGE,
  requestLocationPermission,
  watchUserLocation,
} from '@/services/locationService';

type LocationPermissionStatus = Location.PermissionStatus | null;

type UseLocationResult = {
  location: CurrentLocation | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  permissionStatus: LocationPermissionStatus;
  isTracking: boolean;
  refreshLocation: () => Promise<CurrentLocation>;
  retry: () => Promise<void>;
};

function permissionDeniedMessage(canAskAgain: boolean): string {
  return canAskAgain
    ? 'Location permission is required to use attendance. Tap Retry to request it.'
    : 'Location permission is required to use attendance. Enable it in device settings, then tap Retry.';
}

export function useLocation(): UseLocationResult {
  const [location, setLocation] = useState<CurrentLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] =
    useState<LocationPermissionStatus>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [canStartTracking, setCanStartTracking] = useState(false);
  const locationRef = useRef<CurrentLocation | null>(null);

  const updateLocation = useCallback((nextLocation: CurrentLocation) => {
    locationRef.current = nextLocation;
    setLocation(nextLocation);
  }, []);

  const clearLocation = useCallback(() => {
    locationRef.current = null;
    setLocation(null);
  }, []);

  const loadLocation = useCallback(async () => {
    try {
      const permission = await requestLocationPermission();
      setPermissionStatus(permission.status);

      if (!permission.granted) {
        clearLocation();
        setIsTracking(false);
        setCanStartTracking(false);
        setError(permissionDeniedMessage(permission.canAskAgain));
        return;
      }

      updateLocation(await getCurrentLocation());
      setCanStartTracking(true);
      setError(null);
    } catch (caughtError) {
      clearLocation();
      setIsTracking(false);
      setCanStartTracking(false);
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to get your current location.',
      );
    } finally {
      setLoading(false);
    }
  }, [clearLocation, updateLocation]);

  const refreshLocation = useCallback(async (): Promise<CurrentLocation> => {
    const hasExistingLocation = locationRef.current !== null;
    if (!hasExistingLocation) {
      setLoading(true);
    }
    setRefreshing(true);

    try {
      const permission = await getForegroundLocationPermission();
      setPermissionStatus(permission.status);

      if (!permission.granted) {
        setIsTracking(false);
        setCanStartTracking(false);
        throw new Error(permissionDeniedMessage(permission.canAskAgain));
      }

      const freshLocation = await getCurrentLocation();
      updateLocation(freshLocation);
      setError(null);
      if (!hasExistingLocation) {
        setCanStartTracking(true);
      }
      return freshLocation;
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to get your current location.';
      setError(message);
      throw new Error(message);
    } finally {
      setRefreshing(false);
      if (!hasExistingLocation) {
        setLoading(false);
      }
    }
  }, [updateLocation]);

  const retry = useCallback(async () => {
    setLoading(true);
    setError(null);
    setIsTracking(false);
    setCanStartTracking(false);
    clearLocation();
    setPermissionStatus(null);
    await loadLocation();
  }, [clearLocation, loadLocation]);

  useEffect(() => {
    void Promise.resolve().then(loadLocation);
  }, [loadLocation]);

  useEffect(() => {
    if (permissionStatus !== 'granted' || !canStartTracking) {
      return;
    }

    let isActive = true;
    let subscription: Location.LocationSubscription | null = null;
    let trackingFailed = false;

    const reportTrackingError = async (trackingError: string) => {
      let message = trackingError || 'Unable to track your current location.';

      try {
        if (!(await areLocationServicesEnabled())) {
          message = LOCATION_SERVICES_DISABLED_MESSAGE;
        }
      } catch {
        // Preserve the location error if the service status cannot be read.
      }

      if (!isActive) {
        return;
      }

      clearLocation();
      setIsTracking(false);
      setCanStartTracking(false);
      setError(message);
    };

    const startWatching = async () => {
      try {
        const nextSubscription = await watchUserLocation(
          (nextLocation) => {
            if (isActive) {
              updateLocation(nextLocation);
              setError(null);
            }
          },
          (watchError) => {
            if (isActive) {
              trackingFailed = true;
              subscription?.remove();
              subscription = null;
              void reportTrackingError(watchError);
            }
          },
        );

        if (isActive && !trackingFailed) {
          subscription = nextSubscription;
          setIsTracking(true);
        } else {
          nextSubscription.remove();
        }
      } catch (caughtError) {
        if (isActive) {
          trackingFailed = true;
          void reportTrackingError(
            caughtError instanceof Error
              ? caughtError.message
              : 'Unable to track your current location.',
          );
        }
      }
    };

    void Promise.resolve().then(startWatching);

    return () => {
      isActive = false;
      subscription?.remove();
    };
  }, [canStartTracking, clearLocation, permissionStatus, updateLocation]);

  return {
    location,
    loading,
    refreshing,
    error,
    permissionStatus,
    isTracking,
    refreshLocation,
    retry,
  };
}
