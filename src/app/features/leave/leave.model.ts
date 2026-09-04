export interface LeaveRequest {
  leaveRequestId: number | null;
  companyId: number;
  employeeId: number;
  leaveTypeId: number;
  fromDate: string;
  toDate: string;
  totalDays: number;
  reason: string;
  status: string | null;
  approvedBy: number | null;
  approvedByName: string | null;
  approvedAt: string | null;
  airecommendation: string | null;
  ainotes: string | null;
}

export const LeaveRequestStatus = {
  All: 0,
  Pending: 1,
  Approved: 2,
  Rejected: 3,
  Cancelled: 4,
} as const;

export interface LeaveAttendanceMarkDto {
  employeeId: number;
  companyId: number;
  remarks: string | null;
}
