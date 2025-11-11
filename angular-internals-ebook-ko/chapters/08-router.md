# 8장: 라우터 심층 분석

> *"네비게이션은 실제로 어떻게 작동할까?"*

## 네비게이션 플로우

```
URL 변경
  ↓
URL 파싱
  ↓
라우트 매칭
  ↓
Guards 실행 (canActivate, canActivateChild)
  ↓
데이터 Resolve (resolvers)
  ↓
컴포넌트 활성화
  ↓
URL 업데이트
  ↓
완료
```

## URL 트리 구조

```typescript
// URL: /products/123/reviews?sort=date#top

interface UrlTree {
  root: UrlSegmentGroup;
  queryParams: { sort: 'date' };
  fragment: 'top';
}

interface UrlSegmentGroup {
  segments: UrlSegment[];     // ['products', '123', 'reviews']
  children: { [outlet: string]: UrlSegmentGroup };
}
```

## 함수형 Guards (Angular 15+)

```typescript
// 구방식 (클래스 기반)
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(): boolean {
    return this.authService.isAuthenticated();
  }
}

// 새방식 (함수형)
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  return authService.isAuthenticated();
};

// 사용
{
  path: 'admin',
  canActivate: [authGuard],
  loadChildren: () => import('./admin/admin.routes')
}
```

## Route Reuse 전략

```typescript
export class CustomReuseStrategy implements RouteReuseStrategy {
  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    // 같은 라우트면 재사용
    return future.routeConfig === curr.routeConfig;
  }

  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    // 나중에 재사용하기 위해 라우트 저장
    return route.data['reuseRoute'] === true;
  }

  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
    // 라우트 캐시
  }

  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    // 캐시된 라우트 가져오기
    return !!this.storedRoutes[route.routeConfig?.path || ''];
  }

  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    return this.storedRoutes[route.routeConfig?.path || ''];
  }
}
```

## 고급 패턴

### 데이터와 함께 Lazy Loading

```typescript
{
  path: 'user/:id',
  resolve: {
    user: (route: ActivatedRouteSnapshot) => {
      const userService = inject(UserService);
      return userService.getUser(route.params['id']);
    }
  },
  loadComponent: () => import('./user-detail.component')
}
```

### Outlets를 사용한 중첩 라우트

```typescript
{
  path: 'dashboard',
  component: DashboardComponent,
  children: [
    {
      path: 'main',
      component: MainPanelComponent,
      outlet: 'primary'
    },
    {
      path: 'sidebar',
      component: SidebarComponent,
      outlet: 'side'
    }
  ]
}

// 템플릿
<router-outlet></router-outlet>        <!-- primary outlet -->
<router-outlet name="side"></router-outlet>  <!-- named outlet -->

// 네비게이트
router.navigate([{
  outlets: {
    primary: ['main'],
    side: ['sidebar']
  }
}]);
```

**[9장: TaskMaster 구축하기로 계속 →](09-building-taskmaster.md)**
