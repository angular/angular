# Debugging and troubleshooting dependency injection

Dependency injection (DI) issues typically stem from configuration mistakes, scope problems, or incorrect usage patterns. This guide helps you identify and resolve common DI problems that developers encounter.

## Common pitfalls and solutions

### Services not available where expected

One of the most common DI issues occurs when you try to inject a service but Angular cannot find it in the current injector or any parent injector. This usually happens when the service is provided in the wrong scope or not provided at all.

#### Provider scope mismatch

When you provide a service in a component's `providers` array, Angular creates an instance in that component's injector. This instance is only available to that component and its children. Parent components and sibling components cannot access it because they use different injectors.

```angular-ts {header: 'child-view.ts'}
import {Component} from '@angular/core';
import {DataStore} from './data-store';

@Component({
  selector: 'app-child',
  template: '<p>Child</p>',
  providers: [DataStore], // Only available in this component and its children
})
export class ChildView {}
```

```angular-ts {header: 'parent-view.ts'}
import {Component, inject} from '@angular/core';
import {DataStore} from './data-store';

@Component({
  selector: 'app-parent',
  template: '<app-child />',
})
export class ParentView {
  private dataService = inject(DataStore); // ERROR: Not available to parent
}
```

Angular only searches up the hierarchy, never down. Parent components cannot access services provided in child components.

**Solution:** Provide the service at a higher level (application or parent component).

```ts {prefer}
import {Injectable} from '@angular/core';

@Injectable({providedIn: 'root'})
export class DataStore {
  // Available everywhere
}
```

TIP: Use `providedIn: 'root'` by default for services that don't need component-specific state. This makes services available everywhere and enables tree-shaking.

#### Services and lazy-loaded routes

When you provide a service in a lazy-loaded route's `providers` array, Angular creates a child injector for that route. This injector and its services only become available after the route loads. Components in the eagerly-loaded parts of your application cannot access these services because they use different injectors that exist before the lazy-loaded injector is created.

```ts {header: 'feature.routes.ts'}
import {Routes} from '@angular/router';
import {FeatureClient} from './feature-client';

export const featureRoutes: Routes = [
  {
    path: 'feature',
    providers: [FeatureClient],
    loadComponent: () => import('./feature-view'),
  },
];
```

```angular-ts {header: 'eager-view.ts'}
import {Component, inject} from '@angular/core';
import {FeatureClient} from './feature-client';

@Component({
  selector: 'app-eager',
  template: '<p>Eager Component</p>',
})
export class EagerView {
  private featureService = inject(FeatureClient); // ERROR: Not available yet
}
```

Lazy-loaded routes create child injectors that are only available after the route loads.

NOTE: By default, route injectors and their services persist even after navigating away from the route. They are not destroyed until the application is closed. For automatic cleanup of unused route injectors, see [customizing route behavior](guide/routing/customizing-route-behavior#experimental-automatic-cleanup-of-unused-route-injectors).

**Solution:** Use `providedIn: 'root'` for services that need to be shared across lazy boundaries.

```ts {prefer, header: 'Provide at root for shared services'}
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

```angular-ts {avoid, header: 'Component-level provider creates multiple instances'}
import {Component, inject} from '@angular/core';
import {UserClient} from './user-client';

@Component({
  selector: 'app-profile',
  template: '<p>Profile</p>',
  providers: [UserClient], // Creates new instance per component!
})
export class UserProfile {
  private userService = inject(UserClient);
}

@Component({
  selector: 'app-settings',
  template: '<p>Settings</p>',
  providers: [UserClient], // Different instance!
})
export class UserSettings {
  private userService = inject(UserClient);
}
```

Each component gets its own `UserClient` instance. Changes in one component don't affect the other.

**Solution:** Use `providedIn: 'root'` for singletons.

```ts {prefer, header: 'Root-level singleton'}
import {Injectable} from '@angular/core';

@Injectable({providedIn: 'root'})
export class UserClient {
  // Single instance shared across all components
}
```

#### When multiple instances are intentional

Sometimes you want separate instances per component for component-specific state.

```angular-ts {header: 'Intentional: Component-scoped state'}
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
export class UserForm {
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

```angular-ts {avoid, header: 'inject() in ngOnInit'}
import {Component, inject} from '@angular/core';
import {UserClient} from './user-client';

@Component({
  selector: 'app-profile',
  template: '<p>User: {{userName}}</p>',
})
export class UserProfile {
  userName = '';

  ngOnInit() {
    const userService = inject(UserClient); // ERROR: Not an injection context
    this.userName = userService.getUser().name;
  }
}
```

**Solution:** Capture dependencies and derive values in field initializers.

```angular-ts {prefer, header: 'Derive values in field initializers'}
import {Component, inject} from '@angular/core';
import {UserClient} from './user-client';

@Component({
  selector: 'app-profile',
  template: '<p>User: {{userName}}</p>',
})
export class UserProfile {
  private userService = inject(UserClient);
  userName = this.userService.getUser().name;
}
```

#### Using the Injector for deferred injection

When you need to retrieve services outside an injection context, use the captured `Injector` directly with `injector.get()`:

```angular-ts
import {Component, inject, Injector} from '@angular/core';
import {UserClient} from './user-client';

@Component({
  selector: 'app-profile',
  template: '<button (click)="delayedLoad()">Load Later</button>',
})
export class UserProfile {
  private injector = inject(Injector);

  delayedLoad() {
    setTimeout(() => {
      const userService = this.injector.get(UserClient);
      console.log(userService.getUser());
    }, 1000);
  }
}
```

#### Using runInInjectionContext for callbacks

Use `runInInjectionContext()` when you need to enable **other code** to call `inject()`. This is useful when accepting callbacks that might use dependency injection:

```angular-ts
import {Component, inject, Injector, input} from '@angular/core';

@Component({
  selector: 'app-data-loader',
  template: '<button (click)="load()">Load</button>',
})
export class DataLoader {
  private injector = inject(Injector);
  onLoad = input<() => void>();

  load() {
    const callback = this.onLoad();
    if (callback) {
      // Enable the callback to use inject()
      this.injector.runInInjectionContext(callback);
    }
  }
}
```

The `runInInjectionContext()` method creates a temporary injection context, allowing code inside the callback to call `inject()`.

IMPORTANT: Always capture dependencies at the class level when possible. Use `injector.get()` for simple deferred retrieval, and `runInInjectionContext()` only when external code needs to call `inject()`.

TIP: Use `assertInInjectionContext()` to verify your code is running in a valid injection context. This is useful when creating reusable functions that call `inject()`. See [Asserting the context](guide/di/dependency-injection-context#asserts-the-context) for details.

### providers vs viewProviders confusion

The difference between `providers` and `viewProviders` affects content projection scenarios.

#### Understanding the difference

**providers:** Available to the component's template AND any content projected into the component (ng-content).

**viewProviders:** Only available to the component's template, NOT to projected content.

```angular-ts {header: 'parent-view.ts'}
import {Component, inject} from '@angular/core';
import {ThemeStore} from './theme-store';

@Component({
  selector: 'app-parent',
  template: `
    <div>
      <p>Theme: {{ themeService.theme() }}</p>
      <ng-content />
    </div>
  `,
  providers: [ThemeStore], // Available to content children
})
export class ParentView {
  protected themeService = inject(ThemeStore);
}

@Component({
  selector: 'app-parent-view',
  template: `
    <div>
      <p>Theme: {{ themeService.theme() }}</p>
      <ng-content />
    </div>
  `,
  viewProviders: [ThemeStore], // NOT available to content children
})
export class ParentViewOnly {
  protected themeService = inject(ThemeStore);
}
```

```angular-ts {header: 'child-view.ts'}
import {Component, inject} from '@angular/core';
import {ThemeStore} from './theme-store';

@Component({
  selector: 'app-child',
  template: '<p>Child theme: {{theme()}}</p>',
})
export class ChildView {
  private themeService = inject(ThemeStore, {optional: true});
  theme = () => this.themeService?.theme() ?? 'none';
}
```

```angular-ts {header: 'app.ts'}
@Component({
  selector: 'app-root',
  template: `
    <app-parent>
      <app-child />
      <!-- Can access ThemeStore -->
    </app-parent>

    <app-parent-view>
      <app-child />
      <!-- Cannot access ThemeStore -->
    </app-parent-view>
  `,
})
export class App {}
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

```ts {header: 'config.token.ts'}
import {InjectionToken} from '@angular/core';

export interface AppConfig {
  apiUrl: string;
}

export const APP_CONFIG = new InjectionToken<AppConfig>('app config');
```

```ts {header: 'app.config.ts'}
import {APP_CONFIG} from './config.token';

export const appConfig: AppConfig = {
  apiUrl: 'https://api.example.com',
};

bootstrapApplication(App, {
  providers: [{provide: APP_CONFIG, useValue: appConfig}],
});
```

```angular-ts {avoid, header: 'feature-view.ts'}
// Creating new token with same description
import {InjectionToken, inject} from '@angular/core';
import {AppConfig} from './config.token';

const APP_CONFIG = new InjectionToken<AppConfig>('app config');

@Component({
  selector: 'app-feature',
  template: '<p>Feature</p>',
})
export class FeatureView {
  private config = inject(APP_CONFIG); // ERROR: Different token instance!
}
```

Even though both tokens have the description `'app config'`, they are different objects. Angular compares tokens by reference, not by description.

**Solution:** Import the same token instance.

```angular-ts {prefer, header: 'feature-view.ts'}
import {inject} from '@angular/core';
import {APP_CONFIG, AppConfig} from './config.token';

@Component({
  selector: 'app-feature',
  template: '<p>API: {{config.apiUrl}}</p>',
})
export class FeatureView {
  protected config = inject(APP_CONFIG); // Works: Same token instance
}
```

TIP: Always export tokens from a shared file and import them everywhere they're needed. Never create multiple `InjectionToken` instances with the same description.

#### Trying to inject interfaces

When you define a TypeScript interface, it only exists during compilation for type checking. TypeScript erases all interface definitions when it compiles to JavaScript, so at runtime there's no object for Angular to use as an injection token. If you try to inject an interface type, Angular has nothing to match against the provider configuration.

```angular-ts {avoid, header: 'Can't inject interface'}
interface UserConfig {
  name: string;
  email: string;
}

@Component({
  selector: 'app-profile',
  template: '<p>Profile</p>',
})
export class UserProfile {
  // ERROR: Interfaces don't exist at runtime
  constructor(private config: UserConfig) {}
}
```

**Solution:** Use `InjectionToken` for interface types.

```angular-ts {prefer, header: 'Use InjectionToken for interfaces'}
import {InjectionToken, inject} from '@angular/core';

interface UserConfig {
  name: string;
  email: string;
}

export const USER_CONFIG = new InjectionToken<UserConfig>('user configuration');

// Provide the configuration
bootstrapApplication(App, {
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
export class UserProfile {
  protected config = inject(USER_CONFIG);
}
```

The `InjectionToken` exists at runtime and can be used for injection, while the `UserConfig` interface provides type safety during development.

### Circular dependencies

Circular dependencies occur when services inject each other, creating a cycle that Angular cannot resolve. For detailed explanations and code examples, see [NG0200: Circular dependency](errors/NG0200).

**Resolution strategies** (in order of preference):

1. **Restructure** - Extract shared logic to a third service, breaking the cycle
2. **Use events** - Replace direct dependencies with event-based communication (such as `Subject`)
3. **Lazy injection** - Use `Injector.get()` to defer one dependency (last resort)

NOTE: Do not use `forwardRef()` for service circular dependencies—it only solves circular imports in standalone component configurations.

## Debugging dependency resolution

### Understanding the resolution process

Angular resolves dependencies by walking up the injector hierarchy. When a `NullInjectorError` occurs, understanding this search order helps you identify where to add the missing provider.

Angular searches in this order:

1. **Element injector** - The current component or directive
2. **Parent element injectors** - Up the DOM tree through parent components
3. **Environment injector** - The route or application injector
4. **NullInjector** - Throws `NullInjectorError` if not found

When you see a `NullInjectorError`, the service isn't provided at any level the component can access. Check that:

- The service has `@Injectable({providedIn: 'root'})`, or
- The service is in a `providers` array the component can reach

You can modify this search behavior with resolution modifiers like `self`, `skipSelf`, `host`, and `optional`. For complete coverage of resolution rules and modifiers, see the [Hierarchical injectors guide](guide/di/hierarchical-dependency-injection).

### Using Angular DevTools

Angular DevTools includes an injector tree inspector that visualizes the entire injector hierarchy and shows which providers are available at each level. For installation and general usage, see the [Angular DevTools injector documentation](tools/devtools/injectors).

When debugging DI issues, use DevTools to answer these questions:

- **Is the service provided?** Select the component that fails to inject and check if the service appears in the Injector section.
- **At what level?** Walk up the component tree to find where the service is actually provided (component, route, or application level).
- **Multiple instances?** If a singleton service appears in multiple component injectors, it's likely provided in component `providers` arrays instead of using `providedIn: 'root'`.

If a service never appears in any injector, verify it has the `@Injectable()` decorator with `providedIn: 'root'` or is listed in a `providers` array.

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

#### Checking service availability

Use optional injection with logging to determine if a service is available.

```angular-ts
import {Component, inject} from '@angular/core';
import {UserClient} from './user-client';

@Component({
  selector: 'app-debug',
  template: '<p>Debug Component</p>',
})
export class DebugView {
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

```angular-ts
import {Component, inject} from '@angular/core';
import {UserClient} from './user-client';

@Component({
  selector: 'app-debug',
  template: '<p>Debug Component</p>',
  providers: [UserClient],
})
export class DebugView {
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
  Dependency path: App -> AuthClient -> UserClient
```

The dependency path shows that `App` injected `AuthClient`, which tried to inject `UserClient`, but no provider was found.

#### Missing @Injectable decorator

The most common cause is forgetting the `@Injectable()` decorator on a service class.

```ts {avoid, header: 'Missing decorator'}
export class UserClient {
  getUser() {
    return {name: 'Alice'};
  }
}
```

Angular requires the `@Injectable()` decorator to generate the metadata needed for dependency injection.

```ts {prefer, header: 'Include @Injectable'}
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

```ts {avoid, header: 'No providedIn specified'}
import {Injectable} from '@angular/core';

@Injectable()
export class UserClient {
  getUser() {
    return {name: 'Alice'};
  }
}
```

Specify `providedIn: 'root'` to make the service available throughout your application.

```ts {prefer, header: 'Specify providedIn'}
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

```angular-ts {avoid, header: 'Missing service import'}
import {Component, inject} from '@angular/core';
import {UserClient} from './user-client';

@Component({
  selector: 'app-profile',
  template: '<p>User: {{user().name}}</p>',
})
export class UserProfile {
  private userService = inject(UserClient); // ERROR: No provider
  user = this.userService.getUser();
}
```

Ensure the service uses `providedIn: 'root'` or add it to the component's `providers` array.

```angular-ts {prefer, header: 'Service uses providedIn: root'}
import {Component, inject} from '@angular/core';
import {UserClient} from './user-client';

@Component({
  selector: 'app-profile',
  template: '<p>User: {{user().name}}</p>',
})
export class UserProfile {
  private userService = inject(UserClient); // Works: providedIn: 'root'
  user = this.userService.getUser();
}
```

#### Debugging with the dependency path

The dependency path in the error message shows the chain of injections that led to the failure.

```
NullInjectorError: No provider for LoggerStore!
  Dependency path: App -> DataStore -> ApiClient -> LoggerStore
```

This path tells you:

1. `App` injected `DataStore`
2. `DataStore` injected `ApiClient`
3. `ApiClient` tried to inject `LoggerStore`
4. No provider for `LoggerStore` was found

Start your investigation at the end of the chain (`LoggerStore`) and verify it has proper configuration.

#### Checking provider availability with optional injection

Use optional injection to check if a provider exists without throwing an error.

```angular-ts
import {Component, inject} from '@angular/core';
import {UserClient} from './user-client';

@Component({
  selector: 'app-debug',
  template: '<p>Service available: {{serviceAvailable}}</p>',
})
export class DebugView {
  private userService = inject(UserClient, {optional: true});
  serviceAvailable = this.userService !== null;
}
```

Optional injection returns `null` if no provider is found, allowing you to handle the absence gracefully.

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

   ```angular-ts
   import {Component, inject} from '@angular/core';
   import {UserClient} from './user-client';

   @Component({
     selector: 'app-profile',
     template: '<p>User: {{user().name}}</p>',
   })
   export class UserProfile {
     private userService = inject(UserClient); // Valid
     user = this.userService.getUser();
   }
   ```

2. **Class constructor**

   ```angular-ts
   import {Component, inject} from '@angular/core';
   import {UserClient} from './user-client';

   @Component({
     selector: 'app-profile',
     template: '<p>User: {{user().name}}</p>',
   })
   export class UserProfile {
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

   ```angular-ts
   import {Component, inject, Injector} from '@angular/core';
   import {UserClient} from './user-client';

   @Component({
     selector: 'app-profile',
     template: '<button (click)="loadUser()">Load User</button>',
   })
   export class UserProfile {
     private injector = inject(Injector);

     loadUser() {
       this.injector.runInInjectionContext(() => {
         const userService = inject(UserClient); // Valid
         console.log(userService.getUser());
       });
     }
   }
   ```

Other injection contexts that `inject()` also works in include:

- [provideAppInitializer](api/core/provideAppInitializer)
- [provideEnvironmentInitializer](api/core/provideEnvironmentInitializer)
- Functional [route guards](guide/routing/route-guards)
- Functional [data resolvers](guide/routing/data-resolvers)

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

For detailed explanations and solutions for these errors, see the [Angular error reference](errors):

| Error Code              | Description                                                                                |
| ----------------------- | ------------------------------------------------------------------------------------------ |
| [NG0204](errors/NG0204) | Can't resolve all parameters - missing `@Injectable()` decorator                           |
| [NG0205](errors/NG0205) | Injector already destroyed - accessing services after component destruction                |
| [NG0207](errors/NG0207) | EnvironmentProviders in wrong context - using `provideHttpClient()` in component providers |

## Next steps

When you encounter DI errors, remember to:

1. Read the error message and dependency path carefully
2. Verify basic configuration (decorators, `providedIn`, imports)
3. Check injection context and timing
4. Use DevTools and logging to investigate
5. Simplify and isolate the problem

For a deeper understanding of specific topics on dependency injection, check out:

- [Understanding dependency injection](guide/di) - Core DI concepts and patterns
- [Hierarchical dependency injection](guide/di/hierarchical-dependency-injection) - How the injector hierarchy works
- [Testing with dependency injection](guide/testing) - Using TestBed and mocking dependencies
