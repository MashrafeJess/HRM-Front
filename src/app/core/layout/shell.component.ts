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
          <a class="nav-link text-dark" routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Dashboard</a>

          @if (isSuperAdmin()) {
            <a class="nav-link text-dark" routerLink="/companies" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Companies</a>
          }
          @if (isCompanyAdmin()) {
            <a class="nav-link text-dark" routerLink="/company" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">My Company</a>
            <a class="nav-link text-dark" routerLink="/departments" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Departments</a>
            <a class="nav-link text-dark" routerLink="/employees" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Employees</a>
            <a class="nav-link text-dark" routerLink="/roles" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Roles</a>
            <a class="nav-link text-dark" routerLink="/hr-assistant" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">HR Assistant</a>
          }

          @if (!isSuperAdmin()) {
            <a class="nav-link text-dark" routerLink="/attendance" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Attendance</a>
          }
          @if (isCompanyAdmin()) {
            <a class="nav-link text-dark" routerLink="/attendance/admin" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Attendance (Admin)</a>
          }

          @if (!isSuperAdmin()) {
            <a class="nav-link text-dark" routerLink="/leaves" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">My Leave</a>
          }
          @if (isCompanyAdmin()) {
            <a class="nav-link text-dark" routerLink="/leaves/approvals" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Leave Approvals</a>
          }

          @if (!isSuperAdmin()) {
            <a class="nav-link text-dark" routerLink="/payroll" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">My Payroll</a>
          }
          @if (isCompanyAdmin()) {
            <a class="nav-link text-dark" routerLink="/payroll/company" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Payroll (Company)</a>
          }
        </nav>

        <button type="button" class="btn btn-outline-secondary" (click)="logout()">Logout</button>
      </aside>

      <div class="flex-grow-1 d-flex flex-column overflow-auto bg-light">
        <header class="d-flex justify-content-between align-items-center border-bottom bg-white px-4 py-3">
          <input type="search" class="form-control w-auto" placeholder="Search" aria-label="Search" />
          <a routerLink="/profile" class="d-flex align-items-center gap-2 text-decoration-none text-dark">
            @if (authService.currentUser(); as user) {
              <span class="small text-muted">{{ user.name }} · {{ user.role }}</span>
              <div
                class="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center fw-semibold"
                style="width: 32px; height: 32px;"
              >
                {{ user.name.charAt(0).toUpperCase() }}
              </div>
            } @else {
              <div class="rounded-circle bg-secondary" style="width: 32px; height: 32px;"></div>
            }
          </a>
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

  isSuperAdmin = computed(() => this.authService.currentUser()?.role === 'Super Admin');
  isCompanyAdmin = computed(() => this.authService.currentUser()?.role === 'Company Admin');

  async logout(): Promise<void> {
    await firstValueFrom(this.authService.logout());
    this.router.navigateByUrl('/login');
  }
}
