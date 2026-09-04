export interface Payroll {
  payrollId: number;
  companyId: number;
  employeeId: number;
  month: number;
  year: number;
  basicSalary: number;
  absentDeduction: number | null;
  lateDeduction: number | null;
  netSalary: number | null;
  generatedAt: string | null;
}
