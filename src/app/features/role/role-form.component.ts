import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { form, required, FormField, FormRoot } from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';
import { RoleService } from './role.service';
import { Role } from './role.model';

const EMPTY_ROLE: Role = {
  roleId: null,
  roleName: '',
  isActive: true,
  createdAt: null,
  updatedAt: null,
};

@Component({
  selector: 'app-role-form',
  imports: [FormField, FormRoot],
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
            @if (saved()) {
              <span class="text-success small">Saved.</span>
            }
          </div>
        </form>
      </div>
    </div>
  `,
})
export class RoleFormComponent {
  private readonly roleService = inject(RoleService);
  private readonly route = inject(ActivatedRoute);

  roleModel = signal<Role>({ ...EMPTY_ROLE });
  saved = signal(false);

  roleForm = form(
    this.roleModel,
    (schemaPath) => {
      required(schemaPath.roleName, { message: 'Role name is required' });
    },
    {
      submission: {
        action: async () => {
          const result = await firstValueFrom(this.roleService.addOrUpdateRole(this.roleModel()));
          this.roleModel.update((current) => ({ ...current, ...result }));
          this.saved.set(true);
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
