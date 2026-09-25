import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Attendance,
  AttendanceCheckInOutRequest,
  AttendanceStatistics,
  AttendanceSummary,
  AttendanceSummaryForADay,
} from './attendance.model';

@Injectable({ providedIn: 'root' })
export class AttendanceService {
  private readonly http = inject(HttpClient);

  checkInOrOut(payload: AttendanceCheckInOutRequest): Observable<Attendance> {
    // Literal, unencoded "&" in the route (documented in API.md) — pass the path as-is.
    console.log('[AttendanceService] POST /api/Attendance/CheckIn&CheckOut', { dto: payload });
    return this.http.post<Attendance>('/api/Attendance/CheckIn&CheckOut', { dto: payload });
  }

  getAttendanceByDate(companyId: number, date: string): Observable<Attendance[]> {
    const params = new HttpParams().set('companyId', companyId).set('date', date);
    return this.http.get<Attendance[]>('/api/Attendance/GetAttendanceByDate', { params });
  }

  getAttendanceByEmployeeId(employeeId: number): Observable<Attendance[]> {
    const params = new HttpParams().set('employeeId', employeeId);
    return this.http.get<Attendance[]>('/api/Attendance/GetAttendanceByEmployeeId', { params });
  }

  getAttendanceStatisticsByEmployeeId(employeeId: number, monthId: number, yearId: number): Observable<AttendanceStatistics> {
    const params = new HttpParams().set('employeeId', employeeId).set('monthId', monthId).set('yearId', yearId);
    return this.http.get<AttendanceStatistics>('/api/Attendance/GetAttendancesStatisticsByEmployeeId', { params });
  }

  getAttendanceSummaryForMonth(companyId: number, monthId: number, yearId: number): Observable<AttendanceSummary> {
    const params = new HttpParams().set('companyId', companyId).set('monthId', monthId).set('yearId', yearId);
    return this.http.get<AttendanceSummary>('/api/Attendance/GetAttendanceSummaryForMonth', { params });
  }

  getAttendanceSummaryForADay(companyId: number, date: string): Observable<AttendanceSummaryForADay> {
    const params = new HttpParams().set('companyId', companyId).set('date', date);
    return this.http.get<AttendanceSummaryForADay>('/api/Attendance/GetAttendanceSummaryForADay', { params });
  }
}
