// #docplaster
import { inject } from '@angular/core';
import {
  CanActivateFn, CanMatchFn, Router,
  CanActivateChildFn,
  NavigationExtras,
  CanLoadFn, UrlTree
} from '@angular/router';
import { AuthService } from './auth.service';

// #docregion canLoad
export const authGuard: CanMatchFn|CanActivateChildFn|CanActivateFn|CanLoadFn = () => {
// #enddocregion canLoad
  const router = inject(Router);
  const authService = inject(AuthService);

  if (authService.isLoggedIn) {
    return true;
  }

  const url = router.getCurrentNavigation()!.extractedUrl.toString();

  // Store the attempted URL for redirecting
  authService.redirectUrl = url;

  // Create a dummy session id
  const sessionId = 123456789;

  // Set our navigation extras object
  // that contains our global query params and fragment
  const navigationExtras: NavigationExtras = {
    queryParams: { session_id: sessionId },
    fragment: 'anchor'
  };

  // Navigate to the login page with extras
  return router.createUrlTree(['/login'], navigationExtras);
};
