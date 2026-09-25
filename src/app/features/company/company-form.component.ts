import { Component, computed, inject, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { form, required, FormField, FormRoot } from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';
import { CompanyService } from './company.service';
import { Company } from './company.model';
import { AuthService } from '../../core/auth/auth.service';
import { TokenStorageService } from '../../core/auth/token-storage.service';
import { ErrorModalComponent } from '../../shared/error-modal.component';
import { extractErrorMessage } from '../../shared/http-error.util';

const EMPTY_COMPANY: Company = {
  companyId: null,
  companyName: '',
  companyEmail: '',
  companyPhone: '',
  companyAddress: '',
  logoUrl: '',
  subscriptionPlan: 'Normal',
  isActive: true,
  createdAt: null,
  updatedAt: null,
};

@Component({
  selector: 'app-company-form',
  imports: [FormField, FormRoot, NgOptimizedImage, ErrorModalComponent],
  template: `
    <h1 class="h3 mb-4">{{ companyModel().companyId ? 'Edit' : 'New' }} Company</h1>

    <div class="card shadow-sm border-0" style="max-width: 640px;">
      <div class="card-body p-4">
        <form [formRoot]="companyForm">
          <div class="mb-3">
            <label class="form-label" for="companyName">Name</label>
            <input
              id="companyName"
              class="form-control"
              [class.is-invalid]="companyForm.companyName().touched() && companyForm.companyName().invalid()"
              [formField]="companyForm.companyName"
            />
            @if (companyForm.companyName().touched() && companyForm.companyName().invalid()) {
              <div class="invalid-feedback">{{ companyForm.companyName().errors()[0].message }}</div>
            }
          </div>

          <div class="mb-3">
            <label class="form-label" for="companyEmail">Email</label>
            <input
              id="companyEmail"
              type="email"
              class="form-control"
              [class.is-invalid]="companyForm.companyEmail().touched() && companyForm.companyEmail().invalid()"
              [formField]="companyForm.companyEmail"
            />
            @if (companyForm.companyEmail().touched() && companyForm.companyEmail().invalid()) {
              <div class="invalid-feedback">{{ companyForm.companyEmail().errors()[0].message }}</div>
            }
          </div>

          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label" for="companyPhone">Phone</label>
              <input id="companyPhone" class="form-control" [formField]="companyForm.companyPhone" />
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label" for="subscriptionPlan">Subscription Plan</label>
              <input id="subscriptionPlan" class="form-control" [formField]="companyForm.subscriptionPlan" />
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label" for="companyAddress">Address</label>
            <input id="companyAddress" class="form-control" [formField]="companyForm.companyAddress" />
          </div>

          <div class="mb-4">
            <label class="form-label" for="logoUrl">Logo URL</label>
            <div class="d-flex align-items-center gap-3">
              <input id="logoUrl" class="form-control" [formField]="companyForm.logoUrl" />
              @if (logoPreview()) {
                <img [ngSrc]="logoPreview()!" width="40" height="40" class="rounded object-fit-cover flex-shrink-0" alt="Logo preview" />
              }
            </div>
          </div>

          <div class="d-flex align-items-center gap-3">
            <button type="submit" class="btn btn-primary" [disabled]="!companyForm().valid()">Save</button>
          </div>
        </form>
      </div>
    </div>

    <app-error-modal [message]="errorMessage()" (closed)="errorMessage.set(null)" />
  `,
})
export class CompanyFormComponent {
  private readonly companyService = inject(CompanyService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly tokenStorage = inject(TokenStorageService);

  companyModel = signal<Company>({ ...EMPTY_COMPANY });
  errorMessage = signal<string | null>(null);
  logoPreview = computed(() => this.companyModel().logoUrl || null);

  companyForm = form(
    this.companyModel,
    (schemaPath) => {
      required(schemaPath.companyName, { message: 'Company name is required' });
      required(schemaPath.companyEmail, { message: 'Company email is required' });
    },
    {
      submission: {
        action: async () => {
          try {
            await firstValueFrom(this.companyService.editCompany(this.companyModel()));
            const isSuperAdmin = this.authService.currentUser()?.role === 'Super Admin';
            this.router.navigateByUrl(isSuperAdmin ? '/companies' : '/dashboard');
          } catch (error) {
            this.errorMessage.set(extractErrorMessage(error));
          }
        },
      },
    },
  );

  constructor() {
    const idParam = this.route.snapshot.paramMap.get('id');
    // Company Admin doesn't get a company picker/list — they land here with no :id
    // and this resolves straight to the one company tied to their own account.
    const companyId = idParam ? Number(idParam) : this.authService.currentUser()?.role !== 'Super Admin'
      ? this.tokenStorage.getCompanyId()
      : null;

    if (companyId) {
      this.companyService.getCompanyById(companyId).subscribe((company) => this.companyModel.set(company));
    }
  }
}
