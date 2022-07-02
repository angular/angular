// #docregion can-activate-child
import { inject } from '@angular/core';
import {
  CanActivateFn, CanMatchFn, Router,
  CanActivateChildFn,
  UrlTree
} from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanMatchFn|CanActivateFn|CanActivateChildFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn) {
    return true;
  }

  const url = router.getCurrentNavigation()!.extractedUrl.toString();
  // Store the attempted URL for redirecting
  authService.redirectUrl = url;
  // Redirect to the login page
  return router.parseUrl('/login');
};
