import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { form, required, FormField, FormRoot } from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { EmployeeService } from '../employee/employee.service';
import { LeaveService } from './leave.service';
import { LeaveRequest } from './leave.model';

const EMPTY_LEAVE_REQUEST: LeaveRequest = {
  leaveRequestId: null,
  companyId: 0,
  employeeId: 0,
  leaveTypeId: 1,
  fromDate: '',
  toDate: '',
  totalDays: 0,
  reason: '',
  status: null,
  approvedBy: null,
  approvedByName: null,
  approvedAt: null,
  airecommendation: null,
  ainotes: null,
};

@Component({
  selector: 'app-leave-request-form',
  imports: [FormField, FormRoot],
  template: `
    <h1 class="h3 mb-4">New Leave Request</h1>

    <div class="card shadow-sm border-0" style="max-width: 560px;">
      <div class="card-body p-4">
        <form [formRoot]="leaveForm">
          <div class="mb-3">
            <label class="form-label" for="leaveTypeId">Leave Type Id</label>
            <input id="leaveTypeId" type="number" class="form-control" [formField]="leaveForm.leaveTypeId" />
          </div>

          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label" for="fromDate">From</label>
              <input
                id="fromDate"
                type="date"
                class="form-control"
                [class.is-invalid]="leaveForm.fromDate().touched() && leaveForm.fromDate().invalid()"
                [formField]="leaveForm.fromDate"
              />
              @if (leaveForm.fromDate().touched() && leaveForm.fromDate().invalid()) {
                <div class="invalid-feedback">{{ leaveForm.fromDate().errors()[0].message }}</div>
              }
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label" for="toDate">To</label>
              <input
                id="toDate"
                type="date"
                class="form-control"
                [class.is-invalid]="leaveForm.toDate().touched() && leaveForm.toDate().invalid()"
                [formField]="leaveForm.toDate"
              />
              @if (leaveForm.toDate().touched() && leaveForm.toDate().invalid()) {
                <div class="invalid-feedback">{{ leaveForm.toDate().errors()[0].message }}</div>
              }
            </div>
          </div>

          <div class="mb-4">
            <label class="form-label" for="reason">Reason</label>
            <textarea id="reason" class="form-control" rows="3" [formField]="leaveForm.reason"></textarea>
          </div>

          <div class="d-flex align-items-center gap-3">
            <button type="submit" class="btn btn-primary" [disabled]="!leaveForm().valid()">Submit Request</button>
            @if (saved()) {
              <span class="text-success small">Request submitted.</span>
            }
          </div>
        </form>
      </div>
    </div>
  `,
})
export class LeaveRequestFormComponent {
  private readonly authService = inject(AuthService);
  private readonly employeeService = inject(EmployeeService);
  private readonly leaveService = inject(LeaveService);
  private readonly router = inject(Router);

  leaveModel = signal<LeaveRequest>({ ...EMPTY_LEAVE_REQUEST });
  saved = signal(false);

  leaveForm = form(
    this.leaveModel,
    (schemaPath) => {
      required(schemaPath.fromDate, { message: 'From date is required' });
      required(schemaPath.toDate, { message: 'To date is required' });
    },
    {
      submission: {
        action: async () => {
          await firstValueFrom(this.leaveService.addLeaveRequest(this.leaveModel()));
          this.saved.set(true);
          this.router.navigateByUrl('/leaves');
        },
      },
    },
  );

  constructor() {
    const employeeId = this.authService.currentUser()?.id;
    if (!employeeId) return;

    this.leaveModel.update((current) => ({ ...current, employeeId }));
    this.employeeService.getEmployeeById(employeeId).subscribe((employee) => {
      this.leaveModel.update((current) => ({ ...current, companyId: employee.companyId }));
    });
  }
}
