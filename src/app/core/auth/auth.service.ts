import { Injectable, inject, signal } from '@angular/core';
import { tap } from 'rxjs';
import { AuthApiService } from './auth-api.service';
import { TokenStorageService } from './token-storage.service';
import { LoginRequest } from './auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly authApi = inject(AuthApiService);
  private readonly tokenStorage = inject(TokenStorageService);

  readonly isLoggedIn = signal<boolean>(!!this.tokenStorage.getAccessToken());

  login(payload: LoginRequest) {
    return this.authApi.login(payload).pipe(tap(() => this.isLoggedIn.set(true)));
  }

  logout() {
    return this.authApi.logout().pipe(
      tap(() => {
        this.tokenStorage.clear();
        this.isLoggedIn.set(false);
      }),
    );
  }
}
