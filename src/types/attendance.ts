export type AttendanceRecord = {
  id: string;
  date: string;
  latitude: number;
  longitude: number;
  distance: number;
  status: 'checked-in';
};
