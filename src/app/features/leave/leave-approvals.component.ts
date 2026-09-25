import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TokenStorageService } from '../../core/auth/token-storage.service';
import { DepartmentService } from '../department/department.service';
import { EmployeeService } from '../employee/employee.service';
import { LeaveService } from './leave.service';
import { LeaveRequest, LeaveRequestStatus } from './leave.model';

@Component({
  selector: 'app-leave-approvals',
  template: `
    <h1 class="h3 mb-4">Leave Approvals</h1>

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
      <div class="col-auto" style="min-width: 180px;">
        <label class="form-label" for="statusFilter">Status</label>
        <select id="statusFilter" class="form-select" [value]="status()" (change)="onStatusChange($event)">
          <option [value]="1">Pending</option>
          <option [value]="2">Approved</option>
          <option [value]="3">Rejected</option>
          <option [value]="4">Cancelled</option>
          <option [value]="0">All</option>
        </select>
      </div>
    </div>

    <div class="card shadow-sm border-0">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th>Employee Id</th>
              <th>From</th>
              <th>To</th>
              <th>Days</th>
              <th>Reason</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            @for (request of requests(); track request.leaveRequestId) {
              <tr>
                <td>{{ request.employeeId }}</td>
                <td>{{ request.fromDate }}</td>
                <td>{{ request.toDate }}</td>
                <td>{{ request.totalDays }}</td>
                <td>{{ request.reason }}</td>
                <td><span class="badge text-bg-secondary">{{ request.status }}</span></td>
                <td class="text-end">
                  @if (request.status === 'Pending') {
                    <button type="button" class="btn btn-success btn-sm me-1" [disabled]="acting()" (click)="approve(request)">
                      Approve
                    </button>
                    <button type="button" class="btn btn-outline-danger btn-sm" [disabled]="acting()" (click)="reject(request)">
                      Reject
                    </button>
                  }
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="7" class="text-center text-muted py-4">No leave requests found.</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class LeaveApprovalsComponent {
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly departmentService = inject(DepartmentService);
  private readonly employeeService = inject(EmployeeService);
  private readonly leaveService = inject(LeaveService);

  companyId = signal<number>(this.tokenStorage.getCompanyId() ?? 0);
  departmentId = signal<number | null>(null);
  departments = toSignal(this.departmentService.getAllDepartmentsByCompanyId(this.companyId(), 'asc', 1, 100));
  employees = toSignal(this.employeeService.getAllEmployeesByCompanyId(this.companyId(), null, 'asc', 1, 100));
  status = signal<number>(LeaveRequestStatus.Pending);
  allRequests = signal<LeaveRequest[]>([]);
  acting = signal(false);

  requests = computed(() => {
    const departmentId = this.departmentId();
    if (!departmentId) return this.allRequests();

    const employeeIds = new Set(
      (this.employees()?.items ?? [])
        .filter((employee) => employee.departmentId === departmentId && employee.id != null)
        .map((employee) => employee.id as number),
    );
    return this.allRequests().filter((request) => employeeIds.has(request.employeeId));
  });

  constructor() {
    effect(() => {
      const companyId = this.companyId();
      const status = this.status();
      if (!companyId) return;
      this.leaveService.getLeaveRequestByStatus(status, companyId).subscribe((result) => this.allRequests.set(result));
    });
  }

  onDepartmentChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.departmentId.set(value ? Number(value) : null);
  }

  onStatusChange(event: Event): void {
    this.status.set(Number((event.target as HTMLSelectElement).value));
  }

  approve(request: LeaveRequest): void {
    this.act(request, 'Approved');
  }

  reject(request: LeaveRequest): void {
    this.act(request, 'Rejected');
  }

  private act(request: LeaveRequest, status: string): void {
    this.acting.set(true);

    if (status === 'Approved') {
      if (request.leaveRequestId == null) {
        this.acting.set(false);
        return;
      }

      this.leaveService.approveLeaveRequest(request.leaveRequestId).subscribe({
        next: () => {
          this.leaveService
            .updateLeaveRequestStatus(
              { employeeId: request.employeeId, companyId: this.companyId(), remarks: null },
              request.fromDate.slice(0, 10),
              request.toDate.slice(0, 10),
            )
            .subscribe({
              next: () => {
                this.acting.set(false);
                this.refresh();
              },
              error: () => this.acting.set(false),
            });
        },
        error: () => this.acting.set(false),
      });
      return;
    }

    this.leaveService.addLeaveRequest({ ...request, status }).subscribe({
      next: () => {
        this.acting.set(false);
        this.refresh();
      },
      error: () => this.acting.set(false),
    });
  }

  private refresh(): void {
    this.leaveService.getLeaveRequestByStatus(this.status(), this.companyId()).subscribe((result) => this.allRequests.set(result));
  }
}
