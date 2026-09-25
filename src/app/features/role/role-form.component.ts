import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { form, required, FormField, FormRoot } from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';
import { RoleService } from './role.service';
import { Role } from './role.model';
import { ErrorModalComponent } from '../../shared/error-modal.component';
import { extractErrorMessage } from '../../shared/http-error.util';

const EMPTY_ROLE: Role = {
  roleId: null,
  roleName: '',
  isActive: true,
  createdAt: null,
  updatedAt: null,
};

@Component({
  selector: 'app-role-form',
  imports: [FormField, FormRoot, ErrorModalComponent],
  template: `
    <h1 class="h3 mb-4">{{ roleModel().roleId ? 'Edit' : 'New' }} Role</h1>

    <div class="card shadow-sm border-0" style="max-width: 480px;">
      <div class="card-body p-4">
        <form [formRoot]="roleForm">
          <div class="mb-3">
            <label class="form-label" for="roleName">Name</label>
            <input
              id="roleName"
              class="form-control"
              [class.is-invalid]="roleForm.roleName().touched() && roleForm.roleName().invalid()"
              [formField]="roleForm.roleName"
            />
            @if (roleForm.roleName().touched() && roleForm.roleName().invalid()) {
              <div class="invalid-feedback">{{ roleForm.roleName().errors()[0].message }}</div>
            }
          </div>

          <div class="form-check mb-4">
            <input id="isActive" type="checkbox" class="form-check-input" [formField]="roleForm.isActive" />
            <label class="form-check-label" for="isActive">Active</label>
          </div>

          <div class="d-flex align-items-center gap-3">
            <button type="submit" class="btn btn-primary" [disabled]="!roleForm().valid()">Save</button>
          </div>
        </form>
      </div>
    </div>

    <app-error-modal [message]="errorMessage()" (closed)="errorMessage.set(null)" />
  `,
})
export class RoleFormComponent {
  private readonly roleService = inject(RoleService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  roleModel = signal<Role>({ ...EMPTY_ROLE });
  errorMessage = signal<string | null>(null);

  roleForm = form(
    this.roleModel,
    (schemaPath) => {
      required(schemaPath.roleName, { message: 'Role name is required' });
    },
    {
      submission: {
        action: async () => {
          try {
            await firstValueFrom(this.roleService.addOrUpdateRole(this.roleModel()));
            this.router.navigateByUrl('/roles');
          } catch (error) {
            this.errorMessage.set(extractErrorMessage(error));
          }
        },
      },
    },
  );

  constructor() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.roleService.getRoleById(Number(idParam)).subscribe((role) => this.roleModel.set(role));
    }
  }
}
