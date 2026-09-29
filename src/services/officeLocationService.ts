import AsyncStorage from '@react-native-async-storage/async-storage';

import { OFFICE_LOCATION } from '@/constants/officeLocation';
import type { OfficeLocation } from '@/types/officeLocation';

const OFFICE_LOCATION_STORAGE_KEY = 'office_location';

function isOfficeLocation(value: unknown): value is OfficeLocation {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const location = value as Record<string, unknown>;

  return (
    typeof location.latitude === 'number' &&
    Number.isFinite(location.latitude) &&
    location.latitude >= -90 &&
    location.latitude <= 90 &&
    typeof location.longitude === 'number' &&
    Number.isFinite(location.longitude) &&
    location.longitude >= -180 &&
    location.longitude <= 180 &&
    typeof location.radius === 'number' &&
    Number.isFinite(location.radius) &&
    location.radius > 0
  );
}

export async function getOfficeLocation(): Promise<OfficeLocation> {
  const storedLocation = await AsyncStorage.getItem(OFFICE_LOCATION_STORAGE_KEY);

  if (storedLocation === null) {
    return { ...OFFICE_LOCATION };
  }

  const parsedLocation: unknown = JSON.parse(storedLocation);
  if (!isOfficeLocation(parsedLocation)) {
    throw new Error('Saved office location is invalid.');
  }

  return parsedLocation;
}

export async function saveOfficeLocation(
  location: OfficeLocation,
): Promise<void> {
  if (!isOfficeLocation(location)) {
    throw new Error('Enter a valid office latitude, longitude, and radius.');
  }

  await AsyncStorage.setItem(
    OFFICE_LOCATION_STORAGE_KEY,
    JSON.stringify(location),
  );
}

export async function resetOfficeLocation(): Promise<void> {
  await AsyncStorage.removeItem(OFFICE_LOCATION_STORAGE_KEY);
}