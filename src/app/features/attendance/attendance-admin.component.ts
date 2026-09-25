import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TokenStorageService } from '../../core/auth/token-storage.service';
import { DepartmentService } from '../department/department.service';
import { EmployeeService } from '../employee/employee.service';
import { AttendanceService } from './attendance.service';
import { Attendance, AttendanceSummary, AttendanceSummaryForADay } from './attendance.model';
import { todayIso } from '../../shared/date.util';

@Component({
  selector: 'app-attendance-admin',
  template: `
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1 class="h3 mb-0">Attendance — {{ viewMode() === 'day' ? 'Daily View' : 'Monthly Summary' }}</h1>
      <div class="btn-group" role="group" aria-label="View mode">
        <button
          type="button"
          class="btn btn-sm"
          [class.btn-primary]="viewMode() === 'day'"
          [class.btn-outline-primary]="viewMode() !== 'day'"
          (click)="viewMode.set('day')"
        >
          Day
        </button>
        <button
          type="button"
          class="btn btn-sm"
          [class.btn-primary]="viewMode() === 'month'"
          [class.btn-outline-primary]="viewMode() !== 'month'"
          (click)="viewMode.set('month')"
        >
          Month
        </button>
      </div>
    </div>

    <div class="row g-3 mb-3">
      <div class="col-auto" style="min-width: 220px;">
        <label class="form-label" for="departmentFilter">Department</label>
        <select id="departmentFilter" class="form-select" [value]="departmentId() ?? ''" (change)="onDepartmentChange($event)">
          <option value="">All departments</option>
          @for (department of departments()?.items ?? []; track department.departmentId) {
            <option [value]="department.departmentId">{{ department.departmentName }}</option>
          }
        </select>
      </div>

      @if (viewMode() === 'day') {
        <div class="col-auto">
          <label class="form-label" for="datePicker">Date</label>
          <input id="datePicker" type="date" class="form-control" [value]="date()" (change)="onDateChange($event)" />
        </div>
      } @else {
        <div class="col-auto">
          <label class="form-label" for="monthPicker">Month</label>
          <select id="monthPicker" class="form-select" [value]="month()" (change)="onMonthChange($event)">
            @for (m of monthOptions; track m.value) {
              <option [value]="m.value">{{ m.label }}</option>
            }
          </select>
        </div>
        <div class="col-auto">
          <label class="form-label" for="yearPicker">Year</label>
          <input id="yearPicker" type="number" class="form-control" style="width: 110px;" [value]="year()" (change)="onYearChange($event)" />
        </div>
      }
    </div>

    @if (viewMode() === 'day') {
      @if (daySummary(); as summary) {
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
                <th>Employee</th>
                <th>Department</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Working Hours</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              @for (record of filteredRecords(); track record.attendanceId) {
                <tr>
                  <td>{{ employeeDepartmentMap().get(record.employeeId)?.name ?? ('Employee #' + record.employeeId) }}</td>
                  <td>{{ employeeDepartmentMap().get(record.employeeId)?.departmentName ?? '—' }}</td>
                  <td>{{ record.checkIn ?? '—' }}</td>
                  <td>{{ record.checkOut ?? '—' }}</td>
                  <td>{{ record.workingHours ?? '—' }}</td>
                  <td>{{ record.status ?? '—' }}</td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6" class="text-center text-muted py-4">No records for this date.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    } @else {
      @if (monthSummary(); as summary) {
        <div class="row g-3 mb-3">
          <div class="col-6 col-md-3">
            <div class="card shadow-sm border-0 text-center p-3">
              <div class="fw-semibold fs-5">{{ summary.averageAttendanceRate ?? '—' }}%</div>
              <div class="small text-muted">Avg. Attendance</div>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="card shadow-sm border-0 text-center p-3">
              <div class="fw-semibold fs-5">{{ summary.totalLateArrivals ?? '—' }}</div>
              <div class="small text-muted">Late Arrivals</div>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="card shadow-sm border-0 text-center p-3">
              <div class="fw-semibold fs-5">{{ summary.numOfPerfectAttendance ?? '—' }}</div>
              <div class="small text-muted">Perfect Attendance</div>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="card shadow-sm border-0 text-center p-3">
              <div class="fw-semibold fs-6">{{ summary.mostPunctualDepartmentName ?? '—' }}</div>
              <div class="small text-muted">Most Punctual Dept.</div>
            </div>
          </div>
        </div>

        @if (summary.highestAbsenteeName) {
          <p class="text-muted small mb-3">
            Highest absentee this month: <strong>{{ summary.highestAbsenteeName }}</strong>
            @if (summary.lateRate != null) {
              · Late rate: {{ summary.lateRate }}%
            }
          </p>
        }
      }

      <div class="card shadow-sm border-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Total Absent</th>
              </tr>
            </thead>
            <tbody>
              @for (row of filteredMonthEmployees(); track row.employeeId) {
                <tr>
                  <td>{{ row.employeeName ?? ('Employee #' + row.employeeId) }}</td>
                  <td>{{ row.departmentName ?? '—' }}</td>
                  <td>{{ row.totalAbsent ?? '—' }}</td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="3" class="text-center text-muted py-4">No data for this month.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    }
  `,
})
export class AttendanceAdminComponent {
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly departmentService = inject(DepartmentService);
  private readonly employeeService = inject(EmployeeService);
  private readonly attendanceService = inject(AttendanceService);

  // Only a Company Admin reaches this page — always scoped to their own company;
  // GetAllCompany (needed for a company picker) is Super Admin-only now.
  companyId = signal<number>(this.tokenStorage.getCompanyId() ?? 0);
  departmentId = signal<number | null>(null);
  viewMode = signal<'day' | 'month'>('day');

  date = signal(todayIso());
  month = signal(new Date().getMonth() + 1);
  year = signal(new Date().getFullYear());

  readonly monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: new Date(2000, i, 1).toLocaleString('default', { month: 'long' }),
  }));

  departments = toSignal(this.departmentService.getAllDepartmentsByCompanyId(this.companyId(), 'asc', 1, 100));

  records = signal<Attendance[]>([]);
  daySummary = signal<AttendanceSummaryForADay | null>(null);
  monthSummary = signal<AttendanceSummary | null>(null);

  // Attendance records only carry a raw employeeId, not a name or department — fetch the
  // employee list once and join client-side to show names and filter by department.
  employees = toSignal(this.employeeService.getAllEmployeesByCompanyId(this.companyId(), null, 'asc', 1, 100));

  employeeDepartmentMap = computed(() => {
    const employees = this.employees();
    const map = new Map<number, { name: string; departmentId: number | null; departmentName: string | null }>();
    for (const employee of employees?.items ?? []) {
      if (employee.id == null) continue;
      const department = this.departments()?.items.find((d) => d.departmentId === employee.departmentId);
      map.set(employee.id, {
        name: `${employee.firstName} ${employee.lastName}`.trim(),
        departmentId: employee.departmentId,
        departmentName: department?.departmentName ?? null,
      });
    }
    return map;
  });

  filteredRecords = computed(() => {
    const departmentId = this.departmentId();
    if (!departmentId) return this.records();
    const lookup = this.employeeDepartmentMap();
    return this.records().filter((record) => lookup.get(record.employeeId)?.departmentId === departmentId);
  });

  filteredMonthEmployees = computed(() => {
    const departmentId = this.departmentId();
    const employees = this.monthSummary()?.employeeList ?? [];
    if (!departmentId) return employees;
    const lookup = this.employeeDepartmentMap();
    return employees.filter((row) => lookup.get(row.employeeId)?.departmentId === departmentId);
  });

  constructor() {
    effect(() => {
      const companyId = this.companyId();
      const date = this.date();
      const viewMode = this.viewMode();
      if (!companyId || viewMode !== 'day') return;

      this.attendanceService.getAttendanceByDate(companyId, date).subscribe((result) => this.records.set(result));
      this.attendanceService.getAttendanceSummaryForADay(companyId, date).subscribe((result) => this.daySummary.set(result));
    });

    effect(() => {
      const companyId = this.companyId();
      const month = this.month();
      const year = this.year();
      const viewMode = this.viewMode();
      if (!companyId || viewMode !== 'month') return;

      this.attendanceService.getAttendanceSummaryForMonth(companyId, month, year).subscribe((result) => this.monthSummary.set(result));
    });
  }

  onDepartmentChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.departmentId.set(value ? Number(value) : null);
  }

  onDateChange(event: Event): void {
    this.date.set((event.target as HTMLInputElement).value);
  }

  onMonthChange(event: Event): void {
    this.month.set(Number((event.target as HTMLSelectElement).value));
  }

  onYearChange(event: Event): void {
    this.year.set(Number((event.target as HTMLInputElement).value));
  }
}
