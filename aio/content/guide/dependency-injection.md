@title
Dependency Injection

@intro
Angular's dependency injection system creates and delivers dependent services "just-in-time".

@description
**Dependency injection** is an important application design pattern.
Angular has its own dependency injection framework, and
we really can't build an Angular application without it.
It's used so widely that almost everyone just calls it _DI_.

In this chapter we'll learn what DI is and why we want it.
Then we'll learn [how to use it](guide/dependency-injection#angular-di) in an Angular app.

- [Why dependency injection?](guide/dependency-injection#why-dependency-injection)
- [Angular dependency injection](guide/dependency-injection#angular-dependency-injection)
- [Injector providers](guide/dependency-injection#injector-providers)
- [Dependency injection tokens](guide/dependency-injection#dependency-injection-tokens)
- [Summary](guide/dependency-injection#summary)

Run the <live-example></live-example>.

## Why dependency injection?

Let's start with the following code.


{@example 'dependency-injection/ts/src/app/car/car-no-di.ts' region='car'}

Our `Car` creates everything it needs inside its constructor.
What's the problem?
The problem is that our `Car` class is brittle, inflexible, and hard to test.

Our `Car` needs an engine and tires. Instead of asking for them,
the `Car` constructor instantiates its own copies from
the very specific classes `Engine` and `Tires`.

What if the `Engine` class evolves and its constructor requires a parameter?
Our `Car` is broken and stays broken until we rewrite it along the lines of
`#{_thisDot}engine = new Engine(theNewParameter)`.
We didn't care about `Engine` constructor parameters when we first wrote `Car`.
We don't really care about them now.
But we'll *have* to start caring because
when the definition of `Engine` changes, our `Car` class must change.
That makes `Car` brittle.

What if we want to put a different brand of tires on our `Car`? Too bad.
We're locked into whatever brand the `Tires` class creates. That makes our `Car` inflexible.

Right now each new car gets its own engine. It can't share an engine with other cars.
While that makes sense for an automobile engine,
we can think of other dependencies that should be shared, such as the onboard
wireless connection to the manufacturer's service center. Our `Car` lacks the flexibility
to share services that have been created previously for other consumers.

When we write tests for our `Car` we're at the mercy of its hidden dependencies.
Is it even possible to create a new `Engine` in a test environment?
What does `Engine`itself depend upon? What does that dependency depend on?
Will a new instance of `Engine` make an asynchronous call to the server?
We certainly don't want that going on during our tests.

What if our `Car` should flash a warning signal when tire pressure is low?
How do we confirm that it actually does flash a warning
if we can't swap in low-pressure tires during the test?

We have no control over the car's hidden dependencies.
When we can't control the dependencies, a class becomes difficult to test.

How can we make `Car` more robust, flexible, and testable?

<a id="ctor-injection"></a>
That's super easy. We change our `Car` constructor to a version with DI:

<md-tab-group>

  <md-tab label="src/app/car/car.ts (excerpt with DI)">
    {@example 'dependency-injection/ts/src/app/car/car.ts' region='car-ctor'}
  </md-tab>


  <md-tab label="src/app/car/car.ts (excerpt without DI)">
    {@example 'dependency-injection/ts/src/app/car/car-no-di.ts' region='car-ctor'}
  </md-tab>


</md-tab-group>

See what happened? We moved the definition of the dependencies to the constructor.
Our `Car` class no longer creates an engine or tires.
It just consumes them.
Now we create a car by passing the engine and tires to the constructor.


{@example 'dependency-injection/ts/src/app/car/car-creations.ts' region='car-ctor-instantiation'}

How cool is that?
The definition of the engine and tire dependencies are
decoupled from the `Car` class itself.
We can pass in any kind of engine or tires we like, as long as they
conform to the general API requirements of an engine or tires.

If someone extends the `Engine` class, that is not `Car`'s problem.

The _consumer_ of `Car` has the problem. The consumer must update the car creation code to
something like this:


{@example 'dependency-injection/ts/src/app/car/car-creations.ts' region='car-ctor-instantiation-with-param'}

The critical point is this: `Car` itself did not have to change.
We'll take care of the consumer's problem soon enough.
The `Car` class is much easier to test because we are in complete control
of its dependencies.
We can pass mocks to the constructor that do exactly what we want them to do
during each test:


{@example 'dependency-injection/ts/src/app/car/car-creations.ts' region='car-ctor-instantiation-with-mocks'}

**We just learned what dependency injection is**.

It's a coding pattern in which a class receives its dependencies from external
sources rather than creating them itself.

Cool! But what about that poor consumer?
Anyone who wants a `Car` must now
create all three parts: the `Car`, `Engine`, and `Tires`.
The `Car` class shed its problems at the consumer's expense.
We need something that takes care of assembling these parts for us.

We could write a giant class to do that:


{@example 'dependency-injection/ts/src/app/car/car-factory.ts'}

It's not so bad now with only three creation methods.
But maintaining it will be hairy as the application grows.
This factory is going to become a huge spiderweb of
interdependent factory methods!

Wouldn't it be nice if we could simply list the things we want to build without
having to define which dependency gets injected into what?

This is where the dependency injection framework comes into play.
Imagine the framework had something called an _injector_.
We register some classes with this injector, and it figures out how to create them.

When we need a `Car`, we simply ask the injector to get it for us and we're good to go.


{@example 'dependency-injection/ts/src/app/car/car-injector.ts' region='injector-call'}

Everyone wins. The `Car` knows nothing about creating an `Engine` or `Tires`.
The consumer knows nothing about creating a `Car`.
We don't have a gigantic factory class to maintain.
Both `Car` and consumer simply ask for what they need and the injector delivers.

This is what a **dependency injection framework** is all about.

Now that we know what dependency injection is and appreciate its benefits,
let's see how it is implemented in Angular.

## Angular dependency injection

Angular ships with its own dependency injection framework. This framework can also be used
as a standalone module by other applications and frameworks.

That sounds nice. What does it do for us when building components in Angular?
Let's see, one step at a time.

We'll begin with a simplified version of the `HeroesComponent`
that we built in the [The Tour of Heroes](tutorial/).

<md-tab-group>

  <md-tab label="src/app/heroes/heroes.component.ts">
    {@example 'dependency-injection/ts/src/app/heroes/heroes.component.1.ts' region='v1'}
  </md-tab>


  <md-tab label="src/app/heroes/hero-list.component.ts">
    {@example 'dependency-injection/ts/src/app/heroes/hero-list.component.1.ts'}
  </md-tab>


  <md-tab label="src/app/heroes/hero.ts">
    {@example 'dependency-injection/ts/src/app/heroes/hero.ts'}
  </md-tab>


  <md-tab label="src/app/heroes/mock-heroes.ts">
    {@example 'dependency-injection/ts/src/app/heroes/mock-heroes.ts'}
  </md-tab>


</md-tab-group>

The `HeroesComponent` is the root component of the *Heroes* feature area.
It governs all the child components of this area.
Our stripped down version has only one child, `HeroListComponent`,
which displays a list of heroes.
Right now `HeroListComponent` gets heroes from `HEROES`, an in-memory collection
defined in another file.
That may suffice in the early stages of development, but it's far from ideal.
As soon as we try to test this component or want to get our heroes data from a remote server,
we'll have to change the implementation of `heroes` and
fix every other use of the `HEROES` mock data.

Let's make a service that hides how we get hero data.

Given that the service is a
[separate concern](https://en.wikipedia.org/wiki/Separation_of_concerns),
we suggest that you
write the service code in its own file.

{@example 'dependency-injection/ts/src/app/heroes/hero.service.1.ts'}

Our `HeroService` exposes a `getHeroes` method that returns
the same mock data as before, but none of its consumers need to know that.
Notice the `@Injectable()` #{_decorator} above the service class.
We'll discuss its purpose [shortly](guide/dependency-injection#injectable).

We aren't even pretending this is a real service.
If we were actually getting data from a remote server, the API would have to be 
asynchronous, #{_perhaps} returning a !{_PromiseLinked}.
We'd also have to rewrite the way components consume our service.
This is important in general, but not to our current story.
A service is nothing more than a class in Angular.
It remains nothing more than a class until we register it with an Angular injector.

<div id='bootstrap'>

</div>

### Configuring the injector

We don't have to create an Angular injector.
Angular creates an application-wide injector for us during the bootstrap process.
We do have to configure the injector by registering the **providers**
that create the services our application requires.
We'll explain what [providers](guide/dependency-injection#providers) are later in this chapter.
### Registering providers in a component

Here's a revised `HeroesComponent` that registers the `HeroService`.


{@example 'dependency-injection/ts/src/app/heroes/heroes.component.1.ts' region='full'}

### Preparing the HeroListComponent for injection

The `HeroListComponent` should get heroes from the injected `HeroService`.
Per the dependency injection pattern, the component must ask for the service in its 
constructor, [as we explained earlier](guide/dependency-injection#ctor-injection).
It's a small change:

<md-tab-group>

  <md-tab label="src/app/heroes/hero-list.component (with DI)">
    {@example 'dependency-injection/ts/src/app/heroes/hero-list.component.2.ts'}
  </md-tab>


  <md-tab label="src/app/heroes/hero-list.component (without DI)">
    {@example 'dependency-injection/ts/src/app/heroes/hero-list.component.1.ts'}
  </md-tab>


</md-tab-group>


#### Focus on the constructor

Adding a parameter to the constructor isn't all that's happening here.


{@example 'dependency-injection/ts/src/app/heroes/hero-list.component.2.ts' region='ctor'}

Note that the constructor parameter has the type `HeroService`, and that
the `HeroListComponent` class has an `@Component` #{_decorator}
(scroll up to confirm that fact).
Also recall that the parent component (`HeroesComponent`)
has `providers` information for `HeroService`.

The constructor parameter type, the `@Component` #{_decorator},
and the parent's `providers` information combine to tell the
Angular injector to inject an instance of
`HeroService` whenever it creates a new `HeroListComponent`.

<div id='di-metadata'>

</div>

### Implicit injector creation

When we introduced the idea of an injector above, we showed how to
use it to create a new `Car`. Here we also show how such an injector
would be explicitly created:


{@example 'dependency-injection/ts/src/app/car/car-injector.ts' region='injector-create-and-call'}

We won't find code like that in the Tour of Heroes or any of our other samples.
We *could* write code that [explicitly creates an injector](guide/dependency-injection#explicit-injector) if we *had* to, but we rarely do.
Angular takes care of creating and calling injectors
when it creates components for us &mdash; whether through HTML markup, as in `<hero-list></hero-list>`,
or after navigating to a component with the [router](guide/router).
If we let Angular do its job, we'll enjoy the benefits of automated dependency injection.
### Singleton services

Dependencies are singletons within the scope of an injector.
In our example, a single `HeroService` instance is shared among the
`HeroesComponent` and its `HeroListComponent` children.

However, Angular DI is an hierarchical injection
system, which means that nested injectors can create their own service instances.
Learn more about that in the [Hierarchical Injectors](guide/hierarchical-dependency-injection) chapter.
### Testing the component

We emphasized earlier that designing a class for dependency injection makes the class easier to test.
Listing dependencies as constructor parameters may be all we need to test application parts effectively.

For example, we can create a new `HeroListComponent` with a mock service that we can manipulate
under test:


{@example 'dependency-injection/ts/src/app/test.component.ts' region='spec'}


Learn more in [Testing](guide/testing).
### When the service needs a service

Our `HeroService` is very simple. It doesn't have any dependencies of its own.


What if it had a dependency? What if it reported its activities through a logging service?
We'd apply the same *constructor injection* pattern,
adding a constructor that takes a `Logger` parameter.

Here is the revision compared to the original.

<md-tab-group>

  <md-tab label="src/app/heroes/hero.service (v2)">
    {@example 'dependency-injection/ts/src/app/heroes/hero.service.2.ts'}
  </md-tab>


  <md-tab label="src/app/heroes/hero.service (v1)">
    {@example 'dependency-injection/ts/src/app/heroes/hero.service.1.ts'}
  </md-tab>


</md-tab-group>

The constructor now asks for an injected instance of a `Logger` and stores it in a private property called `#{_priv}logger`.
We call that property within our `getHeroes` method when anyone asks for heroes.

<h3 id='injectable'>
  Why @Injectable()?
</h3>

**<a href="#{injUrl}">@Injectable()</a>** marks a class as available to an
injector for instantiation. Generally speaking, an injector will report an
error when trying to instantiate a class that is not marked as
`@Injectable()`.
Injectors are also responsible for instantiating components
like `HeroesComponent`. Why haven't we marked `HeroesComponent` as
`@Injectable()`?

We *can* add it if we really want to. It isn't necessary because the
`HeroesComponent` is already marked with `@Component`, and this
!{_decorator} class (like `@Directive` and `@Pipe`, which we'll learn about later)
is a subtype of <a href="#{injUrl}">Injectable</a>.  It is in
fact `Injectable` #{_decorator}s that
identify a class as a target for instantiation by an injector.


~~~ {.callout.is-critical}


<header>
  Always include the parentheses
</header>



~~~


## Creating and registering a logger service

We're injecting a logger into our `HeroService` in two steps:
1. Create the logger service.
1. Register it with the application.

Our logger service is quite simple:


{@example 'dependency-injection/ts/src/app/logger.service.ts'}

We're likely to need the same logger service everywhere in our application,
so we put it in the project's `#{_appDir}` folder, and
we register it in the `providers` #{_array} of our application !{_moduleVsComp}, `!{_AppModuleVsAppComp}`.
If we forget to register the logger, Angular throws an exception when it first looks for the logger:
<code-example format="nocode">
  EXCEPTION: No provider for Logger! (HeroListComponent -> HeroService -> Logger)  
    
</code-example>

That's Angular telling us that the dependency injector couldn't find the *provider* for the logger.
It needed that provider to create a `Logger` to inject into a new
`HeroService`, which it needed to
create and inject into a new `HeroListComponent`.

The chain of creations started with the `Logger` provider. *Providers* are the subject of our next section.

## Injector providers

A provider *provides* the concrete, runtime version of a dependency value.
The injector relies on **providers** to create instances of the services
that the injector injects into components and other services.

We must register a service *provider* with the injector, or it won't know how to create the service.

Earlier we registered the `Logger` service in the `providers` #{_array} of the metadata for the `AppModule` like this:


{@example 'dependency-injection/ts/src/app/providers.component.ts' region='providers-logger'}

There are many ways to *provide* something that #{implements} `Logger`.
The `Logger` class itself is an obvious and natural provider.
But it's not the only way.

We can configure the injector with alternative providers that can deliver #{objectlike} a `Logger`.
We could provide a substitute class. #{loggerlike}
We could give it a provider that calls a logger factory function.
Any of these approaches might be a good choice under the right circumstances.

What matters is that the injector has a provider to go to when it needs a `Logger`.

<div id='provide'>

</div>

### The *Provider* class !{_andProvideFn}
We wrote the `providers` #{_array} like this:


{@example 'dependency-injection/ts/src/app/providers.component.ts' region='providers-1'}



{@example 'dependency-injection/ts/src/app/providers.component.ts' region='providers-3'}

The first is the [token](guide/dependency-injection#token) that serves as the key for both locating a dependency value
and registering the provider.

The second is a !{_secondParam}, 
which we can think of as a *recipe* for creating the dependency value. 
There are many ways to create dependency values ... and many ways to write a recipe.

<div id='class-provider'>

</div>

### Alternative class providers

Occasionally we'll ask a different class to provide the service.
The following code tells the injector
to return a `BetterLogger` when something asks for the `Logger`.


{@example 'dependency-injection/ts/src/app/providers.component.ts' region='providers-4'}

### Class provider with dependencies
Maybe an `EvenBetterLogger` could display the user name in the log message.
This logger gets the user from the injected `UserService`,
which happens also to be injected at the application level.


{@example 'dependency-injection/ts/src/app/providers.component.ts' region='EvenBetterLogger'}

Configure it like we did `BetterLogger`.


{@example 'dependency-injection/ts/src/app/providers.component.ts' region='providers-5'}

### Aliased class providers

Suppose an old component depends upon an `OldLogger` class.
`OldLogger` has the same interface as the `NewLogger`, but for some reason
we can't update the old component to use it.

When the *old* component logs a message with `OldLogger`,
we want the singleton instance of `NewLogger` to handle it instead.

The dependency injector should inject that singleton instance
when a component asks for either the new or the old logger.
The `OldLogger` should be an alias for `NewLogger`.

We certainly do not want two different `NewLogger` instances in our app.
Unfortunately, that's what we get if we try to alias `OldLogger` to `NewLogger` with `useClass`.


{@example 'dependency-injection/ts/src/app/providers.component.ts' region='providers-6a'}

The solution: alias with the `useExisting` option.


{@example 'dependency-injection/ts/src/app/providers.component.ts' region='providers-6b'}


<div id='value-provider'>

</div>

### Value providers
Sometimes it's easier to provide a ready-made object rather than ask the injector to create it from a class.


{@example 'dependency-injection/ts/src/app/providers.component.ts' region='silent-logger'}

Then we register a provider with the `useValue` option,
which makes this object play the logger role.


{@example 'dependency-injection/ts/src/app/providers.component.ts' region='providers-7'}

See more `useValue` examples in the
[Non-class dependencies](guide/dependency-injection#non-class-dependencies) and
[OpaqueToken](guide/dependency-injection#opaquetoken) sections.

<div id='factory-provider'>

</div>

### Factory providers

Sometimes we need to create the dependent value dynamically,
based on information we won't have until the last possible moment.
Maybe the information changes repeatedly in the course of the browser session.

Suppose also that the injectable service has no independent access to the source of this information.

This situation calls for a **factory provider**.

Let's illustrate by adding a new business requirement:
the HeroService must hide *secret* heroes from normal users.
Only authorized users should see secret heroes.

Like the `EvenBetterLogger`, the `HeroService` needs a fact about the user.
It needs to know if the user is authorized to see secret heroes.
That authorization can change during the course of a single application session,
as when we log in a different user.

Unlike `EvenBetterLogger`, we can't inject the `UserService` into the `HeroService`.
The `HeroService` won't have direct access to the user information to decide
who is authorized and who is not.

Why? We don't know either. Stuff like this happens.
Instead the `HeroService` constructor takes a boolean flag to control display of secret heroes.


{@example 'dependency-injection/ts/src/app/heroes/hero.service.ts' region='internals'}

We can inject the `Logger`, but we can't inject the  boolean `isAuthorized`.
We'll have to take over the creation of new instances of this `HeroService` with a factory provider.

A factory provider needs a factory function:


{@example 'dependency-injection/ts/src/app/heroes/hero.service.provider.ts' region='factory'}

Although the `HeroService` has no access to the `UserService`, our factory function does.

We inject both the `Logger` and the `UserService` into the factory provider and let the injector pass them along to the factory function:


{@example 'dependency-injection/ts/src/app/heroes/hero.service.provider.ts' region='provider'}


The `useFactory` field tells Angular that the provider is a factory function
whose implementation is the `heroServiceFactory`.

The `deps` property is #{_an} #{_array} of [provider tokens](guide/dependency-injection#token).
The `Logger` and `UserService` classes serve as tokens for their own class providers.
The injector resolves these tokens and injects the corresponding services into the matching factory function parameters.
Notice that we captured the factory provider in #{_an} #{exportedvar}, `heroServiceProvider`.
This extra step makes the factory provider reusable.
We can register our `HeroService` with this #{variable} wherever we need it.

In our sample, we need it only in the `HeroesComponent`,
where it replaces the previous `HeroService` registration in the metadata `providers` #{_array}.
Here we see the new and the old implementation side-by-side:

<md-tab-group>

  <md-tab label="src/app/heroes/heroes.component (v3)">
    {@example 'dependency-injection/ts/src/app/heroes/heroes.component.ts'}
  </md-tab>


  <md-tab label="src/app/heroes/heroes.component (v2)">
    {@example 'dependency-injection/ts/src/app/heroes/heroes.component.1.ts' region='full'}
  </md-tab>


</md-tab-group>


## Dependency injection tokens

When we register a provider with an injector, we associate that provider with a dependency injection token.
The injector maintains an internal *token-provider* map that it references when
asked for a dependency. The token is the key to the map.

In all previous examples, the dependency value has been a class *instance*, and
the class *type* served as its own lookup key.
Here we get a `HeroService` directly from the injector by supplying the `HeroService` type as the token:


{@example 'dependency-injection/ts/src/app/injector.component.ts' region='get-hero-service'}

We have similar good fortune when we write a constructor that requires an injected class-based dependency.
We define a constructor parameter with the `HeroService` class type,
and Angular knows to inject the
service associated with that `HeroService` class token:


{@example 'dependency-injection/ts/src/app/heroes/hero-list.component.ts' region='ctor-signature'}

This is especially convenient when we consider that most dependency values are provided by classes.
### Non-class dependencies
<p>
  What if the dependency value isn't a class? Sometimes the thing we want to inject is a 
</p>


<p>
  Applications often define configuration objects with lots of small facts   
    (like the title of the application or the address of a web API endpoint)  &nbsp;such as this one:
</p>



{@example 'dependency-injection/ts/src/app/app.config.ts' region='config'}

We'd like to make this configuration object available for injection.
We know we can register an object with a [value provider](guide/dependency-injection#value-provider).
### OpaqueToken

One solution to choosing a provider token for non-class dependencies is
to define and use an !{opaquetoken}.
The definition looks like this:


{@example 'dependency-injection/ts/src/app/app.config.ts' region='token'}

We register the dependency provider using the `OpaqueToken` object:


{@example 'dependency-injection/ts/src/app/providers.component.ts' region='providers-9'}

Now we can inject the configuration object into any constructor that needs it, with
the help of an `@Inject` #{_decorator}:


{@example 'dependency-injection/ts/src/app/app.component.2.ts' region='ctor'}


Although the !{configType} interface plays no role in dependency injection,
it supports typing of the configuration object within the class.

<div id='optional'>

</div>

## Optional dependencies

Our `HeroService` *requires* a `Logger`, but what if it could get by without
a logger?
We can tell Angular that the dependency is optional by annotating the 
constructor argument with `@Optional()`:


{@example 'dependency-injection/ts/src/app/providers.component.ts' region='provider-10-ctor'}

When using `@Optional()`, our code must be prepared for a null value. If we
don't register a logger somewhere up the line, the injector will set the
value of `logger` to null.

## Summary

We learned the basics of Angular dependency injection in this chapter.
We can register various kinds of providers,
and we know how to ask for an injected object (such as a service) by
adding a parameter to a constructor.

Angular dependency injection is more capable than we've described.
We can learn more about its advanced features, beginning with its support for
nested injectors, in the
[Hierarchical Dependency Injection](guide/hierarchical-dependency-injection) chapter.

## Appendix: Working with injectors directly

We rarely work directly with an injector, but
here's an `InjectorComponent` that does.


{@example 'dependency-injection/ts/src/app/injector.component.ts' region='injector'}

An `Injector` is itself an injectable service.

In this example, Angular injects the component's own `Injector` into the component's constructor.
The component then asks the injected injector for the services it wants.

Note that the services themselves are not injected into the component.
They are retrieved by calling `injector.get`.

The `get` method throws an error if it can't resolve the requested service.
We can call `get` with a second parameter (the value to return if the service is not found) 
instead, which we do in one case
to retrieve a service (`ROUS`) that isn't registered with this or any ancestor injector.

The technique we just described is an example of the
[service locator pattern](https://en.wikipedia.org/wiki/Service_locator_pattern).

We **avoid** this technique unless we genuinely need it.
It encourages a careless grab-bag approach such as we see here.
It's difficult to explain, understand, and test.
We can't know by inspecting the constructor what this class requires or what it will do.
It could acquire services from any ancestor component, not just its own.
We're forced to spelunk the implementation to discover what it does.

Framework developers may take this approach when they
must acquire services generically and dynamically.
