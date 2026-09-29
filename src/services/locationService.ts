import * as Location from 'expo-location';

export type CurrentLocation = Pick<
	Location.LocationObject['coords'],
	'latitude' | 'longitude' | 'accuracy'
>;

export const LOCATION_SERVICES_DISABLED_MESSAGE =
	'Please enable location services to use attendance.';

export function requestLocationPermission(): Promise<Location.LocationPermissionResponse> {
	return Location.requestForegroundPermissionsAsync();
}

export function getForegroundLocationPermission(): Promise<Location.LocationPermissionResponse> {
	return Location.getForegroundPermissionsAsync();
}

export function areLocationServicesEnabled(): Promise<boolean> {
	return Location.hasServicesEnabledAsync();
}

export async function getCurrentLocation(): Promise<CurrentLocation> {
	if (!(await areLocationServicesEnabled())) {
		throw new Error(LOCATION_SERVICES_DISABLED_MESSAGE);
	}

	const position = await Location.getCurrentPositionAsync({});

	if (
		!Number.isFinite(position.coords.latitude) ||
		!Number.isFinite(position.coords.longitude) ||
		position.coords.latitude < -90 ||
		position.coords.latitude > 90 ||
		position.coords.longitude < -180 ||
		position.coords.longitude > 180
	) {
		throw new Error('Unable to get a valid current location.');
	}

	return {
		latitude: position.coords.latitude,
		longitude: position.coords.longitude,
		accuracy: position.coords.accuracy,
	};
}

export function watchUserLocation(
	onLocation: (location: CurrentLocation) => void,
	onError?: (error: string) => void,
): Promise<Location.LocationSubscription> {
	return Location.watchPositionAsync(
		{
			accuracy: Location.Accuracy.High,
			distanceInterval: 1,
			timeInterval: 1000,
		},
		(position) => {
			onLocation({
				latitude: position.coords.latitude,
				longitude: position.coords.longitude,
				accuracy: position.coords.accuracy,
			});
		},
		onError,
	);
}
