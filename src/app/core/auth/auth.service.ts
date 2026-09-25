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

  // Synchronous, no network call — for when the guard finds an already-expired token
  // (e.g. via browser Back navigation) and needs to reset local state immediately,
  // without waiting on (or bothering with) a server-side revoke of a dead session.
  forceLogout(): void {
    this.tokenStorage.clear();
    this.isLoggedIn.set(false);
    this.currentUser.set(null);
  }
}

const CLAIM_TYPES = {
  nameIdentifier: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier',
  name: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name',
  email: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
  role: 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role',
};

function claim(claims: Record<string, unknown>, shortKey: string, longKey: string): string {
  const value = claims[shortKey] ?? claims[longKey];
  return value == null ? '' : String(value);
}

function decodeAuthUser(token: string | null): AuthUser | null {
  if (!token) return null;
  const claims = decodeJwt(token);
  if (!claims) return null;

  return {
    id: Number(claim(claims, 'NameIdentifier', CLAIM_TYPES.nameIdentifier)),
    name: claim(claims, 'Name', CLAIM_TYPES.name),
    email: claim(claims, 'Email', CLAIM_TYPES.email),
    role: claim(claims, 'Role', CLAIM_TYPES.role),
  };
}
