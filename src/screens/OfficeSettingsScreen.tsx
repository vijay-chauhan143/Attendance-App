import { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { AppButton } from '@/components/common/AppButton';
import { AppText } from '@/components/common/AppText';
import { useOfficeLocation } from '@/contexts/OfficeLocationContext';

type OfficeLocationDraft = {
  latitude: string;
  longitude: string;
  radius: string;
};

export function OfficeSettingsScreen() {
  const {
    officeLocation,
    isLoading,
    error: officeLocationError,
    saveOfficeLocation,
    resetOfficeLocation,
  } = useOfficeLocation();
  const [draft, setDraft] = useState<OfficeLocationDraft | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const latitude = draft?.latitude ?? String(officeLocation.latitude);
  const longitude = draft?.longitude ?? String(officeLocation.longitude);
  const radius = draft?.radius ?? String(officeLocation.radius);

  const updateDraft = (field: keyof OfficeLocationDraft, value: string) => {
    setDraft((current) => ({
      latitude: current?.latitude ?? String(officeLocation.latitude),
      longitude: current?.longitude ?? String(officeLocation.longitude),
      radius: current?.radius ?? String(officeLocation.radius),
      [field]: value,
    }));
  };

  const handleSave = async () => {
    setValidationError(null);
    setFeedback(null);

    const nextLatitude = Number(latitude.trim());
    const nextLongitude = Number(longitude.trim());
    const nextRadius = Number(radius.trim());

    if (
      latitude.trim() === '' ||
      !Number.isFinite(nextLatitude) ||
      nextLatitude < -90 ||
      nextLatitude > 90
    ) {
      setValidationError('Latitude must be a number between -90 and 90.');
      return;
    }

    if (
      longitude.trim() === '' ||
      !Number.isFinite(nextLongitude) ||
      nextLongitude < -180 ||
      nextLongitude > 180
    ) {
      setValidationError('Longitude must be a number between -180 and 180.');
      return;
    }

    if (radius.trim() === '' || !Number.isFinite(nextRadius) || nextRadius <= 0) {
      setValidationError('Geofence radius must be a number greater than 0.');
      return;
    }

    setIsSaving(true);
    try {
      await saveOfficeLocation({
        latitude: nextLatitude,
        longitude: nextLongitude,
        radius: nextRadius,
      });
      setDraft(null);
      setFeedback('Office location saved successfully.');
    } catch (caughtError) {
      setFeedback(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to save office location.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    setValidationError(null);
    setFeedback(null);
    setIsSaving(true);

    try {
      await resetOfficeLocation();
      setDraft(null);
      setFeedback('Office location reset to default.');
    } catch (caughtError) {
      setFeedback(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to reset office location.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <AppText preset="title">Office Settings</AppText>
      <AppText style={styles.description}>
        Set the office coordinates and permitted check-in radius.
      </AppText>
      {isLoading ? <AppText>Loading saved office location...</AppText> : null}
      {officeLocationError ? (
        <AppText style={styles.error}>{officeLocationError}</AppText>
      ) : null}

      <View style={styles.field}>
        <AppText>Office Latitude</AppText>
        <TextInput
          accessibilityLabel="Office Latitude"
          value={latitude}
          onChangeText={(value) => updateDraft('latitude', value)}
          keyboardType="numbers-and-punctuation"
          editable={!isLoading && !isSaving}
          style={styles.input}
        />
      </View>

      <View style={styles.field}>
        <AppText>Office Longitude</AppText>
        <TextInput
          accessibilityLabel="Office Longitude"
          value={longitude}
          onChangeText={(value) => updateDraft('longitude', value)}
          keyboardType="numbers-and-punctuation"
          editable={!isLoading && !isSaving}
          style={styles.input}
        />
      </View>

      <View style={styles.field}>
        <AppText>Geofence Radius (meters)</AppText>
        <TextInput
          accessibilityLabel="Geofence Radius in meters"
          value={radius}
          onChangeText={(value) => updateDraft('radius', value)}
          keyboardType="numbers-and-punctuation"
          editable={!isLoading && !isSaving}
          style={styles.input}
        />
      </View>

      {validationError ? (
        <AppText style={styles.error}>{validationError}</AppText>
      ) : null}
      {feedback ? <AppText style={styles.feedback}>{feedback}</AppText> : null}

      <AppButton
        title={isSaving ? 'Saving...' : 'Save Office Location'}
        onPress={() => void handleSave()}
        disabled={isLoading || isSaving}
        style={styles.button}
      />
      <AppButton
        title={isSaving ? 'Saving...' : 'Reset to Default'}
        onPress={() => void handleReset()}
        variant="secondary"
        disabled={isLoading || isSaving}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: '#f8fafc',
  },
  description: {
    marginTop: 8,
    marginBottom: 24,
    color: '#475569',
  },
  field: {
    marginBottom: 18,
    gap: 6,
  },
  input: {
    minHeight: 48,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#94a3b8',
    borderRadius: 6,
    backgroundColor: '#ffffff',
    color: '#0f172a',
    fontSize: 16,
  },
  error: {
    marginBottom: 12,
    color: '#b91c1c',
  },
  feedback: {
    marginBottom: 12,
    color: '#166534',
  },
  button: {
    marginBottom: 12,
  },
});