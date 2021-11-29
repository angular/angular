# Injecting services in other services

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
