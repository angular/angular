<docs-decorative-header title="Dependency injection in Angular" imgSrc="adev/src/assets/images/dependency_injection.svg"> <!-- markdownlint-disable-line -->

Dependency Injection (DI) is a design pattern used to organize and share code across an application.
</docs-decorative-header>

TIP: Check out Angular's [Essentials](essentials/dependency-injection) before diving into this comprehensive guide.

As an application grows, developers often need to reuse and share features across different parts of the codebase. Dependency Injection (DI) is a design pattern used to organize and share code across an application by allowing you to "inject" features into different parts.

Dependency injection is a popular pattern because it allows developers to address common challenges such as:

1. **Improved code maintainability**: Dependency injection allows cleaner separation of concerns which enables easier refactoring and reducing code duplication.
2. **Scalability**: Modular functionality can be reused across multiple contexts and allows for easier scaling.
3. **Better testing**: DI allows unit tests to inject mock dependencies which can improve performance and make test coverage more comprehensive since things can be tested independently.

## How does dependency injection (DI) work in Angular?

Angular has a built-in dependency injection (DI) system that is designed to be powerful and flexible. It is built upon five core concepts:

- [Services](#services)
- [Dependencies](#dependencies)
- [Providers vs Consumers](#providers-vs-consumers)
- [Injectors](#injectors)
  - [`inject()`](#inject)
- [Tokens](#tokens)

### Services

A service is a JavaScript class in Angular that is typically used to share data or functionality across components, handle business logic, or interact with backend services.

All services use the `@Injectable()` decorator to distinguish itself from other JavaScript classes.

Here is a simplified example of what an analytics service that tracks event information could look like:

```ts
@Injectable({ providedIn: 'root' })
export class AnalyticService {
  trackEvent(category: string, value: string) {
    console.log('Analytics event logged:', {
      category,
      value,
      timestamp: new Date().toISOString()
    })
  }
}
```

### Dependencies

A dependency is any object, value, function or service that a class needs to work but does not create itself. In other words, it creates a relationship between different parts of your application since it wouldn't work without the dependency.

Examples of dependencies include:

- **Services**: Classes that provide specific functionality and/or business logic
- **Configuration values**: Environment-specific constants, API URLs, feature flags, etc.
- **State stores**: Shared data stores that help maintain application state
- **Factories**: Functions that create objects or values based on runtime conditions

### Providers vs Consumers

There are two main roles in the dependency injection (DI) system: providers and consumers.

A **provider** defines the dependency and determines how Angular should create or obtain an instance of the dependency.

Here is an example of a simplified `AnalyticsService` provider:

```ts
// 📄 AnalyticsService.ts
@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  trackEvent(event: string) {
    console.log(`Tracking: ${event}`);
  }
}
```

A **consumer** is a class that needs and uses a dependency.

Here is an example of a component that uses the `AnalyticsService`.

```angular-ts
@Component({
  selector: 'app-checkout',
  providers: [AnalyticsService]
})
export class CheckoutComponent {
  private analytics = inject(AnalyticsService);

  purchase() {
    this.analytics.trackEvent('purchase_started');
  }
}
```

### Injectors

Angular facilitates the interaction between dependency consumers and dependency providers using an abstraction called `Injector`.

When a dependency is requested, Angular's injector starts by checking to see if one has already been created. If it does, it reuses the existing instance. If not, it creates a new one and saves it for later use.

#### `inject()`

The `inject()` is a built-in service provided by Angular that enables you to interface directly with Angular's injector system. It's a helper function that asks the Angular, "Can you get me this dependency?"

Here is an example of a navigation bar that injects the AnalyticService and Angular Router service to allow users to navigate to a different page while tracking the event.

```angular-ts
@Component({
  standalone: true,
  selector: 'app-navbar',
  template: `
    <a href="#" (click)="navigateToDetail()">Detail Page</a>
  `,
  providers: [AnalyticService]
})
export class NavbarComponent {
  private router = inject(Router)
  private analyticService = inject(AnalyticService)

  navigateToDetail() {
    event.preventDefault()
    this.analyticService.trackEvent('navigation', '/details')
    this.router.navigate('/details')
  }
}
```

### Tokens

Tokens are unique identifiers that the dependency injection (DI) system uses to locate dependencies.

They are provided in two particular forms:

1. **Class name tokens**: These are the most common tokens because they are configured by
2. **Injection tokens**: A special Angular class used for generating a unique identifier for non-class dependencies (like configuration values)

WARNING: DI can technically accept a string token, but it is generally not recommended due to being less type-safe and prone to human error.

## Next steps

Now that you understand the fundamentals of dependency injection in Angular, let's take a look at how to implement it in an application.
