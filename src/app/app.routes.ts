import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { ShellComponent } from './core/layout/shell.component';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./core/auth/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'companies',
        loadComponent: () => import('./features/company/company-list.component').then((m) => m.CompanyListComponent),
      },
      {
        path: 'companies/new',
        loadComponent: () => import('./features/company/company-form.component').then((m) => m.CompanyFormComponent),
      },
      {
        path: 'companies/:id/edit',
        loadComponent: () => import('./features/company/company-form.component').then((m) => m.CompanyFormComponent),
      },
      {
        path: 'employees/new',
        loadComponent: () => import('./features/employee/employee-form.component').then((m) => m.EmployeeFormComponent),
      },
      {
        path: 'employees/:id/edit',
        loadComponent: () => import('./features/employee/employee-form.component').then((m) => m.EmployeeFormComponent),
      },
    ],
  },
];
