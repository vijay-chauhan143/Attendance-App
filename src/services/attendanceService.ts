import AsyncStorage from '@react-native-async-storage/async-storage';

import { AttendanceRecord } from '@/types/attendance';

const ATTENDANCE_STORAGE_KEY = 'attendance_records';

export async function getAttendanceRecords(): Promise<AttendanceRecord[]> {
	const storedRecords = await AsyncStorage.getItem(ATTENDANCE_STORAGE_KEY);

	if (storedRecords === null) {
		return [];
	}

	const records: unknown = JSON.parse(storedRecords);
	if (!Array.isArray(records)) {
		throw new Error('Saved attendance data is invalid.');
	}

	return records as AttendanceRecord[];
}

export async function saveAttendanceRecord(
	record: AttendanceRecord,
): Promise<void> {
	const records = await getAttendanceRecords();
	await AsyncStorage.setItem(
		ATTENDANCE_STORAGE_KEY,
		JSON.stringify([...records, record]),
	);
}

export async function hasCheckedInToday(): Promise<boolean> {
	const records = await getAttendanceRecords();
	const today = new Date();

	return records.some((record) => {
		const recordDate = new Date(record.date);

		return (
			!Number.isNaN(recordDate.getTime()) &&
			recordDate.getFullYear() === today.getFullYear() &&
			recordDate.getMonth() === today.getMonth() &&
			recordDate.getDate() === today.getDate()
		);
	});
}
