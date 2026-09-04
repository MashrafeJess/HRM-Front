import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PagedResult } from '../../shared/models/paged-result.model';
import { Department } from './department.model';

@Injectable({ providedIn: 'root' })
export class DepartmentService {
  private readonly http = inject(HttpClient);

  editDepartment(payload: Department): Observable<Department> {
    return this.http.post<Department>('/api/Department/EditDepartment', payload);
  }

  getAllDepartmentsByCompanyId(
    companyId: number,
    viewOrder: 'asc' | 'desc',
    pageNumber: number,
    pageSize: number,
  ): Observable<PagedResult<Department>> {
    const params = new HttpParams().set('viewOrder', viewOrder).set('pageNumber', pageNumber).set('pageSize', pageSize);
    return this.http.get<PagedResult<Department>>(`/api/Department/AllDepartmentsByCompanyId/${companyId}`, { params });
  }

  getDepartmentById(departmentId: number): Observable<Department> {
    // Backend route has no separator before the id (documented bug in API.md) — do not add a slash here.
    return this.http.get<Department>(`/api/Department/GetDepartmentById${departmentId}`);
  }
}
