# Chapter 8: Router Deep Dive

> *"How does navigation really work?"*

## The Navigation Flow

```
URL Change
  ↓
Parse URL
  ↓
Match Routes
  ↓
Run Guards (canActivate, canActivateChild)
  ↓
Resolve Data (resolvers)
  ↓
Activate Components
  ↓
Update URL
  ↓
Complete
```

## URL Tree Structure

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

## Functional Guards (Angular 15+)

```typescript
// Old way (class-based)
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(): boolean {
    return this.authService.isAuthenticated();
  }
}

// New way (functional)
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  return authService.isAuthenticated();
};

// Usage
{
  path: 'admin',
  canActivate: [authGuard],
  loadChildren: () => import('./admin/admin.routes')
}
```

## Route Reuse Strategy

```typescript
export class CustomReuseStrategy implements RouteReuseStrategy {
  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    // Reuse if same route
    return future.routeConfig === curr.routeConfig;
  }

  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    // Store route for later reuse
    return route.data['reuseRoute'] === true;
  }

  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
    // Cache the route
  }

  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    // Retrieve cached route
    return !!this.storedRoutes[route.routeConfig?.path || ''];
  }

  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    return this.storedRoutes[route.routeConfig?.path || ''];
  }
}
```

## Advanced Patterns

### Lazy Loading with Data

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

### Nested Routes with Outlets

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

// Template
<router-outlet></router-outlet>        <!-- primary outlet -->
<router-outlet name="side"></router-outlet>  <!-- named outlet -->

// Navigate
router.navigate([{
  outlets: {
    primary: ['main'],
    side: ['sidebar']
  }
}]);
```

**[Continue to Chapter 9: Building TaskMaster →](09-building-taskmaster.md)**
