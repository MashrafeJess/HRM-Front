import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { RoleService } from './role.service';

@Component({
  selector: 'app-role-list',
  imports: [RouterLink],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h1 class="h3 mb-0">Roles</h1>
      <a routerLink="/roles/new" class="btn btn-primary btn-sm">+ New Role</a>
    </div>

    <div class="card shadow-sm border-0">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th>Name</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            @for (role of roles(); track role.roleId) {
              <tr>
                <td>{{ role.roleName }}</td>
                <td>
                  <span class="badge" [class.text-bg-success]="role.isActive" [class.text-bg-secondary]="!role.isActive">
                    {{ role.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="text-end">
                  <a [routerLink]="['/roles', role.roleId, 'edit']" class="btn btn-outline-primary btn-sm">Edit</a>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="3" class="text-center text-muted py-4">No roles found.</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class RoleListComponent {
  private readonly roleService = inject(RoleService);

  roles = toSignal(this.roleService.getAllRoles(), { initialValue: [] });
}
