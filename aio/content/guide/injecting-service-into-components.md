# Injecting services into component

Injecting services results in making them visible to a component.

To inject a dependency in a component's `constructor()`, supply a constructor argument with the dependency type.
The following example specifies the `HeroService` in the `HeroListComponent` constructor.
The type of `heroService` is `HeroService`.

<code-example header="src/app/heroes/hero-list.component (constructor signature)" path="dependency-injection/src/app/heroes/hero-list.component.ts"
region="ctor-signature">
</code-example>


For more information, see [Providing dependencies in modules](guide/providers) and [Hierarchical injectors](guide/hierarchical-dependency-injection).

{@a service-needs-service}

## What's next

* [Dependency providers](guide/dependency-injection-providers)
* [DI tokens and providers](guide/dependency-injection-providers)
* [Dependency Injection in Action](guide/dependency-injection-in-action)
