# Providing other dependencies

In the previous guide, you learned that services with `providedIn: 'root'` are automatically available throughout your application. However, there are many scenarios where you need more control over how dependencies are provided:

- Providing services without `providedIn`
- Providing non-class dependencies (configuration values, functions, etc.)
- Creating different instances for different contexts
- Replacing implementations for testing

When manually providing dependencies, you typically see this shorthand syntax:

```ts
import { Component } from '@angular/core';
import { LocalService } from './local-service';

@Component({
  selector: 'app-example',
  providers: [LocalService]  // Service without providedIn
})
export class ExampleComponent { }
```

What you might not know is that this is actually a shorthand for a more detailed provider configuration:

```ts
{
  // This is the shorthand version
  providers: [LocalService],

  // This is the full version
  providers: [
    { provide: LocalService, useClass: LocalService }
  ]
}
```

Let's dive deeper into what's going on behind the scenes.

## Understanding the provider configuration object

Think of Angular's dependency injection system as a hash map (or dictionary). Each provider configuration object defines a key-value pair:

- **Key**: The token you use to request a dependency
- **Value**: What Angular should return when that token is requested

There are two primary parts to every provider configuration object:

1. **Provider token**: The unique key that Angular uses to get the dependency and is set via the `provide` property.
2. **Value**: The actual dependency that you want Angular to fetch. This is configured with a different key (i.e., useClass, useValue, etc.) based on the desired type of dependency. The following section covers these options in more detail.

For detailed information about all provider types, see the [Provider types](api/core/Provider) in the API documentation.

### Provider token: the dependency's ID

Provider tokens allow Angular's dependency injection (DI) system to retrieve a dependency through a unique ID.

You can generate provider tokens in two ways:

1. **Class name tokens**: These are the most common tokens because they are automatically defined for you when using classes.
2. **Injection tokens**: A special Angular class used for generating a unique identifier for non-class dependencies (like configuration values).

CRITICAL: DI can technically accept a string token, but it is generally not recommended due to being less type-safe and prone to human error.

#### Class name tokens

Class name tokens use the imported class directly as the ID:

```ts
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { LocalService } from './local-service';

@Component({
  selector: 'app-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: LocalService, useClass: LocalService }
  ]
})
export class ExampleComponent { /* ... */ }
```

In this example, the `LocalService` class serves as both the identifier (token) and the implementation for the dependency.

You may notice that the class also serves as the value in the `useClass` key, which explains why Angular provides a shorthand when providing class dependencies:

```ts
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { LocalService } from './local-service';

@Component({
  selector: 'app-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [LocalService]
})
export class ExampleComponent { /* ... */ }
```

#### Injection tokens

Angular provides a built-in [`InjectionToken`](api/core/InjectionToken) class that creates a unique object reference for its dependency injection system. Angular uses object reference equality (`===`) to match tokens when resolving dependencies.

Injection tokens are particularly useful for non-class dependencies or when you want to provide multiple implementations of the same interface.

Let's create an injection token for a data service:

```ts
// 📁 /app/tokens.ts
import { InjectionToken } from '@angular/core';
import { DataService } from './data-service.interface';

export const DATA_SERVICE_TOKEN = new InjectionToken<DataService>('DataService');
```

Note: The string `'DataService'` is a description used for debugging purposes. Angular identifies the token by its object reference, not this string.

Next, import the token and replace the class name with the token:

```ts
import { Component } from '@angular/core';
import { LocalDataService } from './local-data-service';
import { DATA_SERVICE_TOKEN } from './tokens';

@Component({
  selector: 'app-example',
  providers: [
    { provide: DATA_SERVICE_TOKEN, useClass: LocalDataService }
  ]
})
export class ExampleComponent { /* ... */ }
```

Finally, inject the token when you want to use the dependency:

```ts
const dataService = inject(DATA_SERVICE_TOKEN);
```

For more information about the inject function, see the [`inject` API documentation](api/core/inject).

Here's the full code example:

```ts
import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { DATA_SERVICE_TOKEN } from './tokens';
import { LocalDataService } from './local-data-service';

@Component({
  selector: 'app-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: DATA_SERVICE_TOKEN, useClass: LocalDataService }
  ]
})
export class ExampleComponent {
  private dataService = inject(DATA_SERVICE_TOKEN);
}
```

For more information about injection tokens, see the [`InjectionToken` API documentation](api/core/InjectionToken).

## The Dependency Value

Angular provides four different values for its dependency injection system:

1. useClass
2. useValue
3. useFactory
4. useExisting

### useClass

`useClass` provides a JavaScript class as a dependency. Angular uses this value by default when you use the shorthand syntax for services without `providedIn`.

```ts
// For a service without providedIn
@Injectable()
export class DataService { }

{
  // This is the shorthand version
  providers: [DataService],

  // This is the full version
  providers: [
    { provide: DataService, useClass: DataService }
  ]
}
```

The real power of `useClass` comes when you want to provide a different implementation:

```ts
// Provide a mock for testing
providers: [
  { provide: DataService, useClass: MockDataService }
]

// Provide environment-specific implementations
providers: [
  {
    provide: StorageService,
    useClass: environment.production ? CloudStorageService : LocalStorageService
  }
]
```

If you want to manually provide your own ID for the class instead of the shorthand, see the [Injection Tokens](#injection-tokens) section.

For more information about class providers, see the [`ClassProvider` API documentation](api/core/ClassProvider).

### useValue

`useValue` allows you to provide any standard JavaScript data type as a static value dependency. It is always paired with an injection token as the identifier.

```ts
[
  { provide: STRING_TOKEN, useValue: 'api.domain.com' },
  { provide: NUMBER_TOKEN, useValue: 4200 },
  { provide: BOOLEAN_TOKEN, useValue: true },
  { provide: ARRAY_TOKEN, useValue: [1, 1, 3, 5, 8, 13] },
  { provide: OBJECT_TOKEN, useValue: { word: 'Grakappan', pronunciation: 'glokschuppen' } },
  { provide: SYMBOL_TOKEN, useValue: new Symbol('💧') }
]
```

IMPORTANT: TypeScript types and interfaces cannot serve as dependency values. Types and interfaces exist only at compile-time and lack runtime representation or tokens that the DI framework can use.

For more information about value providers, see the [`ValueProvider` API documentation](api/core/ValueProvider).

### useFactory

`useFactory` lets you provide a function that generates a new value for injection as a dependency. This approach offers the advantage of generating dynamic values based on different contexts.

A common example of when this is useful is checking whether a user has the correct permissions before returning a certain value.

Let's create a service that needs to be configured differently based on the environment:

```ts
// 📁 src/app/services/logger.service.ts
@Injectable()  // No providedIn - will be provided manually
export class LoggerService {
  private level = inject(LOGGER_LEVEL_TOKEN);
  private endpoint = inject(LOGGER_ENDPOINT_TOKEN, { optional: true });

  log(message: string) {
    if (this.level === 'debug') {
      console.log(`[DEBUG] ${message}`);
    }

    if (this.endpoint) {
      // Send to remote endpoint
      fetch(this.endpoint, {
        method: 'POST',
        body: JSON.stringify({ message, level: this.level })
      });
    }
  }
}
```

Now let's create a factory function that configures the logger based on the environment:

```ts
// 📁 app/factories/logger.factory.ts
import { LoggerService } from '../services/logger.service';

export const loggerFactory = (environment: { production: boolean; logEndpoint?: string }) => {
  const level = environment.production ? 'error' : 'debug';
  const endpoint = environment.production ? environment.logEndpoint : undefined;

  return new LoggerService(level, endpoint);
};
```

Finally, instead of providing a class, use the `useFactory` provider key with the factory function:

```ts
import { loggerFactory } from './factories/logger.factory';
import { ENVIRONMENT_TOKEN } from './tokens';

// In your component or application config
{
  providers: [
    { provide: ENVIRONMENT_TOKEN, useValue: environment },
    { provide: LoggerService, useFactory: loggerFactory, deps: [ENVIRONMENT_TOKEN] }
  ]
}
```

#### Factory dependencies with the `deps` array

The `useFactory` key also lets you add arguments to the factory function by adding them to the `deps` key, which takes an array of provider tokens.

```ts
// Multiple dependencies example
export const complexServiceFactory = (logger: Logger, config: AppConfig, userService: UserService) => {
  return new ComplexService(logger, config, userService.isAdmin);
};

{
  providers: [
    {
      provide: ComplexService,
      useFactory: complexServiceFactory,
      deps: [Logger, APP_CONFIG_TOKEN, UserService]
    }
  ]
}
```

The injector resolves these tokens and injects the corresponding services into the matching factory function parameters based on the order you specify in the `deps` array.

#### Optional dependencies in factories

You can also mark dependencies as optional by wrapping them in an array with the `Optional` decorator:

```ts
import { Optional } from '@angular/core';

export const optionalServiceFactory = (required: RequiredService, optional?: OptionalService) => {
  return new MyService(required, optional || new DefaultService());
};

{
  providers: [
    {
      provide: MyService,
      useFactory: optionalServiceFactory,
      deps: [RequiredService, [new Optional(), OptionalService]]
    }
  ]
}
```

For more information about the Optional decorator, see the [`Optional` API documentation](api/core/Optional).

For more information about factory providers, see the [`FactoryProvider` API documentation](api/core/FactoryProvider).

### useExisting

`useExisting` lets you create an alias for an existing provider. Both the original token and the alias token return the same instance.

This is particularly useful when you need to provide the same service under multiple tokens, such as when supporting legacy APIs or providing multiple interfaces for the same service.

```ts
// Create an alias where OldLogger points to NewLogger
{
  providers: [
    NewLogger,  // The actual service
    { provide: OldLogger, useExisting: NewLogger }  // The alias
  ]
}
```

IMPORTANT: Don't confuse `useExisting` with `useClass`. Using `useClass` would create separate instances, while `useExisting` ensures you get the same singleton instance.

```ts
// ❌ Wrong - creates two different instances
{ provide: OldLogger, useClass: NewLogger }

// ✅ Correct - both tokens return the same instance
{ provide: OldLogger, useExisting: NewLogger }
```

For more information about existing providers, see the [`ExistingProvider` API documentation](api/core/ExistingProvider).

## Multiple providers

Sometimes you need multiple providers to contribute values to the same token. You can achieve this using the `multi: true` flag.

```ts
// Multiple HTTP interceptors
{
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: LoggingInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: RetryInterceptor, multi: true }
  ]
}
```

When you inject `HTTP_INTERCEPTORS`, you'll receive an array containing instances of all three interceptors.

This pattern is commonly used for:

- HTTP interceptors
- Route guards
- Validators
- Event listeners
- Plugin systems

For more information about multi providers, see the [Provider interfaces](api/core/Provider) in the API documentation.

## Choosing where to provide dependencies

A critical decision when working with dependency injection is determining **where** to provide your dependencies. Angular offers several levels where you can register providers, each with different implications for scope, lifecycle, and performance.

### Application-level providers (bootstrapApplication)

Use application-level providers in `bootstrapApplication` when:

- **The service is used across multiple feature areas** - Services like HTTP clients, logging, or authentication that many parts of your app need
- **You want a true singleton** - One instance shared by the entire application
- **The service has no component-specific configuration** - General-purpose utilities that work the same everywhere
- **You're providing global configuration** - API endpoints, feature flags, or environment settings

```ts
// main.ts
bootstrapApplication(AppComponent, {
  providers: [
    { provide: API_BASE_URL, useValue: 'https://api.example.com' },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    LoggingService,  // Used throughout the app
    { provide: ErrorHandler, useClass: GlobalErrorHandler }
  ]
});
```

**Benefits:**

- Single instance reduces memory usage
- Available everywhere without additional setup
- Easier to manage global state

**Drawbacks:**

- Always included in bundle (no tree-shaking benefit)
- Cannot be easily customized per feature
- Harder to test individual components in isolation

### Component/Directive-level providers

Use component or directive providers when:

- **The service has component-specific state** - Form validators, component-specific caches, or UI state managers
- **You need isolated instances** - Each component needs its own copy of the service
- **The service is only used by one component tree** - Specialized services that don't need global access
- **You're creating reusable components** - Components that should work independently with their own services

```ts
// Specialized form component with its own validation service
@Component({
  selector: 'app-advanced-form',
  providers: [
    FormValidationService,  // Each form gets its own validator
    { provide: FORM_CONFIG, useValue: { strictMode: true } }
  ]
})
export class AdvancedFormComponent { }

// Modal component with isolated state management
@Component({
  selector: 'app-modal',
  providers: [
    ModalStateService  // Each modal manages its own state
  ]
})
export class ModalComponent { }
```

**Benefits:**

- Better encapsulation and isolation
- Easier to test components individually
- Can be tree-shaken if component isn't used
- Multiple instances can coexist with different configurations

**Drawbacks:**

- New instance created for each component (higher memory usage)
- No shared state between components
- Must be provided wherever needed

### Route-level providers

Use route-level providers for:

- **Feature-specific services** - Services only needed for particular routes or feature modules
- **Lazy-loaded module dependencies** - Services that should only load with specific features
- **Route-specific configuration** - Settings that vary by application area

```ts
// routes.ts
export const routes: Routes = [
  {
    path: 'admin',
    providers: [
      AdminService,  // Only loaded with admin routes
      { provide: FEATURE_FLAGS, useValue: { adminMode: true } }
    ],
    loadChildren: () => import('./admin/admin.routes')
  },
  {
    path: 'shop',
    providers: [
      ShoppingCartService,  // Isolated shopping state
      PaymentService
    ],
    loadChildren: () => import('./shop/shop.routes')
  }
];
```

### Decision framework

Ask yourself these questions when choosing provider level:

1. **Scope**: Who needs access to this service?
   - Entire app → Application-level
   - Single component tree → Component-level
   - Specific feature → Route-level

2. **State**: Should instances be shared or isolated?
   - Shared state → Application-level
   - Isolated state → Component-level

3. **Lifecycle**: When should the service be created and destroyed?
   - App lifetime → Application-level
   - Component lifetime → Component-level
   - Route lifetime → Route-level

4. **Bundle size**: Is this service always needed?
   - Always needed → Application-level
   - Conditionally needed → Component/Route-level
