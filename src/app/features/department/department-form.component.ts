import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { form, required, FormField, FormRoot } from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';
import { TokenStorageService } from '../../core/auth/token-storage.service';
import { DepartmentService } from './department.service';
import { Department } from './department.model';
import { ErrorModalComponent } from '../../shared/error-modal.component';
import { extractErrorMessage } from '../../shared/http-error.util';

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
  imports: [FormField, FormRoot, ErrorModalComponent],
  template: `
    <h1 class="h3 mb-4">{{ departmentModel().departmentId ? 'Edit' : 'New' }} Department</h1>

    <div class="card shadow-sm border-0" style="max-width: 640px;">
      <div class="card-body p-4">
        <form [formRoot]="departmentForm">
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
          </div>
        </form>
      </div>
    </div>

    <app-error-modal [message]="errorMessage()" (closed)="errorMessage.set(null)" />
  `,
})
export class DepartmentFormComponent {
  private readonly departmentService = inject(DepartmentService);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  departmentModel = signal<Department>({ ...EMPTY_DEPARTMENT });
  errorMessage = signal<string | null>(null);

  departmentForm = form(
    this.departmentModel,
    (schemaPath) => {
      required(schemaPath.departmentName, { message: 'Department name is required' });
    },
    {
      submission: {
        action: async () => {
          try {
            await firstValueFrom(this.departmentService.editDepartment(this.departmentModel()));
            this.router.navigateByUrl('/departments');
          } catch (error) {
            this.errorMessage.set(extractErrorMessage(error));
          }
        },
      },
    },
  );

  constructor() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.departmentService.getDepartmentById(Number(idParam)).subscribe((department) => this.departmentModel.set(department));
      return;
    }

    // Only a Company Admin reaches this page — always scope a new department to
    // their own company (the list still passes it as a query param too, but this
    // covers navigating here directly).
    const companyIdParam = this.route.snapshot.queryParamMap.get('companyId');
    const companyId = companyIdParam ? Number(companyIdParam) : this.tokenStorage.getCompanyId();
    if (companyId) {
      this.departmentModel.update((current) => ({ ...current, companyId }));
    }
  }
}
