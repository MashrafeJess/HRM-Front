import {Injectable, inject} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Observable, catchError, tap, of, throwError} from 'rxjs';
import {TokenStorageService} from './token-storage.service';
import { LoginRequest, LoginResponse, RefreshTokenResponse } from './auth.model';

@Injectable({providedIn: 'root'})
export class AuthApiService {
  private readonly http = inject(HttpClient);
  private readonly tokenStorage = inject(TokenStorageService);

  login(payload: LoginRequest) : Observable<LoginResponse> {
    return this.http
    .post<LoginResponse>('/api/Auth/login', payload, { withCredentials: true })
    .pipe(
      tap((response) => this.tokenStorage.setTokens(response.accessToken, response.refreshToken)),
      catchError((error : HttpErrorResponse) => {
        console.error('Login error:', error.status, error.message);
        return throwError(() => error);
      })
    )
  }

  refreshToken(): Observable<RefreshTokenResponse> {
    const refreshToken = this.tokenStorage.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http
    .post<RefreshTokenResponse>('/api/Auth/refresh', { refreshToken }, { withCredentials: true })
    .pipe(
      tap((response) => this.tokenStorage.setTokens(response.accessToken, response.refreshToken)),
      catchError((error : HttpErrorResponse) => {
        console.error('Refresh token error:', error.status, error.message);
        this.tokenStorage.clear();
        return throwError(() => error);
      })
    )
  }

  logout(): Observable<void> {
    return this.http
    .post<void>('/api/Auth/logout', {}, { withCredentials: true })
    .pipe(
      catchError((error : HttpErrorResponse) => {
        console.error('Logout error:', error.status, error.message);
        return of(undefined)
      })
    )
  }
}
