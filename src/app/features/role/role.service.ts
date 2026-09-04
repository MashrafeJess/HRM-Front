import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Role } from './role.model';

@Injectable({ providedIn: 'root' })
export class RoleService {
  private readonly http = inject(HttpClient);

  addOrUpdateRole(payload: Role): Observable<Role> {
    return this.http.post<Role>('/api/Role/AddOrUpdateRole', payload);
  }

  getAllRoles(): Observable<Role[]> {
    return this.http.get<Role[]>('/api/Role/GetAllRoles');
  }

  getRoleById(roleId: number): Observable<Role> {
    return this.http.get<Role>(`/api/Role/GetRoleById/${roleId}`);
  }
}
