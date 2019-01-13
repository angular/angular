// #docregion
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

import { AuthService }      from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
    let url: string = state.url;

    return this.checkLogin(url);
  }

  checkLogin(url: string): boolean {
    if (this.authService.isLoggedIn) { return true; }

    // 로그인한 후 리다이렉트할 수 있도록 URL을 저장합니다.
    this.authService.redirectUrl = url;

    // 로그인하지 않았기 때문에 로그인 페이지로 이동합니다.
    this.router.navigate(['/login']);
    return false;
  }
}
// #enddocregion

/*
// #docregion can-load-interface
export class AuthGuard implements CanActivate, CanLoad {
// #enddocregion can-load-interface
*/
