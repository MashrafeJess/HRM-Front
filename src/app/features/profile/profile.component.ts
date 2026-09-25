import { Component, inject, signal } from '@angular/core';
import { TokenStorageService } from '../../core/auth/token-storage.service';
import { AuthService } from '../../core/auth/auth.service';
import { EmployeeService } from '../employee/employee.service';
import { CompanyService } from '../company/company.service';
import { DepartmentService } from '../department/department.service';
import { Employee } from '../employee/employee.model';
import { Company } from '../company/company.model';
import { Department } from '../department/department.model';

@Component({
  selector: 'app-profile',
  template: `
    <h1 class="h3 mb-3">My Profile</h1>

    <div class="card shadow-sm border-0 mb-3">
      <div class="card-body d-flex align-items-center gap-3">
        @if (company()?.logoUrl && !logoFailed()) {
          <img
            [src]="company()!.logoUrl"
            (error)="logoFailed.set(true)"
            alt="{{ company()?.companyName }} logo"
            width="56"
            height="56"
            class="rounded object-fit-cover flex-shrink-0"
          />
        } @else {
          <div
            class="rounded bg-secondary-subtle d-flex align-items-center justify-content-center text-muted fw-semibold flex-shrink-0"
            style="width: 56px; height: 56px;"
          >
            {{ (company()?.companyName ?? 'C').charAt(0) }}
          </div>
        }

        <div>
          <div class="fw-semibold fs-4">{{ employee()?.firstName }} {{ employee()?.lastName || authService.currentUser()?.name }}</div>
          <div class="text-muted small">
            {{ company()?.companyName ?? '—' }}
            @if (department()?.departmentName) {
              · {{ department()?.departmentName }}
            }
          </div>
        </div>
      </div>
    </div>

    <div class="card shadow-sm border-0">
      <div class="card-body">
        <h2 class="h5 mb-3">Employee Details</h2>
        <dl class="row mb-0">
          <dt class="col-sm-3">Name</dt>
          <dd class="col-sm-9">{{ employee()?.firstName }} {{ employee()?.lastName }}</dd>

          <dt class="col-sm-3">Email</dt>
          <dd class="col-sm-9">{{ employee()?.email ?? authService.currentUser()?.email }}</dd>

          <dt class="col-sm-3">Phone</dt>
          <dd class="col-sm-9">{{ employee()?.phone ?? '—' }}</dd>

          <dt class="col-sm-3">Role</dt>
          <dd class="col-sm-9">{{ employee()?.roleName ?? authService.currentUser()?.role }}</dd>

          <dt class="col-sm-3">Employee Code</dt>
          <dd class="col-sm-9">{{ employee()?.employeeCode ?? '—' }}</dd>

          <dt class="col-sm-3">Join Date</dt>
          <dd class="col-sm-9">{{ employee()?.joinDate ?? '—' }}</dd>
        </dl>
      </div>
    </div>
  `,
})
export class ProfileComponent {
  protected readonly authService = inject(AuthService);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly employeeService = inject(EmployeeService);
  private readonly companyService = inject(CompanyService);
  private readonly departmentService = inject(DepartmentService);

  employee = signal<Employee | null>(null);
  company = signal<Company | null>(null);
  department = signal<Department | null>(null);
  logoFailed = signal(false);

  constructor() {
    const employeeId = this.tokenStorage.getEmployeeId();
    const companyId = this.tokenStorage.getCompanyId();
    const departmentId = this.tokenStorage.getDepartmentId();

    if (employeeId) {
      this.employeeService.getEmployeeById(employeeId).subscribe({
        next: (employee) => this.employee.set(employee),
        error: (error) => console.error('[Profile] failed to load employee', error),
      });
    }

    if (companyId) {
      this.companyService.getCompanyById(companyId).subscribe({
        next: (company) => this.company.set(company),
        error: (error) => console.error('[Profile] failed to load company', error),
      });
    }

    if (departmentId) {
      this.departmentService.getDepartmentById(departmentId).subscribe({
        next: (department) => this.department.set(department),
        error: (error) => console.error('[Profile] failed to load department', error),
      });
    }
  }
}
