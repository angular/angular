<docs-decorative-header title="Dependency Injection" imgSrc="adev/src/assets/images/dependency_injection.svg"> <!-- markdownlint-disable-line -->
Reuse code and control behaviors across your application and tests.
</docs-decorative-header>

When you need to share logic between components, Angular leverages the design pattern of [dependency injection](guide/di) that allows you to create a “service” which allows you to inject code into components while managing it from a single source of truth.

## What are services?

Services are reusable pieces of code that can be injected.

Similar to defining a component, services are comprised of the following:

- A **TypeScript decorator** that declares the class as an Angular service via `@Injectable` and allows you to define what part of the application can access the service via the `providedIn` property (which is typically `'root'`) to allow a service to be accessed anywhere within the application.
- A **TypeScript class** that defines the desired code that will be accessible when the service is injected

Here is an example of a `Calculator` service.

```angular-ts
import {Injectable} from '@angular/core';

@Injectable({providedIn: 'root'})
export class Calculator {
  add(x: number, y: number) {
    return x + y;
  }
}
```

## How to use a service

When you want to use a service in a component, you need to:

1. Import the service
2. Declare a class field where the service is injected. Assign the class field to the result of the call of the built-in function `inject` which creates the service

Here’s what it might look like in the `Receipt` component:

```angular-ts
import { Component, inject } from '@angular/core';
import { Calculator } from './calculator';

@Component({
  selector: 'app-receipt',
  template: `<h1>The total is {{ totalCost }}</h1>`,
})

export class Receipt {
  private calculator = inject(Calculator);
  totalCost = this.calculator.add(50, 25);
}
```

In this example, the `Calculator` is being used by calling the Angular function `inject` and passing in the service to it.

## Next Step

<docs-pill-row>
  <docs-pill title="Next Steps After Essentials" href="essentials/next-steps" />
  <docs-pill title="In-depth dependency injection guide" href="guide/di" />
</docs-pill-row>
