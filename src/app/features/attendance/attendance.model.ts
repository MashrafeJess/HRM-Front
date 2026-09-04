export interface Attendance {
  attendanceId: number | null;
  companyId: number;
  employeeId: number;
  attendanceDate: string;
  checkIn: string | null;
  checkOut: string | null;
  workingHours: number | null;
  lateMinutes: number | null;
  earlyLeaveMinutes: number | null;
  status: string | null;
  remarks: string | null;
  createdAt: string | null;
}

export type AttendanceCheckInOutRequest = Omit<
  Attendance,
  'workingHours' | 'lateMinutes' | 'earlyLeaveMinutes' | 'createdAt'
>;

export interface AttendanceStatistics {
  presentDays: number;
  lateDays: number;
  leaveDays: number;
  attendanceRatio: number;
}

export interface PerfectAttendanceEmployeeSummary {
  employeeId: number;
  employeeName: string | null;
  departmentName: string | null;
  totalAbsent: number | null;
}

export interface AttendanceSummary {
  averageAttendanceRate: number | null;
  totalLateArrivals: number | null;
  numOfPerfectAttendance: number | null;
  employeeList: PerfectAttendanceEmployeeSummary[] | null;
  mostPunctualDepartmentId: number | null;
  mostPunctualDepartmentName: string | null;
  lateRate: number | null;
  highestAbsenteeId: number | null;
  highestAbsenteeName: string | null;
}

export interface AttendanceSummaryForADay {
  totalEmployees: number;
  totalPresent: number;
  totalLate: number;
  totalLeave: number;
  totalAbsent: number;
  totalAbsentArrival: number;
}
