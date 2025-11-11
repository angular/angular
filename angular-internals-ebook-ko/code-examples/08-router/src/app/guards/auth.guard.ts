// 인증 가드
// Angular 18+ 함수형 가드를 사용한 라우트 보호

import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';

/**
 * AuthService
 *
 * 사용자 인증 상태를 관리하는 서비스입니다.
 * 실제 프로덕션 환경에서는 백엔드 API와 통신합니다.
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // 시뮬레이션용 인증 상태
  private isAuthenticated = false;

  // 현재 로그인한 사용자
  private currentUser: { id: string; name: string; email: string } | null = null;

  constructor() {
    // 로컬 스토리지에서 인증 상태 복원
    const storedAuth = localStorage.getItem('isAuthenticated');
    if (storedAuth === 'true') {
      this.isAuthenticated = true;
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        this.currentUser = JSON.parse(storedUser);
      }
    }
  }

  /**
   * 로그인 메서드 (시뮬레이션)
   *
   * @param username 사용자 이름
   * @param password 비밀번호
   * @returns 인증 성공 여부
   */
  login(username: string, password: string): Observable<boolean> {
    // API 호출을 시뮬레이션하기 위해 지연을 추가합니다
    return of(true).pipe(
      delay(500),
      map(() => {
        // 간단한 검증 (실제 환경에서는 백엔드에서 수행)
        if (username && password) {
          this.isAuthenticated = true;
          this.currentUser = {
            id: '1',
            name: username,
            email: `${username}@example.com`,
          };
          // 로컬 스토리지에 저장
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
          return true;
        }
        return false;
      })
    );
  }

  /**
   * 로그아웃 메서드
   */
  logout(): void {
    this.isAuthenticated = false;
    this.currentUser = null;
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('currentUser');
  }

  /**
   * 인증 여부 확인
   *
   * @returns 인증 상태
   */
  isLoggedIn(): boolean {
    return this.isAuthenticated;
  }

  /**
   * 현재 사용자 정보 조회
   *
   * @returns 현재 사용자 정보
   */
  getCurrentUser() {
    return this.currentUser;
  }
}

/**
 * 인증 가드
 *
 * Angular 18+의 함수형 가드를 사용합니다.
 * 사용자가 인증되지 않으면 로그인 페이지로 리다이렉트합니다.
 */
@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  /**
   * 라우트 활성화 여부를 결정합니다.
   *
   * @param route 활성화될 라우트
   * @param state 라우터 상태
   * @returns true면 라우트 활성화, false면 거부
   */
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    // 사용자가 인증되었는지 확인
    if (this.authService.isLoggedIn()) {
      return of(true);
    }

    // 인증되지 않은 경우 로그인 페이지로 리다이렉트
    console.warn(`접근 거부: 인증되지 않은 사용자 - 요청한 URL: ${state.url}`);
    this.router.navigate(['/login']);
    return of(false);
  }
}

/**
 * 함수형 인증 가드
 *
 * Angular 18+에서는 다음과 같이 함수형 가드를 정의할 수 있습니다:
 * 이것이 더 권장되는 패턴입니다.
 */
export const authGuard = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
  authService: AuthService,
  router: Router
): Observable<boolean> => {
  if (authService.isLoggedIn()) {
    return of(true);
  }

  console.warn(`접근 거부: 인증되지 않은 사용자 - 요청한 URL: ${state.url}`);
  router.navigate(['/login']);
  return of(false);
};

/**
 * 역할 기반 가드
 *
 * 특정 역할을 가진 사용자만 접근할 수 있는 가드입니다.
 */
@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    const requiredRole = route.data['role'];

    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return of(false);
    }

    // 실제 구현에서는 사용자의 역할을 확인합니다
    const userRole = route.data['userRole'] || 'user';

    if (requiredRole && userRole !== requiredRole) {
      console.warn(`접근 거부: 필요한 역할 ${requiredRole}, 사용자 역할 ${userRole}`);
      this.router.navigate(['/']);
      return of(false);
    }

    return of(true);
  }
}
