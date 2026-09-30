import Constants from 'expo-constants';
import { useEffect, useRef } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import MapView, {
  Circle,
  Marker,
  PROVIDER_GOOGLE,
  Region,
} from 'react-native-maps';

import { AppText } from '@/components/common/AppText';
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

  const isGoogleMapsApiKeyConfigured =
    Constants.expoConfig?.extra?.googleMapsApiKeyConfigured === true;

  if (Platform.OS === 'android' && !isGoogleMapsApiKeyConfigured) {
    return (
      <View style={[styles.container, styles.fallback]}>
        <AppText style={styles.fallbackTitle}>
          Google Maps API key is not configured.
        </AppText>
        <AppText style={styles.fallbackMessage}>
          Please configure GOOGLE_MAPS_API_KEY to enable the map.
        </AppText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
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
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f1f5f9',
  },
  fallbackTitle: {
    marginBottom: 8,
    textAlign: 'center',
  },
  fallbackMessage: {
    textAlign: 'center',
    color: '#475569',
  },
});