import { Component, computed, inject, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { form, required, FormField, FormRoot } from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';
import { CompanyService } from './company.service';
import { Company } from './company.model';

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
  imports: [FormField, FormRoot, NgOptimizedImage],
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
            @if (saved()) {
              <span class="text-success small">Saved.</span>
            }
          </div>
        </form>
      </div>
    </div>
  `,
})
export class CompanyFormComponent {
  private readonly companyService = inject(CompanyService);
  private readonly route = inject(ActivatedRoute);

  companyModel = signal<Company>({ ...EMPTY_COMPANY });
  saved = signal(false);
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
          const result = await firstValueFrom(this.companyService.editCompany(this.companyModel()));
          this.companyModel.set(result);
          this.saved.set(true);
        },
      },
    },
  );

  constructor() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.companyService.getCompanyById(Number(idParam)).subscribe((company) => this.companyModel.set(company));
    }
  }
}
