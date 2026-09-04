import { Component, effect, inject, linkedSignal, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CompanyService } from '../company/company.service';
import { LeaveService } from './leave.service';
import { LeaveRequest, LeaveRequestStatus } from './leave.model';

@Component({
  selector: 'app-leave-approvals',
  template: `
    <h1 class="h3 mb-4">Leave Approvals</h1>

    <div class="row g-3 mb-3">
      <div class="col-auto" style="min-width: 220px;">
        <label class="form-label" for="companyPicker">Company</label>
        <select id="companyPicker" class="form-select" [value]="companyId()" (change)="onCompanyChange($event)">
          @for (company of companies()?.items ?? []; track company.companyId) {
            <option [value]="company.companyId">{{ company.companyName }}</option>
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
  private readonly companyService = inject(CompanyService);
  private readonly leaveService = inject(LeaveService);

  companies = toSignal(this.companyService.getAllCompanies('asc', 1, 100));
  companyId = linkedSignal<number>(() => this.companies()?.items[0]?.companyId ?? 0);
  status = signal<number>(LeaveRequestStatus.Pending);
  requests = signal<LeaveRequest[]>([]);
  acting = signal(false);

  constructor() {
    effect(() => {
      const companyId = this.companyId();
      const status = this.status();
      if (!companyId) return;
      this.leaveService.getLeaveRequestByStatus(status, companyId).subscribe((result) => this.requests.set(result));
    });
  }

  onCompanyChange(event: Event): void {
    this.companyId.set(Number((event.target as HTMLSelectElement).value));
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
    this.leaveService.addLeaveRequest({ ...request, status }).subscribe({
      next: () => {
        if (status === 'Approved') {
          this.leaveService
            .updateLeaveRequestStatus(
              { employeeId: request.employeeId, companyId: this.companyId(), remarks: null },
              request.fromDate.slice(0, 10),
              request.toDate.slice(0, 10),
            )
            .subscribe();
        }
        this.acting.set(false);
        this.refresh();
      },
      error: () => this.acting.set(false),
    });
  }

  private refresh(): void {
    this.leaveService.getLeaveRequestByStatus(this.status(), this.companyId()).subscribe((result) => this.requests.set(result));
  }
}
