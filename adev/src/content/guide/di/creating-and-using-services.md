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

### Configuring a service's scope

When you create a service, you need to provide a configuration object that defines the scope for the service through the `providedIn` key. This enables Angular to tree-shake the service when it's used in lazy-loaded routes or deferred components.

```ts
@Injectable({
  providedIn: 'root'
})
```

In other words, how should the service be used in the context of the application?

There are two primary scopes:

1. `root` - This injects the service at the application level and is the recommended approach for most services.
2. `platform` - The service will be created as a special singleton that can be shared by **multiple Angular applications** on a page.

TIP: Unless you have multiple Angular applications on a page, you will want to use `root` for your services.

## Providing a service

Whenever you want to use a service in a part of your code (e.g., component, directive, etc.), you need to "provide" the service. In other words, you need to explicitly tell Angular what service you want by configuring it through the `providers` configuration key.

Here is an example of the `BasicDataService` being imported in a component:

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

Here is an example of the `BasicDataService` being imported in a directive:

```ts
import { Directive } from '@angular/core';
import { BasicDataService } from '../basic-data-service';

@Directive({
  selector: '[appDirectiveTemplate]',
  providers: [ BasicDataService ]
})
export class TemplateDirective {
// ...
}
```

Here is an example of providing `BasicDataService` at an application level:

```ts
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { BasicDataService } from './app/basic-data-service';

bootstrapApplication(AppComponent, {
  providers: [
    BasicDataService,
    // Other application-level providers
  ]
}).catch(err => console.error(err));
```

Here is an example of providing `BasicDataService` for a route:

```ts
import { Routes } from '@angular/router';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { BasicDataService } from './app/basic-data-service';

export const routes: Routes = [
  {
    path: 'user/:id',
    component: UserProfileComponent,
    // Route-level provider
    providers: [ BasicDataService ]
  }
];
```

The one exception to this pattern is when you're providing a service to another service. In this case, no providers key is required in the configuration object. You just need to import and inject the service in the file.

```ts
import { inject, Injectable } from '@angular/core';
import { AdvancedDataService } from './advanced-data-service';

@Injectable({
  providedIn: 'root',
})

export class BasicDataService {
  private const advancedDataService = inject(AdvancedDataService)
}
```

## Injecting a service

Now that you have provided the service in the desired context, it's time to call our service by using the `inject()` function from `@angular/core`!

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

Next, you'll learn more about how you can provide dependencies in other contexts.
