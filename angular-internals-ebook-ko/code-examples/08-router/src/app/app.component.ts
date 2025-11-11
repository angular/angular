// 루트 애플리케이션 컴포넌트
// Angular 18+ 스탠드얼론 컴포넌트

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd, NavigationStart } from '@angular/router';
import { filter, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from './guards/auth.guard';

/**
 * 애플리케이션 루트 컴포넌트
 *
 * 역할:
 * - 라우터 아웃렛 제공 (라우트된 컴포넌트 렌더링)
 * - 네비게이션 메뉴 표시
 * - 라우터 이벤트 처리 및 로딩 상태 관리
 * - 인증 상태 표시
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="app-container">
      <!-- 네비게이션 바 -->
      <nav>
        <div class="container">
          <div class="nav-header">
            <h1>Angular 라우터 예제</h1>
          </div>

          <!-- 네비게이션 링크 -->
          <ul class="nav-links">
            <li>
              <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
                홈
              </a>
            </li>
            <li>
              <a routerLink="/about" routerLinkActive="active">
                소개
              </a>
            </li>
            <li>
              <a routerLink="/blog" routerLinkActive="active">
                블로그
              </a>
            </li>
            <li *ngIf="isLoggedIn">
              <a routerLink="/dashboard" routerLinkActive="active">
                대시보드
              </a>
            </li>
            <li *ngIf="isLoggedIn">
              <a routerLink="/settings" routerLinkActive="active">
                설정
              </a>
            </li>
          </ul>

          <!-- 인증 상태 및 버튼 -->
          <div class="auth-section">
            <span *ngIf="isLoggedIn" class="user-info">
              환영합니다, {{ currentUserName }}
            </span>
            <button *ngIf="!isLoggedIn" (click)="simulateLogin()" class="btn-login">
              로그인 (시뮬레이션)
            </button>
            <button *ngIf="isLoggedIn" (click)="logout()" class="btn-logout">
              로그아웃
            </button>
          </div>
        </div>
      </nav>

      <!-- 로딩 표시기 -->
      <div *ngIf="isLoading" class="loading-bar">
        <div class="progress"></div>
      </div>

      <!-- 주요 콘텐츠 영역 -->
      <main class="container">
        <!-- 라우터 아웃렛: 라우트된 컴포넌트가 여기서 렌더링됩니다 -->
        <router-outlet></router-outlet>
      </main>

      <!-- 푸터 -->
      <footer>
        <p>Angular 18+ 라우터 학습 예제</p>
        <p>{{ currentRoute }}</p>
      </footer>
    </div>
  `,
  styles: [
    `
      .app-container {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
      }

      nav {
        background-color: #2c3e50;
        color: white;
        padding: 0;
        margin-bottom: 2rem;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      nav .container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
      }

      .nav-header {
        margin: 0;
      }

      .nav-header h1 {
        font-size: 1.5rem;
        margin: 0;
      }

      .nav-links {
        display: flex;
        list-style: none;
        gap: 0;
        margin: 0;
        padding: 0;
        flex: 1;
        margin-left: 2rem;
      }

      .nav-links li {
        margin: 0;
      }

      .nav-links a {
        display: block;
        color: white;
        text-decoration: none;
        padding: 0.5rem 1rem;
        transition: background-color 0.3s ease;
      }

      .nav-links a:hover {
        background-color: #34495e;
      }

      .nav-links a.active {
        background-color: #3498db;
        font-weight: bold;
      }

      .auth-section {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-left: auto;
      }

      .user-info {
        color: #ecf0f1;
        font-size: 0.9rem;
      }

      .btn-login,
      .btn-logout {
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.9rem;
        transition: background-color 0.3s ease;
      }

      .btn-login {
        background-color: #27ae60;
      }

      .btn-login:hover {
        background-color: #229954;
      }

      .btn-logout {
        background-color: #c0392b;
      }

      .btn-logout:hover {
        background-color: #a93226;
      }

      .loading-bar {
        height: 4px;
        background-color: #ecf0f1;
        overflow: hidden;
      }

      .progress {
        height: 100%;
        background: linear-gradient(
          90deg,
          #3498db,
          #2ecc71,
          #e74c3c,
          #3498db
        );
        background-size: 200% 100%;
        animation: loading 1s ease-in-out infinite;
      }

      @keyframes loading {
        0% {
          transform: translateX(-100%);
        }
        100% {
          transform: translateX(100%);
        }
      }

      main {
        flex: 1;
      }

      footer {
        background-color: #2c3e50;
        color: white;
        text-align: center;
        padding: 1rem;
        margin-top: 2rem;
      }

      footer p {
        margin: 0.25rem 0;
        font-size: 0.9rem;
      }

      @media (max-width: 768px) {
        nav .container {
          flex-direction: column;
          align-items: flex-start;
          gap: 1rem;
        }

        .nav-links {
          width: 100%;
          flex-direction: column;
          margin-left: 0;
        }

        .auth-section {
          width: 100%;
          margin-left: 0;
        }
      }
    `,
  ],
})
export class AppComponent implements OnInit, OnDestroy {
  // 로딩 상태
  isLoading = false;

  // 인증 상태
  isLoggedIn = false;
  currentUserName = '';

  // 현재 라우트
  currentRoute = '';

  // 구독 해제를 위한 Subject
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  /**
   * 컴포넌트 초기화
   *
   * - 라우터 이벤트 구독
   * - 인증 상태 확인
   */
  ngOnInit(): void {
    // 라우터 네비게이션 이벤트 처리
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationStart),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.isLoading = true;
        console.log('라우트 변경 시작...');
      });

    // 네비게이션 종료 후 로딩 상태 해제
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: any) => {
        this.isLoading = false;
        this.currentRoute = `현재 경로: ${event.urlAfterRedirects}`;
        console.log(`라우트 변경 완료: ${event.urlAfterRedirects}`);
      });

    // 초기 인증 상태 확인
    this.updateAuthStatus();
  }

  /**
   * 컴포넌트 소멸 시 구독 해제
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * 인증 상태 업데이트
   */
  private updateAuthStatus(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    const user = this.authService.getCurrentUser();
    this.currentUserName = user ? user.name : '';
  }

  /**
   * 로그인 시뮬레이션
   *
   * 실제 애플리케이션에서는 로그인 폼이 있을 것입니다.
   * 여기서는 간단한 시뮬레이션을 제공합니다.
   */
  simulateLogin(): void {
    const username = prompt('사용자명을 입력하세요:');
    if (username) {
      this.authService.login(username, 'password').subscribe(
        (success) => {
          if (success) {
            this.updateAuthStatus();
            console.log(`${username}님이 로그인했습니다.`);
          }
        }
      );
    }
  }

  /**
   * 로그아웃
   */
  logout(): void {
    this.authService.logout();
    this.updateAuthStatus();
    this.router.navigate(['/']);
    console.log('로그아웃했습니다.');
  }
}
