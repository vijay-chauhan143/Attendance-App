import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Circle, Marker, Region } from 'react-native-maps';

import type { OfficeLocation } from '@/types/officeLocation';

type LocationMapProps = {
  latitude: number;
  longitude: number;
  officeLocation: OfficeLocation;
};

export function LocationMap({
  latitude,
  longitude,
  officeLocation,
}: LocationMapProps) {
  const mapRef = useRef<MapView | null>(null);
  const hasValidCoordinates =
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180;

  const region: Region = {
    latitude,
    longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  useEffect(() => {
    if (!hasValidCoordinates) {
      return;
    }

    mapRef.current?.animateToRegion(
      {
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      500,
    );
  }, [hasValidCoordinates, latitude, longitude]);

  if (!hasValidCoordinates) {
    return null;
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={region}
        onMapReady={() => mapRef.current?.animateToRegion(region, 500)}
      >
        <Circle
          center={officeLocation}
          radius={officeLocation.radius}
          strokeWidth={2}
          strokeColor="rgba(37, 99, 235, 0.9)"
          fillColor="rgba(37, 99, 235, 0.18)"
        />
        <Marker coordinate={{ latitude, longitude }} title="You are here" />
        <Marker coordinate={officeLocation} title="Office" />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 300,
    marginBottom: 16,
    overflow: 'hidden',
    borderRadius: 8,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});