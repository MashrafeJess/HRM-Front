import { Component, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { form, required, FormField, FormRoot } from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';
import { EmployeeService } from './employee.service';
import { Employee } from './employee.model';
import { TokenStorageService } from '../../core/auth/token-storage.service';
import { DepartmentService } from '../department/department.service';
import { Department } from '../department/department.model';
import { RoleService } from '../role/role.service';
import { ErrorModalComponent } from '../../shared/error-modal.component';
import { extractErrorMessage } from '../../shared/http-error.util';

type EmployeeFormModel = Omit<Employee, 'password'> & { password: string };

const EMPTY_EMPLOYEE: EmployeeFormModel = {
  id: null,
  companyId: 0,
  departmentId: 0,
  employeeCode: null,
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  phone: '',
  roleId: null,
  roleName: null,
  gender: '',
  dateOfBirth: '',
  joinDate: '',
  salary: 0,
  status: 'Active',
  isActive: true,
};

@Component({
  selector: 'app-employee-form',
  imports: [FormField, FormRoot, ErrorModalComponent],
  template: `
    <h1 class="h3 mb-4">{{ employeeModel().id ? 'Edit' : 'New' }} Employee</h1>

    <div class="card shadow-sm border-0" style="max-width: 720px;">
      <div class="card-body p-4">
        <form [formRoot]="employeeForm">
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label" for="firstName">First Name</label>
              <input
                id="firstName"
                class="form-control"
                [class.is-invalid]="employeeForm.firstName().touched() && employeeForm.firstName().invalid()"
                [formField]="employeeForm.firstName"
              />
              @if (employeeForm.firstName().touched() && employeeForm.firstName().invalid()) {
                <div class="invalid-feedback">{{ employeeForm.firstName().errors()[0].message }}</div>
              }
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label" for="lastName">Last Name</label>
              <input id="lastName" class="form-control" [formField]="employeeForm.lastName" />
            </div>
          </div>

          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label" for="email">Email</label>
              <input
                id="email"
                type="email"
                class="form-control"
                [class.is-invalid]="employeeForm.email().touched() && employeeForm.email().invalid()"
                [formField]="employeeForm.email"
              />
              @if (employeeForm.email().touched() && employeeForm.email().invalid()) {
                <div class="invalid-feedback">{{ employeeForm.email().errors()[0].message }}</div>
              }
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label" for="password">Password</label>
              <input id="password" type="password" class="form-control" [formField]="employeeForm.password" />
            </div>
          </div>

          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label" for="phone">Phone</label>
              <input id="phone" class="form-control" [formField]="employeeForm.phone" />
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label" for="gender">Gender</label>
              <input id="gender" class="form-control" [formField]="employeeForm.gender" />
            </div>
          </div>

          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label" for="departmentId">Department</label>
              <select
                id="departmentId"
                class="form-select"
                [value]="employeeModel().departmentId"
                (change)="onDepartmentChange($event)"
              >
                <option [value]="0" disabled>Select a department</option>
                @for (department of departments(); track department.departmentId) {
                  <option [value]="department.departmentId">{{ department.departmentName }}</option>
                }
              </select>
            </div>
          </div>

          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label" for="roleId">Role</label>
              <select id="roleId" class="form-select" [value]="employeeModel().roleId ?? ''" (change)="onRoleChange($event)">
                <option value="">Select a role</option>
                @for (role of roles(); track role.roleId) {
                  <option [value]="role.roleId">{{ role.roleName }}</option>
                }
              </select>
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label" for="status">Status</label>
              <input id="status" class="form-control" [formField]="employeeForm.status" />
            </div>
          </div>

          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label" for="dateOfBirth">Date of Birth</label>
              <input id="dateOfBirth" type="date" class="form-control" [formField]="employeeForm.dateOfBirth" />
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label" for="joinDate">Join Date</label>
              <input id="joinDate" type="date" class="form-control" [formField]="employeeForm.joinDate" />
            </div>
          </div>

          <div class="row">
            <div class="col-md-6 mb-4">
              <label class="form-label" for="salary">Salary</label>
              <input id="salary" type="number" class="form-control" [formField]="employeeForm.salary" />
            </div>
          </div>

          <div class="d-flex align-items-center gap-3">
            <button type="submit" class="btn btn-primary" [disabled]="!employeeForm().valid()">Save</button>
          </div>
        </form>
      </div>
    </div>

    <app-error-modal [message]="errorMessage()" (closed)="errorMessage.set(null)" />
  `,
})
export class EmployeeFormComponent {
  private readonly employeeService = inject(EmployeeService);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly departmentService = inject(DepartmentService);
  private readonly roleService = inject(RoleService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  // Only a Company Admin reaches this page — always scoped to their own company;
  // GetAllCompany (needed for a picker) is Super Admin-only now.
  employeeModel = signal<EmployeeFormModel>({ ...EMPTY_EMPLOYEE, companyId: this.tokenStorage.getCompanyId() ?? 0 });
  errorMessage = signal<string | null>(null);

  roles = toSignal(this.roleService.getAllRoles(), { initialValue: [] });
  departments = signal<Department[]>([]);

  employeeForm = form(
    this.employeeModel,
    (schemaPath) => {
      required(schemaPath.firstName, { message: 'First name is required' });
      required(schemaPath.email, { message: 'Email is required' });
    },
    {
      submission: {
        action: async () => {
          try {
            await firstValueFrom(this.employeeService.addOrUpdateEmployee(this.employeeModel()));
            this.router.navigateByUrl('/employees');
          } catch (error) {
            this.errorMessage.set(extractErrorMessage(error));
          }
        },
      },
    },
  );

  onDepartmentChange(event: Event): void {
    const departmentId = Number((event.target as HTMLSelectElement).value);
    this.employeeModel.update((current) => ({ ...current, departmentId }));
  }

  onRoleChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.employeeModel.update((current) => ({ ...current, roleId: value ? Number(value) : null }));
  }

  constructor() {
    effect(() => {
      const companyId = this.employeeModel().companyId;
      if (!companyId) {
        this.departments.set([]);
        return;
      }
      this.departmentService
        .getAllDepartmentsByCompanyId(companyId, 'asc', 1, 100)
        .subscribe((result) => this.departments.set(result.items));
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    console.log('[EmployeeFormComponent] constructor, idParam from route =', idParam);
    if (idParam) {
      const employeeId = Number(idParam);
      console.log('[EmployeeFormComponent] loading existing employee, employeeId =', employeeId);
      this.employeeService.getEmployeeById(employeeId).subscribe({
        next: (employee) => {
          console.log('[EmployeeFormComponent] loaded employee for edit', employee);
          this.employeeModel.set({ ...employee, id: employeeId, password: '' });
        },
        error: (error) => {
          console.error('[EmployeeFormComponent] failed to load employee for edit, falling back to blank form', error);
        },
      });
    }
  }
}
