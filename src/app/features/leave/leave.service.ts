import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LeaveAttendanceMarkDto, LeaveRequest } from './leave.model';

@Injectable({ providedIn: 'root' })
export class LeaveService {
  private readonly http = inject(HttpClient);

  addLeaveRequest(payload: LeaveRequest): Observable<unknown> {
    // Backend returns an empty {} (MediatR Unit) — re-fetch via a GET endpoint if the saved record is needed.
    return this.http.post('/api/Leave/AddLeaveRequest', { dto: payload });
  }

  getLeaveRequestByEmployeeId(employeeId: number): Observable<LeaveRequest[]> {
    const params = new HttpParams().set('employeeId', employeeId);
    return this.http.get<LeaveRequest[]>('/api/Leave/GetLeaveRequestByEmployeeId', { params });
  }

  getLeaveRequestByStatus(status: number, companyId: number): Observable<LeaveRequest[]> {
    const params = new HttpParams().set('id', status).set('companyId', companyId);
    return this.http.get<LeaveRequest[]>('/api/Leave/GetLeaveRequestByStatus', { params });
  }

  getEmployeeLeaveRequestsByEmployeeId(employeeId: number): Observable<LeaveRequest[]> {
    const params = new HttpParams().set('employeeId', employeeId);
    return this.http.get<LeaveRequest[]>('/api/Leave/GetEmployeeLeaveRequestsByEmployeeId', { params });
  }

  updateLeaveRequestStatus(dto: LeaveAttendanceMarkDto, fromDate: string, toDate: string): Observable<boolean> {
    return this.http.post<boolean>('/api/Leave/UpdateLeaveRequestStatus', { dto, fromDate, toDate });
  }
}
