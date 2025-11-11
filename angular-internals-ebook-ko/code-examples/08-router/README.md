# Angular 라우터 예제

이 프로젝트는 Angular 18+ 라우팅의 고급 기능을 시연하는 완전한 예제입니다.

## 개요

Angular 라우터는 싱글 페이지 애플리케이션(SPA)에서 컴포넌트 간 네비게이션을 관리하는 핵심 기능입니다. 이 예제에서는 다음 기능들을 다룹니다:

- **기본 라우팅**: 컴포넌트 간 간단한 이동
- **매개변수 라우팅**: URL 매개변수를 사용한 동적 라우팅
- **가드 (Guards)**: 라우트 보호 및 접근 제어
- **리졸버 (Resolvers)**: 라우트 활성화 전 데이터 프리페칭
- **지연 로드 (Lazy Loading)**: 필요할 때만 컴포넌트/모듈 로드
- **중첩 라우트 (Child Routes)**: 계층적 라우팅 구조

## 프로젝트 구조

```
08-router/
├── src/
│   ├── main.ts                  # 애플리케이션 부트스트랩
│   ├── index.html               # HTML 진입점
│   ├── styles.css               # 전역 스타일
│   └── app/
│       ├── app.component.ts     # 루트 컴포넌트
│       ├── app.routes.ts        # 라우트 설정
│       ├── home.component.ts    # 홈 페이지
│       ├── about.component.ts   # 소개 페이지
│       ├── guards/
│       │   └── auth.guard.ts    # 인증 가드
│       ├── admin/
│       │   └── admin.component.ts   # 관리자 대시보드 (지연 로드)
│       ├── settings/
│       │   └── settings.component.ts # 설정 페이지 (지연 로드)
│       └── blog/
│           ├── blog.component.ts           # 블로그 레이아웃
│           ├── blog-list.component.ts     # 블로그 목록
│           └── blog-detail.component.ts   # 블로그 상세
├── package.json                 # 프로젝트 의존성
├── tsconfig.json               # TypeScript 설정
├── tsconfig.app.json           # 앱 TypeScript 설정
├── tsconfig.spec.json          # 테스트 TypeScript 설정
├── angular.json                # Angular CLI 설정
├── .nvmrc                      # Node.js 버전
└── .gitignore                  # Git 무시 파일

```

## 주요 기능 설명

### 1. 기본 라우팅 (app.routes.ts)

```typescript
const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    data: { title: '홈' }
  },
  {
    path: 'about',
    component: AboutComponent,
    data: { title: '소개' }
  }
];
```

### 2. 가드 (Guards)

#### 인증 가드 (AuthGuard)
사용자가 인증되지 않으면 접근을 차단합니다:

```typescript
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  canActivate(route, state): Observable<boolean> {
    if (this.authService.isLoggedIn()) {
      return of(true);
    }
    this.router.navigate(['/login']);
    return of(false);
  }
}
```

라우트에 적용:
```typescript
{
  path: 'dashboard',
  component: DashboardComponent,
  canActivate: [AuthGuard]
}
```

#### 역할 기반 가드 (RoleGuard)
특정 역할을 가진 사용자만 접근:

```typescript
{
  path: 'admin',
  component: AdminComponent,
  canActivate: [RoleGuard],
  data: { role: 'admin' }
}
```

### 3. 리졸버 (Resolvers)

라우트 활성화 전에 필요한 데이터를 미리 로드합니다:

```typescript
export const userResolver: ResolveFn<any> = (route) => {
  return userService.getUser(route.paramMap.get('id')).pipe(
    delay(500)
  );
};
```

라우트에 적용:
```typescript
{
  path: 'user/:id',
  component: UserComponent,
  resolve: { user: userResolver }
}
```

컴포넌트에서 접근:
```typescript
this.route.data.subscribe(data => {
  this.user = data['user'];
});
```

### 4. 지연 로드 (Lazy Loading)

필요할 때만 컴포넌트를 로드하여 초기 번들 크기를 줄입니다:

```typescript
{
  path: 'admin',
  loadComponent: () => import('./admin/admin.component')
    .then(m => m.AdminComponent),
  canActivate: [RoleGuard]
},
{
  path: 'settings',
  loadComponent: () => import('./settings/settings.component')
    .then(m => m.SettingsComponent),
  canActivate: [AuthGuard]
}
```

### 5. 중첩 라우트 (Child Routes)

계층적 라우팅 구조를 만듭니다:

```typescript
{
  path: 'blog',
  loadComponent: () => import('./blog/blog.component')
    .then(m => m.BlogComponent),
  children: [
    {
      path: '',
      loadComponent: () => import('./blog/blog-list.component')
        .then(m => m.BlogListComponent)
    },
    {
      path: ':id',
      loadComponent: () => import('./blog/blog-detail.component')
        .then(m => m.BlogDetailComponent),
      resolve: { post: postResolver }
    }
  ]
}
```

### 6. 라우터 아웃렛

라우트된 컴포넌트가 렌더링되는 지점:

```typescript
<!-- app.component.ts 템플릿 -->
<nav>
  <a routerLink="/" routerLinkActive="active">홈</a>
  <a routerLink="/about" routerLinkActive="active">소개</a>
</nav>

<!-- 라우트된 컴포넌트가 여기서 렌더링됨 -->
<router-outlet></router-outlet>
```

## Angular 18+ 개선사항

### 스탠드얼론 컴포넌트
NgModule 없이 라우팅을 구성합니다:

```typescript
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `...`
})
export class AppComponent {}
```

### 함수형 가드
클래스 기반 가드 대신 함수형 가드를 사용합니다:

```typescript
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};
```

### 함수형 리졸버
함수 기반의 데이터 리졸버:

```typescript
export const userResolver: ResolveFn<User> = (route) => {
  return inject(UserService).getUser(route.paramMap.get('id'));
};
```

### 프리로딩 전략
지연 로드 모듈을 백그라운드에서 미리 로드:

```typescript
bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(
      routes,
      withPreloading(PreloadAllModules)
    )
  ]
});
```

## 시작하기

### 설치

```bash
# 의존성 설치
npm install
```

### 개발 서버 실행

```bash
# 개발 서버 시작
npm start

# 또는
ng serve

# 브라우저에서 http://localhost:4200 열기
```

### 빌드

```bash
# 프로덕션 빌드
npm run build

# 또는
ng build --configuration production
```

## 라우팅 테스트

### 기본 라우팅 테스트
1. 홈 페이지 방문: http://localhost:4200
2. '소개' 링크 클릭
3. '사용자 프로필' 링크로 이동하여 매개변수 라우팅 테스트

### 가드 테스트
1. 로그인 시뮬레이션 (우측 상단 "로그인" 버튼)
2. 로그인 전: '대시보드' 링크 클릭 → 로그인 페이지로 리다이렉트
3. 로그인 후: '대시보드' 접근 가능

### 지연 로드 테스트
1. 개발자 도구 (F12) 열기
2. Network 탭 확인
3. '블로그' 또는 '설정' 링크 클릭
4. 해당 번들이 로드되는 것을 확인

### 리졸버 테스트
1. '블로그' 페이지로 이동
2. 블로그 포스트 상세 클릭
3. 콘솔 열기 → 리졸버가 먼저 데이터를 로드한 후 컴포넌트가 렌더링됨

## 라우팅 이벤트

라우터는 다양한 라우팅 이벤트를 발생시킵니다:

- **NavigationStart**: 네비게이션 시작
- **RoutesRecognized**: 라우트 인식
- **GuardsCheckStart**: 가드 확인 시작
- **GuardsCheckEnd**: 가드 확인 종료
- **ResolveStart**: 리졸버 실행 시작
- **ResolveEnd**: 리졸버 실행 종료
- **NavigationEnd**: 네비게이션 완료
- **NavigationCancel**: 네비게이션 취소
- **NavigationError**: 네비게이션 오류

app.component.ts에서 이러한 이벤트를 처리합니다:

```typescript
this.router.events.pipe(
  filter(event => event instanceof NavigationStart)
).subscribe(() => {
  this.isLoading = true;
});

this.router.events.pipe(
  filter(event => event instanceof NavigationEnd)
).subscribe(() => {
  this.isLoading = false;
});
```

## 데이터 전달

### 라우트 데이터 전달
```typescript
{
  path: 'about',
  component: AboutComponent,
  data: { title: '소개', description: '...' }
}
```

### 쿼리 문자열
```typescript
// 네비게이션
this.router.navigate(['/blog'], { queryParams: { sort: 'date' } });

// 접근
this.route.queryParams.subscribe(params => {
  console.log(params['sort']);
});
```

### 라우트 매개변수
```typescript
// 정의
{ path: 'user/:id', component: UserComponent }

// 네비게이션
this.router.navigate(['/user', userId]);

// 접근
this.route.params.subscribe(params => {
  console.log(params['id']);
});
```

## 라우팅 모범 사례

### 1. 보호된 라우트는 반드시 가드 적용
```typescript
{
  path: 'admin',
  canActivate: [adminGuard],
  component: AdminComponent
}
```

### 2. 느린 로드 컴포넌트는 리졸버 사용
```typescript
{
  path: 'details/:id',
  resolve: { data: dataResolver },
  component: DetailsComponent
}
```

### 3. 대규모 모듈은 지연 로드
```typescript
{
  path: 'heavy-module',
  loadComponent: () => import('./heavy').then(m => m.HeavyComponent)
}
```

### 4. 라우트 메타데이터 활용
```typescript
{
  path: 'about',
  component: AboutComponent,
  data: {
    title: '소개',
    breadcrumb: '소개'
  }
}
```

### 5. 에러 페이지 설정
```typescript
{
  path: '**',
  component: NotFoundComponent
}
```

## 문제 해결

### 라우트가 작동하지 않음
1. RouterModule이 임포트되었는지 확인
2. app.routes.ts가 올바르게 정의되었는지 확인
3. 브라우저 콘솔에서 라우팅 에러 확인

### 지연 로드가 작동하지 않음
1. loadComponent 함수가 올바르게 정의되었는지 확인
2. 경로가 정확한지 확인
3. Network 탭에서 번들이 로드되는지 확인

### 가드가 작동하지 않음
1. canActivate 가드가 라우트에 적용되었는지 확인
2. 가드 로직이 올바르게 작동하는지 확인
3. 콘솔에서 가드 로그 확인

## 추가 리소스

- [Angular 라우팅 공식 문서](https://angular.io/guide/router)
- [Angular CanActivate 가드](https://angular.io/api/router/CanActivate)
- [Angular Resolve 인터페이스](https://angular.io/api/router/Resolve)
- [Angular 지연 로드](https://angular.io/guide/lazy-loading-ngmodules)

## 라이센스

MIT

## 학습 내용 정리

이 예제를 통해 다음을 배웠습니다:

1. ✅ Angular 18+ 스탠드얼론 컴포넌트로 라우팅 구성
2. ✅ 함수형 가드를 사용한 라우트 보호
3. ✅ 함수형 리졸버를 사용한 데이터 프리페칭
4. ✅ 지연 로드로 번들 크기 최적화
5. ✅ 중첩 라우트로 계층적 구조 구성
6. ✅ 라우팅 이벤트 처리
7. ✅ RouterLink와 RouterOutlet 활용
8. ✅ 프리로딩 전략 적용

각 기능을 직접 테스트하고 콘솔을 확인하면서 라우팅의 동작 원리를 깊이 있게 이해할 수 있습니다.
