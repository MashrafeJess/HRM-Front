import { Component, computed, inject, signal } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { EmployeeService } from '../employee/employee.service';
import { Employee } from '../employee/employee.model';
import { AttendanceService } from './attendance.service';
import { Attendance, AttendanceStatistics } from './attendance.model';
import { nowTime, todayIso } from '../../shared/date.util';

@Component({
  selector: 'app-attendance-checkin',
  template: `
    <h1 class="h3 mb-4">Attendance</h1>

    <div class="row g-3">
      <div class="col-12 col-lg-5">
        <div class="card shadow-sm border-0">
          <div class="card-body">
            <h2 class="h6 text-muted mb-3">Today</h2>
            <p class="mb-1"><strong>Check-in:</strong> {{ today()?.checkIn ?? '—' }}</p>
            <p class="mb-3"><strong>Check-out:</strong> {{ today()?.checkOut ?? '—' }}</p>

            <div class="d-flex gap-2">
              <button
                type="button"
                class="btn btn-primary btn-sm"
                [disabled]="!!today()?.checkIn || saving()"
                (click)="checkIn()"
              >
                Check In
              </button>
              <button
                type="button"
                class="btn btn-outline-primary btn-sm"
                [disabled]="!today()?.checkIn || !!today()?.checkOut || saving()"
                (click)="checkOut()"
              >
                Check Out
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="col-12 col-lg-7">
        <div class="card shadow-sm border-0">
          <div class="card-body">
            <h2 class="h6 text-muted mb-3">This Month</h2>
            @if (statistics(); as stats) {
              <div class="row text-center g-3">
                <div class="col-3">
                  <div class="fw-semibold fs-5">{{ stats.presentDays }}</div>
                  <div class="small text-muted">Present</div>
                </div>
                <div class="col-3">
                  <div class="fw-semibold fs-5">{{ stats.lateDays }}</div>
                  <div class="small text-muted">Late</div>
                </div>
                <div class="col-3">
                  <div class="fw-semibold fs-5">{{ stats.leaveDays }}</div>
                  <div class="small text-muted">Leave</div>
                </div>
                <div class="col-3">
                  <div class="fw-semibold fs-5">{{ stats.attendanceRatio }}%</div>
                  <div class="small text-muted">Ratio</div>
                </div>
              </div>
            } @else {
              <p class="text-muted small mb-0">No statistics yet.</p>
            }
          </div>
        </div>
      </div>
    </div>

    <div class="card shadow-sm border-0 mt-3">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th>Date</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            @for (record of history(); track record.attendanceId) {
              <tr>
                <td>{{ record.attendanceDate }}</td>
                <td>{{ record.checkIn ?? '—' }}</td>
                <td>{{ record.checkOut ?? '—' }}</td>
                <td>{{ record.status ?? '—' }}</td>
              </tr>
            } @empty {
              <tr>
                <td colspan="4" class="text-center text-muted py-4">No attendance records yet.</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class AttendanceCheckinComponent {
  private readonly authService = inject(AuthService);
  private readonly employeeService = inject(EmployeeService);
  private readonly attendanceService = inject(AttendanceService);

  saving = signal(false);
  employee = signal<Employee | null>(null);
  history = signal<Attendance[]>([]);
  statistics = signal<AttendanceStatistics | null>(null);

  today = computed(() => this.history().find((record) => record.attendanceDate === todayIso()) ?? null);

  constructor() {
    const employeeId = this.authService.currentUser()?.id;
    if (!employeeId) return;

    this.employeeService.getEmployeeById(employeeId).subscribe((employee) => this.employee.set(employee));
    this.loadHistory(employeeId);

    const now = new Date();
    this.attendanceService
      .getAttendanceStatisticsByEmployeeId(employeeId, now.getMonth() + 1, now.getFullYear())
      .subscribe((stats) => this.statistics.set(stats));
  }

  checkIn(): void {
    this.mark({ checkIn: nowTime() });
  }

  checkOut(): void {
    this.mark({ checkOut: nowTime() });
  }

  private mark(times: { checkIn?: string; checkOut?: string }): void {
    const employee = this.employee();
    const employeeId = this.authService.currentUser()?.id;
    if (!employee || !employeeId) return;

    const existing = this.today();
    this.saving.set(true);
    this.attendanceService
      .checkInOrOut({
        attendanceId: existing?.attendanceId ?? null,
        companyId: employee.companyId,
        employeeId,
        attendanceDate: todayIso(),
        checkIn: times.checkIn ?? existing?.checkIn ?? null,
        checkOut: times.checkOut ?? existing?.checkOut ?? null,
        status: existing?.status ?? null,
        remarks: existing?.remarks ?? null,
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.loadHistory(employeeId);
        },
        error: () => this.saving.set(false),
      });
  }

  private loadHistory(employeeId: number): void {
    this.attendanceService.getAttendanceByEmployeeId(employeeId).subscribe((records) => this.history.set(records));
  }
}
