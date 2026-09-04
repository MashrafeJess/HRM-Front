import { Component, effect, inject, linkedSignal, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CompanyService } from '../company/company.service';
import { PayrollService } from './payroll.service';
import { Payroll } from './payroll.model';

@Component({
  selector: 'app-payroll-company-list',
  template: `
    <h1 class="h3 mb-4">Payroll — Company</h1>

    <div class="row g-3 mb-3">
      <div class="col-auto" style="min-width: 220px;">
        <label class="form-label" for="companyPicker">Company</label>
        <select id="companyPicker" class="form-select" [value]="companyId()" (change)="onCompanyChange($event)">
          @for (company of companies()?.items ?? []; track company.companyId) {
            <option [value]="company.companyId">{{ company.companyName }}</option>
          }
        </select>
      </div>
      <div class="col-auto">
        <label class="form-label" for="month">Month</label>
        <input
          id="month"
          type="number"
          min="1"
          max="12"
          class="form-control"
          style="width: 100px;"
          [value]="month()"
          (change)="onMonthChange($event)"
        />
      </div>
      <div class="col-auto">
        <label class="form-label" for="year">Year</label>
        <input id="year" type="number" class="form-control" style="width: 120px;" [value]="year()" (change)="onYearChange($event)" />
      </div>
    </div>

    <div class="card shadow-sm border-0">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th>Employee Id</th>
              <th>Basic Salary</th>
              <th>Absent Deduction</th>
              <th>Late Deduction</th>
              <th>Net Salary</th>
            </tr>
          </thead>
          <tbody>
            @for (payroll of payrolls(); track payroll.payrollId) {
              <tr>
                <td>{{ payroll.employeeId }}</td>
                <td>{{ payroll.basicSalary }}</td>
                <td>{{ payroll.absentDeduction ?? 0 }}</td>
                <td>{{ payroll.lateDeduction ?? 0 }}</td>
                <td>{{ payroll.netSalary ?? '—' }}</td>
              </tr>
            } @empty {
              <tr>
                <td colspan="5" class="text-center text-muted py-4">No payroll records for this period.</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class PayrollCompanyListComponent {
  private readonly companyService = inject(CompanyService);
  private readonly payrollService = inject(PayrollService);

  companies = toSignal(this.companyService.getAllCompanies('asc', 1, 100));
  companyId = linkedSignal<number>(() => this.companies()?.items[0]?.companyId ?? 0);
  month = signal(new Date().getMonth() + 1);
  year = signal(new Date().getFullYear());
  payrolls = signal<Payroll[]>([]);

  constructor() {
    effect(() => {
      const companyId = this.companyId();
      const month = this.month();
      const year = this.year();
      if (!companyId) return;

      this.payrollService.getPayrollForCompany(companyId, year, month).subscribe((result) => this.payrolls.set(result));
    });
  }

  onCompanyChange(event: Event): void {
    this.companyId.set(Number((event.target as HTMLSelectElement).value));
  }

  onMonthChange(event: Event): void {
    this.month.set(Number((event.target as HTMLInputElement).value));
  }

  onYearChange(event: Event): void {
    this.year.set(Number((event.target as HTMLInputElement).value));
  }
}
