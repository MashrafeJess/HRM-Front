import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Payroll } from './payroll.model';

@Injectable({ providedIn: 'root' })
export class PayrollService {
  private readonly http = inject(HttpClient);

  getPayrollForEmployee(employeeId: number, yearId: number, monthId: number): Observable<Payroll> {
    const params = new HttpParams().set('employeeId', employeeId).set('yearId', yearId).set('monthId', monthId);
    return this.http.get<Payroll>('/api/Payroll/GetPayRollForEmployee', { params });
  }

  getPayrollForCompany(companyId: number, yearId: number, monthId: number): Observable<Payroll[]> {
    const params = new HttpParams().set('companyId', companyId).set('yearId', yearId).set('monthId', monthId);
    return this.http.get<Payroll[]>('/api/Payroll/GetPayRollForCompany', { params });
  }

  getLivePayrollStatusForEmployee(employeeId: number): Observable<Payroll> {
    // Computed live from current attendance data on every call — nothing is persisted,
    // so payrollId stays 0 and generatedAt stays null in the response.
    const params = new HttpParams().set('employeeId', employeeId);
    return this.http.get<Payroll>('/api/Payroll/GetPayrollStatusForEmployee', { params });
  }
}
