// #docplaster
// #docregion
import { Injectable }       from '@angular/core';
import {
  CanActivate, Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  CanActivateChild,
  NavigationExtras
}                           from '@angular/router';
import { AuthService }      from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate, CanActivateChild {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    let url: string = state.url;

    return this.checkLogin(url);
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.canActivate(route, state);
  }

  checkLogin(url: string): boolean {
    if (this.authService.isLoggedIn) { return true; }

    // 리다이렉트할 URL을 저장해 둡니다.
    this.authService.redirectUrl = url;

    // 더미 세션 ID를 생성합니다.
    let sessionId = 123456789;

    // 전역 쿼리 파라미터와 프래그먼트를 NavigationExtras 객체타입으로 전달합니다.
    let navigationExtras: NavigationExtras = {
      queryParams: { 'session_id': sessionId },
      fragment: 'anchor'
    };

    // 로그인 페이지로 이동하면서 인자를 함께 전달합니다.
    this.router.navigate(['/login'], navigationExtras);
    return false;
  }
}
