# Providing other dependencies

When [creating and using services](guide/di/creating-and-using-services), you typically import the class you want to provide as a service and include it directly in the array.

```ts
import { Component } from '@angular/core';
import { BasicDataService } from '../basic-data-service';

@Component({
 selector: 'app-template',
 providers: [ BasicDataService ]
})
export class TemplateComponent {
 // ...
}
```

What you might not know however, is that this is actually a shorthand for how providers are configured in Angular's dependency injection system.

```ts
{
  // This is the shorthand version
  providers: [ BasicDataService ],

  // This is the full version
  providers: [
    { provide: BasicDataService, useClass: BasicDataService}
  ]
}
```

Let's dive deeper into what's going on behind the scenes.

## Understanding the provider configuration object

There are two primary parts to every provider configuration object:

1. **Provider token**: The unique ID that Angular uses to fetch the dependency and is configured via the provide key.
2. **Value**: The actual dependency that you want Angular to fetch. This is configured with a different key (i.e., useClass, useValue, etc.) based on the desired type of dependency. We will cover this more in-depth on in the guide.

For detailed information about all provider types, see the [Provider types](api/core/Provider) in the API documentation.

### Provider token: the dependency's ID

Provider tokens allow Angular to retrieve a dependency through a unique ID.

You can generate provider tokens in two ways:

1. JavaScript class names
2. Injection tokens

#### JavaScript class names

This approach uses the imported class directly as the ID:

```ts
import { Component } from '@angular/core';
import { BasicDataService } from '../basic-data-service';

@Component({
selector: 'app-template',
providers: [
  { provide: BasicDataService, useClass: BasicDataService }
]
})
export class TemplateComponent { /* ... */ }
```

In our earlier example, the `BasicDataService` class serves as the identifier for the dependency.

You may notice that the class also serves as the value in the `useClass` key, which explains why Angular provides a shorthand when providing class dependencies:

```ts
import { Component } from '@angular/core';
import { BasicDataService } from '../basic-data-service';

@Component({
selector: 'app-template',
providers: [ BasicDataService ]
})
export class TemplateComponent { /* ... */ }
```

#### Injection Tokens

Angular provides a built-in [`InjectionToken`](api/core/InjectionToken) class that generates a unique ID for its dependency injection system.

Using the previous example of `BasicDataService`, let's switch the identifier to use an injection token instead of the class name.

First step, we'll need to create an injection token:

```ts
// 📁 /app/tokens.ts
import { InjectionToken } from '@angular/core';

export const BasicDataToken = new InjectionToken<string>('BASIC_DATA_SERVICE')
```

Next, import the token and replace the class name with the token:

```ts
import { Component } from '@angular/core';
import { BasicDataService } from '../basic-data-service';
import { BasicDataToken } from '../app/tokens'

@Component({
  selector: 'app-template',
  providers: [
    { provide: BasicDataToken, useClass: BasicDataService }
  ]
})
export class TemplateComponent { /* ... */ }
```

Finally, inject the token when you want to use the dependency:

```ts
const basicDataService = inject(BasicDataToken)
```

For more information about the inject function, see the [`inject` API documentation](api/core/inject).

Here's the full code example:

```ts
import { Component, inject } from '@angular/core';
import { BasicDataToken } from '../tokens'
import { BasicDataService } from '../basic-data-service';

@Component({
  selector: 'app-template',
  providers: [
    { provide: BasicDataToken, useClass: BasicDataService}
  ]
})
export class TemplateComponent {
  private basicDataService = inject(BasicDataToken)
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

`useClass` provides a JavaScript class as a dependency. Angular uses this value by default when you use the shorthand for providing services, making it the most commonly used dependency value.

```ts
{
  // This is the shorthand version
  providers: [ BasicDataService ],

  // This is the full version
  providers: [
    { provide: BasicDataService, useClass: BasicDataService}
  ]
}
```

You can use this approach when unit testing components to provide a mock class that stubs certain functionality.

```ts
providers: [{ provide: BasicDataService, useClass: mockBasicDataService }]
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

A common example of when this useful is checking whether a user has the correct permissions before returning a certain value.

Let's expand on the `BasicDataService` example from [creating and using services](guide/di/creating-and-using-services), so it responds accordingly based on whether the user is authenticated or not.

```ts
// 📁 src/app/services/basicDataService.ts
@Injectable({
  providedIn: 'root'
})
export class BasicDataService {
  private data: string[] = []

  constructor(private isAuthenticated: boolean) {}

  addData(item: string): void | string {
    if (this.isAuthenticated) {
      this.data.push(item)
    } else {
      return 'User is not authenticated.'
    }
  }

  getData(): string[] | string {
    if (this.isAuthenticated) {
      return [...this.data]
    } else {
      return 'User is not authenticated.'
    }
  }
}
```

Next, let's assume an `AuthService` service already exists that dynamically checks whether a user has logged in. You can then construct a basic factory function:

```ts
// 📁 app/services/basicDataServiceFactory.ts
import { AuthService } from './AuthService';
import { BasicDataService } from './BasicDataService';

export const basicDataServiceFactory = (authService: AuthService) =>
  new BasicDataService(authService.isAuthorized);
```

Finally, instead of providing a class, use the `useFactory` provider key and pass it the newly created `basicDataServiceFactory` function.

```ts
import { basicDataServiceFactory } from './src/services/basicDataService.factory';
import { AuthService } from './src/services/AuthService';

// Contextual decorator omitted for illustration purposes
{
  providers: [
    { provide: BasicDataService, useFactory: basicDataServiceFactory, deps: [AuthService] }
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
