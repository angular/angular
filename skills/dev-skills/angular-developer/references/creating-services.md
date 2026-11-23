# Creating and Using Services

Services in Angular are reusable pieces of code that handle data fetching, business logic, or state management that multiple components or other services need to access.

## Creating a Service

You can generate a service using the Angular CLI:

```bash
ng generate service my-data
```

Or you can manually create a TypeScript class and decorate it with `@Service()`. For reactive state management, store data in a private `signal()` and expose it publicly via `.asReadonly()`:

```ts
import {Service, signal} from '@angular/core';

@Service()
export class BasicDataStore {
  private readonly dataSignal = signal<string[]>([]);

  // Expose state as a read-only signal to prevent direct external mutation
  readonly data = this.dataSignal.asReadonly();

  addData(item: string): void {
    this.dataSignal.update((items) => [...items, item]);
  }
}
```

### The `@Service` decorator

Using `@Service` is the recommended approach for most services. It tells Angular to:

- **Create a single instance (singleton)** for the entire application.
- **Make it available everywhere** automatically, without needing to list it in any `providers` array.
- **Enable tree-shaking**, meaning the service is only included in the final JavaScript bundle if it is actually injected somewhere.

#### The `autoProvided` option

If you don't want to create a singleton of your service, you can set `@Service({autoProvided: false})` and declare the service in a `providers` array.

## Injecting a Service

Once a service is created, you can inject it into components, directives, or other services using the `inject()` function.

### Injecting into a Component

```ts
import {Component, inject} from '@angular/core';
import {BasicDataStore} from './basic-data-store.service';

@Component({
  selector: 'app-example',
  template: `
    <div>
      <p>Data items: {{ dataStore.data().length }}</p>
      <button (click)="dataStore.addData('New Item')">Add Item</button>
    </div>
  `,
})
export class Example {
  // Inject the service as a class field
  readonly dataStore = inject(BasicDataStore);
}
```

### Injecting into Another Service

Services can inject other services in the exact same way. Use `computed()` to derive values from injected services reactively:

```ts
import {Service, computed, inject, signal} from '@angular/core';
import {AdvancedDataStore} from './advanced-data-store.service';

@Service()
export class CombinedDataStore {
  // Injecting another service
  private readonly advancedDataStore = inject(AdvancedDataStore);
  private readonly dataSignal = signal<string[]>([]);

  // Combine reactive state from this service and the injected service
  readonly allData = computed(() => [...this.dataSignal(), ...this.advancedDataStore.data()]);
}
```

## Advanced Service Patterns

While `@Service` covers most scenarios, you may sometimes need:

- **Component-specific instances**: If a component needs its own isolated instance of a service, provide it directly in the component's `@Component({ providers: [MyService] })` array and set the `autoProvided: false` option: `@Service({autoProvided: false})`
- **Factory providers**: For dynamic creation.
- **Value providers**: For injecting configuration objects.
