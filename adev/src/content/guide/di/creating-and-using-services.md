# Creating and using services

When you want to use services with dependency injection in your application, there are three primary steps:

1. [Creating a service](#creating-a-service)
2. [Providing a service](#providing-a-service)
3. [Injecting a service](#injecting-a-service)

## Creating a service

You can create a service with the [Angular CLI](tools/cli) with the following command:

```bash
ng generate service CUSTOM_NAME
```

This creates a dedicated `CUSTOM_NAME.ts` file in your `src` directory.

You can also manually create a service by using the `@Injectable()` decorator. This tells Angular that the service can be injected as a dependency.

Here is an example of a service that allows users to add and request data:

```ts
// 📄 src/app/basic-data-service.ts
@Injectable({ providedIn: 'root' })
export class BasicDataService {
  private data: string[] = []

  addData(item: string): void {
    this.data.push(item)
  }

  getData(): string[] {
    return [...this.data]
  }
}
```

### Automatic vs manual service provision

Angular provides two ways to make services available for injection:

1. **Automatic provision** - Using `providedIn` in the `@Injectable` decorator
2. **Manual provision** - Using the `providers` array in components, directives, or application config

#### Automatic provision with `providedIn`

When you include `providedIn` in your service's `@Injectable` decorator, Angular automatically makes it available at the specified level:

```ts
@Injectable({
  providedIn: 'root'
})
export class DataService { }
```

This approach:

- Enables tree-shaking for unused services
- Provides a single instance at the specified level
- Requires no additional configuration in components that use it

Available scopes for `providedIn`:

1. `'root'` - Provides a single instance at the application level (recommended for most services)
2. `'platform'` - Provides a special singleton shared by all Angular applications on the page
3. `null` or omitted - Service must be manually provided

TIP: Use `providedIn: 'root'` for most services unless you have specific requirements.

#### Manual provision without `providedIn`

If you omit `providedIn` or set it to `null`, the service must be manually provided:

```ts
@Injectable()  // No providedIn - must be manually provided
export class LocalDataService { }
```

## When to use the providers array

You only need to manually provide a service using the `providers` array in two cases:

1. **The service doesn't have `providedIn`** - Services without automatic provision must be manually provided
2. **You want a new instance** - To create a separate instance at the component/directive level instead of using the shared one

### Services without `providedIn`

If a service doesn't use `providedIn`, you must add it to a `providers` array:

```ts
// Service without providedIn
@Injectable()
export class LocalDataService {
  private data: string[] = [];

  addData(item: string) {
    this.data.push(item);
  }
}

// Component must provide it
@Component({
  selector: 'app-example',
  providers: [LocalDataService],  // Required because service has no providedIn
  template: `...`
})
export class ExampleComponent {
  dataService = inject(LocalDataService);
}
```

You can provide services at different levels:

```ts
// Application level - available to entire app
bootstrapApplication(AppComponent, {
  providers: [
    LocalDataService,  // Now available app-wide
  ]
});

// Route level - available to a specific route and its children
export const routes: Routes = [
  {
    path: 'feature',
    providers: [LocalDataService],
    loadChildren: () => import('./feature/routes')
  }
];
```

### Creating new instances of services

Even if a service uses `providedIn: 'root'`, you can create component-specific instances:

```ts
// This service is automatically provided at root level
@Injectable({ providedIn: 'root' })
export class SharedDataService {
  private data: any[] = [];
}

// But this component creates its own instance
@Component({
  selector: 'app-isolated',
  providers: [SharedDataService],  // Creates a new instance just for this component
  template: `...`
})
export class IsolatedComponent {
  // This injects the component-specific instance, not the root one
  dataService = inject(SharedDataService);
}
```

### Services with `providedIn` don't need providers array

When a service uses `providedIn: 'root'` or `providedIn: 'platform'`, you don't need to add it to any `providers` array:

```ts
// Service with automatic provision
@Injectable({ providedIn: 'root' })
export class DataService { }

// Component can inject it without providers array
@Component({
  selector: 'app-example',
  // No providers array needed!
  template: `...`
})
export class ExampleComponent {
  dataService = inject(DataService);  // Works automatically
}
```

This also applies when injecting one service into another:

```ts
@Injectable({ providedIn: 'root' })
export class LoggerService { }

@Injectable({ providedIn: 'root' })
export class DataService {
  private logger = inject(LoggerService);  // No providers needed
}
```

## Injecting a service

Once a service is available (either through automatic provision with `providedIn` or manual provision with `providers`), you can inject it using the `inject()` function from `@angular/core`:

Here is an example of the `BasicDataService` being used in a component:

```ts
import { Component, inject } from '@angular/core';
import { BasicDataService } from '../basic-data-service';

@Component({
selector: 'app-template',
providers: [ BasicDataService ],
template: `
    <div>
      <p>{{ basicDataService.getData() }}</p>
      <button (click)="basicDataService.addData('More data')">
        Add more data
      </button>
    </div>
  `
})
export class TemplateComponent {
  basicDataService = inject(BasicDataService)
}
```

Here is an example of `BasicDataService` injecting a different service into it:

```ts
import { inject, Injectable } from '@angular/core';
import { AdvancedDataService } from './advanced-data';

@Injectable({
  providedIn: 'root',
})

export class BasicDataService {
  private advancedDataService = inject(AdvancedDataService);
  private data: string[] = [];

  addData(item: string): void {
    this.data.push(item);
  }

  getData(): string[] {
    return [...this.data, ...this.advancedDataService.getData()];
  }
}
```

## Next steps

Next, you'll learn more about how you can [provide dependencies in other contexts](/guide/di/providing-other-dependencies).
