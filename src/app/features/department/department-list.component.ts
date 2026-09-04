import { Component, effect, inject, linkedSignal, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { CompanyService } from '../company/company.service';
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

    <div class="mb-3" style="max-width: 320px;">
      <label class="form-label" for="companyPicker">Company</label>
      <select id="companyPicker" class="form-select" [value]="companyId()" (change)="onCompanyChange($event)">
        @for (company of companies()?.items ?? []; track company.companyId) {
          <option [value]="company.companyId">{{ company.companyName }}</option>
        }
      </select>
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
  private readonly companyService = inject(CompanyService);
  private readonly departmentService = inject(DepartmentService);

  companies = toSignal(this.companyService.getAllCompanies('asc', 1, 100));
  companyId = linkedSignal<number>(() => this.companies()?.items[0]?.companyId ?? 0);
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

  onCompanyChange(event: Event): void {
    this.companyId.set(Number((event.target as HTMLSelectElement).value));
  }
}
