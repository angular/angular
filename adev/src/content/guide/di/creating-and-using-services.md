# Creating and using services

Services are reusable pieces of code that you can share across your Angular application. You commonly use them to handle data fetching, business logic, or other functionality that multiple components need to access.

## Creating a service

You can create a service using the [Angular CLI](tools/cli) with the following command:

```bash
ng generate service CUSTOM_NAME
```

This command creates a dedicated `CUSTOM_NAME.ts` file in your `src` directory.

You can also manually create a service by adding the `@Injectable()` decorator to a TypeScript class. This tells Angular that you can use the class as an injectable dependency.

The following example defines a service that allows users to add and retrieve data:

```ts
// 📄 src/app/basic-data-store.ts
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

- **Creates a single instance** (a singleton) for the entire application
- **Makes it available throughout your application** without additional configuration
- **Enables tree-shaking** so Angular only includes the service in your JavaScript bundle if you actually use it

This is the recommended approach for most services.

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

While `providedIn: 'root'` covers most use cases, Angular also provides additional ways you can configure services for more specialized scenarios:

- **Component-specific instances** - When components need their own isolated service instances
- **Manual configuration** - For services that require runtime configuration
- **Factory providers** - For dynamic service creation based on runtime conditions
- **Value providers** - For providing configuration objects or constants

You can learn more about these advanced patterns in the next guide: [defining dependency providers](/guide/di/defining-dependency-providers).
