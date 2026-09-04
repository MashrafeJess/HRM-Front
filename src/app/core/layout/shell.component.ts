import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-shell',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="d-flex vh-100">
      <aside class="d-flex flex-column bg-white border-end p-3" style="width: 240px;">
        <div class="d-flex align-items-center gap-2 mb-4 px-2">
          <div
            class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold"
            style="width: 36px; height: 36px;"
          >
            H
          </div>
          <span class="fw-semibold fs-5">HRM</span>
        </div>

        <nav class="nav nav-pills flex-column gap-1 flex-grow-1 overflow-auto">
          <a class="nav-link text-dark" routerLink="/dashboard" routerLinkActive="active">Dashboard</a>

          @if (isManager()) {
            <a class="nav-link text-dark" routerLink="/companies" routerLinkActive="active">Companies</a>
            <a class="nav-link text-dark" routerLink="/departments" routerLinkActive="active">Departments</a>
            <a class="nav-link text-dark" routerLink="/employees" routerLinkActive="active">Employees</a>
            <a class="nav-link text-dark" routerLink="/roles" routerLinkActive="active">Roles</a>
          }

          <a class="nav-link text-dark" routerLink="/attendance" routerLinkActive="active">Attendance</a>
          @if (isManager()) {
            <a class="nav-link text-dark" routerLink="/attendance/admin" routerLinkActive="active">Attendance (Admin)</a>
          }

          <a class="nav-link text-dark" routerLink="/leaves" routerLinkActive="active">My Leave</a>
          @if (isManager()) {
            <a class="nav-link text-dark" routerLink="/leaves/approvals" routerLinkActive="active">Leave Approvals</a>
          }

          <a class="nav-link text-dark" routerLink="/payroll" routerLinkActive="active">My Payroll</a>
          @if (isManager()) {
            <a class="nav-link text-dark" routerLink="/payroll/company" routerLinkActive="active">Payroll (Company)</a>
          }
        </nav>

        <button type="button" class="btn btn-outline-secondary" (click)="logout()">Logout</button>
      </aside>

      <div class="flex-grow-1 d-flex flex-column overflow-auto bg-light">
        <header class="d-flex justify-content-between align-items-center border-bottom bg-white px-4 py-3">
          <input type="search" class="form-control w-auto" placeholder="Search" aria-label="Search" />
          <div class="d-flex align-items-center gap-2">
            @if (authService.currentUser(); as user) {
              <span class="small text-muted">{{ user.name }} · {{ user.role }}</span>
            }
            <div class="rounded-circle bg-secondary" style="width: 32px; height: 32px;"></div>
          </div>
        </header>

        <main class="p-4 flex-grow-1">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
})
export class ShellComponent {
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  isManager = computed(() => {
    const role = this.authService.currentUser()?.role;
    return role === 'Admin' || role === 'Manager';
  });

  async logout(): Promise<void> {
    await firstValueFrom(this.authService.logout());
    this.router.navigateByUrl('/login');
  }
}
