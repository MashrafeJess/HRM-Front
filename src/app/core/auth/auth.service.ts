import { Injectable, inject, signal } from '@angular/core';
import { catchError, tap, throwError } from 'rxjs';
import { AuthApiService } from './auth-api.service';
import { TokenStorageService } from './token-storage.service';
import { AuthUser, LoginRequest } from './auth.model';
import { decodeJwt } from './jwt.util';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly authApi = inject(AuthApiService);
  private readonly tokenStorage = inject(TokenStorageService);

  readonly isLoggedIn = signal<boolean>(!!this.tokenStorage.getAccessToken());
  readonly currentUser = signal<AuthUser | null>(decodeAuthUser(this.tokenStorage.getAccessToken()));

  login(payload: LoginRequest) {
    return this.authApi.login(payload).pipe(
      tap((response) => {
        this.isLoggedIn.set(true);
        this.currentUser.set(decodeAuthUser(response.accessToken));
      }),
    );
  }

  refresh() {
    return this.authApi.refreshToken().pipe(
      tap((response) => {
        this.isLoggedIn.set(true);
        this.currentUser.set(decodeAuthUser(response.accessToken));
      }),
      catchError((error) => {
        this.isLoggedIn.set(false);
        this.currentUser.set(null);
        return throwError(() => error);
      }),
    );
  }

  logout() {
    return this.authApi.logout().pipe(
      tap(() => {
        this.tokenStorage.clear();
        this.isLoggedIn.set(false);
        this.currentUser.set(null);
      }),
    );
  }
}

function decodeAuthUser(token: string | null): AuthUser | null {
  if (!token) return null;
  const claims = decodeJwt(token);
  if (!claims) return null;

  return {
    id: Number(claims['NameIdentifier']),
    name: String(claims['Name'] ?? ''),
    email: String(claims['Email'] ?? ''),
    role: String(claims['Role'] ?? ''),
  };
}
