import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { LoginResponse } from './auth.model';

@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  private readonly platformId = inject(PLATFORM_ID);

  private readonly ACCESS_KEY = 'accessToken';
  private readonly REFRESH_KEY = 'refreshToken';
  private readonly COMPANY_KEY = 'companyId';
  private readonly EMPLOYEE_KEY = 'employeeId';
  private readonly DEPARTMENT_KEY = 'departmentId';

  getAccessToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    return localStorage.getItem(this.ACCESS_KEY);
  }

  setAccessToken(accessToken: string): void {
    if (!isPlatformBrowser(this.platformId)) return;
    localStorage.setItem(this.ACCESS_KEY, accessToken);
  }

  setLoginData(response: LoginResponse): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const companyId = response.CompanyId ?? response.companyId;
    const employeeId = response.EmployeeId ?? response.employeeId;
    const departmentId = response.DepartmentId ?? response.departmentId;

    console.log('[TokenStorage] saving login identifiers', { companyId, employeeId, departmentId });

    localStorage.setItem(this.ACCESS_KEY, response.accessToken);

    // Remove old context values so a partial/malformed login cannot reuse another user's IDs.
    [this.COMPANY_KEY, this.EMPLOYEE_KEY, this.DEPARTMENT_KEY].forEach((key) => localStorage.removeItem(key));

    if (response.refreshToken) {
      localStorage.setItem(this.REFRESH_KEY, response.refreshToken);
    }

    if (companyId != null) localStorage.setItem(this.COMPANY_KEY, String(companyId));
    if (employeeId != null) localStorage.setItem(this.EMPLOYEE_KEY, String(employeeId));
    if (departmentId != null) localStorage.setItem(this.DEPARTMENT_KEY, String(departmentId));
  }

  getCompanyId(): number | null {
    return this.getNumber(this.COMPANY_KEY);
  }

  getEmployeeId(): number | null {
    return this.getNumber(this.EMPLOYEE_KEY);
  }

  getDepartmentId(): number | null {
    return this.getNumber(this.DEPARTMENT_KEY);
  }

  clear(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    [
      this.ACCESS_KEY,
      this.REFRESH_KEY,
      this.COMPANY_KEY,
      this.EMPLOYEE_KEY,
      this.DEPARTMENT_KEY,
    ].forEach((key) => localStorage.removeItem(key));
  }

  private getNumber(key: string): number | null {
    if (!isPlatformBrowser(this.platformId)) return null;

    const value = localStorage.getItem(key);
    if (!value) return null;

    const parsedValue = Number(value);
    return Number.isFinite(parsedValue) ? parsedValue : null;
  }
}
