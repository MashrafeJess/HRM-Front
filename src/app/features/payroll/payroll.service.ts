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
}
