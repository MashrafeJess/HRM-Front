export interface Department {
  departmentId: number | null;
  companyId: number;
  departmentName: string;
  description: string;
  isActive: boolean;
  employeeCount: number | null;
  createdAt: string | null;
  updatedAt: string | null;
}
