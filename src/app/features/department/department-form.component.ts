import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { form, required, FormField, FormRoot } from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';
import { CompanyService } from '../company/company.service';
import { DepartmentService } from './department.service';
import { Department } from './department.model';

const EMPTY_DEPARTMENT: Department = {
  departmentId: null,
  companyId: 0,
  departmentName: '',
  description: '',
  isActive: true,
  employeeCount: null,
  createdAt: null,
  updatedAt: null,
};

@Component({
  selector: 'app-department-form',
  imports: [FormField, FormRoot],
  template: `
    <h1 class="h3 mb-4">{{ departmentModel().departmentId ? 'Edit' : 'New' }} Department</h1>

    <div class="card shadow-sm border-0" style="max-width: 640px;">
      <div class="card-body p-4">
        <form [formRoot]="departmentForm">
          <div class="mb-3">
            <label class="form-label" for="companyId">Company</label>
            <select
              id="companyId"
              class="form-select"
              [value]="departmentModel().companyId"
              (change)="onCompanyChange($event)"
            >
              <option [value]="0" disabled>Select a company</option>
              @for (company of companies()?.items ?? []; track company.companyId) {
                <option [value]="company.companyId">{{ company.companyName }}</option>
              }
            </select>
          </div>

          <div class="mb-3">
            <label class="form-label" for="departmentName">Name</label>
            <input
              id="departmentName"
              class="form-control"
              [class.is-invalid]="departmentForm.departmentName().touched() && departmentForm.departmentName().invalid()"
              [formField]="departmentForm.departmentName"
            />
            @if (departmentForm.departmentName().touched() && departmentForm.departmentName().invalid()) {
              <div class="invalid-feedback">{{ departmentForm.departmentName().errors()[0].message }}</div>
            }
          </div>

          <div class="mb-3">
            <label class="form-label" for="description">Description</label>
            <textarea id="description" class="form-control" rows="3" [formField]="departmentForm.description"></textarea>
          </div>

          <div class="form-check mb-4">
            <input id="isActive" type="checkbox" class="form-check-input" [formField]="departmentForm.isActive" />
            <label class="form-check-label" for="isActive">Active</label>
          </div>

          <div class="d-flex align-items-center gap-3">
            <button type="submit" class="btn btn-primary" [disabled]="!departmentForm().valid()">Save</button>
            @if (saved()) {
              <span class="text-success small">Saved.</span>
            }
          </div>
        </form>
      </div>
    </div>
  `,
})
export class DepartmentFormComponent {
  private readonly departmentService = inject(DepartmentService);
  private readonly companyService = inject(CompanyService);
  private readonly route = inject(ActivatedRoute);

  companies = toSignal(this.companyService.getAllCompanies('asc', 1, 100));
  departmentModel = signal<Department>({ ...EMPTY_DEPARTMENT });
  saved = signal(false);

  departmentForm = form(
    this.departmentModel,
    (schemaPath) => {
      required(schemaPath.departmentName, { message: 'Department name is required' });
    },
    {
      submission: {
        action: async () => {
          const result = await firstValueFrom(this.departmentService.editDepartment(this.departmentModel()));
          this.departmentModel.update((current) => ({ ...current, ...result }));
          this.saved.set(true);
        },
      },
    },
  );

  onCompanyChange(event: Event): void {
    this.departmentModel.update((current) => ({
      ...current,
      companyId: Number((event.target as HTMLSelectElement).value),
    }));
  }

  constructor() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.departmentService.getDepartmentById(Number(idParam)).subscribe((department) => this.departmentModel.set(department));
      return;
    }

    const companyIdParam = this.route.snapshot.queryParamMap.get('companyId');
    if (companyIdParam) {
      this.departmentModel.update((current) => ({ ...current, companyId: Number(companyIdParam) }));
    }
  }
}
