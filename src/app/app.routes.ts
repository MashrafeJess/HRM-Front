import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { companyAdminGuard, superAdminGuard, notSuperAdminGuard } from './core/auth/company-admin.guard';
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
        path: 'profile',
        loadComponent: () => import('./features/profile/profile.component').then((m) => m.ProfileComponent),
      },
      {
        path: 'companies',
        canActivate: [superAdminGuard],
        loadComponent: () => import('./features/company/company-list.component').then((m) => m.CompanyListComponent),
      },
      {
        path: 'companies/new',
        canActivate: [superAdminGuard],
        loadComponent: () => import('./features/company/company-form.component').then((m) => m.CompanyFormComponent),
      },
      {
        path: 'companies/:id/edit',
        canActivate: [superAdminGuard],
        loadComponent: () => import('./features/company/company-form.component').then((m) => m.CompanyFormComponent),
      },
      {
        path: 'company',
        canActivate: [companyAdminGuard],
        loadComponent: () => import('./features/company/company-form.component').then((m) => m.CompanyFormComponent),
      },
      {
        path: 'departments',
        canActivate: [companyAdminGuard],
        loadComponent: () => import('./features/department/department-list.component').then((m) => m.DepartmentListComponent),
      },
      {
        path: 'departments/new',
        canActivate: [companyAdminGuard],
        loadComponent: () => import('./features/department/department-form.component').then((m) => m.DepartmentFormComponent),
      },
      {
        path: 'departments/:id/edit',
        canActivate: [companyAdminGuard],
        loadComponent: () => import('./features/department/department-form.component').then((m) => m.DepartmentFormComponent),
      },
      {
        path: 'employees',
        canActivate: [companyAdminGuard],
        loadComponent: () => import('./features/employee/employee-list.component').then((m) => m.EmployeeListComponent),
      },
      {
        path: 'employees/new',
        canActivate: [companyAdminGuard],
        loadComponent: () => import('./features/employee/employee-form.component').then((m) => m.EmployeeFormComponent),
      },
      {
        path: 'employees/:id/edit',
        canActivate: [companyAdminGuard],
        loadComponent: () => import('./features/employee/employee-form.component').then((m) => m.EmployeeFormComponent),
      },
      {
        path: 'roles',
        canActivate: [companyAdminGuard],
        loadComponent: () => import('./features/role/role-list.component').then((m) => m.RoleListComponent),
      },
      {
        path: 'roles/new',
        canActivate: [companyAdminGuard],
        loadComponent: () => import('./features/role/role-form.component').then((m) => m.RoleFormComponent),
      },
      {
        path: 'roles/:id/edit',
        canActivate: [companyAdminGuard],
        loadComponent: () => import('./features/role/role-form.component').then((m) => m.RoleFormComponent),
      },
      {
        path: 'attendance',
        canActivate: [notSuperAdminGuard],
        loadComponent: () =>
          import('./features/attendance/attendance-checkin.component').then((m) => m.AttendanceCheckinComponent),
      },
      {
        path: 'attendance/admin',
        canActivate: [companyAdminGuard],
        loadComponent: () => import('./features/attendance/attendance-admin.component').then((m) => m.AttendanceAdminComponent),
      },
      {
        path: 'leaves',
        canActivate: [notSuperAdminGuard],
        loadComponent: () => import('./features/leave/leave-my-list.component').then((m) => m.LeaveMyListComponent),
      },
      {
        path: 'leaves/new',
        canActivate: [notSuperAdminGuard],
        loadComponent: () => import('./features/leave/leave-request-form.component').then((m) => m.LeaveRequestFormComponent),
      },
      {
        path: 'leaves/approvals',
        canActivate: [companyAdminGuard],
        loadComponent: () => import('./features/leave/leave-approvals.component').then((m) => m.LeaveApprovalsComponent),
      },
      {
        path: 'payroll',
        canActivate: [notSuperAdminGuard],
        loadComponent: () => import('./features/payroll/payroll-my-view.component').then((m) => m.PayrollMyViewComponent),
      },
      {
        path: 'payroll/company',
        canActivate: [companyAdminGuard],
        loadComponent: () =>
          import('./features/payroll/payroll-company-list.component').then((m) => m.PayrollCompanyListComponent),
      },
      {
        path: 'hr-assistant',
        canActivate: [companyAdminGuard],
        loadComponent: () => import('./features/hr-assistant/hr-assistant.component').then((m) => m.HrAssistantComponent),
      },
    ],
  },
];
