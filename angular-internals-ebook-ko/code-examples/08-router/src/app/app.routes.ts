// 라우트 설정
// Angular 18+ 스탠드얼론 API를 사용한 고급 라우팅 구성

import { Routes, ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { of, delay } from 'rxjs';

import { AppComponent } from './app.component';
import { HomeComponent } from './home.component';
import { AboutComponent } from './about.component';
import { AuthGuard, AuthService, RoleGuard } from './guards/auth.guard';

/**
 * 데이터 리졸버
 *
 * Angular 18+의 ResolveFn을 사용하여 라우트 활성화 전에
 * 필요한 데이터를 미리 로드합니다.
 */

/**
 * 사용자 데이터 리졸버
 * 사용자 정보를 비동기적으로 로드합니다.
 */
export const userResolver: ResolveFn<any> = (
  route: ActivatedRouteSnapshot
) => {
  // 시뮬레이션: 사용자 데이터 로드
  console.log('사용자 데이터 로딩 중...');
  return of({
    id: 1,
    name: '홍길동',
    email: 'hong@example.com',
    role: 'admin',
  }).pipe(delay(500));
};

/**
 * 게시물 데이터 리졸버
 * 특정 게시물 정보를 비동기적으로 로드합니다.
 */
export const postResolver: ResolveFn<any> = (
  route: ActivatedRouteSnapshot
) => {
  const postId = route.paramMap.get('id');
  console.log(`게시물 #${postId} 데이터 로딩 중...`);

  return of({
    id: postId,
    title: `게시물 ${postId}`,
    content: '이것은 샘플 게시물입니다.',
    author: '홍길동',
    createdAt: new Date(),
  }).pipe(delay(800));
};

/**
 * 라우트 설정
 *
 * - 기본 라우트
 * - 매개변수가 있는 라우트
 * - 보호된 라우트 (가드)
 * - 지연 로드 모듈
 * - 리다이렉트
 * - 와일드카드 라우트
 */
export const routes: Routes = [
  // 기본 라우트 - 루트 경로
  {
    path: '',
    component: HomeComponent,
    data: {
      title: '홈',
      description: '홈 페이지에 오신 것을 환영합니다.',
    },
  },

  // About 페이지
  {
    path: 'about',
    component: AboutComponent,
    data: {
      title: '소개',
      description: '이 애플리케이션에 대해 알아보세요.',
    },
  },

  // 보호된 라우트 - 대시보드 (인증 필요)
  {
    path: 'dashboard',
    component: HomeComponent, // 실제로는 DashboardComponent를 사용
    canActivate: [AuthGuard],
    data: {
      title: '대시보드',
      description: '대시보드에 오신 것을 환영합니다.',
      requiresAuth: true,
    },
  },

  // 매개변수가 있는 라우트 - 사용자 프로필
  {
    path: 'user/:id',
    component: AboutComponent, // 실제로는 UserProfileComponent를 사용
    resolve: {
      user: userResolver,
    },
    data: {
      title: '사용자 프로필',
    },
  },

  // 매개변수가 있는 라우트 - 게시물 상세보기
  {
    path: 'post/:id',
    component: AboutComponent, // 실제로는 PostDetailComponent를 사용
    resolve: {
      post: postResolver,
    },
    canActivate: [AuthGuard],
    data: {
      title: '게시물',
      requiresAuth: true,
    },
  },

  // 지연 로드 모듈 - 관리자 기능
  {
    path: 'admin',
    loadComponent: () =>
      import('./admin/admin.component').then((m) => m.AdminComponent),
    canActivate: [RoleGuard],
    data: {
      role: 'admin',
      title: '관리자',
    },
  },

  // 지연 로드 모듈 - 설정
  {
    path: 'settings',
    loadComponent: () =>
      import('./settings/settings.component').then((m) => m.SettingsComponent),
    canActivate: [AuthGuard],
    data: {
      title: '설정',
      requiresAuth: true,
    },
  },

  // 중첩 라우트 - 블로그
  {
    path: 'blog',
    loadComponent: () =>
      import('./blog/blog.component').then((m) => m.BlogComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./blog/blog-list.component').then(
            (m) => m.BlogListComponent
          ),
        data: {
          title: '블로그 목록',
        },
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./blog/blog-detail.component').then(
            (m) => m.BlogDetailComponent
          ),
        resolve: {
          post: postResolver,
        },
        data: {
          title: '블로그 상세',
        },
      },
    ],
  },

  // 리다이렉트
  {
    path: 'home',
    redirectTo: '',
    pathMatch: 'full',
  },

  {
    path: 'index',
    redirectTo: '',
    pathMatch: 'full',
  },

  // 와일드카드 라우트 - 404 페이지
  {
    path: '**',
    component: HomeComponent, // 실제로는 NotFoundComponent를 사용
    data: {
      title: '페이지를 찾을 수 없음',
    },
  },
];

/**
 * 라우트 설정 설명:
 *
 * 1. 기본 라우트
 *    - 루트 경로('') 및 리다이렉트 처리
 *
 * 2. 가드 (Guards)
 *    - AuthGuard: 인증된 사용자만 접근
 *    - RoleGuard: 특정 역할을 가진 사용자만 접근
 *
 * 3. 리졸버 (Resolvers)
 *    - userResolver: 라우트 활성화 전에 사용자 데이터 로드
 *    - postResolver: 라우트 활성화 전에 게시물 데이터 로드
 *
 * 4. 지연 로드 (Lazy Loading)
 *    - loadComponent()를 사용하여 필요할 때만 컴포넌트 로드
 *    - 번들 크기를 줄이고 초기 로딩 속도를 개선
 *
 * 5. 중첩 라우트 (Child Routes)
 *    - children 배열을 사용하여 계층적 라우팅 구성
 *
 * 6. 매개변수 라우트
 *    - :id와 같은 동적 매개변수를 사용하여 유연한 라우팅
 *
 * 7. 데이터 전달
 *    - data 객체를 통해 라우트 메타데이터를 전달
 *    - 예: 페이지 제목, 설명 등
 */
