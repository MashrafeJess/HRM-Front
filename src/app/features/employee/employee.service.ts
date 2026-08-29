import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Employee, EmployeeUpsertRequest } from './employee.model';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private readonly http = inject(HttpClient);

  addOrUpdateEmployee(payload: Employee): Observable<Employee> {
    const body: EmployeeUpsertRequest = { dto: payload };
    return this.http.post<Employee>('/api/Employee/AddOrUpdateEmployee', body);
  }
}
