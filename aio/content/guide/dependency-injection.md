@title
Dependency Injection

@intro
Angular's dependency injection system creates and delivers dependent services "just-in-time".

@description



**Dependency injection** is an important application design pattern.
Angular has its own dependency injection framework, and
you really can't build an Angular application without it.
It's used so widely that almost everyone just calls it _DI_.

This page covers what DI is, why it's so useful,
and [how to use it](guide/dependency-injection#angular-di) in an Angular app.

<!--

# Contents

* [Why dependency injection?](guide/dependency-injection#why-di)
* [Angular dependency injection](guide/dependency-injection#angular-dependency-injection)

  * [Configuring the injector](guide/dependency-injection#injector-config)
  * [Registering providers in an `NgModule`](guide/dependency-injection#register-providers-ngmodule)
  * [Registering providers in a component](guide/dependency-injection#register-providers-component)
  * [When to use `NgModule` versus an application component](guide/dependency-injection#ngmodule-vs-comp)
  * [Preparing the `HeroListComponent` for injection](guide/dependency-injection#prep-for-injection)
  * [Implicit injector creation](guide/dependency-injection#di-metadata)
  * [Singleton services](guide/dependency-injection#singleton-services)
  * [Testing the component](guide/dependency-injection#testing-the-component)
  * [When the service needs a service](guide/dependency-injection#service-needs-service)
  * [Why `@Injectable()`?](guide/dependency-injection#injectable)

* [Creating and registering a logger service](guide/dependency-injection#logger-service)
* [Injector providers](guide/dependency-injection#injector-providers)

  * [The `Provider` class and `provide` object literal](guide/dependency-injection#provide)
  * [Alternative class providers](guide/dependency-injection#class-provider)
  * [Class provider with dependencies](guide/dependency-injection#class-provider-dependencies)
  * [Aliased class providers](guide/dependency-injection#aliased-class-providers)
  * [Value providers](guide/dependency-injection#value-provider)
  * [Factory providers](guide/dependency-injection#factory-provider)

* [Dependency injection tokens](guide/dependency-injection#dependency-injection-tokens)

  * [Non-class dependencies](guide/dependency-injection#non-class-dependencies)
  * [`InjectionToken`](guide/dependency-injection#injection-token)

* [Optional dependencies](guide/dependency-injection#optional)
* [Summary](guide/dependency-injection#summary)
* [Appendix: Working with injectors directly](guide/dependency-injection#explicit-injector)

-->

Run the <live-example></live-example>.

{@a why-di }

## Why dependency injection?

To understand why dependency injection is so important, consider an example without it.
Imagine writing the following code:


<code-example path="dependency-injection/src/app/car/car-no-di.ts" region="car" title="src/app/car/car.ts (without DI)">

</code-example>



The `Car` class creates everything it needs inside its constructor.
What's the problem?
The problem is that the `Car` class is brittle, inflexible, and hard to test.

This `Car` needs an engine and tires. Instead of asking for them,
the `Car` constructor instantiates its own copies from
the very specific classes `Engine` and `Tires`.

What if the `Engine` class evolves and its constructor requires a parameter?
That would break the `Car` class and it would stay broken until you rewrote it along the lines of
`this.engine = new Engine(theNewParameter)`.
The `Engine` constructor parameters weren't even a consideration when you first wrote `Car`.
You may not anticipate them even now.
But you'll *have* to start caring because
when the definition of `Engine` changes, the `Car` class must change.
That makes `Car` brittle.

What if you want to put a different brand of tires on your `Car`? Too bad.
You're locked into whatever brand the `Tires` class creates. That makes the
`Car` class inflexible.

Right now each new car gets its own `engine`. It can't share an `engine` with other cars.
While that makes sense for an automobile engine,
surely you can think of other dependencies that should be shared, such as the onboard
wireless connection to the manufacturer's service center. This `Car` lacks the flexibility
to share services that have been created previously for other consumers.

When you write tests for `Car` you're at the mercy of its hidden dependencies.
Is it even possible to create a new `Engine` in a test environment?
What does `Engine` depend upon? What does that dependency depend on?
Will a new instance of `Engine` make an asynchronous call to the server?
You certainly don't want that going on during tests.

What if the `Car` should flash a warning signal when tire pressure is low?
How do you confirm that it actually does flash a warning
if you can't swap in low-pressure tires during the test?

You have no control over the car's hidden dependencies.
When you can't control the dependencies, a class becomes difficult to test.

How can you make `Car` more robust, flexible, and testable?

{@a ctor-injection}
That's super easy. Change the `Car` constructor to a version with DI:


<code-tabs>

  <code-pane title="src/app/car/car.ts (excerpt with DI)" path="dependency-injection/src/app/car/car.ts" region="car-ctor">

  </code-pane>

  <code-pane title="src/app/car/car.ts (excerpt without DI)" path="dependency-injection/src/app/car/car-no-di.ts" region="car-ctor">

  </code-pane>

</code-tabs>



See what happened? The definition of the dependencies are
now in the constructor.
The `Car` class no longer creates an `engine` or `tires`.
It just consumes them.


<div class="l-sub-section">



This example leverages TypeScript's constructor syntax for declaring
parameters and properties simultaneously.


</div>



Now you can create a car by passing the engine and tires to the constructor.


<code-example path="dependency-injection/src/app/car/car-creations.ts" region="car-ctor-instantiation" linenums="false">

</code-example>



How cool is that?
The definition of the `engine` and `tire` dependencies are
decoupled from the `Car` class.
You can pass in any kind of `engine` or `tires` you like, as long as they
conform to the general API requirements of an `engine` or `tires`.

Now, if someone extends the `Engine` class, that is not `Car`'s problem.


<div class="l-sub-section">



The _consumer_ of `Car` has the problem. The consumer must update the car creation code to
something like this:


<code-example path="dependency-injection/src/app/car/car-creations.ts" region="car-ctor-instantiation-with-param" linenums="false">

</code-example>



The critical point is this: the `Car` class did not have to change.
You'll take care of the consumer's problem shortly.


</div>



The `Car` class is much easier to test now because you are in complete control
of its dependencies.
You can pass mocks to the constructor that do exactly what you want them to do
during each test:


<code-example path="dependency-injection/src/app/car/car-creations.ts" region="car-ctor-instantiation-with-mocks" linenums="false">

</code-example>



**You just learned what dependency injection is**.

It's a coding pattern in which a class receives its dependencies from external
sources rather than creating them itself.

Cool! But what about that poor consumer?
Anyone who wants a `Car` must now
create all three parts: the `Car`, `Engine`, and `Tires`.
The `Car` class shed its problems at the consumer's expense.
You need something that takes care of assembling these parts.

You _could_ write a giant class to do that:


<code-example path="dependency-injection/src/app/car/car-factory.ts" title="src/app/car/car-factory.ts">

</code-example>



It's not so bad now with only three creation methods.
But maintaining it will be hairy as the application grows.
This factory is going to become a huge spiderweb of
interdependent factory methods!

Wouldn't it be nice if you could simply list the things you want to build without
having to define which dependency gets injected into what?

This is where the dependency injection framework comes into play.
Imagine the framework had something called an _injector_.
You register some classes with this injector, and it figures out how to create them.

When you need a `Car`, you simply ask the injector to get it for you and you're good to go.


<code-example path="dependency-injection/src/app/car/car-injector.ts" region="injector-call" title="src/app/car/car-injector.ts" linenums="false">

</code-example>



Everyone wins. The `Car` knows nothing about creating an `Engine` or `Tires`.
The consumer knows nothing about creating a `Car`.
You don't have a gigantic factory class to maintain.
Both `Car` and consumer simply ask for what they need and the injector delivers.

This is what a **dependency injection framework** is all about.

Now that you know what dependency injection is and appreciate its benefits,
read on to see how it is implemented in Angular.

{@a angular-di}

## Angular dependency injection

Angular ships with its own dependency injection framework. This framework can also be used
as a standalone module by other applications and frameworks.

To see what it can do when building components in Angular,
start with a simplified version of the `HeroesComponent`
that from the [The Tour of Heroes](tutorial/).


<code-tabs>

  <code-pane title="src/app/heroes/heroes.component.ts" path="dependency-injection/src/app/heroes/heroes.component.1.ts" region="v1">

  </code-pane>

  <code-pane title="src/app/heroes/hero-list.component.ts" path="dependency-injection/src/app/heroes/hero-list.component.1.ts">

  </code-pane>

  <code-pane title="src/app/heroes/hero.ts" path="dependency-injection/src/app/heroes/hero.ts">

  </code-pane>

  <code-pane title="src/app/heroes/mock-heroes.ts" path="dependency-injection/src/app/heroes/mock-heroes.ts">

  </code-pane>

</code-tabs>



The `HeroesComponent` is the root component of the *Heroes* feature area.
It governs all the child components of this area.
This stripped down version has only one child, `HeroListComponent`,
which displays a list of heroes.


Right now `HeroListComponent` gets heroes from `HEROES`, an in-memory collection
defined in another file.
That may suffice in the early stages of development, but it's far from ideal.
As soon as you try to test this component or want to get your heroes data from a remote server,
you'll have to change the implementation of `heroes` and
fix every other use of the `HEROES` mock data.

It's better to make a service that hides how the app gets hero data.


<div class="l-sub-section">



Given that the service is a
[separate concern](https://en.wikipedia.org/wiki/Separation_of_concerns),
consider writing the service code in its own file.

See [this note](guide/dependency-injection#one-class-per-file) for details.

</div>



The following `HeroService` exposes a `getHeroes` method that returns
the same mock data as before, but none of its consumers need to know that.


<code-example path="dependency-injection/src/app/heroes/hero.service.1.ts" title="src/app/heroes/hero.service.ts">

</code-example>





<div class="l-sub-section">



The `@Injectable()` decorator above the service class is
covered [shortly](guide/dependency-injection#injectable).


</div>



<div class="l-sub-section">



Of course, this isn't a real service.
If the app were actually getting data from a remote server, the API would have to be
asynchronous, perhaps returning a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).
You'd also have to rewrite the way components consume the service.
This is important in general, but not in this example.


</div>



A service is nothing more than a class in Angular.
It remains nothing more than a class until you register it with an Angular injector.


<div id='bootstrap'>

</div>



{@a injector-config}


### Configuring the injector

You don't have to create an Angular injector.
Angular creates an application-wide injector for you during the bootstrap process.


<code-example path="dependency-injection/src/main.ts" linenums="false" title="src/main.ts (bootstrap)" region="bootstrap">

</code-example>



You do have to configure the injector by registering the **providers**
that create the services the application requires.
This guide explains what [providers](guide/dependency-injection#providers) are later.


You can either register a provider within an [NgModule](guide/ngmodule) or in application components.


{@a register-providers-ngmodule}


### Registering providers in an _NgModule_
Here's the `AppModule` that registers two providers, `UserService` and an `APP_CONFIG` provider,
in its `providers` array.


<code-example path="dependency-injection/src/app/app.module.ts" linenums="false" title="src/app/app.module.ts (excerpt)" region="ngmodule">

</code-example>



Because the `HeroService` is used _only_ within the `HeroesComponent`
and its subcomponents, the top-level `HeroesComponent` is the ideal
place to register it.


{@a register-providers-component}


### Registering providers in a component

Here's a revised `HeroesComponent` that registers the `HeroService` in its `providers` array.


<code-example path="dependency-injection/src/app/heroes/heroes.component.1.ts" region="full" title="src/app/heroes/heroes.component.ts" linenums="false">

</code-example>



{@a ngmodule-vs-comp}


### When to use _NgModule_ versus an application component

On the one hand, a provider in an `NgModule` is registered in the root injector. That means that every provider
registered within an `NgModule` will be accessible in the _entire application_.

On the other hand, a provider registered in an application component is available only on
that component and all its children.

Here, the `APP_CONFIG` service needs to be available all across the application, so it's
registered in the `AppModule` `@NgModule` `providers` array.
But since the `HeroService` is only used within the *Heroes*
feature area and nowhere else, it makes sense to register it in
the `HeroesComponent`.


<div class="l-sub-section">



Also see *"Should I add app-wide providers to the root `AppModule` or
the root `AppComponent`?"* in the [NgModule FAQ](guide/ngmodule-faq#q-root-component-or-module).


</div>



{@a prep-for-injection}


### Preparing the _HeroListComponent_ for injection

The `HeroListComponent` should get heroes from the injected `HeroService`.
Per the dependency injection pattern, the component must ask for the service in its
constructor, [as discussed earlier](guide/dependency-injection#ctor-injection).
It's a small change:


<code-tabs>

  <code-pane title="src/app/heroes/hero-list.component (with DI)" path="dependency-injection/src/app/heroes/hero-list.component.2.ts">

  </code-pane>

  <code-pane title="src/app/heroes/hero-list.component (without DI)" path="dependency-injection/src/app/heroes/hero-list.component.1.ts">

  </code-pane>

</code-tabs>



<div class="l-sub-section">



#### Focus on the constructor

Adding a parameter to the constructor isn't all that's happening here.


<code-example path="dependency-injection/src/app/heroes/hero-list.component.2.ts" region="ctor" title="src/app/heroes/hero-list.component.ts" linenums="false">

</code-example>



Note that the constructor parameter has the type `HeroService`, and that
the `HeroListComponent` class has an `@Component` decorator
(scroll up to confirm that fact).
Also recall that the parent component (`HeroesComponent`)
has `providers` information for `HeroService`.

The constructor parameter type, the `@Component` decorator,
and the parent's `providers` information combine to tell the
Angular injector to inject an instance of
`HeroService` whenever it creates a new `HeroListComponent`.


</div>



{@a di-metadata}


### Implicit injector creation

You saw how to use an injector to create a new
`Car` earlier in this guide.
You _could_ create such an injector
explicitly:


<code-example path="dependency-injection/src/app/car/car-injector.ts" region="injector-create-and-call" title="src/app/car/car-injector.ts" linenums="false">

</code-example>



You won't find code like that in the Tour of Heroes or any of the other
documentation samples.
You *could* write code that [explicitly creates an injector](guide/dependency-injection#explicit-injector) if you *had* to,
but it's not always the best choice.
Angular takes care of creating and calling injectors
when it creates components for you&mdash;whether through HTML markup, as in `<hero-list></hero-list>`,
or after navigating to a component with the [router](guide/router).
If you let Angular do its job, you'll enjoy the benefits of automated dependency injection.


{@a singleton-services}


### Singleton services

Dependencies are singletons within the scope of an injector.
In this guide's example, a single `HeroService` instance is shared among the
`HeroesComponent` and its `HeroListComponent` children.

However, Angular DI is a hierarchical injection
system, which means that nested injectors can create their own service instances.
For more information, see [Hierarchical Injectors](guide/hierarchical-dependency-injection).


{@a testing-the-component}


### Testing the component

Earlier you saw that designing a class for dependency injection makes the class easier to test.
Listing dependencies as constructor parameters may be all you need to test application parts effectively.

For example, you can create a new `HeroListComponent` with a mock service that you can manipulate
under test:


<code-example path="dependency-injection/src/app/test.component.ts" region="spec" title="src/app/test.component.ts" linenums="false">

</code-example>



<div class="l-sub-section">



Learn more in [Testing](guide/testing).


</div>



{@a service-needs-service}


### When the service needs a service

The `HeroService` is very simple. It doesn't have any dependencies of its own.


What if it had a dependency? What if it reported its activities through a logging service?
You'd apply the same *constructor injection* pattern,
adding a constructor that takes a `Logger` parameter.

Here is the revision compared to the original.


<code-tabs>

  <code-pane title="src/app/heroes/hero.service (v2)" path="dependency-injection/src/app/heroes/hero.service.2.ts">

  </code-pane>

  <code-pane title="src/app/heroes/hero.service (v1)" path="dependency-injection/src/app/heroes/hero.service.1.ts">

  </code-pane>

</code-tabs>



The constructor now asks for an injected instance of a `Logger` and stores it in a private property called `logger`.
You call that property within the `getHeroes()` method when anyone asks for heroes.


{@a injectable}


### Why _@Injectable()_?

**[@Injectable()](api/core/Injectable)** marks a class as available to an
injector for instantiation. Generally speaking, an injector reports an
error when trying to instantiate a class that is not marked as
`@Injectable()`.


<div class="l-sub-section">



As it happens, you could have omitted `@Injectable()` from the first
version of `HeroService` because it had no injected parameters.
But you must have it now that the service has an injected dependency.
You need it because Angular requires constructor parameter metadata
in order to inject a `Logger`.


</div>



<div class="callout is-helpful">



<header>
  Suggestion: add @Injectable() to every service class
</header>



Consider adding `@Injectable()` to every service class, even those that don't have dependencies
and, therefore, do not technically require it. Here's why:


<ul style="font-size:inherit">

  <li>
    <b>Future proofing:</b> No need to remember <code>@Injectable()</code> when you add a dependency later.
  </li>

  <li>
    <b>Consistency:</b> All services follow the same rules, and you don't have to wonder why a decorator is missing.
  </li>

</ul>



</div>



Injectors are also responsible for instantiating components
like `HeroesComponent`. So why doesn't `HeroesComponent` have
`@Injectable()`?

You *can* add it if you really want to. It isn't necessary because the
`HeroesComponent` is already marked with `@Component`, and this
decorator class (like `@Directive` and `@Pipe`, which you learn about later)
is a subtype of [@Injectable()](api/core/Injectable).  It is in
fact `@Injectable()` decorators that
identify a class as a target for instantiation by an injector.


<div class="l-sub-section">



At runtime, injectors can read class metadata in the transpiled JavaScript code
and use the constructor parameter type information
to determine what things to inject.

Not every JavaScript class has metadata.
The TypeScript compiler discards metadata by default.
If the `emitDecoratorMetadata` compiler option is true
(as it should be in the `tsconfig.json`),
the compiler adds the metadata to the generated JavaScript
for _every class with at least one decorator_.

While any decorator will trigger this effect, mark the service class with the
[@Injectable()](api/core/Injectable) decorator
to make the intent clear.


</div>



<div class="callout is-critical">



<header>
  Always include the parentheses
</header>



Always write `@Injectable()`, not just `@Injectable`.
The application will fail mysteriously if you forget the parentheses.


</div>


{@a logger-service}

## Creating and registering a logger service

Inject a logger into `HeroService` in two steps:

1. Create the logger service.
1. Register it with the application.

The logger service is quite simple:


<code-example path="dependency-injection/src/app/logger.service.ts" title="src/app/logger.service.ts">

</code-example>



You're likely to need the same logger service everywhere in your application,
so put it in the project's `app` folder and
register it in the `providers` array of the application module, `AppModule`.


<code-example path="dependency-injection/src/app/providers.component.ts" linenums="false" title="src/app/providers.component.ts (excerpt)" region="providers-logger">

</code-example>



If you forget to register the logger, Angular throws an exception when it first looks for the logger:

<code-example format="nocode">
  EXCEPTION: No provider for Logger! (HeroListComponent -> HeroService -> Logger)

</code-example>



That's Angular telling you that the dependency injector couldn't find the *provider* for the logger.
It needed that provider to create a `Logger` to inject into a new
`HeroService`, which it needed to
create and inject into a new `HeroListComponent`.

The chain of creations started with the `Logger` provider. *Providers* are the subject of the next section.

{@a providers}

## Injector providers

A provider *provides* the concrete, runtime version of a dependency value.
The injector relies on **providers** to create instances of the services
that the injector injects into components and other services.

You must register a service *provider* with the injector, or it won't know how to create the service.

Earlier you registered the `Logger` service in the `providers` array of the metadata for the `AppModule` like this:


<code-example path="dependency-injection/src/app/providers.component.ts" region="providers-logger" title="src/app/providers.component.ts">

</code-example>



There are many ways to *provide* something that looks and behaves like a `Logger`.
The `Logger` class itself is an obvious and natural provider.
But it's not the only way.

You can configure the injector with alternative providers that can deliver an object that behaves like a `Logger`.
You could provide a substitute class. You could provide a logger-like object.
You could give it a provider that calls a logger factory function.
Any of these approaches might be a good choice under the right circumstances.

What matters is that the injector has a provider to go to when it needs a `Logger`.


<div id='provide'>

</div>



### The *Provider* class and _provide_ object literal


You wrote the `providers` array like this:


<code-example path="dependency-injection/src/app/providers.component.ts" region="providers-1" title="src/app/providers.component.ts">

</code-example>



This is actually a shorthand expression for a provider registration
using a _provider_ object literal with two properties:


<code-example path="dependency-injection/src/app/providers.component.ts" region="providers-3" title="src/app/providers.component.ts">

</code-example>



The first is the [token](guide/dependency-injection#token) that serves as the key for both locating a dependency value
and registering the provider.

The second is a provider definition object,
which you can think of as a *recipe* for creating the dependency value.
There are many ways to create dependency values just as there are many ways to write a recipe.


<div id='class-provider'>

</div>



### Alternative class providers

Occasionally you'll ask a different class to provide the service.
The following code tells the injector
to return a `BetterLogger` when something asks for the `Logger`.


<code-example path="dependency-injection/src/app/providers.component.ts" region="providers-4" title="src/app/providers.component.ts">

</code-example>



{@a class-provider-dependencies}


### Class provider with dependencies
Maybe an `EvenBetterLogger` could display the user name in the log message.
This logger gets the user from the injected `UserService`,
which is also injected at the application level.


<code-example path="dependency-injection/src/app/providers.component.ts" region="EvenBetterLogger" title="src/app/providers.component.ts" linenums="false">

</code-example>



Configure it like `BetterLogger`.


<code-example path="dependency-injection/src/app/providers.component.ts" region="providers-5" title="src/app/providers.component.ts" linenums="false">

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


<code-example path="dependency-injection/src/app/providers.component.ts" region="providers-6a" title="src/app/providers.component.ts" linenums="false">

</code-example>



The solution: alias with the `useExisting` option.


<code-example path="dependency-injection/src/app/providers.component.ts" region="providers-6b" linenums="false">

</code-example>



{@a value-provider}


### Value providers


Sometimes it's easier to provide a ready-made object rather than ask the injector to create it from a class.


<code-example path="dependency-injection/src/app/providers.component.ts" region="silent-logger" title="src/app/providers.component.ts" linenums="false">

</code-example>



Then you register a provider with the `useValue` option,
which makes this object play the logger role.


<code-example path="dependency-injection/src/app/providers.component.ts" region="providers-7" linenums="false">

</code-example>



See more `useValue` examples in the
[Non-class dependencies](guide/dependency-injection#non-class-dependencies) and
[InjectionToken](guide/dependency-injection#injection-token) sections.


<div id='factory-provider'>

</div>



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

  <code-pane title="src/app/heroes/heroes.component (v2)" path="dependency-injection/src/app/heroes/heroes.component.1.ts" region="full">

  </code-pane>

</code-tabs>


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

<p>
  What if the dependency value isn't a class? Sometimes the thing you want to inject is a
  string, function, or object.
</p>



<p>
  Applications often define configuration objects with lots of small facts
  (like the title of the application or the address of a web API endpoint)
  but these configuration objects aren't always instances of a class.
  They can be object literals such as this one:
</p>



<code-example path="dependency-injection/src/app/app.config.ts" region="config" title="src/app/app-config.ts (excerpt)" linenums="false">

</code-example>



What if you'd like to make this configuration object available for injection?
You know you can register an object with a [value provider](guide/dependency-injection#value-provider).


But what should you use as the token?
You don't have a class to serve as a token.
There is no `AppConfig` class.


<div class="l-sub-section">



### TypeScript interfaces aren't valid tokens

The `HERO_DI_CONFIG` constant has an interface, `AppConfig`. Unfortunately, you
cannot use a TypeScript interface as a token:

<code-example path="dependency-injection/src/app/providers.component.ts" region="providers-9-interface" title="src/app/providers.component.ts" linenums="false">

</code-example>



<code-example path="dependency-injection/src/app/providers.component.ts" region="provider-9-ctor-interface" title="src/app/providers.component.ts" linenums="false">

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


<code-example path="dependency-injection/src/app/app.config.ts" region="token" title="src/app/app.config.ts" linenums="false">

</code-example>



The type parameter, while optional, conveys the dependency's type to developers and tooling.
The token description is another developer aid.

Register the dependency provider using the `InjectionToken` object:


<code-example path="dependency-injection/src/app/providers.component.ts" region="providers-9" title="src/app/providers.component.ts" linenums="false">

</code-example>



Now you can inject the configuration object into any constructor that needs it, with
the help of an `@Inject` decorator:


<code-example path="dependency-injection/src/app/app.component.2.ts" region="ctor" title="src/app/app.component.ts" linenums="false">

</code-example>



<div class="l-sub-section">



Although the `AppConfig` interface plays no role in dependency injection,
it supports typing of the configuration object within the class.


</div>



Alternatively, you can provide and inject the configuration object in an ngModule like `AppModule`.

<code-example path="dependency-injection/src/app/app.module.ts" region="ngmodule-providers" title="src/app/app.module.ts (ngmodule-providers)"></code-example>

<div id='optional'>

</div>



## Optional dependencies

The `HeroService` *requires* a `Logger`, but what if it could get by without
a `logger`?
You can tell Angular that the dependency is optional by annotating the
constructor argument with `@Optional()`:


<code-example path="dependency-injection/src/app/providers.component.ts" region="import-optional">

</code-example>



<code-example path="dependency-injection/src/app/providers.component.ts" region="provider-10-ctor" linenums="false">

</code-example>



When using `@Optional()`, your code must be prepared for a null value. If you
don't register a `logger` somewhere up the line, the injector will set the
value of `logger` to null.



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

## Appendix: Why have one class per file

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
But why flirt with trouble?
Avoid the problem altogether by defining components and services in separate files.

</div>

