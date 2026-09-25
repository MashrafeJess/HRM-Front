import { Component, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TokenStorageService } from '../../core/auth/token-storage.service';
import { DepartmentService } from '../department/department.service';
import { Department } from '../department/department.model';
import { EmployeeService } from './employee.service';
import { Employee } from './employee.model';
import { PagedResult } from '../../shared/models/paged-result.model';

@Component({
  selector: 'app-employee-list',
  imports: [RouterLink],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h1 class="h3 mb-0">Employees</h1>
      <a routerLink="/employees/new" class="btn btn-primary btn-sm">+ New Employee</a>
    </div>

    <div class="row g-3 mb-3">
      <div class="col-auto" style="min-width: 220px;">
        <label class="form-label" for="departmentFilter">Department</label>
        <select id="departmentFilter" class="form-select" [value]="departmentId() ?? ''" (change)="onDepartmentChange($event)">
          <option value="">All departments</option>
          @for (department of departments(); track department.departmentId) {
            <option [value]="department.departmentId">{{ department.departmentName }}</option>
          }
        </select>
      </div>
    </div>

    <div class="card shadow-sm border-0">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            @for (employee of employees()?.items ?? []; track employee.id) {
              <tr>
                <td>{{ employee.firstName }} {{ employee.lastName }}</td>
                <td>{{ employee.email }}</td>
                <td>{{ employee.roleName ?? '—' }}</td>
                <td><span class="badge text-bg-secondary">{{ employee.status }}</span></td>
                <td class="text-end">
                  <a [routerLink]="['/employees', employee.id, 'edit']" class="btn btn-outline-primary btn-sm">Edit</a>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="5" class="text-center text-muted py-4">No employees found.</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class EmployeeListComponent {
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly departmentService = inject(DepartmentService);
  private readonly employeeService = inject(EmployeeService);

  // Only a Company Admin reaches this page — always scoped to their own company;
  // GetAllCompany (needed for a picker) is Super Admin-only now.
  companyId = signal<number>(this.tokenStorage.getCompanyId() ?? 0);
  departmentId = signal<number | null>(null);
  departments = signal<Department[]>([]);
  employees = signal<PagedResult<Employee> | undefined>(undefined);

  constructor() {
    effect(() => {
      const companyId = this.companyId();
      this.departmentId.set(null);
      if (!companyId) {
        this.departments.set([]);
        return;
      }
      this.departmentService
        .getAllDepartmentsByCompanyId(companyId, 'asc', 1, 100)
        .subscribe((result) => this.departments.set(result.items));
    });

    effect(() => {
      const companyId = this.companyId();
      const departmentId = this.departmentId();
      if (!companyId) {
        this.employees.set(undefined);
        return;
      }
      this.employeeService
        .getAllEmployeesByCompanyId(companyId, departmentId, 'asc', 1, 100)
        .subscribe((result) => {
          console.log(
            '[EmployeeListComponent] employees loaded, ids for Edit links:',
            result.items.map((e) => ({ id: e.id, firstName: e.firstName })),
          );
          this.employees.set(result);
        });
    });
  }

  onDepartmentChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.departmentId.set(value ? Number(value) : null);
  }
}
