export interface Payroll {
  payrollId: number;
  companyId: number;
  employeeId: number;
  employeeName: string | null;
  month: number;
  year: number;
  basicSalary: number;
  absentDeduction: number | null;
  lateDeduction: number | null;
  netSalary: number | null;
  generatedAt: string | null;
}
