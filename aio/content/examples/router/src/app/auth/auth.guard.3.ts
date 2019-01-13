// #docregion can-activate-child
import { Injectable }       from '@angular/core';
import {
  CanActivate, Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  CanActivateChild
}                           from '@angular/router';
import { AuthService }      from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate, CanActivateChild {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
    let url: string = state.url;

    return this.checkLogin(url);
  }

  canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
    return this.canActivate(route, state);
  }

// #enddocregion can-activate-child
  checkLogin(url: string): boolean {
    if (this.authService.isLoggedIn) { return true; }

    // 로그인한 후에 이동할 URL을 저장해 둡니다.
    this.authService.redirectUrl = url;

    // 로그인 페이지로 이동합니다.
    this.router.navigate(['/login']);
    return false;
  }
// #docregion can-activate-child
}
// #enddocregion
