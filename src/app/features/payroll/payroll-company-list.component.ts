import { Component, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TokenStorageService } from '../../core/auth/token-storage.service';
import { EmployeeService } from '../employee/employee.service';
import { PayrollService } from './payroll.service';
import { Payroll } from './payroll.model';
import { extractErrorMessage } from '../../shared/http-error.util';

@Component({
  selector: 'app-payroll-company-list',
  template: `
    <h1 class="h3 mb-4">Payroll — Company</h1>

    <div class="row g-3 mb-3">
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

    <div class="card shadow-sm border-0 mb-4">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th>Employee</th>
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
                <td>{{ payroll.employeeName ?? '—' }}</td>
                <td>{{ payroll.employeeId }}</td>
                <td>{{ payroll.basicSalary }}</td>
                <td>{{ payroll.absentDeduction ?? 0 }}</td>
                <td>{{ payroll.lateDeduction ?? 0 }}</td>
                <td>{{ payroll.netSalary ?? '—' }}</td>
              </tr>
            } @empty {
              <tr>
                <td colspan="6" class="text-center text-muted py-4">No payroll records for this period.</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>

    <h2 class="h5 mb-3">Live Estimate (Current Month)</h2>
    <p class="text-muted small mb-3">
      Computed on demand from this month's attendance so far — not a finalized/generated payroll record.
    </p>

    <div class="card shadow-sm border-0">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th>Employee</th>
              <th></th>
              <th>Basic Salary</th>
              <th>Absent Deduction</th>
              <th>Late Deduction</th>
              <th>Net Salary</th>
            </tr>
          </thead>
          <tbody>
            @for (employee of employees()?.items ?? []; track employee.id) {
              <tr>
                <td>{{ employee.firstName }} {{ employee.lastName }}</td>
                <td>
                  <button type="button" class="btn btn-outline-primary btn-sm" (click)="loadLiveEstimate(employee.id!)">
                    @if (liveStatus().get(employee.id!)?.loading) {
                      Loading…
                    } @else {
                      View Live Estimate
                    }
                  </button>
                </td>
                @if (liveStatus().get(employee.id!); as status) {
                  @if (status.result; as result) {
                    <td>{{ result.basicSalary }}</td>
                    <td>{{ result.absentDeduction ?? 0 }}</td>
                    <td>{{ result.lateDeduction ?? 0 }}</td>
                    <td>{{ result.netSalary ?? '—' }}</td>
                  } @else if (status.error) {
                    <td colspan="4" class="text-danger small">{{ status.error }}</td>
                  } @else {
                    <td colspan="4"></td>
                  }
                } @else {
                  <td colspan="4"></td>
                }
              </tr>
            } @empty {
              <tr>
                <td colspan="6" class="text-center text-muted py-4">No employees found.</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class PayrollCompanyListComponent {
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly employeeService = inject(EmployeeService);
  private readonly payrollService = inject(PayrollService);

  companyId = signal(this.tokenStorage.getCompanyId() ?? 0);
  month = signal(new Date().getMonth() + 1);
  year = signal(new Date().getFullYear());
  payrolls = signal<Payroll[]>([]);

  employees = toSignal(this.employeeService.getAllEmployeesByCompanyId(this.companyId(), null, 'asc', 1, 100));

  liveStatus = signal(new Map<number, { loading: boolean; result: Payroll | null; error: string | null }>());

  constructor() {
    effect(() => {
      const companyId = this.companyId();
      const month = this.month();
      const year = this.year();
      if (!companyId) return;

      this.payrollService.getPayrollForCompany(companyId, year, month).subscribe((result) => this.payrolls.set(result));
    });
  }

  loadLiveEstimate(employeeId: number): void {
    this.liveStatus.update((current) => new Map(current).set(employeeId, { loading: true, result: null, error: null }));

    this.payrollService.getLivePayrollStatusForEmployee(employeeId).subscribe({
      next: (result) => {
        this.liveStatus.update((current) => new Map(current).set(employeeId, { loading: false, result, error: null }));
      },
      error: (error) => {
        this.liveStatus.update((current) =>
          new Map(current).set(employeeId, { loading: false, result: null, error: extractErrorMessage(error) }),
        );
      },
    });
  }

  onMonthChange(event: Event): void {
    this.month.set(Number((event.target as HTMLInputElement).value));
  }

  onYearChange(event: Event): void {
    this.year.set(Number((event.target as HTMLInputElement).value));
  }
}
