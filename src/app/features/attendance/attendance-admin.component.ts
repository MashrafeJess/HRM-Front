import { Component, effect, inject, linkedSignal, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CompanyService } from '../company/company.service';
import { AttendanceService } from './attendance.service';
import { Attendance, AttendanceSummaryForADay } from './attendance.model';
import { todayIso } from '../../shared/date.util';

@Component({
  selector: 'app-attendance-admin',
  template: `
    <h1 class="h3 mb-4">Attendance — Daily View</h1>

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
        <label class="form-label" for="datePicker">Date</label>
        <input id="datePicker" type="date" class="form-control" [value]="date()" (change)="onDateChange($event)" />
      </div>
    </div>

    @if (summary(); as summary) {
      <div class="row g-3 mb-3">
        <div class="col-6 col-md-2">
          <div class="card shadow-sm border-0 text-center p-3">
            <div class="fw-semibold fs-5">{{ summary.totalEmployees }}</div>
            <div class="small text-muted">Total</div>
          </div>
        </div>
        <div class="col-6 col-md-2">
          <div class="card shadow-sm border-0 text-center p-3">
            <div class="fw-semibold fs-5">{{ summary.totalPresent }}</div>
            <div class="small text-muted">Present</div>
          </div>
        </div>
        <div class="col-6 col-md-2">
          <div class="card shadow-sm border-0 text-center p-3">
            <div class="fw-semibold fs-5">{{ summary.totalLate }}</div>
            <div class="small text-muted">Late</div>
          </div>
        </div>
        <div class="col-6 col-md-2">
          <div class="card shadow-sm border-0 text-center p-3">
            <div class="fw-semibold fs-5">{{ summary.totalLeave }}</div>
            <div class="small text-muted">Leave</div>
          </div>
        </div>
        <div class="col-6 col-md-2">
          <div class="card shadow-sm border-0 text-center p-3">
            <div class="fw-semibold fs-5">{{ summary.totalAbsent }}</div>
            <div class="small text-muted">Absent</div>
          </div>
        </div>
      </div>
    }

    <div class="card shadow-sm border-0">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th>Employee Id</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>Working Hours</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            @for (record of records(); track record.attendanceId) {
              <tr>
                <td>{{ record.employeeId }}</td>
                <td>{{ record.checkIn ?? '—' }}</td>
                <td>{{ record.checkOut ?? '—' }}</td>
                <td>{{ record.workingHours ?? '—' }}</td>
                <td>{{ record.status ?? '—' }}</td>
              </tr>
            } @empty {
              <tr>
                <td colspan="5" class="text-center text-muted py-4">No records for this date.</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class AttendanceAdminComponent {
  private readonly companyService = inject(CompanyService);
  private readonly attendanceService = inject(AttendanceService);

  companies = toSignal(this.companyService.getAllCompanies('asc', 1, 100));
  companyId = linkedSignal<number>(() => this.companies()?.items[0]?.companyId ?? 0);
  date = signal(todayIso());
  records = signal<Attendance[]>([]);
  summary = signal<AttendanceSummaryForADay | null>(null);

  constructor() {
    effect(() => {
      const companyId = this.companyId();
      const date = this.date();
      if (!companyId) return;

      this.attendanceService.getAttendanceByDate(companyId, date).subscribe((result) => this.records.set(result));
      this.attendanceService.getAttendanceSummaryForADay(companyId, date).subscribe((result) => this.summary.set(result));
    });
  }

  onCompanyChange(event: Event): void {
    this.companyId.set(Number((event.target as HTMLSelectElement).value));
  }

  onDateChange(event: Event): void {
    this.date.set((event.target as HTMLInputElement).value);
  }
}
