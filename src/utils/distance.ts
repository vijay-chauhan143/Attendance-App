const EARTH_RADIUS_METERS = 6_371_000;

export function getDistanceInMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const latitudeDifference = toRadians(lat2 - lat1);
  const longitudeDifference = toRadians(lon2 - lon1);
  const haversine =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(longitudeDifference / 2) ** 2;
  const boundedHaversine = Math.min(1, Math.max(0, haversine));

  return (
    2 *
    EARTH_RADIUS_METERS *
    Math.atan2(Math.sqrt(boundedHaversine), Math.sqrt(1 - boundedHaversine))
  );
}
