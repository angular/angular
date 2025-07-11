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

Many components need to read data from the URL, such as an ID to load a specific user profile or product details. These components depend on [`ActivatedRoute`](api/router/ActivatedRoute) to access route parameters, and testing them requires setting up actual routing configuration.

The recommended approach is to use [`provideRouter`](api/router/provideRouter) with real route configurations and navigate to actual routes, rather than mocking [`ActivatedRoute`](api/router/ActivatedRoute) data. This approach is more resilient in the event Angular needs to update any internal routing implementations.

Here's an example of how to test a component that reads a user ID from the route:

```typescript
// user-profile.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';
import { UserProfile } from './user-profile';

@Component({
  template: '<router-outlet />'
})
class TestHost {}

describe('UserProfile', () => {
  let component: UserProfile;
  let fixture: ComponentFixture<TestHost>;
  let router: Router;
  let location: Location;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserProfile, TestHost],
      providers: [
        provideRouter([
          { path: 'user/:id', component: UserProfile }
        ])
      ]
    });

    fixture = TestBed.createComponent(TestHost);
    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
    fixture.detectChanges();
  });

  it('should read user ID from route parameters', async () => {
    await router.navigate(['/user/123']);
    fixture.detectChanges();

    const userProfile = fixture.debugElement.query(By.directive(UserProfile));
    component = userProfile.componentInstance;

    expect(component.userId).toBe('123');
    expect(location.path()).toBe('/user/123');
  });
});
```

```ts
// user-profile.component.ts
import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  template: '<h1>User Profile: {{userId}}</h1>'
})
export class UserProfile {
  private route = inject(ActivatedRoute);
  userId: string | null;

  constructor() {
    this.userId = this.route.snapshot.paramMap.get('id');
  }
}
```

### Route guards

Route guards often depend on external services (like authentication services), so testing them requires careful mocking of those dependencies.

Here's an example of how to test an authentication guard that checks if a user is logged in before allowing access to a protected route:

```ts
// auth.guard.spec.ts
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthStore } from './auth-store';

describe('AuthGuard', () => {
  let authStore: jasmine.SpyObj<AuthStore>;
  let route: ActivatedRouteSnapshot;
  let state: RouterStateSnapshot;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('AuthStore', ['isAuthenticated']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthStore, useValue: spy }
      ]
    });

    authStore = TestBed.inject(AuthStore) as jasmine.SpyObj<AuthStore>;
    route = {} as ActivatedRouteSnapshot;
    state = {} as RouterStateSnapshot;
  });

  it('should allow access when user is authenticated', () => {
    authStore.isAuthenticated.and.returnValue(true);

    const result = TestBed.runInInjectionContext(() =>
      authGuard(route, state)
    );

    expect(result).toBe(true);
  });

  it('should deny access when user is not authenticated', () => {
    authStore.isAuthenticated.and.returnValue(false);

    const result = TestBed.runInInjectionContext(() =>
      authGuard(route, state)
    );

    expect(result).toBe(false);
  });
});
```

```ts
// auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthStore } from './auth-store';

export const authGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  return authStore.isAuthenticated();
};
```

### Router outlets

Router outlet tests are more of an integration test since you're essentially testing the integration between the [`Router`](api/router/Router), the outlet, and the components being displayed.

Here's an example of how to set up a test that verifies different components are displayed for different routes:

```ts
// app.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { App } from './app';

@Component({
  template: '<h1>Home Page</h1>'
})
class MockHome {}

@Component({
  template: '<h1>About Page</h1>'
})
class MockAbout {}

describe('App Router Outlet', () => {
  let component: App;
  let fixture: ComponentFixture<App>;
  let router: Router;
  let location: Location;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        App,
        MockHome,
        MockAbout
      ],
      providers: [
        provideRouter([
          { path: '', component: MockHome },
          { path: 'about', component: MockAbout }
        ])
      ]
    });

    fixture = TestBed.createComponent(App);
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

```

```ts
// app.component.ts
import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';

@Component({
  imports: [RouterOutlet, RouterLink],
  template: `
    <nav>
      <a routerLink="/">Home</a>
      <a routerLink="/about">About</a>
    </nav>
    <router-outlet />
  `
})
export class App {}
```

### Nested routes

Testing nested routes ensures that both the parent and child components render correctly when navigating to nested URLs. This is important because nested routes involve multiple layers - you need to verify that the parent component renders, the child component renders within it, and ensure that both components can access their respective route data.

Here's an example of testing a parent-child route structure:

```ts
// nested-routes.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { Parent, Child } from './nested-components';

describe('Nested Routes', () => {
  let fixture: ComponentFixture<Parent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        Parent,
        Child
      ],
      providers: [
        provideRouter([
          {
            path: 'parent',
            component: Parent,
            children: [
              { path: 'child', component: Child }
            ]
          }
        ])
      ]
    });

    fixture = TestBed.createComponent(Parent);
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
```

```ts
// nested-components.ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterOutlet],
  template: `
    <h1>Parent Component</h1>
    <router-outlet />
  `
})
export class Parent {}

@Component({
  template: '<h2>Child Component</h2>'
})
export class Child {}
```

### Query parameters and fragments

Query parameters (like `?search=angular&category=web`) and URL fragments (like `#section1`) provide additional data through the URL that doesn't affect which component loads, but does affect how the component behaves. Components that read query parameters through [`ActivatedRoute.queryParams`](api/router/ActivatedRoute#queryParams) need to be tested to ensure they handle different parameter scenarios correctly.

Unlike route parameters that are part of the route definition, query parameters are optional and can change without triggering route navigation. This means you need to test both the initial loading and the reactive updates when query parameters change.

Here's an example of how to test query parameters and fragments:

```ts
// search.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';
import { Search } from './search';

@Component({
  template: '<router-outlet />'
})
class TestHost {}

describe('Search', () => {
  let component: Search;
  let fixture: ComponentFixture<TestHost>;
  let router: Router;
  let location: Location;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Search, TestHost],
      providers: [
        provideRouter([
          { path: 'search', component: Search }
        ])
      ]
    });

    fixture = TestBed.createComponent(TestHost);
    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
    fixture.detectChanges();
  });

  it('should read search term from query parameters', async () => {
    await router.navigate(['/search'], { queryParams: { q: 'angular' } });
    fixture.detectChanges();

    const searchComponent = fixture.debugElement.query(By.directive(Search));
    component = searchComponent.componentInstance;

    expect(component.searchTerm).toBe('angular');
    expect(location.path()).toBe('/search?q=angular');
  });
});
```

```ts
// search.component.ts
import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  template: '<div>Search term: {{searchTerm}}</div>'
})
export class Search {
  private route = inject(ActivatedRoute);
  searchTerm: string | null = null;

  constructor() {
    this.route.queryParams.subscribe(params => {
      this.searchTerm = params['q'] || null;
    });
  }
}
```

## Best practices for router testing

1. **Consider RouterTestingHarness** - For comprehensive integration testing, use [`RouterTestingHarness`](api/router/testing/RouterTestingHarness) which provides a test harness with built-in navigation and component testing capabilities.
2. **Mock external dependencies** - When testing components that use routing, mock any external services or dependencies to focus your tests on routing behavior.
3. **Test navigation state** - Verify both the navigation action and the resulting application state, including URL changes and component rendering.
4. **Handle asynchronous operations** - Router navigation is asynchronous. Use `async/await` or [`fakeAsync`](api/core/testing/fakeAsync) to properly handle timing in your tests.
5. **Test error scenarios** - Include tests for invalid routes, failed navigation, and guard rejections to ensure your application handles edge cases gracefully.
