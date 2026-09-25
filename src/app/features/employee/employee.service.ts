import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { PagedResult } from '../../shared/models/paged-result.model';
import { Employee } from './employee.model';

// The backend's read endpoints (GetAllEmployeesByCompanyId, GetEmployeeById) return the
// employee's id under the key "employeeId", not "id" as API.md documents — confirmed via
// live response inspection. The write endpoint (AddOrUpdateEmployee) still expects "id" in
// its request body, so we normalize on the way in rather than renaming the model field.
type EmployeeApiRecord = Omit<Employee, 'id'> & { id?: number | null; employeeId?: number | null };

function normalizeEmployee(record: EmployeeApiRecord): Employee {
  const normalized = { ...record, id: record.employeeId ?? record.id ?? null };
  console.log('[EmployeeService] normalizeEmployee', { rawId: record.id, rawEmployeeId: record.employeeId, resolvedId: normalized.id });
  return normalized;
}

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private readonly http = inject(HttpClient);

  addOrUpdateEmployee(payload: Employee): Observable<Employee> {
    console.log('[EmployeeService] addOrUpdateEmployee request', { id: payload.id, dto: payload });
    return this.http
      .post<EmployeeApiRecord>('/api/Employee/AddOrUpdateEmployee', { dto: payload })
      .pipe(
        tap((raw) => console.log('[EmployeeService] addOrUpdateEmployee raw response', raw)),
        map(normalizeEmployee),
        tap((employee) => console.log('[EmployeeService] addOrUpdateEmployee normalized response', employee)),
      );
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

    console.log('[EmployeeService] getAllEmployeesByCompanyId request', { companyId, departmentId, viewOrder, pageNumber, pageSize });
    return this.http
      .get<PagedResult<EmployeeApiRecord>>(`/api/Employee/GetAllEmployeesByCompanyId/${companyId}`, { params })
      .pipe(
        tap((raw) => console.log('[EmployeeService] getAllEmployeesByCompanyId raw items', raw.items.map((i) => ({ id: i.id, employeeId: i.employeeId, firstName: i.firstName })))),
        map((result) => ({ ...result, items: result.items.map(normalizeEmployee) })),
        tap((result) => console.log('[EmployeeService] getAllEmployeesByCompanyId normalized ids', result.items.map((i) => i.id))),
      );
  }

  getEmployeeById(employeeId: number): Observable<Employee> {
    console.log('[EmployeeService] getEmployeeById request', { employeeId });
    return this.http
      .get<EmployeeApiRecord>(`/api/Employee/GetEmployeeById/${employeeId}`)
      .pipe(
        tap((raw) => console.log('[EmployeeService] getEmployeeById raw response', raw)),
        map(normalizeEmployee),
      );
  }
}
