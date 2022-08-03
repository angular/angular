// #docregion
import {Injectable} from '@angular/core';
import {
  ActivatedRouteSnapshot, CanActivate, CanMatch,
  Route, Router, RouterStateSnapshot, UrlTree
} from '@angular/router';

import {AuthService} from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate, CanMatch {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): true|UrlTree {
    const url: string = state.url;

    return this.checkLogin(url);
  }

  // #enddocregion
  // #docregion can-match
  canMatch(route: Route) {
    const url = `/${route.path}`;
    return this.checkLogin(url) === true;
  }
  // #enddocregion can-match
  // #docregion

  checkLogin(url: string): true|UrlTree {
    if (this.authService.isLoggedIn) {
      return true;
    }

    // Store the attempted URL for redirecting
    this.authService.redirectUrl = url;

    // Redirect to the login page
    return this.router.parseUrl('/login');
  }
}
// #enddocregion
