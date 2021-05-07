# Dependency injection in Angular

Dependencies are services or objects that a class needs to perform its function.
Dependency injection, or DI, is a design pattern in which a class requests dependencies from external sources rather than creating them.

Angular's DI framework provides dependencies to a class upon instantiation.
You can use Angular DI to increase flexibility and modularity in your applications.

<div class="alert is-helpful">

See the <live-example></live-example> for a working example containing the code snippets in this guide.

</div>

## Creating an injectable service

To generate a new `HeroService` class in the `src/app/heroes` folder use the following [Angular CLI](cli) command.

<code-example language="sh">
ng generate service heroes/hero
</code-example>

This command creates the following default `HeroService`.

<code-example path="dependency-injection/src/app/heroes/hero.service.0.ts" header="src/app/heroes/hero.service.ts (CLI-generated)">
</code-example>

The `@Injectable()` decorator specifies that Angular can use this class in the DI system.
The metadata, `providedIn: 'root'`, means that the `HeroService` is visible throughout the application.

Next, to get the hero mock data, add a `getHeroes()` method that returns the heroes from `mock.heroes.ts`.

<code-example path="dependency-injection/src/app/heroes/hero.service.3.ts" header="src/app/heroes/hero.service.ts">
</code-example>

For clarity and maintainability, it is recommended that you define components and services in separate files.

If you do combine a component and service in the same file, it is important to define the service first, and then the component.
If you define the component before the service, Angular returns a run-time null reference error.


{@a injector-config}
{@a bootstrap}

## Injecting services

Injecting services results in making them visible to a component.

To inject a dependency in a component's `constructor()`, supply a constructor argument with the dependency type.
The following example specifies the `HeroService` in the `HeroListComponent` constructor.
The type of `heroService` is `HeroService`.

<code-example header="src/app/heroes/hero-list.component (constructor signature)" path="dependency-injection/src/app/heroes/hero-list.component.ts"
region="ctor-signature">
</code-example>


For more information, see [Providing dependencies in modules](guide/providers) and [Hierarchical injectors](guide/hierarchical-dependency-injection).

{@a service-needs-service}

## Using services in other services

When a service depends on another service, follow the same pattern as injecting into a component.
In the following example `HeroService` depends on a `Logger` service to report its activities.

First, import the `Logger` service.
Next, inject the `Logger` service in the `HeroService` `constructor()` by specifying `private logger: Logger` within the parentheses.

When you create a class whose `constructor()` has parameters, specify the type and metadata about those parameters so that Angular can inject the correct service.

Here, the `constructor()` specifies a type of `Logger` and stores the instance of `Logger` in a private field called `logger`.


The following code tabs feature the `Logger` service and two versions of `HeroService`.
The first version of `HeroService` does not depend on the `Logger` service.
The revised second version does depend on `Logger` service.

<code-tabs>

  <code-pane header="src/app/heroes/hero.service (v2)" path="dependency-injection/src/app/heroes/hero.service.2.ts">
  </code-pane>

  <code-pane header="src/app/heroes/hero.service (v1)" path="dependency-injection/src/app/heroes/hero.service.1.ts">
  </code-pane>

  <code-pane header="src/app/logger.service"
  path="dependency-injection/src/app/logger.service.ts">
  </code-pane>

</code-tabs>

In this example, the `getHeroes()` method uses the `Logger` service by logging a message when fetching heroes.

## What's next

* [Dependency providers](guide/dependency-injection-providers)
* [DI tokens and providers](guide/dependency-injection-providers)
* [Dependency Injection in Action](guide/dependency-injection-in-action)
