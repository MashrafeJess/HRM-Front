import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  template: `
    <h1 class="h3 mb-4">Dashboard</h1>

    <div class="row g-3">
      @if (isManager()) {
        <div class="col-12 col-md-6 col-lg-4">
          <div class="card shadow-sm border-0 h-100">
            <div class="card-body">
              <h2 class="h6 text-muted mb-3">Companies</h2>
              <p class="card-text text-muted small mb-3">View, add, and edit companies.</p>
              <a routerLink="/companies" class="btn btn-primary btn-sm">Go to Companies</a>
            </div>
          </div>
        </div>

        <div class="col-12 col-md-6 col-lg-4">
          <div class="card shadow-sm border-0 h-100">
            <div class="card-body">
              <h2 class="h6 text-muted mb-3">Departments</h2>
              <p class="card-text text-muted small mb-3">Manage departments per company.</p>
              <a routerLink="/departments" class="btn btn-primary btn-sm">Go to Departments</a>
            </div>
          </div>
        </div>

        <div class="col-12 col-md-6 col-lg-4">
          <div class="card shadow-sm border-0 h-100">
            <div class="card-body">
              <h2 class="h6 text-muted mb-3">Employees</h2>
              <p class="card-text text-muted small mb-3">Browse and manage employee records.</p>
              <a routerLink="/employees" class="btn btn-primary btn-sm">Go to Employees</a>
            </div>
          </div>
        </div>

        <div class="col-12 col-md-6 col-lg-4">
          <div class="card shadow-sm border-0 h-100">
            <div class="card-body">
              <h2 class="h6 text-muted mb-3">Leave Approvals</h2>
              <p class="card-text text-muted small mb-3">Review pending leave requests.</p>
              <a routerLink="/leaves/approvals" class="btn btn-primary btn-sm">Go to Approvals</a>
            </div>
          </div>
        </div>

        <div class="col-12 col-md-6 col-lg-4">
          <div class="card shadow-sm border-0 h-100">
            <div class="card-body">
              <h2 class="h6 text-muted mb-3">Attendance</h2>
              <p class="card-text text-muted small mb-3">View attendance for a company and date.</p>
              <a routerLink="/attendance/admin" class="btn btn-primary btn-sm">Go to Attendance</a>
            </div>
          </div>
        </div>

        <div class="col-12 col-md-6 col-lg-4">
          <div class="card shadow-sm border-0 h-100">
            <div class="card-body">
              <h2 class="h6 text-muted mb-3">Payroll</h2>
              <p class="card-text text-muted small mb-3">View payroll across a company.</p>
              <a routerLink="/payroll/company" class="btn btn-primary btn-sm">Go to Payroll</a>
            </div>
          </div>
        </div>
      } @else {
        <div class="col-12 col-md-6 col-lg-4">
          <div class="card shadow-sm border-0 h-100">
            <div class="card-body">
              <h2 class="h6 text-muted mb-3">Attendance</h2>
              <p class="card-text text-muted small mb-3">Check in or out for today.</p>
              <a routerLink="/attendance" class="btn btn-primary btn-sm">Go to Attendance</a>
            </div>
          </div>
        </div>

        <div class="col-12 col-md-6 col-lg-4">
          <div class="card shadow-sm border-0 h-100">
            <div class="card-body">
              <h2 class="h6 text-muted mb-3">Leave</h2>
              <p class="card-text text-muted small mb-3">Request leave and track its status.</p>
              <a routerLink="/leaves" class="btn btn-primary btn-sm">Go to Leave</a>
            </div>
          </div>
        </div>

        <div class="col-12 col-md-6 col-lg-4">
          <div class="card shadow-sm border-0 h-100">
            <div class="card-body">
              <h2 class="h6 text-muted mb-3">Payroll</h2>
              <p class="card-text text-muted small mb-3">View your payroll for the month.</p>
              <a routerLink="/payroll" class="btn btn-primary btn-sm">Go to Payroll</a>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class DashboardComponent {
  private readonly authService = inject(AuthService);

  isManager = computed(() => {
    const role = this.authService.currentUser()?.role;
    return role === 'Admin' || role === 'Manager';
  });
}
