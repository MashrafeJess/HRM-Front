import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { form, required, FormField, FormRoot } from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';
import { EmployeeService } from './employee.service';
import { Employee } from './employee.model';

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
  status: 'Working',
  isActive: null,
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
              <label class="form-label" for="companyId">Company Id</label>
              <input id="companyId" type="number" class="form-control" [formField]="employeeForm.companyId" />
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label" for="departmentId">Department Id</label>
              <input id="departmentId" type="number" class="form-control" [formField]="employeeForm.departmentId" />
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
            <div class="col-md-6 mb-4">
              <label class="form-label" for="status">Status</label>
              <input id="status" class="form-control" [formField]="employeeForm.status" />
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
  private readonly route = inject(ActivatedRoute);

  employeeModel = signal<EmployeeFormModel>({ ...EMPTY_EMPLOYEE });
  saved = signal(false);

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
          this.employeeModel.set({ ...result, password: '' });
          this.saved.set(true);
        },
      },
    },
  );

  constructor() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.employeeModel.update((employee) => ({ ...employee, id: Number(idParam) }));
    }
  }
}
