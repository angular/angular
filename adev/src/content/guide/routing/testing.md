# Testing routing and navigation

Testing routing and navigation is essential to ensure your Angular application behaves correctly when users navigate between different routes. This guide covers various strategies for testing routing functionality in Angular applications.

## Prerequisites

This guide assumes you are familiar with the following tools and libraries:

- **[Jasmine](https://jasmine.github.io/)** - JavaScript testing framework that provides the testing syntax (`describe`, `it`, `expect`)
- **[Karma](https://karma-runner.github.io/)** - Test runner that executes tests in browsers
- **[Angular Testing Utilities](guide/testing)** - Angular's built-in testing tools ([`TestBed`](api/core/testing/TestBed), [`ComponentFixture`](api/core/testing/ComponentFixture))
- **[provideRouter](api/router/provideRouter)** - Angular's modern router configuration for testing

## Testing scenarios

### Route parameters

Many components need to read data from the URL, such as an ID to load a specific user profile or product details. These components depend on [`ActivatedRoute`](api/router/ActivatedRoute) to access route parameters, and testing them requires providing mock route data.

The challenge here is that [`ActivatedRoute`](api/router/ActivatedRoute) is normally provided by Angular's router, but in tests we need to create a fake version that simulates the route parameters the component expects to receive.

Here's an example of how to test a component that reads a user ID from the route:

<docs-code-multifile>
  <docs-code header="user-profile.component.spec.ts" language="typescript">
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { UserProfileComponent } from './user-profile.component';

describe('UserProfileComponent', () => {
  let component: UserProfileComponent;
  let fixture: ComponentFixture<UserProfileComponent>;

  beforeEach(async () => {
    const activatedRouteStub = {
      snapshot: {
        paramMap: {
          get: (key: string) => key === 'id' ? '123' : null
        }
      }
    };

    await TestBed.configureTestingModule({
      imports: [UserProfileComponent],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteStub }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserProfileComponent);
    component = fixture.componentInstance;
  });

  it('should read user ID from route parameters', () => {
    component.ngOnInit();
    expect(component.userId).toBe('123');
  });
});

  </docs-code>
  <docs-code header="user-profile.component.ts" language="typescript">
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-user-profile',
  template: '<h1>User Profile: {{userId}}</h1>'
})
export class UserProfileComponent implements OnInit {
  private route = inject(ActivatedRoute);
  userId: string | null = null;

  ngOnInit() {
    this.userId = this.route.snapshot.paramMap.get('id');
  }
}

  </docs-code>
</docs-code-multifile>

### Route guards

Route guards often dependent on external services (like authentication services), so testing them requires careful mocking of those dependencies.

Here's an example of how to test an authentication guard that checks if a user is logged in before allowing access to a protected route:

<docs-code-multifile>
  <docs-code header="auth.guard.spec.ts" language="typescript">
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from './auth.service';

describe('AuthGuard', () => {
  let authService: jasmine.SpyObj<AuthService>;
  let route: ActivatedRouteSnapshot;
  let state: RouterStateSnapshot;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('AuthService', ['isAuthenticated']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: spy }
      ]
    });

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    route = {} as ActivatedRouteSnapshot;
    state = {} as RouterStateSnapshot;
  });

  it('should allow access when user is authenticated', () => {
    authService.isAuthenticated.and.returnValue(true);

    const result = TestBed.runInInjectionContext(() =>
      authGuard(route, state)
    );

    expect(result).toBe(true);
  });

  it('should deny access when user is not authenticated', () => {
    authService.isAuthenticated.and.returnValue(false);

    const result = TestBed.runInInjectionContext(() =>
      authGuard(route, state)
    );

    expect(result).toBe(false);
  });
});

  </docs-code>
  <docs-code header="auth.guard.ts" language="typescript">
import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  return authService.isAuthenticated();
};

  </docs-code>
</docs-code-multifile>

### Router outlets

Router outlets tests are more of an integration test since you're essentially testing the integration between the [`Router`](api/router/Router), the outlet, and the components being displayed.

Here's an example of how to set up a test that verifies different components are displayed for different routes:

<docs-code-multifile>
  <docs-code header="app.component.spec.ts" language="typescript">
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app.component';

@Component({
  template: '<h1>Home Page</h1>'
})
class MockHomeComponent {}

@Component({
  template: '<h1>About Page</h1>'
})
class MockAboutComponent {}

describe('AppComponent Router Outlet', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let router: Router;
  let location: Location;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AppComponent,
        MockHomeComponent,
        MockAboutComponent
      ],
      providers: [
        provideRouter([
          { path: '', component: MockHomeComponent },
          { path: 'about', component: MockAboutComponent }
        ])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    location = TestBed.inject(Location);

    fixture.detectChanges();
  });

  it('should display home component for default route', async () => {
    await router.navigate(['']);
    fixture.detectChanges();

    expect(location.path()).toBe('');
    expect(fixture.nativeElement.textContent).toContain('Home Page');
  });

  it('should display about component for about route', async () => {
    await router.navigate(['/about']);
    fixture.detectChanges();

    expect(location.path()).toBe('/about');
    expect(fixture.nativeElement.textContent).toContain('About Page');
  });
});

  </docs-code>
  <docs-code header="app.component.ts" language="typescript">
import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  template: `
    <nav>
      <a routerLink="/">Home</a>
      <a routerLink="/about">About</a>
    </nav>
    <router-outlet></router-outlet>
  `
})
export class AppComponent {}

  </docs-code>
</docs-code-multifile>

### Nested routes

Testing nested routes ensures that both the parent and child components render correctly when navigating to nested URLs. This is important because nested routes involve multiple layers - you need to verify that the parent component renders, the child component renders within it, and ensure that both components can access their respective route data.

Here's an example of testing a parent-child route structure:

<docs-code-multifile>
  <docs-code header="nested-routes.spec.ts" language="typescript">
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { ParentComponent, ChildComponent } from './nested-components';

describe('Nested Routes', () => {
  let fixture: ComponentFixture<ParentComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ParentComponent,
        ChildComponent
      ],
      providers: [
        provideRouter([
          {
            path: 'parent',
            component: ParentComponent,
            children: [
              { path: 'child', component: ChildComponent }
            ]
          }
        ])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ParentComponent);
    router = TestBed.inject(Router);
  });

  it('should render parent and child components for nested route', async () => {
    await router.navigate(['/parent/child']);
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain('Parent Component');
    expect(compiled.textContent).toContain('Child Component');
  });
});

  </docs-code>
  <docs-code header="nested-components.ts" language="typescript">
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-parent',
  imports: [RouterOutlet],
  template: `
    <h1>Parent Component</h1>
    <router-outlet></router-outlet>
  `
})
export class ParentComponent {}

@Component({
  selector: 'app-child',
  template: '<h2>Child Component</h2>'
})
export class ChildComponent {}

  </docs-code>
</docs-code-multifile>

### Query parameters and fragments

Query parameters (like `?search=angular&category=web`) and URL fragments (like `#section1`) provide additional data through the URL that doesn't affect which component loads, but does affect how the component behaves. Components that read query parameters through [`ActivatedRoute.queryParams`](api/router/ActivatedRoute#queryParams) need to be tested to ensure they handle different parameter scenarios correctly.

Unlike route parameters that are part of the route definition, query parameters are optional and can change without triggering route navigation. This means you need to test both the initial loading and the reactive updates when query parameters change.

Here's an example of how to test query parameters and fragments:

<docs-code-multifile>
  <docs-code header="search.component.spec.ts" language="typescript">
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { SearchComponent } from './search.component';

describe('SearchComponent', () => {
  let component: SearchComponent;
  let fixture: ComponentFixture<SearchComponent>;

  beforeEach(async () => {
    const activatedRouteStub = {
      queryParams: of({ q: 'angular' })
    };

    await TestBed.configureTestingModule({
      imports: [SearchComponent],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteStub }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SearchComponent);
    component = fixture.componentInstance;
  });

  it('should read search term from query parameters', () => {
    component.ngOnInit();
    expect(component.searchTerm).toBe('angular');
  });
});

  </docs-code>
  <docs-code header="search.component.ts" language="typescript">
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-search',
  template: '<div>Search term: {{searchTerm}}</div>'
})
export class SearchComponent implements OnInit {
  private route = inject(ActivatedRoute);
  searchTerm: string | null = null;

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.searchTerm = params['q'] || null;
    });
  }
}

  </docs-code>
</docs-code-multifile>

## Best practices for router testing

1. **Use provideRouter for testing** - Use [`provideRouter()`](api/router/provideRouter) in your test configuration instead of the real `RouterModule` to avoid side effects and improve test isolation.
2. **Consider RouterTestingHarness** - For comprehensive integration testing, use [`RouterTestingHarness`](api/router/testing/RouterTestingHarness) which provides a test harness with built-in navigation and component testing capabilities.
3. **Mock external dependencies** - When testing components that use routing, mock any external services or dependencies to focus your tests on routing behavior.
4. **Test navigation state** - Verify both the navigation action and the resulting application state, including URL changes and component rendering.
5. **Handle asynchronous operations** - Router navigation is asynchronous. Use `async/await` or [`fakeAsync`](api/core/testing/fakeAsync) to properly handle timing in your tests.
6. **Test error scenarios** - Include tests for invalid routes, failed navigation, and guard rejections to ensure your application handles edge cases gracefully.

## Next steps

Learn more about [route guards](guide/routing/route-guards) and [reading route state](guide/routing/read-route-state) to implement comprehensive routing solutions in your Angular applications.
