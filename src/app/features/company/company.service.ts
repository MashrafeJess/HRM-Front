import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PagedResult } from '../../shared/models/paged-result.model';
import { Company } from './company.model';

@Injectable({ providedIn: 'root' })
export class CompanyService {
  private readonly http = inject(HttpClient);

  getAllCompanies(viewOrder: 'asc' | 'desc', pageNumber: number, pageSize: number): Observable<PagedResult<Company>> {
    const params = new HttpParams()
      .set('ViewOrder', viewOrder)
      .set('PageNumber', pageNumber)
      .set('PageSize', pageSize);

    return this.http.get<PagedResult<Company>>('/api/Company/GetAllCompany', { params });
  }

  getCompanyById(companyId: number): Observable<Company> {
    return this.http.get<Company>(`/api/Company/GetCompanyById/${companyId}`);
  }

  editCompany(payload: Company): Observable<Company> {
    return this.http.post<Company>('/api/Company/EditCompany', payload);
  }
}
