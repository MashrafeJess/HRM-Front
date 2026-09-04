import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { LeaveService } from './leave.service';
import { LeaveRequest } from './leave.model';

@Component({
  selector: 'app-leave-my-list',
  imports: [RouterLink],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h1 class="h3 mb-0">My Leave Requests</h1>
      <a routerLink="/leaves/new" class="btn btn-primary btn-sm">+ New Request</a>
    </div>

    <div class="card shadow-sm border-0">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th>From</th>
              <th>To</th>
              <th>Days</th>
              <th>Reason</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            @for (request of requests(); track request.leaveRequestId) {
              <tr>
                <td>{{ request.fromDate }}</td>
                <td>{{ request.toDate }}</td>
                <td>{{ request.totalDays }}</td>
                <td>{{ request.reason }}</td>
                <td><span class="badge text-bg-secondary">{{ request.status }}</span></td>
              </tr>
            } @empty {
              <tr>
                <td colspan="5" class="text-center text-muted py-4">No leave requests yet.</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class LeaveMyListComponent {
  private readonly authService = inject(AuthService);
  private readonly leaveService = inject(LeaveService);

  requests = signal<LeaveRequest[]>([]);

  constructor() {
    const employeeId = this.authService.currentUser()?.id;
    if (!employeeId) return;
    this.leaveService.getEmployeeLeaveRequestsByEmployeeId(employeeId).subscribe((requests) => this.requests.set(requests));
  }
}
