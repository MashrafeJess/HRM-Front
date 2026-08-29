import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  template: `
    <h1 class="h3 mb-4">Dashboard</h1>

    <div class="row g-3">
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
            <h2 class="h6 text-muted mb-3">Employees</h2>
            <p class="card-text text-muted small mb-3">Add a new employee record.</p>
            <a routerLink="/employees/new" class="btn btn-primary btn-sm">Add Employee</a>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class DashboardComponent {}
