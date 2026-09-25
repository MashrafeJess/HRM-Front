import { Component, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TokenStorageService } from '../../core/auth/token-storage.service';
import { DepartmentService } from './department.service';
import { Department } from './department.model';
import { PagedResult } from '../../shared/models/paged-result.model';

@Component({
  selector: 'app-department-list',
  imports: [RouterLink],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h1 class="h3 mb-0">Departments</h1>
      <a [routerLink]="['/departments/new']" [queryParams]="{ companyId: companyId() }" class="btn btn-primary btn-sm">
        + New Department
      </a>
    </div>

    <div class="card shadow-sm border-0">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Employees</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            @for (department of departments()?.items ?? []; track department.departmentId) {
              <tr>
                <td>{{ department.departmentName }}</td>
                <td>{{ department.description }}</td>
                <td>{{ department.employeeCount ?? '—' }}</td>
                <td>
                  <span class="badge" [class.text-bg-success]="department.isActive" [class.text-bg-secondary]="!department.isActive">
                    {{ department.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="text-end">
                  <a [routerLink]="['/departments', department.departmentId, 'edit']" class="btn btn-outline-primary btn-sm">
                    Edit
                  </a>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="5" class="text-center text-muted py-4">No departments found.</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class DepartmentListComponent {
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly departmentService = inject(DepartmentService);

  // Only a Company Admin reaches this page (route-guarded), and a Company Admin has
  // exactly one company — GetAllCompany is Super Admin-only now, so there is nothing
  // to pick from here; always scope to the admin's own company.
  companyId = signal<number>(this.tokenStorage.getCompanyId() ?? 0);
  departments = signal<PagedResult<Department> | undefined>(undefined);

  constructor() {
    effect(() => {
      const companyId = this.companyId();
      if (!companyId) {
        this.departments.set(undefined);
        return;
      }
      this.departmentService
        .getAllDepartmentsByCompanyId(companyId, 'asc', 1, 100)
        .subscribe((result) => this.departments.set(result));
    });
  }
}
