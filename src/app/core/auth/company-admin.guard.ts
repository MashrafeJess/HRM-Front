import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const companyAdminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.currentUser()?.role === 'Company Admin' ? true : router.parseUrl('/dashboard');
};

export const superAdminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.currentUser()?.role === 'Super Admin' ? true : router.parseUrl('/dashboard');
};

// Super Admin manages companies across the platform, not a single company's own
// employee self-service data — they have no personal attendance/leave/payroll record.
export const notSuperAdminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.currentUser()?.role !== 'Super Admin' ? true : router.parseUrl('/dashboard');
};
