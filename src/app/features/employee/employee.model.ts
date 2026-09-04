export interface Employee {
  id: number | null;
  companyId: number;
  departmentId: number;
  employeeCode: string | null;
  firstName: string;
  lastName: string;
  email: string;
  password: string | null;
  phone: string;
  roleId: number | null;
  roleName: string | null;
  gender: string;
  dateOfBirth: string;
  joinDate: string;
  salary: number;
  status: string;
  isActive: boolean | null;
}
