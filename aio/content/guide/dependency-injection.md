# Angular Dependency Injection

**Dependency Injection (DI)** is a way to create objects that depend upon other objects.
A Dependency Injection system supplies the dependent objects (called the _dependencies_)
when it creates an instance of an object.

The [Dependency Injection pattern](guide/dependency-injection-pattern) page describes this general approach.
_The guide you're reading now_ explains how Angular's own Dependency Injection system works.

## DI by example

You'll learn Angular Dependency Injection through a discussion of the sample app that accompanies this guide.
Run the <live-example></live-example> anytime.

Start by reviewing this simplified version of the _heroes_ feature
from the [The Tour of Heroes](tutorial/).

<code-tabs>
  <code-pane title="src/app/heroes/heroes.component.ts" path="dependency-injection/src/app/heroes/heroes.component.1.ts"
  region="v1">
  </code-pane>

  <code-pane title="src/app/heroes/hero-list.component.ts" path="dependency-injection/src/app/heroes/hero-list.component.1.ts">
  </code-pane>

  <code-pane title="src/app/heroes/hero.ts" path="dependency-injection/src/app/heroes/hero.ts">
  </code-pane>

  <code-pane title="src/app/heroes/mock-heroes.ts" path="dependency-injection/src/app/heroes/mock-heroes.ts">
  </code-pane>

</code-tabs>

The `HeroesComponent` is the top-level heroes component.
It's only purpose is to display the `HeroListComponent`
which displays a list of hero names.

This version of the `HeroListComponent` gets its `heroes` from the `HEROES` array, an in-memory collection
defined in a separate `mock-heroes` file.

<code-example title="src/app/heroes/hero-list.component.ts (class)" path="dependency-injection/src/app/heroes/hero-list.component.1.ts"
region="class">
</code-example>

That may suffice in the early stages of development, but it's far from ideal.
As soon as you try to test this component or get heroes from a remote server,
you'll have to change the implementation of `HerosListComponent` and
replace every other use of the `HEROES` mock data.

It's better to hide these details inside a _service_ class, 
[defined in its own file](#one-class-per-file).

## Create an injectable _HeroService_

The [**Angular CLI**](https://cli.angular.io/) can generate a new `HeroService` class in the `src/app/heroes` folder with this command.

<code-example language="sh" class="code-shell">
ng generate service heroes/hero
</code-example>

The command above creates the following `HeroService` skeleton.

<code-example path="dependency-injection/src/app/heroes/hero.service.0.ts" title="src/app/heroes/hero.service.ts (CLI-generated)">
</code-example>

The `@Injectable` decorator is an essential ingredient in every Angular service definition.
The rest of the class has been rewritten to expose a `getHeroes` method 
that returns the same mock data as before.

<code-example path="dependency-injection/src/app/heroes/hero.service.3.ts" title="src/app/heroes/hero.service.3.ts">
</code-example>

Of course, this isn't a real data service.
If the app were actually getting data from a remote server, 
the `getHeroes` method signature would have to be asynchronous.

That's a defect we can safely ignore in this guide where our focus is on
_injecting the service_ into the `HeroList` component.


{@a injector-config}
{@a bootstrap}

## Injectors

A _service_ like `HeroService` is just a class in Angular until you register it with an Angular dependency injector.

An Angular injector is responsible for creating service instances and injecting them into classes like the `HeroListComponent`.

You rarely create an Angular injector yourself.
Angular creates injectors for you as it executes the app,
starting with the _root injector_ that it creates during the [bootstrap process](guide/bootstrapping).

Angular doesn't automatically know how you want to create instances of your services or the injector to create your service. You must configure it by specifying providers for every service.

**Providers** tell the injector _how to create the service_.
Without a provider, the injector would not know
that it is responsible for injecting the service
nor be able to create the service.

<div class="l-sub-section">

You'll learn much more about _providers_ [below](#providers).
For now, it is sufficient to know that they configure where and how services are created.

</div>

There are many ways to register a service provider with an injector. This section shows the most common ways 
of configuring a provider for your services.

{@a register-providers-injectable}

## @Injectable providers

The `@Injectable` decorator identifies services and other classes that are intended to be injected. It can also be used to configure a provider for those services.

Here we configure a provider for `HeroService` using the `@Injectable` decorator on the class.

<code-example path="dependency-injection/src/app/heroes/hero.service.0.ts"  title="src/app/heroes/heroes.service.ts" linenums="false"> </code-example> 

`providedIn` tells Angular that the root injector is responsible for creating an instance of the `HeroService` (by invoking its constructor) and making it available across the application. The CLI sets up this kind of a provider automatically for you when generating a new service.

Sometimes it's not desirable to have a service always be provided in the application root injector. Perhaps users should explicitly opt-in to using the service, or the service should be provided in a lazily-loaded context. In this case, the provider should be associated with a specific `@NgModule` class, and will be used by whichever injector includes that module.

In the following excerpt, the `@Injectable` decorator is used to configure a provider that will be available in any injector that includes the HeroModule.

<code-example path="dependency-injection/src/app/heroes/hero.service.4.ts"  title="src/app/heroes/hero.service.ts" linenums="false"> </code-example>

{@a register-providers-ngmodule}

### _@NgModule_ providers

In the following excerpt, the root `AppModule` registers two providers in its `providers` array.

<code-example path="dependency-injection/src/app/app.module.ts" linenums="false" title="src/app/app.module.ts (providers)" region="providers">
</code-example>

The first entry registers the `UserService` class (_not shown_) under the `UserService` _injection token_.
The second registers a value (`HERO_DI_CONFIG`) under the `APP_CONFIG` _injection token_.

With the above registrations, Angular can inject the `UserService` or the `HERO_DI_CONFIG` value
into any class that it creates.

<div class="l-sub-section">

You'll learn about _injection tokens_ and _provider_ syntax [below](#providers).
</div>

{@a register-providers-component}

### _@Component_ providers

In addition to providing the service application-wide or within a particular `@NgModule`, services can also be provided in specific components. Services provided in component-level is only available within that component injector or in any of its child components.

The example below shows a revised `HeroesComponent` that registers the `HeroService` in its `providers` array.

<code-example path="dependency-injection/src/app/heroes/heroes.component.1.ts" title="src/app/heroes/heroes.component.ts" linenums="false">
</code-example>

{@a ngmodule-vs-comp}

### @Injectable, _@NgModule_ or _@Component_?

Should you provide a service with an `@Injectable` decorator, in an `@NgModule`, or within an `@Component`?
The choices lead to differences in the final bundle size, service _scope_, and service _lifetime_.

When you register providers in the **@Injectable** decorator of the service itself, optimization tools such as those used by the CLI's production builds can perform tree shaking, which removes services that aren't used by your app. Tree shaking results in smaller bundle sizes.

**Angular module providers** (`@NgModule.providers`) are registered with the application's root injector.
Angular can inject the corresponding services in any class it creates.
Once created, a service instance lives for the life of the app and Angular injects this one service instance in every class that needs it.

You're likely to inject the `UserService` in many places throughout the app
and will want to inject the same service instance every time.
Providing the `UserService` with an Angular module is a good choice if an `@Injectable` provider is not an option..

<div class="l-sub-section">

To be precise, Angular module providers are registered with the root injector
_unless the module is_ [lazy loaded](guide/lazy-loading-ngmodules).
In this sample, all modules are _eagerly loaded_ when the application starts,
so all module providers are registered with the app's root injector.

</div><br>

<hr>

**A component's providers** (`@Component.providers`) are registered with each component instance's own injector.

Angular can only inject the corresponding services in that component instance or one of its descendant component instances.
Angular cannot inject the same service instance anywhere else.

Note that a component-provided service may have a limited lifetime. Each new instance of the component gets its own instance of the service
and, when the component instance is destroyed, so is that service instance.

In this sample app, the `HeroComponent` is created when the application starts
and is never destroyed so the `HeroService` created for the `HeroComponent` also live for the life of the app.

If you want to restrict `HeroService` access to the `HeroComponent` and its nested `HeroListComponent`,
providing the `HeroService` in the `HeroComponent` may be a good choice.

<div class="l-sub-section">

The scope and lifetime of component-provided services is a consequence of [the way Angular creates component instances](#component-child-injectors). 

</div>


{@a providers}

## Providers

A service provider *provides* the concrete, runtime version of a dependency value.
The injector relies on **providers** to create instances of the services
that the injector injects into components, directives, pipes, and other services.

You must register a service *provider* with an injector, or it won't know how to create the service.

The next few sections explain the many ways you can specify a provider.

### The class as its own provider

There are many ways to *provide* something that looks and behaves like a `Logger`.
The `Logger` class itself is an obvious and natural provider.

<code-example path="dependency-injection/src/app/providers.component.ts" region="providers-logger">
</code-example>

But it's not the only way.

You can configure the injector with alternative providers that can deliver an object that behaves like a `Logger`.
You could provide a substitute class. You could provide a logger-like object.
You could give it a provider that calls a logger factory function.
Any of these approaches might be a good choice under the right circumstances.

What matters is that the injector has a provider to go to when it needs a `Logger`.

{@a provide}

### The _provide_ object literal

Here's the class-provider syntax again.

<code-example path="dependency-injection/src/app/providers.component.ts" region="providers-logger">
</code-example>

This is actually a shorthand expression for a provider registration
using a _provider_ object literal with two properties:

<code-example path="dependency-injection/src/app/providers.component.ts" region="providers-3" >
</code-example>

The `provide` property holds the [token](guide/dependency-injection#token) that serves as the key for both locating a dependency value
and registering the provider.

The second property is always a provider definition object,
which you can think of as a *recipe* for creating the dependency value.
There are many ways to create dependency values just as there are many ways to write a recipe.

{@a class-provider}

### Alternative class providers

Occasionally you'll ask a different class to provide the service.
The following code tells the injector
to return a `BetterLogger` when something asks for the `Logger`.

<code-example path="dependency-injection/src/app/providers.component.ts" region="providers-4" >
</code-example>

{@a class-provider-dependencies}

### Class provider with dependencies

Maybe an `EvenBetterLogger` could display the user name in the log message.
This logger gets the user from the injected `UserService`,
which is also injected at the application level.

<code-example path="dependency-injection/src/app/providers.component.ts" region="EvenBetterLogger"  linenums="false">
</code-example>

Configure it like `BetterLogger`.

<code-example path="dependency-injection/src/app/providers.component.ts" region="providers-5"  linenums="false">
</code-example>

{@a aliased-class-providers}

### Aliased class providers

Suppose an old component depends upon an `OldLogger` class.
`OldLogger` has the same interface as the `NewLogger`, but for some reason
you can't update the old component to use it.

When the *old* component logs a message with `OldLogger`,
you'd like the singleton instance of `NewLogger` to handle it instead.

The dependency injector should inject that singleton instance
when a component asks for either the new or the old logger.
The `OldLogger` should be an alias for `NewLogger`.

You certainly do not want two different `NewLogger` instances in your app.
Unfortunately, that's what you get if you try to alias `OldLogger` to `NewLogger` with `useClass`.

<code-example path="dependency-injection/src/app/providers.component.ts" region="providers-6a"  linenums="false">
</code-example>

The solution: alias with the `useExisting` option.

<code-example path="dependency-injection/src/app/providers.component.ts" region="providers-6b" linenums="false">
</code-example>

{@a value-provider}

### Value providers

Sometimes it's easier to provide a ready-made object rather than ask the injector to create it from a class.

<code-example path="dependency-injection/src/app/providers.component.ts" region="silent-logger"  linenums="false">
</code-example>

Then you register a provider with the `useValue` option,
which makes this object play the logger role.

<code-example path="dependency-injection/src/app/providers.component.ts" region="providers-7" linenums="false">
</code-example>

See more `useValue` examples in the
[Non-class dependencies](guide/dependency-injection#non-class-dependencies) and
[InjectionToken](guide/dependency-injection#injection-token) sections.

{@a factory-provider}

### Factory providers

Sometimes you need to create the dependent value dynamically,
based on information you won't have until the last possible moment.
Maybe the information changes repeatedly in the course of the browser session.

Suppose also that the injectable service has no independent access to the source of this information.

This situation calls for a **factory provider**.

To illustrate the point, add a new business requirement:
the `HeroService` must hide *secret* heroes from normal users.
Only authorized users should see secret heroes.

Like the `EvenBetterLogger`, the `HeroService` needs a fact about the user.
It needs to know if the user is authorized to see secret heroes.
That authorization can change during the course of a single application session,
as when you log in a different user.

Unlike `EvenBetterLogger`, you can't inject the `UserService` into the `HeroService`.
The `HeroService` won't have direct access to the user information to decide
who is authorized and who is not.

Instead, the `HeroService` constructor takes a boolean flag to control display of secret heroes.

<code-example path="dependency-injection/src/app/heroes/hero.service.ts" region="internals" title="src/app/heroes/hero.service.ts (excerpt)" linenums="false">
</code-example>

You can inject the `Logger`, but you can't inject the  boolean `isAuthorized`.
You'll have to take over the creation of new instances of this `HeroService` with a factory provider.

A factory provider needs a factory function:

<code-example path="dependency-injection/src/app/heroes/hero.service.provider.ts" region="factory" title="src/app/heroes/hero.service.provider.ts (excerpt)" linenums="false">
</code-example>

Although the `HeroService` has no access to the `UserService`, the factory function does.

You inject both the `Logger` and the `UserService` into the factory provider
and let the injector pass them along to the factory function:

<code-example path="dependency-injection/src/app/heroes/hero.service.provider.ts" region="provider" title="src/app/heroes/hero.service.provider.ts (excerpt)" linenums="false">
</code-example>

<div class="l-sub-section">

The `useFactory` field tells Angular that the provider is a factory function
whose implementation is the `heroServiceFactory`.

The `deps` property is an array of [provider tokens](guide/dependency-injection#token).
The `Logger` and `UserService` classes serve as tokens for their own class providers.
The injector resolves these tokens and injects the corresponding services into the matching factory function parameters.

</div>

Notice that you captured the factory provider in an exported variable, `heroServiceProvider`.
This extra step makes the factory provider reusable.
You can register the `HeroService` with this variable wherever you need it.

In this sample, you need it only in the `HeroesComponent`,
where it replaces the previous `HeroService` registration in the metadata `providers` array.
Here you see the new and the old implementation side-by-side:

<code-tabs>

  <code-pane title="src/app/heroes/heroes.component (v3)" path="dependency-injection/src/app/heroes/heroes.component.ts">
  </code-pane>

  <code-pane title="src/app/heroes/heroes.component (v2)" path="dependency-injection/src/app/heroes/heroes.component.1.ts">
  </code-pane>

</code-tabs>

{@a tree-shakable-provider}

### Tree-shakable providers

Tree shaking is the ability to remove code that is not referenced in an application from the final bundle. Tree-shakable providers give Angular the ability to remove services that are not used in your application from the final output. This significantly reduces the size of your bundles.

Ideally, if an application is not injecting a service, it should not be included in the final output. However, it turns out that the Angular compiler cannot identify at build time if the service will be required or not. Because it's always possible to inject a service directly using `injector.get(Service)`, Angular cannot identify all of the places in your code where this injection could happen, so it has no choice but to include the service in the injector regardless. Thus, services provided in modules are not tree-shakeable.

Let us consider an example of non-tree-shakable providers in Angular.

In this example, to provide services in Angular, you include them in an `@NgModule`:

<code-example path="dependency-injection/src/app/tree-shaking/service-and-module.ts"  title="src/app/tree-shaking/service-and-modules.ts" linenums="false"> </code-example>

This module can then be imported into your application module, to make the service available for injection in your app:

<code-example path="dependency-injection/src/app/tree-shaking/app.module.ts"  title="src/app/tree-shaking/app.modules.ts" linenums="false"> </code-example>

When `ngc` runs, it compiles AppModule into a module factory, which contains definitions for all the providers declared in all the modules it includes. At runtime, this factory becomes an injector that instantiates these services.

Tree-shaking doesn't work in the method above because Angular cannot decide to exclude one chunk of code (the provider definition for the service within the module factory) based on whether another chunk of code (the service class) is used. To make services tree-shakeable, the information about how to construct an instance of the service (the provider definition) needs to be a part of the service class itself.

#### Creating tree-shakable providers

To create providers that are tree-shakable, the information that used to be specified in the module should be specified in the `@Injectable` decorator on the service itself.

The following example shows the tree-shakeable equivalent to the `ServiceModule` example above:

<code-example path="dependency-injection/src/app/tree-shaking/service.ts"  title="src/app/tree-shaking/service.ts" linenums="false"> </code-example>

In the example above, `providedIn` allows you to declare the injector which injects this service. Unless there is a special case, the value should always be root. Setting the value to root ensures that the service is scoped to the root injector, without naming a particular module that is present in that injector.

The service can be instantiated by configuring a factory function as shown below:

<code-example path="dependency-injection/src/app/tree-shaking/service.0.ts"  title="src/app/tree-shaking/service.0.ts" linenums="false"> </code-example>

<div class="l-sub-section">

To override tree-shakable providers, register the provider using the `providers: []` array syntax of any Angular decorator that supports it.

</div>

{@a injector-config} 
{@a bootstrap}

## Inject a service

The `HeroListComponent` should get heroes from the `HeroService`.

The component shouldn't create the `HeroService` with `new`.
It should ask for the `HeroService` to be injected.

You can tell Angular to inject a dependency in the component's constructor by specifying a **constructor parameter with the dependency type**.
Here's the `HeroListComponent` constructor, asking for the `HeroService` to be injected.

<code-example title="src/app/heroes/hero-list.component (constructor signature)" path="dependency-injection/src/app/heroes/hero-list.component.ts"
region="ctor-signature">
</code-example>

Of course, the `HeroListComponent` should do something with the injected `HeroService`.
Here's the revised component, making use of the injected service, side-by-side with the previous version for comparison.

<code-tabs>
  <code-pane title="hero-list.component (with DI)" path="dependency-injection/src/app/heroes/hero-list.component.2.ts">
  </code-pane>

  <code-pane title="hero-list.component (without DI)" path="dependency-injection/src/app/heroes/hero-list.component.1.ts">
  </code-pane>
</code-tabs>

Notice that the `HeroListComponent` doesn't know where the `HeroService` comes from.
_You_ know that it comes from the parent `HeroesComponent`.
If you decided instead to provide the `HeroService` in the `AppModule`,
the `HeroListComponent` wouldn't change at all.
The _only thing that matters_ is that the `HeroService` is provided in some parent injector.

{@a singleton-services}

## Singleton services

Services are singletons _within the scope of an injector_.
There is at most one instance of a service in a given injector.

There is only one root injector, and the `UserService` is registered with that injector.
Therefore, there can be just one `UserService` instance in the entire app,
and every class that injects `UserService` get this service instance.

However, Angular DI is a 
[hierarchical injection system](guide/hierarchical-dependency-injection), 
which means that nested injectors can create their own service instances.
Angular creates nested injectors all the time.

{@a component-child-injectors}

## Component child injectors

Component injectors are independent of each other and
each of them creates its own instances of the component-provided services.

For example, when Angular creates a new instance of a component that has `@Component.providers`,
it also creates a new _child injector_ for that instance.

When Angular destroys one of these component instances, it also destroys the
component's injector and that injector's service instances. 

Because of [injector inheritance](guide/hierarchical-dependency-injection),
you can still inject application-wide services into these components.
A component's injector is a child of its parent component's injector,
and a descendent of its parent's parent's injector, and so on all the way back to the application's _root_ injector.
Angular can inject a service provided by any injector in that lineage.

For example, Angular could inject a `HeroListComponent`
with both the `HeroService` provided in `HeroComponent`
and the `UserService` provided in `AppModule`.

{@a testing-the-component}

## Testing the component

Earlier you saw that designing a class for dependency injection makes the class easier to test.
Listing dependencies as constructor parameters may be all you need to test application parts effectively.

For example, you can create a new `HeroListComponent` with a mock service that you can manipulate
under test:

<code-example path="dependency-injection/src/app/test.component.ts" region="spec" title="src/app/test.component.ts" linenums="false">
</code-example>

<div class="l-sub-section">

Learn more in the [Testing](guide/testing) guide.

</div>

{@a service-needs-service}

## When the service needs a service

The `HeroService` is very simple. It doesn't have any dependencies of its own.

What if it had a dependency? What if it reported its activities through a logging service?
You'd apply the same *constructor injection* pattern,
adding a constructor that takes a `Logger` parameter.

Here is the revised `HeroService` that injects the `Logger`, side-by-side with the previous service for comparison.

<code-tabs>

  <code-pane title="src/app/heroes/hero.service (v2)" path="dependency-injection/src/app/heroes/hero.service.2.ts">
  </code-pane>

  <code-pane title="src/app/heroes/hero.service (v1)" path="dependency-injection/src/app/heroes/hero.service.1.ts">
  </code-pane>

</code-tabs>

The constructor asks for an injected instance of a `Logger` and stores it in a private field called `logger`.
The `getHeroes()` method logs a message when asked to fetch heroes.


{@a logger-service}

#### The dependent _Logger_ service

The sample app's `Logger` service is quite simple:

<code-example path="dependency-injection/src/app/logger.service.ts" title="src/app/logger.service.ts">
</code-example>

If the app didn't provide this `Logger`,
Angular would throw an exception when it looked for a `Logger` to inject
into the `HeroService`.

<code-example language="sh" class="code-shell">
  ERROR Error: No provider for Logger!
</code-example>

Because a singleton logger service is useful everywhere,
it's provided in the root `AppModule`.

<code-example path="dependency-injection/src/app/app.module.ts" linenums="false" title="src/app/app.module.ts (providers)" region="providers-2">
</code-example>



{@a token}

## Dependency injection tokens

When you register a provider with an injector, you associate that provider with a dependency injection token.
The injector maintains an internal *token-provider* map that it references when
asked for a dependency. The token is the key to the map.

In all previous examples, the dependency value has been a class *instance*, and
the class *type* served as its own lookup key.
Here you get a `HeroService` directly from the injector by supplying the `HeroService` type as the token:

<code-example path="dependency-injection/src/app/injector.component.ts" region="get-hero-service" title="src/app/injector.component.ts" linenums="false">
</code-example>

You have similar good fortune when you write a constructor that requires an injected class-based dependency.
When you define a constructor parameter with the `HeroService` class type,
Angular knows to inject the
service associated with that `HeroService` class token:

<code-example path="dependency-injection/src/app/heroes/hero-list.component.ts" region="ctor-signature" title="src/app/heroes/hero-list.component.ts">
</code-example>

This is especially convenient when you consider that most dependency values are provided by classes.

{@a non-class-dependencies}

### Non-class dependencies

What if the dependency value isn't a class? Sometimes the thing you want to inject is a
string, function, or object.

Applications often define configuration objects with lots of small facts
(like the title of the application or the address of a web API endpoint)
but these configuration objects aren't always instances of a class.
They can be object literals such as this one:

<code-example path="dependency-injection/src/app/app.config.ts" region="config" title="src/app/app.config.ts (excerpt)" linenums="false">
</code-example>

What if you'd like to make this configuration object available for injection?
You know you can register an object with a [value provider](guide/dependency-injection#value-provider).

But what should you use as the token?
You don't have a class to serve as a token.
There is no `AppConfig` class.

<div class="l-sub-section">

### TypeScript interfaces aren't valid tokens

The `HERO_DI_CONFIG` constant conforms to the `AppConfig` interface. 
Unfortunately, you cannot use a TypeScript interface as a token:

<code-example path="dependency-injection/src/app/providers.component.ts" region="providers-9-interface"  linenums="false">
</code-example>

<code-example path="dependency-injection/src/app/providers.component.ts" region="provider-9-ctor-interface"  linenums="false">
</code-example>

That seems strange if you're used to dependency injection in strongly typed languages, where
an interface is the preferred dependency lookup key.

It's not Angular's doing. An interface is a TypeScript design-time artifact. JavaScript doesn't have interfaces.
The TypeScript interface disappears from the generated JavaScript.
There is no interface type information left for Angular to find at runtime.

</div>


{@a injection-token}

### _InjectionToken_

One solution to choosing a provider token for non-class dependencies is
to define and use an [*InjectionToken*](api/core/InjectionToken).
The definition of such a token looks like this:

<code-example>
import { InjectionToken } from '@angular/core';
export const TOKEN = new InjectionToken('desc');
</code-example>

You can directly configure a provider when creating an `InjectionToken`. The provider configuration determines which injector provides the token and how the value will be created.  This is similar to using `@Injectable`, except that you cannot define standard providers (such as `useClass` or `useFactory`) with `InjectionToken`. Instead, you specify a factory function which returns the value to be provided directly.

<code-example>
export const TOKEN = 
  new InjectionToken('desc', { providedIn: 'root', factory: () => new AppConfig(), })
</code-example>

Now you can inject the configuration object into any constructor that needs it, with
the help of an `@Inject` decorator:

<code-example>
constructor(@Inject(TOKEN));
</code-example>

If the factory function needs access to other DI tokens, it can use the inject function from `@angular/core` to request dependencies.

<code-example>
const TOKEN = 
  new InjectionToken('tree-shakeable token', 
    { providedIn: 'root', factory: () => 
        new AppConfig(inject(Parameter1), inject(Paremeter2)), });
</code-example>

{@a optional}

## Optional dependencies

You can tell Angular that the dependency is optional by annotating the constructor argument with null:

<code-example>
constructor(@Inject(Token, null));
</code-example>

When using optional dependencies, your code must be prepared for a null value.

## Summary

You learned the basics of Angular dependency injection in this page.
You can register various kinds of providers,
and you know how to ask for an injected object (such as a service) by
adding a parameter to a constructor.

Angular dependency injection is more capable than this guide has described.
You can learn more about its advanced features, beginning with its support for
nested injectors, in
[Hierarchical Dependency Injection](guide/hierarchical-dependency-injection).

{@a explicit-injector}

## Appendix: Working with injectors directly

Developers rarely work directly with an injector, but
here's an `InjectorComponent` that does.

<code-example path="dependency-injection/src/app/injector.component.ts" region="injector" title="src/app/injector.component.ts">
</code-example>

An `Injector` is itself an injectable service.

In this example, Angular injects the component's own `Injector` into the component's constructor.
The component then asks the injected injector for the services it wants in `ngOnInit()`.

Note that the services themselves are not injected into the component.
They are retrieved by calling `injector.get()`.

The `get()` method throws an error if it can't resolve the requested service.
You can call `get()` with a second parameter, which is the value to return if the service
is not found. Angular can't find the service if it's not registered with this or any ancestor injector.


<div class="l-sub-section">



The technique is an example of the
[service locator pattern](https://en.wikipedia.org/wiki/Service_locator_pattern).

**Avoid** this technique unless you genuinely need it.
It encourages a careless grab-bag approach such as you see here.
It's difficult to explain, understand, and test.
You can't know by inspecting the constructor what this class requires or what it will do.
It could acquire services from any ancestor component, not just its own.
You're forced to spelunk the implementation to discover what it does.

Framework developers may take this approach when they
must acquire services generically and dynamically.


</div>

{@a one-class-per-file}

## Appendix: one class per file

Having multiple classes in the same file is confusing and best avoided.
Developers expect one class per file. Keep them happy.

If you combine the `HeroService` class with
the `HeroesComponent` in the same file,
**define the component last**.
If you define the component before the service,
you'll get a runtime null reference error.


<div class="l-sub-section">

You actually can define the component first with the help of the `forwardRef()` method as explained
in this [blog post](http://blog.thoughtram.io/angular/2015/09/03/forward-references-in-angular-2.html).

But it's best to avoid the problem altogether by defining components and services in separate files.

</div>

