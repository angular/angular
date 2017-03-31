@title
Dependency Injection

@intro
Techniques for Dependency Injection.

@description
Dependency Injection is a powerful pattern for managing code dependencies.
In this cookbook we will explore many of the features of Dependency Injection (DI) in Angular.
<a id="toc"></a>## Table of contents

[Application-wide dependencies](guide/cb-dependency-injection#app-wide-dependencies)

[External module configuration](guide/cb-dependency-injection#external-module-configuration)

[*@Injectable* and nested service dependencies](guide/cb-dependency-injection#nested-dependencies)

[Limit service scope to a component subtree](guide/cb-dependency-injection#service-scope)

[Multiple service instances (sandboxing)](guide/cb-dependency-injection#multiple-service-instances)

[Qualify dependency lookup with *@Optional* and *@Host*](guide/cb-dependency-injection#qualify-dependency-lookup)

[Inject the component's DOM element](guide/cb-dependency-injection#component-element)

[Define dependencies with providers](guide/cb-dependency-injection#providers)

* [The *provide* object literal](guide/cb-dependency-injection#provide)
* [useValue - the *value provider*](guide/cb-dependency-injection#usevalue)
* [useClass - the *class provider*](guide/cb-dependency-injection#useclass)
* [useExisting - the *alias provider*](guide/cb-dependency-injection#useexisting)
* [useFactory - the *factory provider*](guide/cb-dependency-injection#usefactory)

[Provider token alternatives](guide/cb-dependency-injection#tokens)

* [class-interface](guide/cb-dependency-injection#class-interface)
* [OpaqueToken](guide/cb-dependency-injection#opaque-token)

[Inject into a derived class](guide/cb-dependency-injection#di-inheritance)

[Find a parent component by injection](guide/cb-dependency-injection#find-parent)

  * [Find parent with a known component type](guide/cb-dependency-injection#known-parent)
  * [Cannot find a parent by its base class](guide/cb-dependency-injection#base-parent)
  * [Find a parent by its class-interface](guide/cb-dependency-injection#class-interface-parent)
  * [Find a parent in a tree of parents (*@SkipSelf*)](guide/cb-dependency-injection#parent-tree)
  * [A *provideParent* helper function](guide/cb-dependency-injection#provideparent)

[Break circularities with a forward class reference (*forwardRef*)](guide/cb-dependency-injection#forwardref)
**See the <live-example name="cb-dependency-injection"></live-example>**
of the code supporting this cookbook.

<a id="app-wide-dependencies"></a>## Application-wide dependencies
Register providers for dependencies used throughout the application in the root application component, `AppComponent`.

In the following example, we import and register several services
(the `LoggerService`, `UserContext`, and the `UserService`)
in the `@Component` metadata `providers` array.


<code-example path="cb-dependency-injection/src/app/app.component.ts" region="import-services" linenums="false">

</code-example>

All of these services are implemented as classes.
Service classes can act as their own providers which is why listing them in the `providers` array
is all the registration we need.

~~~ {.l-sub-section}

A *provider* is something that can create or deliver a service.
Angular creates a service instance from a class provider by "new-ing" it.
Learn more about providers [below](guide/cb-dependency-injection#providers).

~~~

Now that we've registered these services,
Angular can inject them into the constructor of *any* component or service, *anywhere* in the application.

<code-example path="cb-dependency-injection/src/app/hero-bios.component.ts" region="ctor" linenums="false">

</code-example>



<code-example path="cb-dependency-injection/src/app/user-context.service.ts" region="ctor" linenums="false">

</code-example>

<a id="external-module-configuration"></a>
## External module configuration
We often register providers in the `NgModule` rather than in the root application component.

We do this when (a) we expect the service to be injectable everywhere
or (b) we must configure another application global service _before it starts_.

We see an example of the second case here, where we configure the Component Router with a non-default
[location strategy](guide/router) by listing its provider
in the `providers` list of the `AppModule`.


<code-example path="cb-dependency-injection/src/app/app.module.ts" region="providers" linenums="false">

</code-example>



{@a injectable}


{@a nested-dependencies}

## *@Injectable* and nested service dependencies
The consumer of an injected service does not know how to create that service.
It shouldn't care.
It's the dependency injection's job to create and cache that service.

Sometimes a service depends on other services ... which may depend on yet other services.
Resolving these nested dependencies in the correct order is also the framework's job.
At each step, the consumer of dependencies simply declares what it requires in its constructor and the framework takes over.

For example, we inject both the `LoggerService` and the `UserContext` in the `AppComponent`.

<code-example path="cb-dependency-injection/src/app/app.component.ts" region="ctor" linenums="false">

</code-example>

The `UserContext` in turn has dependencies on both the `LoggerService` (again) and
a `UserService` that gathers information about a particular user.


<code-example path="cb-dependency-injection/src/app/user-context.service.ts" region="injectables" linenums="false">

</code-example>

When Angular creates an`AppComponent`, the dependency injection framework creates an instance of the `LoggerService` and
starts to create the `UserContextService`.
The `UserContextService` needs the `LoggerService`, which the framework already has, and the `UserService`, which it has yet to create.
The `UserService` has no dependencies so the dependency injection framework can just `new` one into existence.

The beauty of dependency injection is that the author of `AppComponent` didn't care about any of this.
The author simply declared what was needed in the constructor (`LoggerService` and `UserContextService`) and the framework did the rest.

Once all the dependencies are in place, the `AppComponent` displays the user information:


<figure class='image-display'>
  <img src="assets/images/cookbooks/dependency-injection/logged-in-user.png" alt="Logged In User">  </img>
</figure>

### *@Injectable()*
Notice the `@Injectable()`decorator on the `UserContextService` class.

<code-example path="cb-dependency-injection/src/app/user-context.service.ts" region="injectable" linenums="false">

</code-example>

That decorator makes it possible for Angular to identify the types of its two dependencies, `LoggerService` and `UserService`.

Technically, the `@Injectable()`decorator is only _required_ for a service class that has _its own dependencies_.
The `LoggerService` doesn't depend on anything. The logger would work if we omitted `@Injectable()`
and the generated code would be slightly smaller.

But the service would break the moment we gave it a dependency and we'd have to go back
and add `@Injectable()` to fix it. We add `@Injectable()` from the start for the sake of consistency and to avoid future pain.


~~~ {.alert.is-helpful}

Although we recommend applying `@Injectable` to all service classes, do not feel bound by it.
Some developers prefer to add it only where needed and that's a reasonable policy too.


~~~



~~~ {.l-sub-section}

The `AppComponent` class had two dependencies as well but no `@Injectable()`.
It didn't need `@Injectable()` because that component class has the `@Component` decorator.
In Angular with TypeScript, a *single* decorator &mdash; *any* decorator &mdash; is sufficient to identify dependency types.



~~~

<a id="service-scope"></a>
## Limit service scope to a component subtree

All injected service dependencies are singletons meaning that,
for a given dependency injector ("injector"), there is only one instance of service.

But an Angular application has multiple dependency injectors, arranged in a tree hierarchy that parallels the component tree.
So a particular service can be *provided* (and created) at any component level and multiple times
if provided in multiple components.

By default, a service dependency provided in one component is visible to all of its child components and
Angular injects the same service instance into all child components that ask for that service.

Accordingly, dependencies provided in the root `AppComponent` can be injected into *any* component *anywhere* in the application.

That isn't always desirable.
Sometimes we want to restrict service availability to a particular region of the application.

We can limit the scope of an injected service to a *branch* of the application hierarchy
by providing that service *at the sub-root component for that branch*.
Here we provide the `HeroService` to the `HeroesBaseComponent` by listing it in the `providers` array:

<code-example path="cb-dependency-injection/src/app/sorted-heroes.component.ts" region="injection">

</code-example>

When Angular creates the `HeroesBaseComponent`, it also creates a new instance of `HeroService`
that is visible only to the component and its children (if any).

We could also provide the `HeroService` to a *different* component elsewhere in the application.
That would result in a *different* instance of the service, living in a *different* injector.

~~~ {.l-sub-section}

We examples of such scoped `HeroService` singletons appear throughout the accompanying sample code,
including the `HeroBiosComponent`, `HeroOfTheMonthComponent`, and `HeroesBaseComponent`.
Each of these components has its own `HeroService` instance managing its own independent collection of heroes.


~~~




~~~ {.alert.is-helpful}

### Take a break!
This much Dependency Injection knowledge may be all that many Angular developers
ever need to build their applications. It doesn't always have to be more complicated.


~~~

<a id="multiple-service-instances"></a>
## Multiple service instances (sandboxing)

Sometimes we want multiple instances of a service at *the same level of the component hierarchy*.

A good example is a service that holds state for its companion component instance.
We need a separate instance of the service for each component.
Each service has its own work-state, isolated from the service-and-state of a different component.
We call this *sandboxing* because each service and component instance has its own sandbox to play in.

<a id="hero-bios-component"></a>
Imagine a `HeroBiosComponent` that presents three instances of the `HeroBioComponent`.

<code-example path="cb-dependency-injection/src/app/hero-bios.component.ts" region="simple">

</code-example>

Each `HeroBioComponent` can edit a single hero's biography.
A `HeroBioComponent` relies on a `HeroCacheService` to fetch, cache, and perform other persistence operations on that hero.

<code-example path="cb-dependency-injection/src/app/hero-cache.service.ts" region="service">

</code-example>

Clearly the three instances of the `HeroBioComponent` can't share the same `HeroCacheService`.
They'd be competing with each other to determine which hero to cache.

Each `HeroBioComponent` gets its *own* `HeroCacheService` instance
by listing the `HeroCacheService` in its metadata `providers` array.

<code-example path="cb-dependency-injection/src/app/hero-bio.component.ts" region="component">

</code-example>

The parent `HeroBiosComponent` binds a value to the `heroId`.
The `ngOnInit` pass that `id` to the service which fetches and caches the hero.
The getter for the `hero` property pulls the cached hero from the service.
And the template displays this data-bound property.

Find this example in <live-example name="cb-dependency-injection">live code</live-example>
and confirm that the three `HeroBioComponent` instances have their own cached hero data.

<figure class='image-display'>
  <img src="assets/images/cookbooks/dependency-injection/hero-bios.png" alt="Bios">  </img>
</figure>



{@a optional}


{@a qualify-dependency-lookup}

## Qualify dependency lookup with *@Optional* and *@Host*
We learned that dependencies can be registered at any level in the component hierarchy.

When a component requests a dependency, Angular starts with that component's injector and walks up the injector tree
until it finds the first suitable provider.  Angular throws an error if it can't find the dependency during that walk.

We *want* this behavior most of the time.
But sometimes we need to limit the search and/or accommodate a missing dependency.
We can modify Angular's search behavior with the `@Host` and `@Optional` qualifying decorators,
used individually or together.

The `@Optional` decorator tells Angular to continue when it can't find the dependency.
Angular sets the injection parameter to `null` instead.

The `@Host` decorator stops the upward search at the *host component*.

The host component is typically the component requesting the dependency.
But when this component is projected into a *parent* component, that parent component becomes the host.
We look at this second, more interesting case in our next example.

### Demonstration
The `HeroBiosAndContactsComponent` is a revision of the `HeroBiosComponent` that we looked at [above](guide/cb-dependency-injection#hero-bios-component).

<code-example path="cb-dependency-injection/src/app/hero-bios.component.ts" region="hero-bios-and-contacts">

</code-example>

Focus on the template:

<code-example path="cb-dependency-injection/src/app/hero-bios.component.ts" region="template" linenums="false">

</code-example>

We've inserted a `<hero-contact>` element between the `<hero-bio>` tags.
Angular *projects* (*transcludes*) the corresponding `HeroContactComponent` into the `HeroBioComponent` view,
placing it in the `<ng-content>` slot of the `HeroBioComponent` template:

<code-example path="cb-dependency-injection/src/app/hero-bio.component.ts" region="template" linenums="false">

</code-example>

It looks like this, with the hero's telephone number from `HeroContactComponent` projected above the hero description:

<figure class='image-display'>
  <img src="assets/images/cookbooks/dependency-injection/hero-bio-and-content.png" alt="bio and contact">  </img>
</figure>

Here's the `HeroContactComponent` which demonstrates the qualifying decorators that we're talking about in this section:

<code-example path="cb-dependency-injection/src/app/hero-contact.component.ts" region="component">

</code-example>

Focus on the constructor parameters

<code-example path="cb-dependency-injection/src/app/hero-contact.component.ts" region="ctor-params" linenums="false">

</code-example>

The `@Host()` function decorating the  `heroCache` property ensures that
we get a reference to the cache service from the parent `HeroBioComponent`.
Angular throws if the parent lacks that service, even if a component higher in the component tree happens to have that service.

A second `@Host()` function decorates the `loggerService` property.
We know the only `LoggerService` instance in the app is provided at the `AppComponent` level.
The host `HeroBioComponent` doesn't have its own `LoggerService` provider.

Angular would throw an error if we hadn't also decorated the property with the `@Optional()` function.
Thanks to `@Optional()`, Angular sets the `loggerService` to null and the rest of the component adapts.


~~~ {.l-sub-section}

We'll come back to the `elementRef` property shortly.

~~~

Here's the `HeroBiosAndContactsComponent` in action.

<figure class='image-display'>
  <img src="assets/images/cookbooks/dependency-injection/hero-bios-and-contacts.png" alt="Bios with contact into">  </img>
</figure>

If we comment out the `@Host()` decorator, Angular now walks up the injector ancestor tree
until it finds the logger at the `AppComponent` level. The logger logic kicks in and the hero display updates
with the gratuitous "!!!", indicating that the logger was found.

<figure class='image-display'>
  <img src="assets/images/cookbooks/dependency-injection/hero-bio-contact-no-host.png" alt="Without @Host">  </img>
</figure>

On the other hand, if we restore the `@Host()` decorator and comment out `@Optional`,
the application fails for lack of the required logger at the host component level.
<br>
`EXCEPTION: No provider for LoggerService! (HeroContactComponent -> LoggerService)`
<a id="component-element"></a>## Inject the component's element

On occasion we might need to access a component's corresponding DOM element.
Although we strive to avoid it, many visual effects and 3rd party tools (such as jQuery)
require DOM access.

To illustrate, we've written a simplified version of the `HighlightDirective` from
the [Attribute Directives](guide/attribute-directives) chapter.

<code-example path="cb-dependency-injection/src/app/highlight.directive.ts">

</code-example>

The directive sets the background to a highlight color when the user mouses over the
DOM element to which it is applied.

Angular set the constructor's `el` parameter to the injected `ElementRef` which is
a wrapper around that DOM element.
Its `nativeElement` property exposes the DOM element for the directive to manipulate.

The sample code applies the directive's `myHighlight` attribute to two `<div>` tags,
first without a value (yielding the default color) and then with an assigned color value.

<code-example path="cb-dependency-injection/src/app/app.component.html" region="highlight" linenums="false">

</code-example>

The following image shows the effect of mousing over the `<hero-bios-and-contacts>` tag.

<figure class='image-display'>
  <img src="assets/images/cookbooks/dependency-injection/highlight.png" alt="Highlighted bios">  </img>
</figure>

<a id="providers"></a>
## Define dependencies with providers

In this section we learn to write providers that deliver dependent services.

### Background
We get a service from a dependency injector by giving it a ***token***.

We usually let Angular handle this transaction for us by specifying a constructor parameter and its type.
The parameter type serves as the injector lookup *token*.
Angular passes this token to the injector and assigns the result to the parameter.
Here's a typical example:


<code-example path="cb-dependency-injection/src/app/hero-bios.component.ts" region="ctor" linenums="false">

</code-example>

Angular asks the injector for the service associated with the `LoggerService`
and assigns the returned value to the `logger` parameter.

Where did the injector get that value?
It may already have that value in its internal container.
If it doesn't, it may be able to make one with the help of a ***provider***.
A *provider* is a recipe for delivering a service associated with a *token*.

~~~ {.l-sub-section}

If the injector doesn't have a provider for the requested *token*, it delegates the request
to its parent injector, where the process repeats until there are no more injectors.
If the search is futile, the injector throws an error ... unless the request was [optional](guide/cb-dependency-injection#optional).

Let's return our attention to providers themselves.

~~~

A new injector has no providers.
Angular initializes the injectors it creates with some providers it cares about.
We have to register our _own_ application providers manually,
usually in the `providers` array of the `Component` or `Directive` metadata:

<code-example path="cb-dependency-injection/src/app/app.component.ts" region="providers">

</code-example>

### Defining providers

The simple class provider is the most typical by far.
We mention the class in the `providers` array and we're done.

<code-example path="cb-dependency-injection/src/app/hero-bios.component.ts" region="class-provider" linenums="false">

</code-example>

It's that simple because the most common injected service is an instance of a class.
But not every dependency can be satisfied by creating a new instance of a class.
We need other ways to deliver dependency values and that means we need other ways to specify a provider.

The `HeroOfTheMonthComponent` example demonstrates many of the alternatives and why we need them.


<figure class='image-display'>
  <img src="assets/images/cookbooks/dependency-injection/hero-of-month.png" alt="Hero of the month" width="300px">  </img>
</figure>

It's visually simple: a few properties and the output of a logger. The code behind it gives us plenty to talk about.

<code-example path="cb-dependency-injection/src/app/hero-of-the-month.component.ts" region="hero-of-the-month">

</code-example>




{@a provide}
#### The *provide* object literal

The `provide` object literal takes a *token* and a *definition object*.
The *token* is usually a class but [it doesn't have to be](guide/cb-dependency-injection#tokens).

The *definition* object has one main property, (e.g. `useValue`) that indicates how the provider
should create or return the provided value.



{@a usevalue}
#### useValue - the *value provider*

Set the `useValue` property to a ***fixed value*** that the provider can return as the dependency object.

Use this technique to provide *runtime configuration constants* such as web-site base addresses and feature flags.
We often use a *value provider* in a unit test to replace a production service with a fake or mock.

The `HeroOfTheMonthComponent` example has two *value providers*.
The first provides an instance of the `Hero` class;
the second specifies a literal string resource:

<code-example path="cb-dependency-injection/src/app/hero-of-the-month.component.ts" region="use-value" linenums="false">

</code-example>

The `Hero` provider token is a class which makes sense because the value is a `Hero`
and the consumer of the injected hero would want the type information.

The `TITLE` provider token is *not a class*.
It's a special kind of provider lookup key called an [OpaqueToken](guide/cb-dependency-injection#opaquetoken).
We often use an `OpaqueToken` when the dependency is a simple value like a string, a number, or a function.

The value of a *value provider* must be defined *now*. We can't create the value later.
Obviously the title string literal is immediately available.
The `someHero` variable in this example was set earlier in the file:

<code-example path="cb-dependency-injection/src/app/hero-of-the-month.component.ts" region="some-hero">

</code-example>

The other providers create their values *lazily* when they're needed for injection.



{@a useclass}
#### useClass - the *class provider*

The `useClass` provider creates and returns new instance of the specified class.

Use this technique to ***substitute an alternative implementation*** for a common or default class.
The alternative could implement a different strategy, extend the default class,
or fake the behavior of the real class in a test case.

We see two examples in the `HeroOfTheMonthComponent`:

<code-example path="cb-dependency-injection/src/app/hero-of-the-month.component.ts" region="use-class" linenums="false">

</code-example>

The first provider is the *de-sugared*, expanded form of the most typical case in which the
class to be created (`HeroService`) is also the provider's injection token.
We wrote it in this long form to de-mystify the preferred short form.

The second provider substitutes the `DateLoggerService` for the `LoggerService`.
The `LoggerService` is already registered at the `AppComponent` level.
When _this component_ requests the `LoggerService`, it receives the `DateLoggerService` instead.

~~~ {.l-sub-section}

This component and its tree of child components receive the `DateLoggerService` instance.
Components outside the tree continue to receive the original `LoggerService` instance.

~~~

The `DateLoggerService` inherits from `LoggerService`; it appends the current date/time to each message:

<code-example path="cb-dependency-injection/src/app/date-logger.service.ts" region="date-logger-service" linenums="false">

</code-example>




{@a useexisting}
#### useExisting - the *alias provider*

The `useExisting` provider maps one token to another.
In effect, the first token is an ***alias*** for the service associated with second token,
creating ***two ways to access the same service object***.

<code-example path="cb-dependency-injection/src/app/hero-of-the-month.component.ts" region="use-existing">

</code-example>

Narrowing an API through an aliasing interface is _one_ important use case for this technique.
We're aliasing for that very purpose here.
Imagine that the `LoggerService` had a large API (it's actually only three methods and a property).
We want to shrink that API surface to just the two members exposed by the `MinimalLogger` [*class-interface*](guide/cb-dependency-injection#class-interface):


<code-example path="cb-dependency-injection/src/app/date-logger.service.ts" region="minimal-logger" linenums="false">

</code-example>

The constructor's `logger` parameter is typed as `MinimalLogger` so only its two members are visible in TypeScript:

<figure class='image-display'>
  <img src="assets/images/cookbooks/dependency-injection/minimal-logger-intellisense.png" alt="MinimalLogger restricted API">  </img>
</figure>

Angular actually sets the `logger` parameter to the injector's full version of the `LoggerService`
which happens to be the `DateLoggerService` thanks to the override provider registered previously via `useClass`.
The following image, which displays the logging date, confirms the point:

<figure class='image-display'>
  <img src="assets/images/cookbooks/dependency-injection/date-logger-entry.png" alt="DateLoggerService entry" width="300px">  </img>
</figure>




{@a usefactory}
#### useFactory - the *factory provider*

The `useFactory` provider creates a dependency object by calling a factory function
as seen in this example.

<code-example path="cb-dependency-injection/src/app/hero-of-the-month.component.ts" region="use-factory">

</code-example>

Use this technique to ***create a dependency object***
with a factory function whose inputs are some ***combination of injected services and local state***.

The *dependency object* doesn't have to be a class instance. It could be anything.
In this example, the *dependency object* is a string of the names of the runners-up
to the "Hero of the Month" contest.

The local state is the number `2`, the number of runners-up this component should show.
We execute `runnersUpFactory` immediately with `2`.

The `runnersUpFactory` itself isn't the provider factory function.
The true provider factory function is the function that `runnersUpFactory` returns.


<code-example path="cb-dependency-injection/src/app/runners-up.ts" region="factory-synopsis" linenums="false">

</code-example>

That returned function takes a winning `Hero` and a `HeroService` as arguments.

Angular supplies these arguments from injected values identified by
the two *tokens* in the `deps` array.
The two `deps` values are *tokens* that the injector uses
to provide these factory function dependencies.

After some undisclosed work, the function returns the string of names
and Angular injects it into the `runnersUp` parameter of the `HeroOfTheMonthComponent`.


~~~ {.l-sub-section}

The function retrieves candidate heroes from the `HeroService`,
takes `2` of them to be the runners-up, and returns their concatenated names.
Look at the <live-example name="cb-dependency-injection"></live-example>
for the full source code.


~~~



{@a tokens}

## Provider token alternatives: the *class-interface* and *OpaqueToken*

Angular dependency injection is easiest when the provider *token* is a class
that is also the type of the returned dependency object (what we usually call the *service*).

But the token doesn't have to be a class and even when it is a class,
it doesn't have to be the same type as the returned object.
That's the subject of our next section.

<a id="class-interface"></a>
### class-interface
In the previous *Hero of the Month* example, we used the `MinimalLogger` class
as the token for a provider of a `LoggerService`.

<code-example path="cb-dependency-injection/src/app/hero-of-the-month.component.ts" region="use-existing">

</code-example>

The `MinimalLogger` is an abstract class.

<code-example path="cb-dependency-injection/src/app/date-logger.service.ts" region="minimal-logger" linenums="false">

</code-example>

We usually inherit from an abstract class.
But `LoggerService` doesn't inherit from `MinimalLogger`. *No class* inherits from it.
Instead, we use it like an interface.

Look again at the declaration for `DateLoggerService`

<code-example path="cb-dependency-injection/src/app/date-logger.service.ts" region="date-logger-service-signature" linenums="false">

</code-example>

`DateLoggerService` inherits (extends) from `LoggerService`, not `MinimalLogger`.
The `DateLoggerService` *implements* `MinimalLogger` as if `MinimalLogger` were an *interface*.

We call a class used in this way a ***class-interface***.
The key benefit of a *class-interface* is that we can get the strong-typing of an interface
and we can ***use it as a provider token*** in the same manner as a normal class.

A ***class-interface*** should define *only* the members that its consumers are allowed to call.
Such a narrowing interface helps decouple the concrete class from its consumers.
The `MinimalLogger` defines just two of the `LoggerClass` members.


~~~ {.l-sub-section}

#### Why *MinimalLogger* is a class and not an interface
We can't use an interface as a provider token because
interfaces are not JavaScript objects.
They exist only in the TypeScript design space.
They disappear after the code is transpiled to JavaScript.

A provider token must be a real JavaScript object of some kind:
a function, an object, a string ... a class.

Using a class as an interface gives us the characteristics of an interface in a JavaScript object.

The minimize memory cost, the class should have *no implementation*.
The `MinimalLogger` transpiles to this unoptimized, pre-minified JavaScript:

<code-example path="cb-dependency-injection/src/app/date-logger.service.ts" region="minimal-logger-transpiled" linenums="false">

</code-example>

It never grows larger no matter how many members we add *as long as they are typed but not implemented*.


~~~



{@a opaque-token}
### OpaqueToken

Dependency objects can be simple values like dates, numbers and strings or
shapeless objects like arrays and functions.

Such objects don't have application interfaces and therefore aren't well represented by a class.
They're better represented by a token that is both unique and symbolic,
a JavaScript object that has a friendly name but won't conflict with
another token that happens to have the same name.

The `OpaqueToken` has these characteristics.
We encountered them twice in the *Hero of the Month* example,
in the *title* value provider and in the *runnersUp* factory provider.

<code-example path="cb-dependency-injection/src/app/hero-of-the-month.component.ts" region="provide-opaque-token" linenums="false">

</code-example>

We created the `TITLE` token like this:

<code-example path="cb-dependency-injection/src/app/hero-of-the-month.component.ts" region="opaque-token" linenums="false">

</code-example>



{@a di-inheritance}

## Inject into a derived class
We must take care when writing a component that inherits from another component.
If the base component has injected dependencies,
we must re-provide and re-inject them in the derived class
and then pass them down to the base class through the constructor.

In this contrived example, `SortedHeroesComponent` inherits from `HeroesBaseComponent`
to display a *sorted* list of heroes.


<figure class='image-display'>
  <img src="assets/images/cookbooks/dependency-injection/sorted-heroes.png" alt="Sorted Heroes">  </img>
</figure>

The `HeroesBaseComponent` could stand on its own.
It demands its own instance of the `HeroService` to get heroes
and displays them in the order they arrive from the database.


<code-example path="cb-dependency-injection/src/app/sorted-heroes.component.ts" region="heroes-base">

</code-example>



~~~ {.l-sub-section}

We strongly prefer simple constructors. They should do little more than initialize variables.
This rule makes the component safe to construct under test without fear that it will do something dramatic like talk to the server.
That's why we call the `HeroService` from within the `ngOnInit` rather than the constructor.

We explain the mysterious `afterGetHeroes` below.

~~~

Users want to see the heroes in alphabetical order.
Rather than modify the original component, we sub-class it and create a
`SortedHeroesComponent` that sorts the heroes before presenting them.
The `SortedHeroesComponent` lets the base class fetch the heroes.
(we said it was contrived).

Unfortunately, Angular cannot inject the `HeroService` directly into the base class.
We must provide the `HeroService` again for *this* component,
then pass it down to the base class inside the constructor.


<code-example path="cb-dependency-injection/src/app/sorted-heroes.component.ts" region="sorted-heroes">

</code-example>

Now take note of the `afterGetHeroes` method.
Our first instinct was to create an `ngOnInit` method in `SortedHeroesComponent` and do the sorting there.
But Angular calls the *derived* class's `ngOnInit` *before* calling the base class's `ngOnInit`
so we'd be sorting the heroes array *before they arrived*. That produces a nasty error.

Overriding the base class's `afterGetHeroes` method solves the problem

These complications argue for *avoiding component inheritance*.


{@a find-parent}

## Find a parent component by injection

Application components often need to share information.
We prefer the more loosely coupled techniques such as data binding and service sharing.
But sometimes it makes sense for one component to have a direct reference to another component
perhaps to access values or call methods on that component.

Obtaining a component reference is a bit tricky in Angular.
Although an Angular application is a tree of components,
there is no public API for inspecting and traversing that tree.

There is an API for acquiring a child reference
(checkout `Query`, `QueryList`, `ViewChildren`, and `ContentChildren`).

There is no public API for acquiring a parent reference.
But because every component instance is added to an injector's container,
we can use Angular dependency injection to reach a parent component.

This section describes some techniques for doing that.

<a id="known-parent"></a>
### Find a parent component of known type

We use standard class injection to acquire a parent component whose type we know.

In the following example, the parent `AlexComponent` has several children including a `CathyComponent`:

{@a alex}


<code-example path="cb-dependency-injection/src/app/parent-finder.component.ts" region="alex-1" linenums="false">

</code-example>

*Cathy* reports whether or not she has access to *Alex*
after injecting an `AlexComponent` into her constructor:

<code-example path="cb-dependency-injection/src/app/parent-finder.component.ts" region="cathy" linenums="false">

</code-example>

We added the [@Optional](guide/cb-dependency-injection#optional) qualifier for safety but
the <live-example name="cb-dependency-injection"></live-example>
confirms that the `alex` parameter is set.

<a id="base-parent"></a>
### Cannot find a parent by its base class

What if we do *not* know the concrete parent component class?

A re-usable component might be a child of multiple components.
Imagine a component for rendering breaking news about a financial instrument.
For sound (cough) business reasons, this news component makes frequent calls
directly into its parent instrument as changing market data stream by.

The app probably defines more than a dozen financial instrument components.
If we're lucky, they all implement the same base class
whose API our `NewsComponent` understands.


~~~ {.l-sub-section}

Looking for components that implement an interface would be better.
That's not possible because TypeScript interfaces disappear from the transpiled JavaScript
which doesn't support interfaces. There's no artifact we could look for.

~~~

We're not claiming this is good design.
We are asking *can a component inject its parent via the parent's base class*?

The sample's `CraigComponent` explores this question. [Looking back](guide/cb-dependency-injection#alex)
we see that the `Alex` component *extends* (*inherits*) from a class named `Base`.

<code-example path="cb-dependency-injection/src/app/parent-finder.component.ts" region="alex-class-signature" linenums="false">

</code-example>

The `CraigComponent` tries to inject `Base` into its `alex` constructor parameter and reports if it succeeded.

<code-example path="cb-dependency-injection/src/app/parent-finder.component.ts" region="craig" linenums="false">

</code-example>

Unfortunately, this does not work.
The <live-example name="cb-dependency-injection"></live-example>
confirms that the `alex` parameter is null.
*We cannot inject a parent by its base class.*

<a id="class-interface-parent"></a>
### Find a parent by its class-interface

We can find a parent component with a [class-interface](guide/cb-dependency-injection#class-interface).

The parent must cooperate by providing an *alias* to itself in the name of a *class-interface* token.

Recall that Angular always adds a component instance to its own injector;
that's why we could inject *Alex* into *Cathy* [earlier](guide/cb-dependency-injection#known-parent).

We write an [*alias provider*](guide/cb-dependency-injection#useexisting) &mdash; a `provide` object literal with a `useExisting` definition &mdash;
that creates an *alternative* way to inject the same component instance
and add that provider to the `providers` array of the `@Component` metadata for the `AlexComponent`:

{@a alex-providers}


<code-example path="cb-dependency-injection/src/app/parent-finder.component.ts" region="alex-providers" linenums="false">

</code-example>

[Parent](guide/cb-dependency-injection#parent-token) is the provider's *class-interface* token.
The [*forwardRef*](guide/cb-dependency-injection#forwardref) breaks the circular reference we just created by having the `AlexComponent` refer to itself.

*Carol*, the third of *Alex*'s child components, injects the parent into its `parent` parameter, the same way we've done it before:

<code-example path="cb-dependency-injection/src/app/parent-finder.component.ts" region="carol-class" linenums="false">

</code-example>

Here's *Alex* and family in action:

<figure class='image-display'>
  <img src="assets/images/cookbooks/dependency-injection/alex.png" alt="Alex in action">  </img>
</figure>



{@a parent-tree}
### Find the parent in a tree of parents

Imagine one branch of a component hierarchy: *Alice* -> *Barry* -> *Carol*.
Both *Alice* and *Barry* implement the `Parent` *class-interface*.

*Barry* is the problem. He needs to reach his parent, *Alice*, and also be a parent to *Carol*.
That means he must both *inject* the `Parent` *class-interface* to get *Alice* and
*provide* a `Parent` to satisfy *Carol*.

Here's *Barry*:

<code-example path="cb-dependency-injection/src/app/parent-finder.component.ts" region="barry" linenums="false">

</code-example>

*Barry*'s `providers` array looks just like [*Alex*'s](guide/cb-dependency-injection#alex-providers).
If we're going to keep writing [*alias providers*](guide/cb-dependency-injection#useexisting) like this we should create a [helper function](guide/cb-dependency-injection#provideparent).

For now, focus on *Barry*'s constructor:

<code-tabs>

  <code-pane title="Barry's constructor" path="cb-dependency-injection/src/app/parent-finder.component.ts" region="barry-ctor">

  </code-pane>

  <code-pane title="Carol's constructor" path="cb-dependency-injection/src/app/parent-finder.component.ts" region="carol-ctor">

  </code-pane>

</code-tabs>

It's identical to *Carol*'s constructor except for the additional `@SkipSelf` decorator.

`@SkipSelf` is essential for two reasons:

1. It tells the injector to start its search for a `Parent` dependency in a component *above* itself,
which *is* what parent means.

2. Angular throws a cyclic dependency error if we omit the `@SkipSelf` decorator.

  `Cannot instantiate cyclic dependency! (BethComponent -> Parent -> BethComponent)`

Here's *Alice*, *Barry* and family in action:


<figure class='image-display'>
  <img src="assets/images/cookbooks/dependency-injection/alice.png" alt="Alice in action">  </img>
</figure>



{@a parent-token}
### The *Parent* class-interface
We [learned earlier](guide/cb-dependency-injection#class-interface) that a *class-interface* is an abstract class used as an interface rather than as a base class.

Our example defines a `Parent` *class-interface* .

<code-example path="cb-dependency-injection/src/app/parent-finder.component.ts" region="parent" linenums="false">

</code-example>

The `Parent` *class-interface* defines a `name` property with a type declaration but *no implementation*.,
The `name` property is the only member of a parent component that a child component can call.
Such a narrowing interface helps decouple the child component class from its parent components.

A component that could serve as a parent *should* implement the *class-interface* as the `AliceComponent` does:

<code-example path="cb-dependency-injection/src/app/parent-finder.component.ts" region="alice-class-signature" linenums="false">

</code-example>

Doing so adds clarity to the code.  But it's not technically necessary.
Although the `AlexComponent` has a `name` property (as required by its `Base` class)
its class signature doesn't mention `Parent`:

<code-example path="cb-dependency-injection/src/app/parent-finder.component.ts" region="alex-class-signature" linenums="false">

</code-example>



~~~ {.l-sub-section}

The `AlexComponent` *should* implement `Parent` as a matter of proper style.
It doesn't in this example *only* to demonstrate that the code will compile and run without the interface


~~~



{@a provideparent}
### A *provideParent* helper function

Writing variations of the same parent *alias provider* gets old quickly,
especially this awful mouthful with a [*forwardRef*](guide/cb-dependency-injection#forwardref):

<code-example path="cb-dependency-injection/src/app/parent-finder.component.ts" region="alex-providers" linenums="false">

</code-example>

We can extract that logic into a helper function like this:

<code-example path="cb-dependency-injection/src/app/parent-finder.component.ts" region="provide-the-parent" linenums="false">

</code-example>

Now we can add a simpler, more meaningful parent provider to our components:

<code-example path="cb-dependency-injection/src/app/parent-finder.component.ts" region="alice-providers" linenums="false">

</code-example>

We can do better. The current version of the helper function can only alias the `Parent` *class-interface*.
Our application might have a variety of parent types, each with its own *class-interface* token.

Here's a revised version that defaults to `parent` but also accepts an optional second parameter for a different parent *class-interface*.

<code-example path="cb-dependency-injection/src/app/parent-finder.component.ts" region="provide-parent" linenums="false">

</code-example>

And here's how we could use it with a different parent type:

<code-example path="cb-dependency-injection/src/app/parent-finder.component.ts" region="beth-providers" linenums="false">

</code-example>



{@a forwardref}

## Break circularities with a forward class reference (*forwardRef*)

The order of class declaration matters in TypeScript.
We can't refer directly to a class until it's been defined.

This isn't usually a problem, especially if we adhere to the recommended *one class per file* rule.
But sometimes circular references are unavoidable.
We're in a bind when class 'A refers to class 'B' and 'B' refers to 'A'.
One of them has to be defined first.

The Angular `forwardRef` function creates an *indirect* reference that Angular can resolve later.

The *Parent Finder* sample is full of circular class references that are impossible to break.
We face this dilemma when a class makes *a reference to itself*
as does the `AlexComponent` in its `providers` array.
The `providers` array is a property of the `@Component` decorator function which must
appear *above* the class definition.

We break the circularity with `forwardRef`:

<code-example path="cb-dependency-injection/src/app/parent-finder.component.ts" region="alex-providers" linenums="false">

</code-example>

