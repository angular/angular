# Creating and using services

Services are reusable pieces of code that can be shared across your Angular application. They typically handle data fetching, business logic, or other functionality that multiple components need to access.

## Creating a service

You can create a service with the [Angular CLI](tools/cli) with the following command:

```bash
ng generate service CUSTOM_NAME
```

This creates a dedicated `CUSTOM_NAME.ts` file in your `src` directory.

You can also manually create a service by adding the `@Injectable()` decorator to a TypeScript class. This tells Angular that the service can be injected as a dependency.

Here is an example of a service that allows users to add and request data:

```ts {header: "src/app/basic-data-store.ts"}
import {Injectable} from '@angular/core';

@Injectable({providedIn: 'root'})
export class BasicDataStore {
  private data: string[] = [];

  addData(item: string): void {
    this.data.push(item);
  }

  getData(): string[] {
    return [...this.data];
  }
}
```

## How services become available

When you use `@Injectable({ providedIn: 'root' })` in your service, Angular:

- **Creates a single instance** (singleton) for your entire application
- **Makes it available everywhere** without any additional configuration
- **Enables tree-shaking** so the service is only included in your JavaScript bundle if it's actually used

This is the recommended approach for most services.

## Using the `@Service` decorator

IMPORTANT: The `@Service` decorator is in [developer preview](reference/releases#developer-preview). Its API may change before becoming stable.

For the common case of a singleton service available throughout your application, Angular provides the `@Service` decorator as a more ergonomic alternative to `@Injectable({providedIn: 'root'})`.

The earlier `BasicDataStore` example can be rewritten with `@Service`:

```ts {header: "src/app/basic-data-store.ts"}
import {Service} from '@angular/core';

@Service()
export class BasicDataStore {
  private data: string[] = [];

  addData(item: string): void {
    this.data.push(item);
  }

  getData(): string[] {
    return [...this.data];
  }
}
```

This behaves the same as the `@Injectable({providedIn: 'root'})` version above: Angular creates a single instance, makes it available everywhere, and tree-shakes it from the bundle if it is never injected.

### Replacing the implementation with a factory

If you need to control how the singleton is created, for example, to swap in a different implementation depending on the environment, pass a `factory` function.

The factory runs in an [injection context](guide/di/dependency-injection-context), so you can use [`inject()`](api/core/inject) inside it to read other dependencies.

The following `Analytics` service is a no-op locally so events don't pollute the console during development. In production, the factory reads an `ANALYTICS_ENABLED` token and returns a `GoogleAnalytics` subclass that forwards events to the real tracker:

```ts {header: "src/app/analytics.ts"}
import {inject, InjectionToken, Service} from '@angular/core';
import {ANALYTICS_ENABLED} from './token';

@Service({
  factory: () => (inject(ANALYTICS_ENABLED) ? new GoogleAnalytics() : new Analytics()),
})
export class Analytics {
  track(event: string, payload?: Record<string, unknown>) {
    // No-op by default.
  }
}

class GoogleAnalytics extends Analytics {
  override track(event: string, payload?: Record<string, unknown>) {
    // Dispatches an analytics event to Google Analytics
  }
}
```

NOTE: The `factory` option replaces the `useClass`, `useValue`, `useExisting`, and `useFactory` options of `@Injectable`. If you need any of those, keep using `@Injectable`.

### Opting out of automatic provisioning

By default, `@Service` provides the class at the root injector. If you want to provide it manually, for example, to scope it to a specific route or component, set `autoProvided: false`:

```ts {header: "src/app/analytics-logger.ts"}
import {Service} from '@angular/core';

@Service({autoProvided: false})
export class AnalyticsLogger {
  trackEvent(name: string) {
    console.log('event:', name);
  }
}
```

You are then responsible for adding the service to a `providers` array, just like with a plain `@Injectable()`:

### When to use `@Service` vs `@Injectable`

Reach for `@Service` when you are creating a new singleton class that uses `inject()` for its dependencies. Keep using `@Injectable` when you need any of the following:

- **Constructor-based dependency injection.** `@Service` only supports the [`inject()`](api/core/inject) function.
- **Advanced provider configuration** such as `useClass`, `useValue`, `useExisting`, or `useFactory`. `@Service` exposes a single `factory` option instead.
- **Non-root scopes** such as `providedIn: 'platform'`.

## Injecting a service

Once you've created a service with `providedIn: 'root'`, you can inject it anywhere in your application using the `inject()` function from `@angular/core`.

### Injecting into a component

```angular-ts
import {Component, inject} from '@angular/core';
import {BasicDataStore} from './basic-data-store';

@Component({
  selector: 'app-example',
  template: `
    <div>
      <p>{{ dataStore.getData() }}</p>
      <button (click)="dataStore.addData('More data')">Add more data</button>
    </div>
  `,
})
export class Example {
  dataStore = inject(BasicDataStore);
}
```

### Injecting into another service

```ts
import {inject, Injectable} from '@angular/core';
import {AdvancedDataStore} from './advanced-data-store';

@Injectable({
  providedIn: 'root',
})
export class BasicDataStore {
  private advancedDataStore = inject(AdvancedDataStore);
  private data: string[] = [];

  addData(item: string): void {
    this.data.push(item);
  }

  getData(): string[] {
    return [...this.data, ...this.advancedDataStore.getData()];
  }
}
```

## Next steps

While `providedIn: 'root'` covers most use cases, Angular offers additional ways to provide services for specialized scenarios:

- **Component-specific instances** - When components need their own isolated service instances
- **Manual configuration** - For services that require runtime configuration
- **Factory providers** - For dynamic service creation based on runtime conditions
- **Value providers** - For providing configuration objects or constants

You can learn more about these advanced patterns in the next guide: [defining dependency providers](/guide/di/defining-dependency-providers).
