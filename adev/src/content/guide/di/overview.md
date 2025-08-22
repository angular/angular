<docs-decorative-header title="Dependency injection in Angular" imgSrc="adev/src/assets/images/dependency_injection.svg"> <!-- markdownlint-disable-line -->

Dependency Injection (DI) is a design pattern used to organize and share code across an application.
</docs-decorative-header>

TIP: Check out Angular's [Essentials](essentials/dependency-injection) before diving into this comprehensive guide.

As an application grows, developers often need to reuse and share features across different parts of the codebase. [Dependency Injection (DI)](https://en.wikipedia.org/wiki/Dependency_injection) is a design pattern used to organize and share code across an application by allowing you to "inject" features into different parts.

Dependency injection is a popular pattern because it allows developers to address common challenges such as:

- **Improved code maintainability**: Dependency injection allows cleaner separation of concerns which enables easier refactoring and reducing code duplication.
- **Scalability**: Modular functionality can be reused across multiple contexts and allows for easier scaling.
- **Better testing**: DI allows unit tests to easily use [test doubles](https://en.wikipedia.org/wiki/Test_double) for situations when using a real implementation is not practical.

## How does dependency injection work in Angular?

A dependency is any object, value, function or service that a class needs to work but does not create itself. In other words, it creates a relationship between different parts of your application since it wouldn't work without the dependency.

There are two ways that code interacts with any dependency injection system:

- Code can _provide_, or makes available, values.
- Code can _inject_, or ask for, those values as dependencies.

"Values," in this context, can be any JavaScript value, including objects and functions. Common types of injected dependencies include:

- **Configuration values**: Environment-specific constants, API URLs, feature flags, etc.
- **Factories**: Functions that create objects or values based on runtime conditions
- **Services**: Classes that provide common functionality, business logic, or state

Angular components and directives automatically participate in DI, meaning that they can inject dependencies _and_ they are available to be injected.

## What are services?

An Angular _service_ is a TypeScript class decorated with `@Injectable`, which makes an instance of the class available to be injected as a dependency. Services are the most common way of sharing data and functionality across an application.

Common types of services include:

- **Data clients:** Abstracts the details of making requests to a server for data retrieval and mutation
- **State management:** Defines state shared across multiple components or pages
- **Authentication and authorization:** Manages user authentication, token storage, and access control
- **Logging and error handling:** Establishes a common API for logging or communicating error states to the user
- **Event handling and dispatch:** Handles events or notifications that are not associated with a specific component, or for dispatching events and notifications to components, following the [observer pattern](https://en.wikipedia.org/wiki/Observer_pattern)
- **Utility functions:** Offers reusable utility functions like data formatting, validation, or calculations

The following example declares a service named `AnalyticsLogger`:

```ts
@Injectable({ providedIn: 'root' })
export class AnalyticsLogger {
  trackEvent(category: string, value: string) {
    console.log('Analytics event logged:', {
      category,
      value,
      timestamp: new Date().toISOString()
    })
  }
}
```

NOTE: The `providedIn: 'root'` option controls where this service is available for injection. See [defining a service's scope](guide/di/creating-and-using-services#configuring-a-services-scope) for details.

## Injecting dependencies with `inject()`

You can inject dependencies using Angular's `inject()` function.

Here is an example of a navigation bar that injects `AnalyticsLogger` and Angular `Router` service to allow users to navigate to a different page while tracking the event.

```angular-ts
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AnalyticsLogger } from './analytics-logger';

@Component({
  selector: 'app-navbar',
  template: `
    <a href="#" (click)="navigateToDetail($event)">Detail Page</a>
  `,
})
export class NavbarComponent {
  private router = inject(Router);
  private analytics = inject(AnalyticsLogger);

  navigateToDetail(event: Event) {
    event.preventDefault();
    this.analytics.trackEvent('navigation', '/details');
    this.router.navigate(['/details']);
  }
}
```

### Where can `inject()` be used?

You can inject dependencies during construction of a component, directive, or service. The call to `inject` can appear in either the `constructor` or in a field initializer. Here are some common examples:

```ts
@Component({...})
export class MyComponent {
  // ✅ In class field initializer
  private service = inject(MyService);

  // ✅ In constructor
  constructor() {
    private service = inject(MyService);
  }
}
```

```ts
@Directive({...})
export class MyDirective {
  // ✅ In class field initializer
  private element = inject(ElementRef);
}
```

```ts
@Injectable()
export class MyService {
  // ✅ In a service
  private http = inject(HttpClient);
}
```

```ts
export const authGuard = () => {
  // ✅ In a route guard
  const auth = inject(AuthService);
  return auth.isAuthenticated();
}
```

Angular uses the term "injection context" to describe any place in your code where you can call `inject`. While component, directive, and service construction is the most common, see [injection contexts](/guide/di/dependency-injection-context) for more details.

For more information, see the [inject API docs](api/core/inject#usage-notes).

## Next steps

Now that you understand the fundamentals of dependency injection in Angular, let's take a look at [how to create and use services in an application](guide/di/creating-and-using-services).
