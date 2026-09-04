import { Component, effect, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { form, required, FormField, FormRoot } from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';
import { EmployeeService } from './employee.service';
import { Employee } from './employee.model';
import { CompanyService } from '../company/company.service';
import { DepartmentService } from '../department/department.service';
import { Department } from '../department/department.model';
import { RoleService } from '../role/role.service';

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
  imports: [FormField, FormRoot],
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
              <label class="form-label" for="companyId">Company</label>
              <select id="companyId" class="form-select" [value]="employeeModel().companyId" (change)="onCompanyChange($event)">
                <option [value]="0" disabled>Select a company</option>
                @for (company of companies()?.items ?? []; track company.companyId) {
                  <option [value]="company.companyId">{{ company.companyName }}</option>
                }
              </select>
            </div>
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
            @if (saved()) {
              <span class="text-success small">Saved.</span>
            }
          </div>
        </form>
      </div>
    </div>
  `,
})
export class EmployeeFormComponent {
  private readonly employeeService = inject(EmployeeService);
  private readonly companyService = inject(CompanyService);
  private readonly departmentService = inject(DepartmentService);
  private readonly roleService = inject(RoleService);
  private readonly route = inject(ActivatedRoute);

  employeeModel = signal<EmployeeFormModel>({ ...EMPTY_EMPLOYEE });
  saved = signal(false);

  companies = toSignal(this.companyService.getAllCompanies('asc', 1, 100));
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
          const result = await firstValueFrom(this.employeeService.addOrUpdateEmployee(this.employeeModel()));
          this.employeeModel.update((current) => ({ ...current, ...result, password: '' }));
          this.saved.set(true);
        },
      },
    },
  );

  onCompanyChange(event: Event): void {
    const companyId = Number((event.target as HTMLSelectElement).value);
    this.employeeModel.update((current) => ({ ...current, companyId, departmentId: 0 }));
  }

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
    if (idParam) {
      const employeeId = Number(idParam);
      this.employeeService.getEmployeeById(employeeId).subscribe((employee) => {
        this.employeeModel.set({ ...employee, id: employeeId, password: '' });
      });
    }
  }
}
