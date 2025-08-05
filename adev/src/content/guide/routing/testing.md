# Testing routing and navigation

Testing routing and navigation is essential to ensure your application behaves correctly when users navigate between different routes. This guide covers various strategies for testing routing functionality in Angular applications.

## Prerequisites

This guide assumes you are familiar with the following tools and libraries:

- **[Jasmine](https://jasmine.github.io/)** - JavaScript testing framework that provides the testing syntax (`describe`, `it`, `expect`)
- **[Karma](https://karma-runner.github.io/)** - Test runner that executes tests in browsers
- **[Angular Testing Utilities](guide/testing)** - Angular's built-in testing tools ([`TestBed`](api/core/testing/TestBed), [`ComponentFixture`](api/core/testing/ComponentFixture))
- **[RouterTestingHarness](api/router/testing/RouterTestingHarness)** - Test harness for testing routed components with built-in navigation and component testing capabilities

## Testing scenarios

### Route parameters

Components often rely on route parameters from the URL to fetch data, like a user ID for a profile page.

The following example shows how to test a `UserProfile` component that displays a user ID from the route.

```ts
// user-profile.component.spec.ts
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideRouter } from '@angular/router';
import { UserProfile } from './user-profile';

describe('UserProfile', () => {
  it('should display user ID from route parameters', async () => {
    TestBed.configureTestingModule({
      imports: [UserProfile],
      providers: [
        provideRouter([
          { path: 'user/:id', component: UserProfile }
        ])
      ]
    });

    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/user/123', UserProfile);

    expect(harness.routeNativeElement?.textContent).toContain('User Profile: 123');
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
  userId: string | null = this.route.snapshot.paramMap.get('id');
}
```

### Route guards

Route guards control access to routes based on conditions like authentication or permissions. When testing guards, focus on mocking dependencies and verifying navigation outcomes.

The following example tests an `authGuard` that allows navigation for authenticated users and redirects unauthenticated users to a login page.

```ts
// auth.guard.spec.ts
import { RouterTestingHarness } from '@angular/router/testing';
import { provideRouter, Router } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthStore } from './auth-store';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

@Component({ template: '<h1>Protected Page</h1>' })
class ProtectedComponent {}

@Component({ template: '<h1>Login Page</h1>' })
class LoginComponent {}

describe('authGuard', () => {
  let authStore: jasmine.SpyObj<AuthStore>;
  let harness: RouterTestingHarness;

  async function setup(isAuthenticated: boolean) {
    authStore = jasmine.createSpyObj('AuthStore', ['isAuthenticated']);
    authStore.isAuthenticated.and.returnValue(isAuthenticated);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthStore, useValue: authStore },
        provideRouter([
          { path: 'protected', component: ProtectedComponent, canActivate: [authGuard] },
          { path: 'login', component: LoginComponent },
        ]),
      ],
    });

    harness = await RouterTestingHarness.create();
  }

  it('allows navigation when user is authenticated', async () => {
    await setup(true);
    await harness.navigateByUrl('/protected', ProtectedComponent);
    // The protected component should render when authenticated
    expect(harness.routeNativeElement?.textContent).toContain('Protected Page');
  });

  it('redirects to login when user is not authenticated', async () => {
    await setup(false);
    await harness.navigateByUrl('/protected', LoginComponent);
    // The login component should render after redirect
    expect(harness.routeNativeElement?.textContent).toContain('Login Page');
  });
});
```

```ts
// auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from './auth-store';

export const authGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);
  return authStore.isAuthenticated() ? true : router.parseUrl('/login');
};
```

### Router outlets

Router outlet tests are more of an integration test since you're essentially testing the integration between the [`Router`](api/router/Router), the outlet, and the components being displayed.

Here's an example of how to set up a test that verifies different components are displayed for different routes:

```ts
// app.component.spec.ts
import { TestBed } from '@angular/core/testing';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideRouter } from '@angular/router';
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
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([
          { path: '', component: MockHome },
          { path: 'about', component: MockAbout }
        ])
      ]
    });

    harness = await RouterTestingHarness.create();
  });

  it('should display home component for default route', async () => {
    await harness.navigateByUrl('');

    expect(harness.routeNativeElement?.textContent).toContain('Home Page');
  });

  it('should display about component for about route', async () => {
    await harness.navigateByUrl('/about');

    expect(harness.routeNativeElement?.textContent).toContain('About Page');
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

Testing nested routes ensures that both the parent and child components render correctly when navigating to nested URLs. This is important because nested routes involve multiple layers.

You need to verify that:

1. The parent component renders properly.
2. The child component renders within it.
3. Ensure that both components can access their respective route data.

Here's an example of testing a parent-child route structure:

```ts
// nested-routes.spec.ts
import { TestBed } from '@angular/core/testing';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideRouter } from '@angular/router';
import { Parent, Child } from './nested-components';

describe('Nested Routes', () => {
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [Parent, Child],
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

    harness = await RouterTestingHarness.create();
  });

  it('should render parent and child components for nested route', async () => {
    await harness.navigateByUrl('/parent/child');

    expect(harness.routeNativeElement?.textContent).toContain('Parent Component');
    expect(harness.routeNativeElement?.textContent).toContain('Child Component');
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
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { Search } from './search';

describe('Search', () => {
  let component: Search;
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [Search],
      providers: [
        provideRouter([
          { path: 'search', component: Search }
        ])
      ]
    });

    harness = await RouterTestingHarness.create();
  });

  it('should read search term from query parameters', async () => {
    component = await harness.navigateByUrl('/search?q=angular', Search);

    expect(component.searchTerm()).toBe('angular');
  });
});
```

```ts
// search.component.ts
import { Component, inject, computed } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  template: '<div>Search term: {{searchTerm()}}</div>'
})
export class Search {
  private route = inject(ActivatedRoute);
  private queryParams = toSignal(this.route.queryParams, { initialValue: {} });

  searchTerm = computed(() => this.queryParams()['q'] || null);
}
```

## Best practices for router testing

1. **Use RouterTestingHarness** - For testing routed components, use [`RouterTestingHarness`](api/router/testing/RouterTestingHarness) which provides a cleaner API and eliminates the need for test host components. It offers direct component access, built-in navigation, and better type safety. However, it isn't as suitable for some scenarios, such as testing named outlets, where you may need to create custom host components.
2. **Handle external dependencies thoughtfully** - Prefer real implementations when possible for more realistic tests. If real implementations aren't feasible (e.g., external APIs), use fakes that approximate the real behavior. Use mocks or stubs only as a last resort, as they can make tests brittle and less reliable.
3. **Test navigation state** - Verify both the navigation action and the resulting application state, including URL changes and component rendering.
4. **Handle asynchronous operations** - Router navigation is asynchronous. Use `async/await` or [`fakeAsync`](api/core/testing/fakeAsync) to properly handle timing in your tests.
5. **Test error scenarios** - Include tests for invalid routes, failed navigation, and guard rejections to ensure your application handles edge cases gracefully.
6. **Do not mock Angular Router** - Instead, provide real route configurations and use the harness to navigate. This makes your tests more robust and less likely to break on internal Angular updates, while also ensuring you catch real issues when the router updates since mocks can hide breaking changes.
