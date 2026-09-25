export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  CompanyId?: number;
  companyId?: number;
  EmployeeId?: number;
  employeeId?: number;
  DepartmentId?: number;
  departmentId?: number;
}

export interface RefreshTokenResponse {
  accessToken: string;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
}
