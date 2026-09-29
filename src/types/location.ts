export type Coordinate = {
  latitude: number;
  longitude: number;
};

export type Geofence = {
  center: Coordinate;
  radiusInMeters: number;
};
