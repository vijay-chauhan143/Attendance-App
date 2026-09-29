import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/common/AppText';
import { getAttendanceRecords } from '@/services/attendanceService';
import { AttendanceRecord } from '@/types/attendance';

export function AttendanceHistoryScreen() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isFocused = true;

      const loadRecords = async () => {
        setIsLoading(true);
        setError(null);

        try {
          const storedRecords = await getAttendanceRecords();
          if (isFocused) {
            setRecords(
              [...storedRecords].sort(
                (first, second) =>
                  new Date(second.date).getTime() - new Date(first.date).getTime(),
              ),
            );
          }
        } catch {
          if (isFocused) {
            setRecords([]);
            setError('Unable to load attendance records. Please try again.');
          }
        } finally {
          if (isFocused) {
            setIsLoading(false);
          }
        }
      };

      void Promise.resolve().then(loadRecords);

      return () => {
        isFocused = false;
      };
    }, []),
  );

  const renderRecord = ({ item }: { item: AttendanceRecord }) => {
    const date = new Date(item.date);

    return (
      <View style={styles.record}>
        <AppText>Date: {date.toLocaleDateString(undefined, {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })}</AppText>
        <AppText>Time: {date.toLocaleTimeString(undefined, {
          hour: 'numeric',
          minute: '2-digit',
        })}</AppText>
        <AppText>Distance: {Math.round(item.distance)} m</AppText>
        <AppText>
          Location: {item.latitude.toFixed(6)}, {item.longitude.toFixed(6)}
        </AppText>
        <AppText>
          Status: {item.status === 'checked-in' ? 'Checked In' : item.status}
        </AppText>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <AppText preset="title">Attendance History</AppText>
      {isLoading ? (
        <View style={styles.state}>
          <AppText>Loading attendance records...</AppText>
        </View>
      ) : error ? (
        <View style={styles.state}>
          <AppText style={styles.error}>{error}</AppText>
        </View>
      ) : (
        <FlatList<AttendanceRecord>
          data={records}
          keyExtractor={(record) => record.id}
          renderItem={renderRecord}
          contentContainerStyle={records.length === 0 ? styles.emptyList : undefined}
          ListEmptyComponent={<AppText>No attendance records found.</AppText>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#f8fafc',
  },
  state: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  record: {
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#cbd5e1',
    gap: 4,
  },
  error: {
    color: '#b91c1c',
    textAlign: 'center',
  },
});
