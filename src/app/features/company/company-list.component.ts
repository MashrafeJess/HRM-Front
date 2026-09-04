import { Component, inject } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { CompanyService } from './company.service';

@Component({
  selector: 'app-company-list',
  imports: [RouterLink, NgOptimizedImage],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h1 class="h3 mb-0">Companies</h1>
      <a routerLink="/companies/new" class="btn btn-primary btn-sm">+ New Company</a>
    </div>

    <div class="card shadow-sm border-0">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th>Logo</th>
              <th>Name</th>
              <th>Email</th>
              <th>Plan</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            @for (company of companies()?.items ?? []; track company.companyId) {
              <tr>
                <td>
                  @if (company.logoUrl) {
                    <img
                      [ngSrc]="company.logoUrl"
                      width="40"
                      height="40"
                      class="rounded object-fit-cover"
                      alt="{{ company.companyName }} logo"
                    />
                  } @else {
                    <div
                      class="rounded bg-secondary-subtle d-flex align-items-center justify-content-center text-muted"
                      style="width: 40px; height: 40px;"
                    >
                      {{ company.companyName.charAt(0) }}
                    </div>
                  }
                </td>
                <td>{{ company.companyName }}</td>
                <td>{{ company.companyEmail }}</td>
                <td><span class="badge text-bg-secondary">{{ company.subscriptionPlan }}</span></td>
                <td class="text-end">
                  <a [routerLink]="['/companies', company.companyId, 'edit']" class="btn btn-outline-primary btn-sm">
                    Edit
                  </a>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="5" class="text-center text-muted py-4">No companies found.</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class CompanyListComponent {
  private readonly companyService = inject(CompanyService);

  companies = toSignal(this.companyService.getAllCompanies('desc', 1, 50));
}
