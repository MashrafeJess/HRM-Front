import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { TokenStorageService } from './token-storage.service';
import { isTokenExpired } from './jwt.util';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const tokenStorage = inject(TokenStorageService);
  const router = inject(Router);

  const token = tokenStorage.getAccessToken();

  // isLoggedIn is only updated on explicit login/logout/refresh — it stays stale (true)
  // across a browser Back/Forward navigation after the token's exp has simply passed,
  // since that kind of navigation makes no HTTP call to trigger the 401/refresh path.
  // Check the token's actual expiry here so History navigation can't bypass the guard.
  if (token && !isTokenExpired(token)) {
    return true;
  }

  authService.forceLogout();
  return router.parseUrl('/login');
};
