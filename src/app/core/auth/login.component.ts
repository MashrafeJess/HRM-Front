import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { form, required, email, FormField, FormRoot } from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-login',
  imports: [FormField, FormRoot],
  template: `
    <div class="d-flex align-items-center justify-content-center vh-100 bg-light">
      <div class="card shadow-sm border-0" style="width: 100%; max-width: 380px;">
        <div class="card-body p-4">
          <div class="d-flex align-items-center gap-2 mb-4">
            <div
              class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold"
              style="width: 36px; height: 36px;"
            >
              H
            </div>
            <span class="fw-semibold fs-5">HRM</span>
          </div>

          <form [formRoot]="loginForm">
            <div class="mb-3">
              <label class="form-label" for="email">Email</label>
              <input
                id="email"
                type="email"
                class="form-control"
                [class.is-invalid]="loginForm.email().touched() && loginForm.email().invalid()"
                [formField]="loginForm.email"
              />
              @if (loginForm.email().touched() && loginForm.email().invalid()) {
                <div class="invalid-feedback">{{ loginForm.email().errors()[0].message }}</div>
              }
            </div>

            <div class="mb-3">
              <label class="form-label" for="password">Password</label>
              <input
                id="password"
                type="password"
                class="form-control"
                [class.is-invalid]="loginForm.password().touched() && loginForm.password().invalid()"
                [formField]="loginForm.password"
              />
              @if (loginForm.password().touched() && loginForm.password().invalid()) {
                <div class="invalid-feedback">{{ loginForm.password().errors()[0].message }}</div>
              }
            </div>

            @if (errorMessage()) {
              <div class="alert alert-danger py-2" role="alert">{{ errorMessage() }}</div>
            }

            <button type="submit" class="btn btn-primary w-100" [disabled]="!loginForm().valid()">Log in</button>
          </form>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  errorMessage = signal<string | null>(null);
  loginModel = signal({ email: '', password: '' });

  loginForm = form(
    this.loginModel,
    (schemaPath) => {
      required(schemaPath.email, { message: 'Email is required' });
      email(schemaPath.email, { message: 'Enter a valid email address' });
      required(schemaPath.password, { message: 'Password is required' });
    },
    {
      submission: {
        action: async () => {
          this.errorMessage.set(null);
          try {
            await firstValueFrom(this.authService.login(this.loginModel()));
            this.router.navigateByUrl('/dashboard');
          } catch {
            this.errorMessage.set('Invalid email or password');
          }
        },
      },
    },
  );
}
