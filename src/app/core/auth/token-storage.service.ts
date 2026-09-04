import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  private readonly platformId = inject(PLATFORM_ID);

  private readonly ACCESS_KEY = 'accessToken';

  getAccessToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    return localStorage.getItem(this.ACCESS_KEY);
  }

  setAccessToken(accessToken: string): void {
    if (!isPlatformBrowser(this.platformId)) return;
    localStorage.setItem(this.ACCESS_KEY, accessToken);
  }

  clear(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    localStorage.removeItem(this.ACCESS_KEY);
  }
}
