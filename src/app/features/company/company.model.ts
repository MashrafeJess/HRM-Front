export interface Company {
  companyId: number | null;
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  companyAddress: string;
  logoUrl: string;
  subscriptionPlan: string;
  isActive: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface CompanyUpsertRequest {
  dto: Company;
}
