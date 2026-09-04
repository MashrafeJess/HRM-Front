import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PagedResult } from '../../shared/models/paged-result.model';
import { Employee } from './employee.model';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private readonly http = inject(HttpClient);

  addOrUpdateEmployee(payload: Employee): Observable<Employee> {
    return this.http.post<Employee>('/api/Employee/AddOrUpdateEmployee', payload);
  }

  getAllEmployeesByCompanyId(
    companyId: number,
    departmentId: number | null,
    viewOrder: 'asc' | 'desc',
    pageNumber: number,
    pageSize: number,
  ): Observable<PagedResult<Employee>> {
    let params = new HttpParams().set('viewOrder', viewOrder).set('pageNumber', pageNumber).set('pageSize', pageSize);
    if (departmentId) {
      params = params.set('departmentId', departmentId);
    }

    return this.http.get<PagedResult<Employee>>(`/api/Employee/GetAllEmployeesByCompanyId/${companyId}`, { params });
  }

  getEmployeeById(employeeId: number): Observable<Employee> {
    return this.http.get<Employee>(`/api/Employee/GetEmployeeById/${employeeId}`);
  }
}
