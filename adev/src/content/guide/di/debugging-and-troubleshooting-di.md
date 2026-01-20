# Debugging and troubleshooting dependency injection

Dependency injection (DI) issues typically stem from configuration mistakes, scope problems, or incorrect usage patterns. This guide helps you identify and resolve common DI problems that developers encounter.

## Common pitfalls and solutions

### Services not available where expected

One of the most common DI issues occurs when you try to inject a service but Angular cannot find it in the current injector or any parent injector. This usually happens when the service is provided in the wrong scope or not provided at all.

#### Provider scope mismatch

When you provide a service in a component's `providers` array, Angular creates an instance in that component's injector. This instance is only available to that component and its children. Parent components and sibling components cannot access it because they use different injectors.

```ts
// child.component.ts - Provides service
import {Component} from '@angular/core';
import {DataStore} from './data-store';

@Component({
  selector: 'app-child',
  template: '<p>Child</p>',
  providers: [DataStore], // Only available in this component and its children
})
export class ChildComponent {}

// parent.component.ts - Tries to inject
import {Component, inject} from '@angular/core';
import {DataStore} from './data-store';

@Component({
  selector: 'app-parent',
  template: '<app-child></app-child>',
})
export class ParentComponent {
  private dataService = inject(DataStore); // ERROR: Not available to parent
}
```

Angular only searches up the hierarchy, never down. Parent components cannot access services provided in child components.

**Solution:** Provide the service at a higher level (application or parent component).

```ts
// Good: Provide at root level
import {Injectable} from '@angular/core';

@Injectable({providedIn: 'root'})
export class DataStore {
  // Available everywhere
}
```

TIP: Use `providedIn: 'root'` by default for services that don't need component-specific state. This makes services available everywhere and enables tree-shaking.

#### Lazy-loaded module services

When you provide a service in a lazy-loaded route's `providers` array, Angular creates a child injector for that route. This injector and its services only become available after the route loads. Components in the eagerly-loaded parts of your application cannot access these services because they use different injectors that exist before the lazy-loaded injector is created.

```ts
// feature.routes.ts - Lazy-loaded route
import {Routes} from '@angular/router';
import {FeatureClient} from './feature-client';

export const featureRoutes: Routes = [
  {
    path: 'feature',
    providers: [FeatureClient],
    loadComponent: () => import('./feature.component'),
  },
];

// eager.component.ts - Eager component
import {Component, inject} from '@angular/core';
import {FeatureClient} from './feature-client';

@Component({
  selector: 'app-eager',
  template: '<p>Eager Component</p>',
})
export class EagerComponent {
  private featureService = inject(FeatureClient); // ERROR: Not available yet
}
```

Lazy-loaded routes create child injectors that are only available after the route loads.

**Solution:** Use `providedIn: 'root'` for services that need to be shared across lazy boundaries.

```ts
// Good: Provide at root for shared services
import {Injectable} from '@angular/core';

@Injectable({providedIn: 'root'})
export class FeatureClient {
  // Available everywhere, including before lazy load
}
```

If the service should be lazy-loaded but still available to eager components, inject it only where needed and use optional injection to handle availability.

### Multiple instances instead of singletons

You expect one shared instance (singleton) but get separate instances in different components.

#### Providing in component instead of root

When you add a service to a component's `providers` array, Angular creates a new instance of that service for each instance of the component. Each component gets its own separate service instance, which means changes in one component don't affect the service instance in other components. This is often unexpected when you want shared state across your application.

```ts
// Avoid: Component-level provider creates multiple instances
import {Component, inject} from '@angular/core';
import {UserClient} from './user-client';

@Component({
  selector: 'app-profile',
  template: '<p>Profile</p>',
  providers: [UserClient], // Creates new instance per component!
})
export class ProfileComponent {
  private userService = inject(UserClient);
}

@Component({
  selector: 'app-settings',
  template: '<p>Settings</p>',
  providers: [UserClient], // Different instance!
})
export class SettingsComponent {
  private userService = inject(UserClient);
}
```

Each component gets its own `UserClient` instance. Changes in one component don't affect the other.

**Solution:** Use `providedIn: 'root'` for singletons.

```ts
// Good: Root-level singleton
import {Injectable} from '@angular/core';

@Injectable({providedIn: 'root'})
export class UserClient {
  // Single instance shared across all components
}
```

#### When multiple instances are intentional

Sometimes you want separate instances per component for component-specific state.

```ts
// Intentional: Component-scoped state
import {Injectable, signal} from '@angular/core';

@Injectable() // No providedIn - must be provided explicitly
export class FormStateStore {
  private formData = signal({});

  setData(data: any) {
    this.formData.set(data);
  }

  getData() {
    return this.formData();
  }
}

@Component({
  selector: 'app-user-form',
  template: '<form>...</form>',
  providers: [FormStateStore], // Each form gets its own state
})
export class UserFormComponent {
  private formState = inject(FormStateStore);
}
```

This pattern is useful for:

- Form state management (each form has isolated state)
- Component-specific caching
- Temporary data that shouldn't be shared

### Incorrect inject() usage

The `inject()` function only works in specific contexts during class construction and factory execution.

#### Using inject() in lifecycle hooks

When you call the `inject()` function inside lifecycle hooks like `ngOnInit()`, `ngAfterViewInit()`, or `ngOnDestroy()`, Angular throws an error because these methods run outside the injection context. The injection context is only available during the synchronous execution of class construction, which happens before lifecycle hooks are called.

```ts
// Avoid: inject() in ngOnInit
import {Component, inject} from '@angular/core';
import {UserClient} from './user-client';

@Component({
  selector: 'app-profile',
  template: '<p>User: {{userName}}</p>',
})
export class ProfileComponent {
  userName = '';

  ngOnInit() {
    const userService = inject(UserClient); // ERROR: Not an injection context
    this.userName = userService.getUser().name;
  }
}
```

**Solution:** Capture dependencies in field initializers or the constructor.

```ts
// Good: Capture in field initializer
import {Component, inject} from '@angular/core';
import {UserClient} from './user-client';

@Component({
  selector: 'app-profile',
  template: '<p>User: {{userName}}</p>',
})
export class ProfileComponent {
  private userService = inject(UserClient); // Valid
  userName = '';

  ngOnInit() {
    this.userName = this.userService.getUser().name;
  }
}
```

#### Using inject() after await

When you use an `await` statement in your code, everything after that `await` executes asynchronously in a different execution context. If you try to call `inject()` after an `await`, Angular cannot access the injection context because it only exists during synchronous class construction. The code after `await` runs at a later time when the injection context is no longer available.

```ts
// Avoid: inject() after await
import {Component, inject} from '@angular/core';
import {UserClient} from './user-client';

@Component({
  selector: 'app-profile',
  template: '<p>User: {{userName}}</p>',
})
export class ProfileComponent {
  userName = '';

  async ngOnInit() {
    await this.loadSettings();
    const userService = inject(UserClient); // ERROR: After async operation
    this.userName = userService.getUser().name;
  }

  async loadSettings() {
    // Simulated async operation
  }
}
```

**Solution:** Capture dependencies before any `await` statements.

```ts
// Good: Capture before async operations
import {Component, inject} from '@angular/core';
import {UserClient} from './user-client';

@Component({
  selector: 'app-profile',
  template: '<p>User: {{userName}}</p>',
})
export class ProfileComponent {
  private userService = inject(UserClient); // Valid: Field initializer
  userName = '';

  async ngOnInit() {
    await this.loadSettings();
    this.userName = this.userService.getUser().name; // Uses captured reference
  }

  async loadSettings() {
    // Simulated async operation
  }
}
```

#### Using runInInjectionContext for deferred injection

When you need to inject dependencies in callbacks or after async operations, use `runInInjectionContext()`.

```ts
import {Component, inject, Injector} from '@angular/core';
import {UserClient} from './user-client';

@Component({
  selector: 'app-profile',
  template: '<button (click)="delayedLoad()">Load Later</button>',
})
export class ProfileComponent {
  private injector = inject(Injector);

  delayedLoad() {
    setTimeout(() => {
      this.injector.runInInjectionContext(() => {
        const userService = inject(UserClient);
        console.log(userService.getUser());
      });
    }, 1000);
  }
}
```

The `runInInjectionContext()` method creates a temporary injection context, allowing `inject()` to work inside the callback.

TIP: Always capture dependencies at the class level when possible. Use `runInInjectionContext()` only when you genuinely need deferred injection.

### providers vs viewProviders confusion

The difference between `providers` and `viewProviders` affects content projection scenarios.

#### Understanding the difference

**providers:** Available to the component's template AND any content projected into the component (ng-content).

**viewProviders:** Only available to the component's template, NOT to projected content.

```ts
// parent.component.ts
import {Component, inject} from '@angular/core';
import {ThemeStore} from './theme-store';

@Component({
  selector: 'app-parent',
  template: `
    <div>
      <p>Theme: {{ themeService.theme() }}</p>
      <ng-content></ng-content>
    </div>
  `,
  providers: [ThemeStore], // Available to content children
})
export class ParentComponent {
  protected themeService = inject(ThemeStore);
}

@Component({
  selector: 'app-parent-view',
  template: `
    <div>
      <p>Theme: {{ themeService.theme() }}</p>
      <ng-content></ng-content>
    </div>
  `,
  viewProviders: [ThemeStore], // NOT available to content children
})
export class ParentViewComponent {
  protected themeService = inject(ThemeStore);
}

// child.component.ts
import {Component, inject} from '@angular/core';
import {ThemeStore} from './theme-store';

@Component({
  selector: 'app-child',
  template: '<p>Child theme: {{theme()}}</p>',
})
export class ChildComponent {
  private themeService = inject(ThemeStore, {optional: true});
  theme = () => this.themeService?.theme() ?? 'none';
}

// app.component.ts
@Component({
  selector: 'app-root',
  template: `
    <app-parent>
      <app-child></app-child>
      <!-- Can access ThemeStore -->
    </app-parent>

    <app-parent-view>
      <app-child></app-child>
      <!-- Cannot access ThemeStore -->
    </app-parent-view>
  `,
})
export class AppComponent {}
```

**When projected into `app-parent`:** The child component can inject `ThemeStore` because `providers` makes it available to projected content.

**When projected into `app-parent-view`:** The child component cannot inject `ThemeStore` because `viewProviders` restricts it to the parent's template only.

#### Choosing between providers and viewProviders

Use `providers` when:

- The service should be available to projected content
- You want content children to access the service
- You're providing general-purpose services

Use `viewProviders` when:

- The service should only be available to your component's template
- You want to hide implementation details from projected content
- You're providing internal services that shouldn't leak out

**Default recommendation:** Use `providers` unless you have a specific reason to restrict access with `viewProviders`.

### InjectionToken issues

When using `InjectionToken` for non-class dependencies, developers often encounter problems related to token identity, type safety, and provider configuration. These issues usually stem from how JavaScript handles object identity and how TypeScript infers types.

#### Token identity confusion

When you create a new `InjectionToken` instance, JavaScript creates a unique object in memory. Even if you create another `InjectionToken` with the exact same description string, it's a completely different object. Angular uses the token object's identity (not its description) to match providers with injection points, so tokens with the same description but different object identities cannot access each other's values.

```ts
// config.token.ts
import {InjectionToken} from '@angular/core';

export interface AppConfig {
  apiUrl: string;
}

export const APP_CONFIG = new InjectionToken<AppConfig>('app config');

// app.config.ts
import {APP_CONFIG} from './config.token';

export const appConfig: AppConfig = {
  apiUrl: 'https://api.example.com',
};

bootstrapApplication(AppComponent, {
  providers: [{provide: APP_CONFIG, useValue: appConfig}],
});

// feature.component.ts - WRONG
import {InjectionToken, inject} from '@angular/core';
import {AppConfig} from './config.token';

// Avoid: Creating new token with same description
const APP_CONFIG = new InjectionToken<AppConfig>('app config');

@Component({
  selector: 'app-feature',
  template: '<p>Feature</p>',
})
export class FeatureComponent {
  private config = inject(APP_CONFIG); // ERROR: Different token instance!
}
```

Even though both tokens have the description `'app config'`, they are different objects. Angular compares tokens by reference, not by description.

**Solution:** Import the same token instance.

```ts
// Good: Import the same token
import {inject} from '@angular/core';
import {APP_CONFIG, AppConfig} from './config.token';

@Component({
  selector: 'app-feature',
  template: '<p>API: {{config.apiUrl}}</p>',
})
export class FeatureComponent {
  protected config = inject(APP_CONFIG); // Works: Same token instance
}
```

TIP: Always export tokens from a shared file and import them everywhere they're needed. Never create multiple `InjectionToken` instances with the same description.

#### Trying to inject interfaces

When you define a TypeScript interface, it only exists during compilation for type checking. TypeScript erases all interface definitions when it compiles to JavaScript, so at runtime there's no object for Angular to use as an injection token. If you try to inject an interface type, Angular has nothing to match against the provider configuration.

```ts
// Avoid: Can't inject interface
interface UserConfig {
  name: string;
  email: string;
}

@Component({
  selector: 'app-profile',
  template: '<p>Profile</p>',
})
export class ProfileComponent {
  // ERROR: Interfaces don't exist at runtime
  constructor(private config: UserConfig) {}
}
```

**Solution:** Use `InjectionToken` for interface types.

```ts
// Good: Use InjectionToken for interfaces
import {InjectionToken, inject} from '@angular/core';

interface UserConfig {
  name: string;
  email: string;
}

export const USER_CONFIG = new InjectionToken<UserConfig>('user configuration');

// Provide the configuration
bootstrapApplication(AppComponent, {
  providers: [
    {
      provide: USER_CONFIG,
      useValue: {name: 'Alice', email: 'alice@example.com'},
    },
  ],
});

// Inject using the token
@Component({
  selector: 'app-profile',
  template: '<p>User: {{config.name}}</p>',
})
export class ProfileComponent {
  protected config = inject(USER_CONFIG);
}
```

The `InjectionToken` exists at runtime and can be used for injection, while the `UserConfig` interface provides type safety during development.

### Circular dependencies

Circular dependencies happen when services inject each other, directly or indirectly.

#### How circular dependencies occur

A circular dependency happens when two or more services inject each other, creating a cycle. For example, Service A injects Service B, and Service B injects Service A.

As a result, When Angular tries to create Service A, it needs Service B. But to create Service B, it needs Service A, which it's already trying to create. Angular cannot determine which service to instantiate first, so it throws a circular dependency error.

```ts
// auth.service.ts
import {Injectable, inject} from '@angular/core';
import {UserClient} from './user-client';

@Injectable({providedIn: 'root'})
export class AuthClient {
  private userService = inject(UserClient);

  login(username: string) {
    return this.userService.findUser(username);
  }
}

// user.service.ts
import {Injectable, inject} from '@angular/core';
import {AuthClient} from './auth-client';

@Injectable({providedIn: 'root'})
export class UserClient {
  private authService = inject(AuthClient); // Creates circular dependency

  findUser(username: string) {
    if (this.authService.isAuthenticated()) {
      // ... find user
    }
  }
}
```

Angular cannot determine which service to create first, resulting in a circular dependency error.

#### Resolving circular dependencies: Restructure

The best solution is to restructure your code to eliminate the circular dependency.

**Option 1: Extract shared logic to a third service**

```ts
// auth-state.service.ts
import {Injectable, signal} from '@angular/core';

@Injectable({providedIn: 'root'})
export class AuthStateStore {
  private authenticated = signal(false);

  isAuthenticated() {
    return this.authenticated();
  }

  setAuthenticated(value: boolean) {
    this.authenticated.set(value);
  }
}

// auth.service.ts
import {Injectable, inject} from '@angular/core';
import {UserClient} from './user-client';
import {AuthStateStore} from './auth-state-store';

@Injectable({providedIn: 'root'})
export class AuthClient {
  private userService = inject(UserClient);
  private authState = inject(AuthStateStore);

  login(username: string) {
    const user = this.userService.findUser(username);
    this.authState.setAuthenticated(true);
    return user;
  }
}

// user.service.ts
import {Injectable, inject} from '@angular/core';
import {AuthStateStore} from './auth-state-store';

@Injectable({providedIn: 'root'})
export class UserClient {
  private authState = inject(AuthStateStore); // No circular dependency

  findUser(username: string) {
    if (this.authState.isAuthenticated()) {
      // ... find user
    }
  }
}
```

**Option 2: Use events or observables**

```ts
// auth-events.service.ts
import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';

@Injectable({providedIn: 'root'})
export class AuthEventsStore {
  loginSuccess = new Subject<string>();
  logoutSuccess = new Subject<void>();
}

// auth.service.ts
import {Injectable, inject} from '@angular/core';
import {AuthEventsStore} from './auth-events-store';

@Injectable({providedIn: 'root'})
export class AuthClient {
  private authEvents = inject(AuthEventsStore);

  login(username: string) {
    // ... perform login
    this.authEvents.loginSuccess.next(username);
  }
}

// user.service.ts
import {Injectable, inject} from '@angular/core';
import {AuthEventsStore} from './auth-events-store';

@Injectable({providedIn: 'root'})
export class UserClient {
  private authEvents = inject(AuthEventsStore);

  constructor() {
    this.authEvents.loginSuccess.subscribe((username) => {
      console.log(`User ${username} logged in`);
    });
  }
}
```

#### Resolving circular dependencies: Lazy injection

As a last resort, you can use lazy injection with the `Injector` to break the circular dependency.

```ts
// user.service.ts
import {Injectable, inject, Injector} from '@angular/core';
import {AuthClient} from './auth-client';

@Injectable({providedIn: 'root'})
export class UserClient {
  private injector = inject(Injector);
  private authService: AuthClient | null = null;

  findUser(username: string) {
    // Lazy initialization breaks the circular dependency
    if (!this.authService) {
      this.authService = this.injector.get(AuthClient);
    }

    if (this.authService.isAuthenticated()) {
      // ... find user
    }
  }
}
```

This approach delays the injection of `AuthClient` until it's actually needed, breaking the circular dependency at construction time.

NOTE: Lazy injection is a workaround, not a solution. Restructuring your code to eliminate the circular dependency is always preferable. Do not use `forwardRef()` for service circular dependencies—it only solves circular imports in standalone component configurations.

## Debugging dependency resolution

### Understanding the resolution process

Angular resolves dependencies by walking up the injector hierarchy. Understanding this process helps you diagnose where and why injection fails.

#### Resolution order

When Angular needs to inject a dependency, it searches in this order:

1. **Element injector** - The current component or directive
2. **Parent element injectors** - Walk up the DOM tree through parent components
3. **Environment injector** - The application or route injector
4. **Parent environment injectors** - Walk up to platform injector
5. **NullInjector** - Throws `NullInjectorError`

```
Component Injector
        ↓
Parent Component Injector
        ↓
Root Component Injector
        ↓
Route Injector (if lazy loaded)
        ↓
Application Injector
        ↓
Platform Injector
        ↓
NullInjector (throws error)
```

#### Default resolution behavior

By default, injection searches the entire hierarchy from bottom to top.

```ts
// Searches from component up through entire hierarchy
private userService = inject(UserClient)
```

If `UserClient` is provided anywhere in the hierarchy, Angular finds it. If not found at any level, Angular throws `NullInjectorError`.

#### Resolution modifiers

You can control how Angular searches the hierarchy with resolution modifiers.

**@Self() - Only check current injector**

```ts
import {Component, inject} from '@angular/core';
import {UserClient} from './user-client';

@Component({
  selector: 'app-profile',
  template: '<p>Profile</p>',
  providers: [UserClient],
})
export class ProfileComponent {
  // Only looks in this component's injector
  private userService = inject(UserClient, {self: true});
}
```

The `self: true` option restricts the search to the current injector. If the provider is not at this level, Angular throws an error immediately without checking parent injectors.

**@SkipSelf() - Start at parent injector**

```ts
import {Component, inject} from '@angular/core';
import {UserClient} from './user-client';

@Component({
  selector: 'app-profile',
  template: '<p>Profile</p>',
  providers: [UserClient],
})
export class ProfileComponent {
  // Skips this component's injector, starts at parent
  private parentUserClient = inject(UserClient, {skipSelf: true});
}
```

The `skipSelf: true` option skips the current injector and starts searching at the parent. This is useful when you want to access a parent's instance while also providing your own.

**@Optional() - Return null if not found**

```ts
import {Component, inject} from '@angular/core';
import {UserClient} from './user-client';

@Component({
  selector: 'app-profile',
  template: '<p>Profile</p>',
})
export class ProfileComponent {
  // Returns null if not found instead of throwing
  private userService = inject(UserClient, {optional: true});

  ngOnInit() {
    if (this.userService) {
      // Service available
    } else {
      // Service not available, handle gracefully
    }
  }
}
```

The `optional: true` option prevents errors when a provider is not found. Angular returns `null` instead of throwing `NullInjectorError`.

**@Host() - Stop at host component**

```ts
import {Directive, inject} from '@angular/core';
import {UserClient} from './user-client';

@Directive({
  selector: '[appUser]',
})
export class UserDirective {
  // Stops search at host component boundary
  private userService = inject(UserClient, {host: true});
}
```

The `host: true` option stops the search at the host component boundary. This is useful for directives that should only access services from their host component.

#### Combining modifiers

You can combine modifiers for specific behaviors.

```ts
// Optional parent service
private parentService = inject(UserClient, {
  optional: true,
  skipSelf: true
})
```

This searches parent injectors only and returns `null` if not found.

### Using Angular DevTools

Angular DevTools is a browser extension that helps visualize the injector hierarchy and debug dependency injection issues.

#### Installing Angular DevTools

1. Install the Angular DevTools extension from your browser's extension store (Chrome, Edge, or Firefox)
2. Open your Angular application in the browser
3. Open browser DevTools (F12 or right-click → Inspect)
4. Select the "Angular" tab

#### Inspecting the injector hierarchy

The Angular DevTools component explorer shows the component tree and available injectors.

**To inspect providers:**

1. Select a component in the component tree
2. Look at the "Injector" section in the component details
3. See all providers available at that component level
4. Expand parent components to see their providers

**What to look for:**

- Is your service listed in the injector view?
- At what level is the service provided? (component, route, application)
- Are there multiple instances? (check multiple components)
- Does the scope match your expectations?

#### Debugging provider availability

Use DevTools to verify a service is provided where you expect:

1. Navigate to the component that fails to inject
2. Check the Injector section - is the service listed?
3. If not, check parent components moving up the tree
4. Verify the service eventually appears at the application level

If the service never appears in any injector, check:

- Service has `@Injectable()` decorator
- Service has `providedIn: 'root'` or is in a providers array
- Service file is not excluded from compilation

#### Identifying scope issues

DevTools helps identify when services are provided at the wrong scope.

**Expected: One instance (singleton)**

- Service appears in application-level injector only
- All components show the same service instance

**Actual: Multiple instances**

- Service appears in multiple component-level injectors
- Each component has its own instance
- Usually caused by including service in component `providers` array

Adjust the `providedIn` scope or remove from component `providers` to fix scope issues.

### Logging and tracing injection

When DevTools isn't enough, use logging to trace injection behavior.

#### Logging service creation

Add console logs to service constructors to see when services are created.

```ts
import {Injectable} from '@angular/core';

@Injectable({providedIn: 'root'})
export class UserClient {
  constructor() {
    console.log('UserClient created');
    console.trace(); // Shows call stack
  }

  getUser() {
    return {name: 'Alice'};
  }
}
```

When the service is created, you'll see the log message and a stack trace showing where the injection occurred.

**What to look for:**

- How many times is the constructor called? (should be once for singletons)
- Where in the code is it being injected? (check the stack trace)
- Is it created at the expected time? (application startup vs lazy)

#### Tracing injection attempts with optional

Use optional injection with logging to determine if a service is available.

```ts
import {Component, inject} from '@angular/core';
import {UserClient} from './user-client';

@Component({
  selector: 'app-debug',
  template: '<p>Debug Component</p>',
})
export class DebugComponent {
  private userService = inject(UserClient, {optional: true});

  constructor() {
    if (this.userService) {
      console.log('UserClient available:', this.userService);
    } else {
      console.warn('UserClient NOT available');
      console.trace(); // Shows where we tried to inject
    }
  }
}
```

This pattern helps you verify if a service is available without crashing the application.

#### Logging resolution modifiers

Test different resolution strategies with logging.

```ts
import {Component, inject} from '@angular/core';
import {UserClient} from './user-client';

@Component({
  selector: 'app-debug',
  template: '<p>Debug Component</p>',
  providers: [UserClient],
})
export class DebugComponent {
  // Try to get local instance
  private localService = inject(UserClient, {self: true, optional: true});

  // Try to get parent instance
  private parentService = inject(UserClient, {
    skipSelf: true,
    optional: true,
  });

  constructor() {
    console.log('Local instance:', this.localService);
    console.log('Parent instance:', this.parentService);
    console.log('Same instance?', this.localService === this.parentService);
  }
}
```

This shows you which instances are available at different injector levels.

### Debugging workflow

When DI fails, follow this systematic approach:

**Step 1: Read the error message**

- Identify the error code (NG0200, NG0203, etc.)
- Read the dependency path
- Note which token failed

**Step 2: Check the basics**

- Does the service have `@Injectable()`?
- Is `providedIn` set correctly?
- Are imports correct?
- Is the file included in compilation?

**Step 3: Verify injection context**

- Is `inject()` called in a valid context?
- Check for async issues (await, setTimeout, promises)
- Verify timing (not after destroy)

**Step 4: Use debugging tools**

- Open Angular DevTools
- Check injector hierarchy
- Add console logs to constructors
- Use optional injection to test availability

**Step 5: Simplify and isolate**

- Remove dependencies one by one
- Test in a minimal component
- Check each injector level separately
- Create a reproduction case

## DI error reference

This section provides detailed information about specific Angular DI error codes you may encounter. Use this as a reference when you see these errors in your console.

### NullInjectorError: No provider for [Service]

**Error code:** None (displayed as `NullInjectorError`)

This error occurs when Angular cannot find a provider for a token in the injector hierarchy. The error message includes a dependency path showing where the injection was attempted.

```
NullInjectorError: No provider for UserClient!
  Dependency path: AppComponent -> AuthClient -> UserClient
```

The dependency path shows that `AppComponent` injected `AuthClient`, which tried to inject `UserClient`, but no provider was found.

#### Missing @Injectable decorator

The most common cause is forgetting the `@Injectable()` decorator on a service class.

```ts
// Avoid: Missing decorator
export class UserClient {
  getUser() {
    return {name: 'Alice'};
  }
}
```

Angular requires the `@Injectable()` decorator to generate the metadata needed for dependency injection.

```ts
// Good: Include @Injectable
import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UserClient {
  getUser() {
    return {name: 'Alice'};
  }
}
```

NOTE: Classes with zero-argument constructors can work without `@Injectable()`, but this is not recommended. Always include the decorator for consistency and to avoid issues when adding dependencies later.

#### Missing providedIn configuration

A service may have `@Injectable()` but not specify where it should be provided.

```ts
// Avoid: No providedIn specified
import {Injectable} from '@angular/core';

@Injectable()
export class UserClient {
  getUser() {
    return {name: 'Alice'};
  }
}
```

Specify `providedIn: 'root'` to make the service available throughout your application.

```ts
// Good: Specify providedIn
import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UserClient {
  getUser() {
    return {name: 'Alice'};
  }
}
```

The `providedIn: 'root'` configuration makes the service available application-wide and enables tree-shaking (the service is removed from the bundle if never injected).

#### Standalone component missing imports

In Angular v20+ with standalone components, you must explicitly import or provide dependencies in each component.

```ts
// Avoid: Missing service import
import {Component, inject} from '@angular/core';
import {UserClient} from './user-client';

@Component({
  selector: 'app-profile',
  template: '<p>User: {{user().name}}</p>',
})
export class ProfileComponent {
  private userService = inject(UserClient); // ERROR: No provider
  user = this.userService.getUser();
}
```

Ensure the service uses `providedIn: 'root'` or add it to the component's `providers` array.

```ts
// Good: Service uses providedIn: 'root'
import {Component, inject} from '@angular/core';
import {UserClient} from './user-client';

@Component({
  selector: 'app-profile',
  template: '<p>User: {{user().name}}</p>',
})
export class ProfileComponent {
  private userService = inject(UserClient); // Works: providedIn: 'root'
  user = this.userService.getUser();
}
```

#### Debugging with the dependency path

The dependency path in the error message shows the chain of injections that led to the failure.

```
NullInjectorError: No provider for LoggerStore!
  Dependency path: AppComponent -> DataStore -> ApiClient -> LoggerStore
```

This path tells you:

1. `AppComponent` injected `DataStore`
2. `DataStore` injected `ApiClient`
3. `ApiClient` tried to inject `LoggerStore`
4. No provider for `LoggerStore` was found

Start your investigation at the end of the chain (`LoggerStore`) and verify it has proper configuration.

#### Checking provider availability with optional injection

Use optional injection to check if a provider exists without throwing an error.

```ts
import {Component, inject} from '@angular/core';
import {UserClient} from './user-client';

@Component({
  selector: 'app-debug',
  template: '<p>Service available: {{serviceAvailable}}</p>',
})
export class DebugComponent {
  private userService = inject(UserClient, {optional: true});
  serviceAvailable = this.userService !== null;

  ngOnInit() {
    if (this.userService) {
      console.log('UserClient is available');
    } else {
      console.log('UserClient is NOT available');
    }
  }
}
```

Optional injection returns `null` if no provider is found, allowing you to handle the absence gracefully or log debugging information.

### NG0203: inject() must be called from an injection context

**Error code:** NG0203

This error occurs when you call `inject()` outside of a valid injection context. Angular requires `inject()` to be called synchronously during class construction or factory execution.

```
NG0203: inject() must be called from an injection context such as a
constructor, a factory function, a field initializer, or a function
used with `runInInjectionContext`.
```

#### Valid injection contexts

Angular allows `inject()` in these locations:

1. **Class field initializers**

   ```ts
   import {Component, inject} from '@angular/core';
   import {UserClient} from './user-client';

   @Component({
     selector: 'app-profile',
     template: '<p>User: {{user().name}}</p>',
   })
   export class ProfileComponent {
     private userService = inject(UserClient); // Valid
     user = this.userService.getUser();
   }
   ```

2. **Class constructor**

   ```ts
   import {Component, inject} from '@angular/core';
   import {UserClient} from './user-client';

   @Component({
     selector: 'app-profile',
     template: '<p>User: {{user().name}}</p>',
   })
   export class ProfileComponent {
     private userService: UserClient;

     constructor() {
       this.userService = inject(UserClient); // Valid
     }

     user = this.userService.getUser();
   }
   ```

3. **Provider factory functions**

   ```ts
   import {inject, InjectionToken} from '@angular/core';
   import {UserClient} from './user-client';

   export const GREETING = new InjectionToken<string>('greeting', {
     factory() {
       const userService = inject(UserClient); // Valid
       const user = userService.getUser();
       return `Hello, ${user.name}`;
     },
   });
   ```

4. **Inside runInInjectionContext()**

   ```ts
   import {Component, inject, Injector} from '@angular/core';
   import {UserClient} from './user-client';

   @Component({
     selector: 'app-profile',
     template: '<button (click)="loadUser()">Load User</button>',
   })
   export class ProfileComponent {
     private injector = inject(Injector);

     loadUser() {
       this.injector.runInInjectionContext(() => {
         const userService = inject(UserClient); // Valid
         console.log(userService.getUser());
       });
     }
   }
   ```

#### When this error occurs

This error occurs when:

- Calling `inject()` in lifecycle hooks (`ngOnInit`, `ngAfterViewInit`, etc.)
- Calling `inject()` after `await` in async functions
- Calling `inject()` in callbacks (`setTimeout`, `Promise.then()`, etc.)
- Calling `inject()` outside of class construction phase

See the "Incorrect inject() usage" section for detailed examples and solutions.

#### Solutions and workarounds

**Solution 1:** Capture dependencies in field initializers (most common)

```ts
private userService = inject(UserClient) // Capture at class level
```

**Solution 2:** Use `runInInjectionContext()` for callbacks

```ts
private injector = inject(Injector)

someCallback() {
  this.injector.runInInjectionContext(() => {
    const service = inject(MyClient)
  })
}
```

**Solution 3:** Pass dependencies as parameters instead of injecting them

```ts
// Instead of injecting inside a callback
setTimeout(() => {
  const service = inject(MyClient) // ERROR
}, 1000)

// Capture first, then use
private service = inject(MyClient)

setTimeout(() => {
  this.service.doSomething() // Use captured reference
}, 1000)
```

### NG0200: Circular dependency detected

**Error code:** NG0200

This error occurs when two or more services depend on each other, creating a circular dependency that Angular cannot resolve.

```
NG0200: Circular dependency in DI detected for AuthClient
  Dependency path: AuthClient -> UserClient -> AuthClient
```

The dependency path shows the cycle: `AuthClient` depends on `UserClient`, which depends back on `AuthClient`.

#### Understanding the error

Angular creates service instances by calling their constructors and injecting dependencies. When services depend on each other circularly, Angular cannot determine which to create first.

#### Common causes

- Direct circular dependency (Service A → Service B → Service A)
- Indirect circular dependency (Service A → Service B → Service C → Service A)
- Import cycles in module files that also have service dependencies

#### Resolution strategies

See the "Circular dependencies" section for detailed examples and solutions:

1. **Restructure** - Extract shared logic to a third service (recommended)
2. **Use events** - Replace direct dependencies with event-based communication
3. **Lazy injection** - Use `Injector.get()` to defer one dependency (last resort)

Do NOT use `forwardRef()` for service circular dependencies. It only solves circular imports in component configurations.

### Other DI error codes

#### NG0204: Invalid injection token

This error occurs when you try to inject a class that doesn't have an `@Injectable()` decorator and has constructor parameters.

```
NG0204: Can't resolve all parameters for UserClient
```

**Solution:** Add the `@Injectable()` decorator to the service.

```ts
// Avoid: Missing @Injectable with constructor parameters
export class UserClient {
  constructor(private http: HttpClient) {} // ERROR
}

// Good: Include @Injectable
import {Injectable, inject} from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable({providedIn: 'root'})
export class UserClient {
  private http = inject(HttpClient);
}
```

#### NG0205: Injector already destroyed

This error occurs when you try to use an injector after it has been destroyed.

```
NG0205: Injector has already been destroyed
```

This typically happens when accessing services after a component or module has been destroyed.

**Solution:** Ensure you don't access services after the component lifecycle has ended. Cancel subscriptions and cleanup async operations in `ngOnDestroy()`.

```ts
// Avoid: Using service after component destroyed
import {Component, inject, OnDestroy} from '@angular/core';
import {UserClient} from './user-client';

@Component({
  selector: 'app-profile',
  template: '<p>User Profile</p>',
})
export class ProfileComponent implements OnDestroy {
  private userService = inject(UserClient);

  ngOnDestroy() {
    // Component is being destroyed
  }

  // This might be called after destroy
  someAsyncCallback() {
    this.userService.getUser(); // ERROR if component destroyed
  }
}
```

#### NG0207: Provider in wrong context

This error occurs when you use `EnvironmentProviders` (from functions like `importProvidersFrom()` or `provideRouter()`) in a component's `providers` array.

```
NG0207: EnvironmentProviders cannot be used in component providers
```

**Solution:** Use `EnvironmentProviders` only at the application or route level.

```ts
// Avoid: importProvidersFrom in component
import {Component} from '@angular/core';
import {provideHttpClient} from '@angular/common/http';

@Component({
  selector: 'app-root',
  template: '<p>App</p>',
  providers: [provideHttpClient()], // ERROR
})
export class AppComponent {}

// Good: provideHttpClient at application level
import {bootstrapApplication} from '@angular/platform-browser';
import {provideHttpClient} from '@angular/common/http';
import {AppComponent} from './app.component';

bootstrapApplication(AppComponent, {
  providers: [provideHttpClient()],
});
```

## Next steps

When you encounter DI errors, remember to:

1. Read the error message and dependency path carefully
2. Verify basic configuration (decorators, `providedIn`, imports)
3. Check injection context and timing
4. Use DevTools and logging to investigate
5. Simplify and isolate the problem

For a deeper understanding of specific topics on dependency injection, check out:

- [Understanding dependency injection](guide/di/overview) - Core DI concepts and patterns
- [Hierarchical dependency injection](guide/di/hierarchical) - How the injector hierarchy works
- [Testing with dependency injection](guide/testing) - Using TestBed and mocking dependencies
