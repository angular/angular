# Angular Routing Patterns

## Table of Contents

- [Route Configuration Options](#route-configuration-options)
- [Authentication Flow](#authentication-flow)
- [Breadcrumbs](#breadcrumbs)
- [Tab Navigation](#tab-navigation)
- [Modal Routes](#modal-routes)
- [Preloading Strategies](#preloading-strategies)

## Route Configuration Options

### Full Route Options

```typescript
{
  path: 'users/:id',
  component: UserCmpt,

  // Lazy loading alternatives
  loadComponent: () => import('./user.component').then(m => m.UserCmpt),
  loadChildren: () => import('./user.routes').then(m => m.userRoutes),

  // Guards
  canActivate: [authGuard],
  canActivateChild: [authGuard],
  canDeactivate: [unsavedChangesGuard],
  canMatch: [featureFlagGuard],

  // Data
  resolve: { user: userResolver },
  data: { title: 'User Profile', animation: 'userPage' },

  // Children
  children: [...],

  // Outlet
  outlet: 'sidebar',

  // Path matching
  pathMatch: 'full', // or 'prefix'

  // Title
  title: 'User Profile',
  // Or dynamic title
  title: userTitleResolver,
}
```

### Dynamic Title Resolver

```typescript
export const userTitleResolver: ResolveFn<string> = (route) => {
  const userService = inject(User);
  const id = route.paramMap.get('id')!;
  return userService.getById(id).pipe(map((user) => `${user.name} - Profile`));
};
```

## Authentication Flow

### Complete Auth Setup

```typescript
// auth.service.ts
@Injectable({providedIn: 'root'})
export class Auth {
  private _user = signal<User | null>(null);
  private _token = signal<string | null>(null);

  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => this._user() !== null);

  private router = inject(Router);
  private http = inject(HttpClient);

  async login(credentials: Credentials): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.http.post<AuthResponse>('/api/login', credentials),
      );

      this._token.set(response.token);
      this._user.set(response.user);
      localStorage.setItem('token', response.token);

      return true;
    } catch {
      return false;
    }
  }

  logout(): void {
    this._user.set(null);
    this._token.set(null);
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  async checkAuth(): Promise<boolean> {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
      const user = await firstValueFrom(this.http.get<User>('/api/me'));
      this._user.set(user);
      this._token.set(token);
      return true;
    } catch {
      localStorage.removeItem('token');
      return false;
    }
  }
}

// auth.guard.ts
export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(Auth);
  const router = inject(Router);

  // Check if already authenticated
  if (authService.isAuthenticated()) {
    return true;
  }

  // Try to restore session
  const isValid = await authService.checkAuth();
  if (isValid) {
    return true;
  }

  // Redirect to login
  return router.createUrlTree(['/login'], {
    queryParams: {returnUrl: state.url},
  });
};

// login.component.ts
@Component({
  template: `
    <form (ngSubmit)="login()">
      <input [(ngModel)]="email" name="email" />
      <input [(ngModel)]="password" name="password" type="password" />
      <button type="submit">Login</button>
    </form>
  `,
})
export class Login {
  private authService = inject(Auth);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  email = '';
  password = '';

  async login() {
    const success = await this.authService.login({
      email: this.email,
      password: this.password,
    });

    if (success) {
      const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
      this.router.navigateByUrl(returnUrl);
    }
  }
}
```

## Breadcrumbs

```typescript
// breadcrumb.service.ts
@Injectable({providedIn: 'root'})
export class Breadcrumb {
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  breadcrumbs = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.buildBreadcrumbs(this.route.root)),
    ),
    {initialValue: []},
  );

  private buildBreadcrumbs(
    route: ActivatedRoute,
    url: string = '',
    breadcrumbs: Breadcrumb[] = [],
  ): Breadcrumb[] {
    const children = route.children;

    if (children.length === 0) {
      return breadcrumbs;
    }

    for (const child of children) {
      const routeUrl = child.snapshot.url.map((segment) => segment.path).join('/');

      if (routeUrl) {
        url += `/${routeUrl}`;
      }

      const label = child.snapshot.data['breadcrumb'];
      if (label) {
        breadcrumbs.push({label, url});
      }

      return this.buildBreadcrumbs(child, url, breadcrumbs);
    }

    return breadcrumbs;
  }
}

// Route config with breadcrumb data
export const routes: Routes = [
  {
    path: 'products',
    data: {breadcrumb: 'Products'},
    children: [
      {path: '', component: ProductList},
      {
        path: ':id',
        data: {breadcrumb: 'Product Details'},
        component: ProductDetail,
      },
    ],
  },
];

// breadcrumb.component.ts
@Component({
  selector: 'app-breadcrumb',
  template: `
    <nav aria-label="Breadcrumb">
      <ol>
        <li><a routerLink="/">Home</a></li>
        @for (crumb of breadcrumbService.breadcrumbs(); track crumb.url) {
          <li>
            <a [routerLink]="crumb.url">{{ crumb.label }}</a>
          </li>
        }
      </ol>
    </nav>
  `,
})
export class BreadcrumbCmpt {
  breadcrumbService = inject(Breadcrumb);
}
```

## Tab Navigation

```typescript
// tabs-layout.component.ts
@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="tabs">
      @for (tab of tabs; track tab.path) {
        <a
          [routerLink]="tab.path"
          routerLinkActive="active"
          [routerLinkActiveOptions]="{ exact: tab.exact }"
        >
          {{ tab.label }}
        </a>
      }
    </div>
    <div class="tab-content">
      <router-outlet />
    </div>
  `,
})
export class TabsLayout {
  tabs = [
    { path: './', label: 'Overview', exact: true },
    { path: 'details', label: 'Details', exact: false },
    { path: 'settings', label: 'Settings', exact: false },
  ];
}

// Routes
{
  path: 'account',
  component: TabsLayout,
  children: [
    { path: '', component: AccountOverview },
    { path: 'details', component: AccountDetails },
    { path: 'settings', component: AccountSettings },
  ],
}
```

## Modal Routes

Using auxiliary outlets for modals:

```typescript
// Routes
export const routes: Routes = [
  { path: 'products', component: ProductList },
  { path: 'product-modal/:id', component: ProductModal, outlet: 'modal' },
];

// App template
@Component({
  template: `
    <router-outlet />
    <router-outlet name="modal" />
  `,
})
export class App {}

// Open modal
this.router.navigate([{ outlets: { modal: ['product-modal', productId] } }]);

// Close modal
this.router.navigate([{ outlets: { modal: null } }]);

// Link to open modal
<a [routerLink]="[{ outlets: { modal: ['product-modal', product.id] } }]">
  View Details
</a>
```

## Preloading Strategies

### Built-in Strategies

```typescript
import {provideRouter, withPreloading, PreloadAllModules, NoPreloading} from '@angular/router';

// Preload all lazy modules
provideRouter(routes, withPreloading(PreloadAllModules));

// No preloading (default)
provideRouter(routes, withPreloading(NoPreloading));
```

### Custom Preloading Strategy

```typescript
// selective-preload.strategy.ts
@Injectable({ providedIn: 'root' })
export class SelectivePreloadStrategy implements PreloadingStrategy {
  preload(route: Route, load: () => Observable<any>): Observable<any> {
    // Only preload routes marked with data.preload = true
    if (route.data?.['preload']) {
      return load();
    }
    return of(null);
  }
}

// Routes
{
  path: 'dashboard',
  loadComponent: () => import('./dashboard.component'),
  data: { preload: true }, // Will be preloaded
}

// Config
provideRouter(routes, withPreloading(SelectivePreloadStrategy))
```

### Network-Aware Preloading

```typescript
@Injectable({providedIn: 'root'})
export class NetworkAwarePreloadStrategy implements PreloadingStrategy {
  preload(route: Route, load: () => Observable<any>): Observable<any> {
    // Check network conditions
    const connection = (navigator as any).connection;

    if (connection) {
      // Don't preload on slow connections
      if (connection.saveData || connection.effectiveType === '2g') {
        return of(null);
      }
    }

    // Preload if marked
    if (route.data?.['preload']) {
      return load();
    }

    return of(null);
  }
}
```

## Route Animations

```typescript
// app.routes.ts
export const routes: Routes = [
  {path: 'home', component: Home, data: {animation: 'HomePage'}},
  {path: 'about', component: About, data: {animation: 'AboutPage'}},
];

// app.component.ts
@Component({
  imports: [RouterOutlet],
  template: `
    <div [@routeAnimations]="getRouteAnimationData()">
      <router-outlet />
    </div>
  `,
  animations: [
    trigger('routeAnimations', [
      transition('HomePage <=> AboutPage', [
        style({position: 'relative'}),
        query(':enter, :leave', [
          style({
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
          }),
        ]),
        query(':enter', [style({left: '-100%'})]),
        query(':leave', animateChild()),
        group([
          query(':leave', [animate('300ms ease-out', style({left: '100%'}))]),
          query(':enter', [animate('300ms ease-out', style({left: '0%'}))]),
        ]),
      ]),
    ]),
  ],
})
export class AppMain {
  getRouteAnimationData() {
    return this.route.firstChild?.snapshot.data['animation'];
  }
}
```

## Scroll Position Restoration

```typescript
// app.config.ts
import {provideRouter, withInMemoryScrolling, withRouterConfig} from '@angular/router';

provideRouter(
  routes,
  withInMemoryScrolling({
    scrollPositionRestoration: 'enabled', // or 'top'
    anchorScrolling: 'enabled',
  }),
  withRouterConfig({
    onSameUrlNavigation: 'reload',
  }),
);
```
