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
        path: 'departments',
        loadComponent: () => import('./features/department/department-list.component').then((m) => m.DepartmentListComponent),
      },
      {
        path: 'departments/new',
        loadComponent: () => import('./features/department/department-form.component').then((m) => m.DepartmentFormComponent),
      },
      {
        path: 'departments/:id/edit',
        loadComponent: () => import('./features/department/department-form.component').then((m) => m.DepartmentFormComponent),
      },
      {
        path: 'employees',
        loadComponent: () => import('./features/employee/employee-list.component').then((m) => m.EmployeeListComponent),
      },
      {
        path: 'employees/new',
        loadComponent: () => import('./features/employee/employee-form.component').then((m) => m.EmployeeFormComponent),
      },
      {
        path: 'employees/:id/edit',
        loadComponent: () => import('./features/employee/employee-form.component').then((m) => m.EmployeeFormComponent),
      },
      {
        path: 'roles',
        loadComponent: () => import('./features/role/role-list.component').then((m) => m.RoleListComponent),
      },
      {
        path: 'roles/new',
        loadComponent: () => import('./features/role/role-form.component').then((m) => m.RoleFormComponent),
      },
      {
        path: 'roles/:id/edit',
        loadComponent: () => import('./features/role/role-form.component').then((m) => m.RoleFormComponent),
      },
      {
        path: 'attendance',
        loadComponent: () =>
          import('./features/attendance/attendance-checkin.component').then((m) => m.AttendanceCheckinComponent),
      },
      {
        path: 'attendance/admin',
        loadComponent: () => import('./features/attendance/attendance-admin.component').then((m) => m.AttendanceAdminComponent),
      },
      {
        path: 'leaves',
        loadComponent: () => import('./features/leave/leave-my-list.component').then((m) => m.LeaveMyListComponent),
      },
      {
        path: 'leaves/new',
        loadComponent: () => import('./features/leave/leave-request-form.component').then((m) => m.LeaveRequestFormComponent),
      },
      {
        path: 'leaves/approvals',
        loadComponent: () => import('./features/leave/leave-approvals.component').then((m) => m.LeaveApprovalsComponent),
      },
      {
        path: 'payroll',
        loadComponent: () => import('./features/payroll/payroll-my-view.component').then((m) => m.PayrollMyViewComponent),
      },
      {
        path: 'payroll/company',
        loadComponent: () =>
          import('./features/payroll/payroll-company-list.component').then((m) => m.PayrollCompanyListComponent),
      },
    ],
  },
];
