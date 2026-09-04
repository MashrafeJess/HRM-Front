import { Component, effect, inject, signal } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { PayrollService } from './payroll.service';
import { Payroll } from './payroll.model';

@Component({
  selector: 'app-payroll-my-view',
  template: `
    <h1 class="h3 mb-4">My Payroll</h1>

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

    @if (payroll(); as payroll) {
      <div class="card shadow-sm border-0" style="max-width: 480px;">
        <div class="card-body">
          <dl class="row mb-0">
            <dt class="col-6">Basic Salary</dt>
            <dd class="col-6 text-end">{{ payroll.basicSalary }}</dd>
            <dt class="col-6">Absent Deduction</dt>
            <dd class="col-6 text-end">{{ payroll.absentDeduction ?? 0 }}</dd>
            <dt class="col-6">Late Deduction</dt>
            <dd class="col-6 text-end">{{ payroll.lateDeduction ?? 0 }}</dd>
            <dt class="col-6 fw-semibold">Net Salary</dt>
            <dd class="col-6 text-end fw-semibold">{{ payroll.netSalary ?? '—' }}</dd>
          </dl>
        </div>
      </div>
    } @else {
      <p class="text-muted">No payroll found for this period.</p>
    }
  `,
})
export class PayrollMyViewComponent {
  private readonly authService = inject(AuthService);
  private readonly payrollService = inject(PayrollService);

  month = signal(new Date().getMonth() + 1);
  year = signal(new Date().getFullYear());
  payroll = signal<Payroll | null>(null);

  constructor() {
    effect(() => {
      const employeeId = this.authService.currentUser()?.id;
      const month = this.month();
      const year = this.year();
      if (!employeeId) return;

      this.payrollService.getPayrollForEmployee(employeeId, year, month).subscribe({
        next: (result) => this.payroll.set(result),
        error: () => this.payroll.set(null),
      });
    });
  }

  onMonthChange(event: Event): void {
    this.month.set(Number((event.target as HTMLInputElement).value));
  }

  onYearChange(event: Event): void {
    this.year.set(Number((event.target as HTMLInputElement).value));
  }
}
