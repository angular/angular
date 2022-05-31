# Creating an injectable service

In this example, we want to add a new service to our application, which was created earlier with the [ng new](cli) command. 

To generate a new `HeroService` class in the `src/app/heroes` folder, follow these steps: 

1. Run this [Angular CLI](cli) command:

<code-example language="sh">
ng generate service heroes/hero
</code-example>

This command creates the following default `HeroService`.

<code-example path="dependency-injection/src/app/heroes/hero.service.0.ts" header="src/app/heroes/hero.service.ts (CLI-generated)">
</code-example>

The `@Injectable()` decorator specifies that Angular can use this class in the DI system.
The metadata, `providedIn: 'root'`, means that the `HeroService` is visible throughout the application.

2. Add a `getHeroes()` method that returns the heroes from `mock.heroes.ts` to get the hero mock data:

<code-example path="dependency-injection/src/app/heroes/hero.service.3.ts" header="src/app/heroes/hero.service.ts">
</code-example>

For clarity and maintainability, it is recommended that you define components and services in separate files.

{@a injector-config}
{@a bootstrap}



## What's next

* [Dependency providers](guide/dependency-injection-providers)
* [Dependency Injection in Action](guide/dependency-injection-in-action)
