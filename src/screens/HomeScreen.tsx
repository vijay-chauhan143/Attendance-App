import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { CompositeNavigationProp } from '@react-navigation/native';
import {
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/common/AppButton';
import { AppText } from '@/components/common/AppText';
import { LocationMap } from '@/components/LocationMap';
import { useOfficeLocation } from '@/contexts/OfficeLocationContext';
import { useLocation } from '@/hooks/useLocation';
import type {
  RootStackParamList,
  RootTabParamList,
} from '@/navigation/AppNavigator';
import {
  hasCheckedInToday,
  saveAttendanceRecord,
} from '@/services/attendanceService';
import { AttendanceRecord } from '@/types/attendance';
import { getDistanceInMeters } from '@/utils/distance';

type HomeNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<RootTabParamList, 'Home'>,
  NativeStackNavigationProp<RootStackParamList, 'MainTabs'>
>;

export function HomeScreen() {
  const navigation = useNavigation<HomeNavigationProp>();
  const {
    officeLocation,
    isLoading: isOfficeLocationLoading,
    error: officeLocationError,
  } = useOfficeLocation();
  const [checkInFeedback, setCheckInFeedback] = useState<string | null>(null);
  const [isSavingCheckIn, setIsSavingCheckIn] = useState(false);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [isCheckingAttendance, setIsCheckingAttendance] = useState(true);
  const [attendanceStorageError, setAttendanceStorageError] = useState(false);
  const checkInInProgress = useRef(false);
  const hasFocusedHomeRef = useRef(false);
  const {
    location,
    loading,
    refreshing,
    error,
    permissionStatus,
    isTracking,
    refreshLocation,
  } = useLocation();
  const hasValidLocation =
    location !== null &&
    Number.isFinite(location.latitude) &&
    Number.isFinite(location.longitude) &&
    location.latitude >= -90 &&
    location.latitude <= 90 &&
    location.longitude >= -180 &&
    location.longitude <= 180;
  const distance = hasValidLocation && location
    ? getDistanceInMeters(
        location.latitude,
        location.longitude,
        officeLocation.latitude,
        officeLocation.longitude,
      )
    : null;
  const isInsideGeofence =
    distance !== null && distance <= officeLocation.radius;
  const hasPoorAccuracy =
    hasValidLocation &&
    location.accuracy !== null &&
    location.accuracy > officeLocation.radius;
  const canShowGeofence =
    hasValidLocation &&
    !isOfficeLocationLoading &&
    officeLocationError === null &&
    permissionStatus === 'granted' &&
    !loading;

  useFocusEffect(
    useCallback(() => {
      let isFocused = true;

      const loadAttendanceStatus = async () => {
        setIsCheckingAttendance(true);
        setAttendanceStorageError(false);

        try {
          const alreadyCheckedIn = await hasCheckedInToday();
          if (isFocused) {
            setHasCheckedIn(alreadyCheckedIn);
            setCheckInFeedback(
              alreadyCheckedIn ? 'Attendance already marked for today.' : null,
            );
          }
        } catch {
          if (isFocused) {
            setAttendanceStorageError(true);
          }
        } finally {
          if (isFocused) {
            setIsCheckingAttendance(false);
          }
        }
      };

      void Promise.resolve().then(loadAttendanceStatus);

      if (hasFocusedHomeRef.current) {
        void refreshLocation().catch(() => undefined);
      }
      hasFocusedHomeRef.current = true;

      return () => {
        isFocused = false;
      };
    }, [refreshLocation]),
  );

  const canCheckIn =
    canShowGeofence &&
    distance !== null &&
    isInsideGeofence &&
    !hasPoorAccuracy &&
    !hasCheckedIn &&
    !refreshing &&
    error === null &&
    !isOfficeLocationLoading &&
    officeLocationError === null &&
    !isCheckingAttendance &&
    !attendanceStorageError &&
    !isSavingCheckIn;

  const handleCheckIn = async () => {
    if (checkInInProgress.current || !canCheckIn) {
      return;
    }

    checkInInProgress.current = true;
    setIsSavingCheckIn(true);
    setCheckInFeedback(null);

    try {
      let alreadyCheckedIn: boolean;
      try {
        alreadyCheckedIn = await hasCheckedInToday();
      } catch {
        setAttendanceStorageError(true);
        setCheckInFeedback('Unable to verify attendance from local storage.');
        return;
      }

      if (alreadyCheckedIn) {
        setHasCheckedIn(true);
        setCheckInFeedback('Attendance already marked for today.');
        return;
      }

      const latestLocation = await refreshLocation();
      if (
        !Number.isFinite(latestLocation.latitude) ||
        !Number.isFinite(latestLocation.longitude) ||
        latestLocation.latitude < -90 ||
        latestLocation.latitude > 90 ||
        latestLocation.longitude < -180 ||
        latestLocation.longitude > 180
      ) {
        setCheckInFeedback('Current location is unavailable. Please try again.');
        return;
      }

      if (
        latestLocation.accuracy !== null &&
        latestLocation.accuracy > officeLocation.radius
      ) {
        setCheckInFeedback(
          `Location accuracy is low (±${Math.round(latestLocation.accuracy)} m). Wait for a more accurate fix before checking in.`,
        );
        return;
      }

      const checkInDistance = getDistanceInMeters(
        latestLocation.latitude,
        latestLocation.longitude,
        officeLocation.latitude,
        officeLocation.longitude,
      );

      if (checkInDistance > officeLocation.radius) {
        setCheckInFeedback(
          `You must be within ${officeLocation.radius} meters of the office to check in.`,
        );
        return;
      }

      if (await hasCheckedInToday()) {
        setCheckInFeedback('Attendance already marked for today.');
        return;
      }

      const record: AttendanceRecord = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        date: new Date().toISOString(),
        latitude: latestLocation.latitude,
        longitude: latestLocation.longitude,
        distance: checkInDistance,
        status: 'checked-in',
      };

      await saveAttendanceRecord(record);
      setHasCheckedIn(true);
      setCheckInFeedback('Attendance checked in successfully.');
    } catch (caughtError) {
      setCheckInFeedback(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to check in right now. Please try again.',
      );
    } finally {
      checkInInProgress.current = false;
      setIsSavingCheckIn(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={true}>
      {/* <AppText preset="title">Home</AppText>
      <AppText style={styles.subtitle}>Geofence-based attendance</AppText> */}
      <AppText style={styles.locationInfo}>
        Location Permission: {permissionStatus === 'granted'
          ? 'Granted'
          : permissionStatus === 'denied'
            ? 'Denied'
            : 'Checking...'}
      </AppText>
      <AppText style={styles.locationInfo}>
        {loading && !hasValidLocation
          ? 'Getting current location...'
          : refreshing
            ? 'Updating location...'
            : error
            ? 'Location unavailable'
            : isTracking
              ? 'Location tracking active'
              : hasValidLocation
                ? 'Location ready; starting tracking...'
                : 'Location unavailable'}
      </AppText>
      {loading && !hasValidLocation ? (
        <AppText style={styles.locationInfo}>Please wait for a location fix.</AppText>
      ) : location ? (
        <View style={styles.coordinates}>
          <AppText>Current Location:</AppText>
          <AppText>Latitude: {location.latitude}</AppText>
          <AppText>Longitude: {location.longitude}</AppText>
          <AppText>
            Accuracy: {location.accuracy === null
              ? 'Unavailable'
              : `${location.accuracy.toFixed(1)} meters`}
          </AppText>
        </View>
      ) : null}
      {hasPoorAccuracy && location?.accuracy !== null ? (
        <AppText style={styles.warning}>
          Location accuracy is low (±{Math.round(location.accuracy)} m); check-in may be unreliable.
        </AppText>
      ) : null}
      {canShowGeofence && location ? (
        <>
          <LocationMap
            latitude={location.latitude}
            longitude={location.longitude}
            officeLocation={officeLocation}
          />
          <View style={styles.geofenceInfo}>
            <AppText>Office latitude: {officeLocation.latitude}</AppText>
            <AppText>Office longitude: {officeLocation.longitude}</AppText>
            <AppText>Geofence radius: {officeLocation.radius} meters</AppText>
            <AppText>Distance from office: {Math.round(distance ?? 0)} meters</AppText>
            <AppText>
              Geofence status: {isInsideGeofence
                ? 'Inside office geofence'
                : 'Outside office geofence'}
            </AppText>
          </View>
        </>
      ) : null}
      {attendanceStorageError ? (
        <AppText style={styles.error}>
          Unable to verify today&apos;s attendance. Reopen this screen to retry.
        </AppText>
      ) : null}
      {checkInFeedback ? (
        <AppText style={styles.checkInFeedback}>{checkInFeedback}</AppText>
      ) : null}
      {error ? <AppText style={styles.error}>{error}</AppText> : null}
      {officeLocationError ? (
        <AppText style={styles.error}>{officeLocationError}</AppText>
      ) : null}
      <AppButton
        title={
          isSavingCheckIn
            ? 'Checking In...'
            : isCheckingAttendance
              ? 'Checking Attendance...'
              : refreshing
                ? 'Updating Location...'
              : hasCheckedIn
                ? 'Already Checked In'
                : isOfficeLocationLoading
                  ? 'Loading Office Location...'
                  : officeLocationError
                    ? 'Office Location Unavailable'
                    : !hasValidLocation || permissionStatus !== 'granted'
                  ? 'Location Required'
                  : hasPoorAccuracy
                    ? 'Improve Location Accuracy'
                    : distance !== null && distance > officeLocation.radius
                      ? 'Outside Office Geofence'
                      : 'Check In'
        }
        onPress={() => void handleCheckIn()}
        disabled={!canCheckIn}
        style={styles.checkInButton}
      />
      <AppButton
        title="Office Settings"
        onPress={() => navigation.navigate('OfficeSettings')}
        variant="secondary"
        style={styles.checkInButton}
      />
      {/* {error ? <AppText style={styles.error}>{error}</AppText> : null}
      {!loading && error ? (
        <AppButton
          title="Retry"
          onPress={() => void retry()}
          variant="secondary"
          style={styles.retryButton}
        />
      ) : null}
      <AppButton
        title="View Attendance History"
          onPress={() => navigation.navigate('AttendanceHistory')}
      /> */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f8fafc',
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 20,
    color: '#475569',
  },
  locationInfo: {
    marginBottom: 12,
  },
  coordinates: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  geofenceInfo: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  checkInFeedback: {
    marginBottom: 12,
    textAlign: 'center',
  },
  warning: {
    marginBottom: 12,
    color: '#92400e',
    textAlign: 'center',
  },
  checkInButton: {
    marginBottom: 16,
    width: '100%',
  },
  error: {
    marginBottom: 12,
    color: '#b91c1c',
    textAlign: 'center',
  },
  retryButton: {
    marginBottom: 16,
  },
});
