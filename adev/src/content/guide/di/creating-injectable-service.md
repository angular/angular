# Creating an injectable service

A service is a broad category that encompasses any value, function, or feature that your application needs.
A service is typically a class with a focused and well-defined purpose.
A component is one type of class that you can use with dependency injection (DI).

Angular distinguishes components from services to improve modularity and reusability.
By separating a component's view-related features from other types of processing, you can keep your component classes lean and efficient.

Ideally, your component's responsibility is to enable the user experience and nothing more.
A component should present properties and methods for data binding, to mediate between the view (rendered by the template) and the application logic (which often includes some notion of a model).

You can delegate tasks from a component to services, such as fetching data from a server, validating user input, or logging to the console.
By defining such tasks in an injectable service class, you make those capabilities available to any component.
You can also make your application more adaptable by configuring different providers for the same type of service based on different circumstances.

Angular does not strictly enforce these principles.
Angular helps you follow these principles by making it easy to organize your application logic into services and make those services available to components through DI.

## Service examples

Here's an example of a service class that logs to the browser console:

```ts {header: "logger.service.ts (class)"}
export class Logger {
  log(msg: unknown) {
    console.log(msg);
  }
  error(msg: unknown) {
    console.error(msg);
  }
  warn(msg: unknown) {
    console.warn(msg);
  }
}
```

Services can depend on other services.
For example, here's a `HeroService` that depends on the `Logger` service, and also uses `BackendService` to get heroes.
That service in turn might depend on the `HttpClient` service to fetch heroes asynchronously from a server:

```ts {header: "hero.service.ts", highlight="[7,8,12,13]"}
import {inject} from '@angular/core';

export class HeroService {
  private heroes: Hero[] = [];

  private backend = inject(BackendService);
  private logger = inject(Logger);

  async getHeroes() {
    // Fetch
    this.heroes = await this.backend.getAll(Hero);
    // Log
    this.logger.log(`Fetched ${this.heroes.length} heroes.`);
    return this.heroes;
  }
}
```

## Creating an injectable service with the CLI

The Angular CLI provides a command to create a new service. In the following example, you add a new service to an existing application.

To generate a new `HeroService` class in the `src/app/heroes` folder, follow these steps:

1. Run this [Angular CLI](/tools/cli) command:

```sh
ng generate service heroes/hero
```

This command creates the following default `HeroService`:

```ts {header: 'heroes/hero.service.ts (CLI-generated)'}
import {Service} from '@angular/core';

@Service()
export class HeroService {}
```

The `@Service()` decorator specifies that Angular can use this class in the DI system and that the `HeroService` is available throughout your application.

Add a `getHeroes()` method that returns the heroes from `mock.heroes.ts` to get the hero mock data:

```ts {header: 'hero.service.ts'}
import {Service} from '@angular/core';
import {HEROES} from './mock-heroes';

@Service()
export class HeroService {
  getHeroes() {
    return HEROES;
  }
}
```

For clarity and maintainability, it is recommended that you define components and services in separate files.

## Injecting services

To inject a service into a component, declare a class field for the dependency and use Angular's [`inject`](/api/core/inject) function to initialize it.

The following example specifies the `HeroService` in the `HeroList`.
The type of `heroService` is `HeroService`.

```ts
import {inject} from '@angular/core';

export class HeroList {
  private heroService = inject(HeroService);
}
```

It is also possible to inject a service into a component using the component's constructor:

```ts {header: 'hero-list.ts (constructor signature)'}
  constructor(private heroService: HeroService)
```

The [`inject`](/api/core/inject) method can be used in both classes and functions, while the constructor method can naturally only be used in a class constructor. However, in both cases, you can only inject a dependency within a valid [injection context](guide/di/dependency-injection-context), typically during the construction or initialization of a component.

## Injecting services in other services

When a service depends on another service, follow the same pattern as injecting into a component.
In the following example, `HeroService` depends on a `Logger` service to report its activities:

```ts {header: 'hero.service.ts, highlight: [[3],[9],[12]]}
import {inject, Service} from '@angular/core';
import {HEROES} from './mock-heroes';
import {Logger} from '../logger.service';

@Service()
export class HeroService {
  private logger = inject(Logger);

  getHeroes() {
    this.logger.log('Getting heroes.');
    return HEROES;
  }
}
```

In this example, the `getHeroes()` method uses the `Logger` service by logging a message when fetching heroes.

## What's next

<docs-pill-row>
  <docs-pill href="guide/di/defining-dependency-providers" title="Configuring dependency providers"/>
  <docs-pill href="guide/di/defining-dependency-providers#automatic-provision-for-non-class-dependencies" title="`InjectionTokens`"/>
</docs-pill-row>
