import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { form, required, FormField, FormRoot } from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';
import { TokenStorageService } from '../../core/auth/token-storage.service';
import { LeaveService } from './leave.service';
import { LeaveRequest, LeaveType } from './leave.model';
import { ErrorModalComponent } from '../../shared/error-modal.component';
import { extractErrorMessage } from '../../shared/http-error.util';

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
  imports: [FormField, FormRoot, ErrorModalComponent],
  template: `
    <h1 class="h3 mb-4">New Leave Request</h1>

    <div class="card shadow-sm border-0" style="max-width: 560px;">
      <div class="card-body p-4">
        <form [formRoot]="leaveForm">
          <div class="mb-3">
            <label class="form-label" for="leaveTypeId">Leave Type</label>
            <select
              id="leaveTypeId"
              class="form-select"
              [value]="leaveModel().leaveTypeId"
              (change)="onLeaveTypeChange($event)"
            >
              @for (leaveType of leaveTypes; track leaveType.value) {
                <option [value]="leaveType.value">{{ leaveType.label }}</option>
              }
            </select>
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
          </div>
        </form>
      </div>
    </div>

    <app-error-modal [message]="errorMessage()" (closed)="errorMessage.set(null)" />
  `,
})
export class LeaveRequestFormComponent {
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly leaveService = inject(LeaveService);
  private readonly router = inject(Router);

  leaveModel = signal<LeaveRequest>({ ...EMPTY_LEAVE_REQUEST });
  errorMessage = signal<string | null>(null);
  readonly leaveTypes = [
    { value: LeaveType.Casual, label: 'Casual' },
    { value: LeaveType.Sick, label: 'Sick' },
    { value: LeaveType.Annual, label: 'Annual' },
    { value: LeaveType.Maternity, label: 'Maternity' },
    { value: LeaveType.Unpaid, label: 'Unpaid' },
  ];

  onLeaveTypeChange(event: Event): void {
    const leaveTypeId = Number((event.target as HTMLSelectElement).value) as LeaveType;
    this.leaveModel.update((current) => ({ ...current, leaveTypeId }));
  }

  leaveForm = form(
    this.leaveModel,
    (schemaPath) => {
      required(schemaPath.fromDate, { message: 'From date is required' });
      required(schemaPath.toDate, { message: 'To date is required' });
    },
    {
      submission: {
        action: async () => {
          try {
            await firstValueFrom(this.leaveService.addLeaveRequest(this.leaveModel()));
            this.router.navigateByUrl('/leaves');
          } catch (error) {
            this.errorMessage.set(extractErrorMessage(error));
          }
        },
      },
    },
  );

  constructor() {
    const employeeId = this.tokenStorage.getEmployeeId();
    const companyId = this.tokenStorage.getCompanyId();

    console.log('[Leave] initializing request identifiers', { employeeId, companyId });

    this.leaveModel.update((current) => ({
      ...current,
      employeeId: employeeId ?? 0,
      companyId: companyId ?? 0,
    }));
  }
}
