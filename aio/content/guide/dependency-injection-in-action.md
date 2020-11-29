# Dependency injection in action

This guide explores many of the features of dependency injection (DI) in Angular.

<div class="alert is-helpful">

See the <live-example></live-example> for a working example containing the code snippets in this guide.

</div>

{@a multiple-service-instances}

## Multiple service instances (sandboxing)

Sometimes you want multiple instances of a service at *the same level* of the component hierarchy.

A good example is a service that holds state for its companion component instance.
You need a separate instance of the service for each component.
Each service has its own work-state, isolated from the service-and-state of a different component.
This is called *sandboxing* because each service and component instance has its own sandbox to play in.

{@a hero-bios-component}

In this example, `HeroBiosComponent` presents three instances of `HeroBioComponent`.

<code-example path="dependency-injection-in-action/src/app/hero-bios.component.ts" region="simple" header="ap/hero-bios.component.ts">

</code-example>


Each `HeroBioComponent` can edit a single hero's biography.
`HeroBioComponent` relies on `HeroCacheService` to fetch, cache, and perform other persistence operations on that hero.

<code-example path="dependency-injection-in-action/src/app/hero-cache.service.ts" region="service" header="src/app/hero-cache.service.ts">

</code-example>


Three instances of `HeroBioComponent` can't share the same instance of `HeroCacheService`,
as they'd be competing with each other to determine which hero to cache.

Instead, each `HeroBioComponent` gets its *own* `HeroCacheService` instance
by listing `HeroCacheService` in its metadata `providers` array.

<code-example path="dependency-injection-in-action/src/app/hero-bio.component.ts" region="component" header="src/app/hero-bio.component.ts">

</code-example>


The parent `HeroBiosComponent` binds a value to `heroId`.
`ngOnInit` passes that ID to the service, which fetches and caches the hero.
The getter for the `hero` property pulls the cached hero from the service.
The template displays this data-bound property.

Find this example in <live-example name="dependency-injection-in-action">live code</live-example>
and confirm that the three `HeroBioComponent` instances have their own cached hero data.

<div class="lightbox">
  <img src="generated/images/guide/dependency-injection-in-action/hero-bios.png" alt="Bios">
</div>

{@a qualify-dependency-lookup}

## Qualify dependency lookup with parameter decorators

When a class requires a dependency, that dependency is added to the constructor as a parameter.
When Angular needs to instantiate the class, it calls upon the DI framework to supply the dependency.
By default, the DI framework searches for a provider in the injector hierarchy,
starting at the component's local injector of the component, and if necessary bubbling up
through the injector tree until it reaches the root injector.

* The first injector configured with a provider supplies the dependency (a service instance or value) to the constructor.

* If no provider is found in the root injector, the DI framework throws an error.

There are a number of options for modifying the default search behavior, using _parameter decorators_
on the service-valued parameters of a class constructor.

{@a optional}

### Make a dependency `@Optional` and limit search with `@Host`

Dependencies can be registered at any level in the component hierarchy.
When a component requests a dependency, Angular starts with that component's injector
and walks up the injector tree until it finds the first suitable provider.
Angular throws an error if it can't find the dependency during that walk.

In some cases, you need to limit the search or accommodate a missing dependency.
You can modify Angular's search behavior with the `@Host` and `@Optional` qualifying
decorators on a service-valued parameter of the component's constructor.

* The `@Optional` property decorator tells Angular to return null when it can't find the dependency.

* The `@Host` property decorator stops the upward search at the *host component*.
The host component is typically the component requesting the dependency.
However, when this component is projected into a *parent* component,
that parent component becomes the host. The following example covers this second case.

These decorators can be used individually or together, as shown in the example.
This `HeroBiosAndContactsComponent` is a revision of `HeroBiosComponent` which you looked at [above](guide/dependency-injection-in-action#hero-bios-component).

<code-example path="dependency-injection-in-action/src/app/hero-bios.component.ts" region="hero-bios-and-contacts" header="src/app/hero-bios.component.ts (HeroBiosAndContactsComponent)">

</code-example>

Focus on the template:

<code-example path="dependency-injection-in-action/src/app/hero-bios.component.ts" region="template" header="dependency-injection-in-action/src/app/hero-bios.component.ts"></code-example>

Now there's a new `<hero-contact>` element between the `<hero-bio>` tags.
Angular *projects*, or *transcludes*, the corresponding `HeroContactComponent` into the `HeroBioComponent` view,
placing it in the `<ng-content>` slot of the `HeroBioComponent` template.

<code-example path="dependency-injection-in-action/src/app/hero-bio.component.ts" region="template" header="src/app/hero-bio.component.ts (template)"></code-example>

The result is shown below, with the hero's telephone number from `HeroContactComponent` projected above the hero description.

<div class="lightbox">
  <img src="generated/images/guide/dependency-injection-in-action/hero-bio-and-content.png" alt="bio and contact">
</div>


Here's `HeroContactComponent`, which demonstrates the qualifying decorators.

<code-example path="dependency-injection-in-action/src/app/hero-contact.component.ts" region="component" header="src/app/hero-contact.component.ts">

</code-example>

Focus on the constructor parameters.

<code-example path="dependency-injection-in-action/src/app/hero-contact.component.ts" region="ctor-params" header="src/app/hero-contact.component.ts"></code-example>

The `@Host()` function decorating the  `heroCache` constructor property ensures that
you get a reference to the cache service from the parent `HeroBioComponent`.
Angular throws an error if the parent lacks that service, even if a component higher
in the component tree includes it.

A second `@Host()` function decorates the `loggerService` constructor property.
The only `LoggerService` instance in the app is provided at the `AppComponent` level.
The host `HeroBioComponent` doesn't have its own `LoggerService` provider.

Angular throws an error if you haven't also decorated the property with `@Optional()`.
When the property is marked as optional, Angular sets `loggerService` to null and the rest of the component adapts.


Here's `HeroBiosAndContactsComponent` in action.

<div class="lightbox">
  <img src="generated/images/guide/dependency-injection-in-action/hero-bios-and-contacts.png" alt="Bios with contact into">
</div>



If you comment out the `@Host()` decorator, Angular walks up the injector ancestor tree
until it finds the logger at the `AppComponent` level.
The logger logic kicks in and the hero display updates
with the "!!!" marker to indicate that the logger was found.

<div class="lightbox">
  <img src="generated/images/guide/dependency-injection-in-action/hero-bio-contact-no-host.png" alt="Without @Host">
</div>


If you restore the `@Host()` decorator and comment out `@Optional`,
the app throws an exception when it cannot find the required logger at the host component level.

`EXCEPTION: No provider for LoggerService! (HeroContactComponent -> LoggerService)`

### Supply a custom provider with `@Inject`

Using a custom provider allows you to provide a concrete implementation for implicit dependencies, such as built-in browser APIs. The following example uses an `InjectionToken` to provide the [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) browser API as a dependency in the `BrowserStorageService`.

<code-example path="dependency-injection-in-action/src/app/storage.service.ts" header="src/app/storage.service.ts">

</code-example>

The `factory` function returns the `localStorage` property that is attached to the browser window object. The `Inject` decorator is a constructor parameter used to specify a custom provider of a dependency. This custom provider can now be overridden during testing with a mock API of `localStorage` instead of interacting with real browser APIs.

{@a skip}

### Modify the provider search with `@Self` and `@SkipSelf`

Providers can also be scoped by injector through constructor parameter decorators. The following example overrides the `BROWSER_STORAGE` token in the `Component` class `providers` with the `sessionStorage` browser API. The same `BrowserStorageService` is injected twice in the constructor, decorated with `@Self` and `@SkipSelf` to define which injector handles the provider dependency.

<code-example path="dependency-injection-in-action/src/app/storage.component.ts" header="src/app/storage.component.ts">

</code-example>

Using the `@Self` decorator, the injector only looks at the component's injector for its providers. The `@SkipSelf` decorator allows you to skip the local injector and look up in the hierarchy to find a provider that satisfies this dependency. The `sessionStorageService` instance interacts with the `BrowserStorageService` using the `sessionStorage` browser API, while the `localStorageService` skips the local injector and uses the root `BrowserStorageService` that uses the `localStorage` browser API.

{@a component-element}

## Inject the component's DOM element

Although developers strive to avoid it, many visual effects and third-party tools, such as jQuery,
require DOM access.
As a result, you might need to access a component's DOM element.

To illustrate, here's a minimal version of `HighlightDirective` from
the [Attribute Directives](guide/attribute-directives) page.

<code-example path="dependency-injection-in-action/src/app/highlight.directive.ts" header="src/app/highlight.directive.ts">

</code-example>

The directive sets the background to a highlight color when the user mouses over the
DOM element to which the directive is applied.

Angular sets the constructor's `el` parameter to the injected `ElementRef`.
(An `ElementRef` is a wrapper around a DOM element,
whose `nativeElement` property exposes the DOM element for the directive to manipulate.)

The sample code applies the directive's `myHighlight` attribute to two `<div>` tags,
first without a value (yielding the default color) and then with an assigned color value.

<code-example path="dependency-injection-in-action/src/app/app.component.html" region="highlight" header="src/app/app.component.html (highlight)"></code-example>


The following image shows the effect of mousing over the `<hero-bios-and-contacts>` tag.

<div class="lightbox">
  <img src="generated/images/guide/dependency-injection-in-action/highlight.png" alt="Highlighted bios">
</div>
{@a defining-providers}


### Defining providers

A dependency can't always be created by the default method of instantiating a class.
You learned about some other methods in [Dependency Providers](guide/dependency-injection-providers).
The following `HeroOfTheMonthComponent` example demonstrates many of the alternatives and why you need them.
It's visually simple: a few properties and the logs produced by a logger.

<div class="lightbox">
  <img src="generated/images/guide/dependency-injection-in-action/hero-of-month.png" alt="Hero of the month">
</div>

The code behind it customizes how and where the DI framework provides dependencies.
The use cases illustrate different ways to use the [*provide* object literal](guide/dependency-injection-providers#provide) to associate a definition object with a DI token.

<code-example path="dependency-injection-in-action/src/app/hero-of-the-month.component.ts" region="hero-of-the-month" header="hero-of-the-month.component.ts">

</code-example>

The `providers` array shows how you might use the different provider-definition keys;
`useValue`, `useClass`, `useExisting`, or `useFactory`.

{@a usevalue}


#### Value providers: `useValue`

The `useValue` key lets you associate a fixed value with a DI token.
Use this technique to provide *runtime configuration constants* such as website base addresses and feature flags.
You can also use a value provider in a unit test to provide mock data in place of a production data service.

The `HeroOfTheMonthComponent` example has two value providers.

<code-example path="dependency-injection-in-action/src/app/hero-of-the-month.component.ts" region="use-value" header="dependency-injection-in-action/src/app/hero-of-the-month.component.ts"></code-example>

* The first provides an existing instance of the `Hero` class to use for the `Hero` token, rather than
requiring the injector to create a new instance with `new` or use its own cached instance.
Here, the token is the class itself.

* The second specifies a literal string resource to use for the `TITLE` token.
The `TITLE` provider token is *not* a class, but is instead a
special kind of provider lookup key called an [injection token](guide/dependency-injection-in-action#injection-token), represented by
an `InjectionToken` instance.

You can use an injection token for any kind of provider but it's particularly
helpful when the dependency is a simple value like a string, a number, or a function.

The value of a *value provider* must be defined before you specify it here.
The title string literal is immediately available.
The `someHero` variable in this example was set earlier in the file as shown below.
You can't use a variable whose value will be defined later.

<code-example path="dependency-injection-in-action/src/app/hero-of-the-month.component.ts" region="some-hero" header="dependency-injection-in-action/src/app/hero-of-the-month.component.ts">

</code-example>

Other types of providers can create their values *lazily*; that is, when they're needed for injection.

{@a useclass}


#### Class providers: `useClass`

The `useClass` provider key lets you create and return a new instance of the specified class.

You can use this type of provider to substitute an *alternative implementation*
for a common or default class.
The alternative implementation could, for example, implement a different strategy,
extend the default class, or emulate the behavior of the real class in a test case.

The following code shows two examples in `HeroOfTheMonthComponent`.

<code-example path="dependency-injection-in-action/src/app/hero-of-the-month.component.ts" region="use-class" header="dependency-injection-in-action/src/app/hero-of-the-month.component.ts"></code-example>

The first provider is the *de-sugared*, expanded form of the most typical case in which the
class to be created (`HeroService`) is also the provider's dependency injection token.
The short form is generally preferred; this long form makes the details explicit.

The second provider substitutes `DateLoggerService` for `LoggerService`.
`LoggerService` is already registered at the `AppComponent` level.
When this child component requests `LoggerService`, it receives a `DateLoggerService` instance instead.

<div class="alert is-helpful">

This component and its tree of child components receive `DateLoggerService` instance.
Components outside the tree continue to receive the original `LoggerService` instance.

</div>

`DateLoggerService` inherits from `LoggerService`; it appends the current date/time to each message:

<code-example path="dependency-injection-in-action/src/app/date-logger.service.ts" region="date-logger-service" header="src/app/date-logger.service.ts"></code-example>

{@a useexisting}

#### Alias providers: `useExisting`

The `useExisting` provider key lets you map one token to another.
In effect, the first token is an *alias* for the service associated with the second token,
creating two ways to access the same service object.

<code-example path="dependency-injection-in-action/src/app/hero-of-the-month.component.ts" region="use-existing" header="dependency-injection-in-action/src/app/hero-of-the-month.component.ts">

</code-example>

You can use this technique to narrow an API through an aliasing interface.
The following example shows an alias introduced for that purpose.

Imagine that `LoggerService` had a large API, much larger than the actual three methods and a property.
You might want to shrink that API surface to just the members you actually need.
In this example, the `MinimalLogger` [class-interface](#class-interface) reduces the API to two members:


<code-example path="dependency-injection-in-action/src/app/minimal-logger.service.ts" header="src/app/minimal-logger.service.ts"></code-example>

The following example puts `MinimalLogger` to use in a simplified version of `HeroOfTheMonthComponent`.

<code-example path="dependency-injection-in-action/src/app/hero-of-the-month.component.1.ts" header="src/app/hero-of-the-month.component.ts (minimal version)"></code-example>

The `HeroOfTheMonthComponent` constructor's `logger` parameter is typed as `MinimalLogger`, so only the `logs` and `logInfo` members are visible in a TypeScript-aware editor.

<div class="lightbox">
  <img src="generated/images/guide/dependency-injection-in-action/minimal-logger-intellisense.png" alt="MinimalLogger restricted API">
</div>


Behind the scenes, Angular sets the `logger` parameter to the full service registered under the `LoggingService` token, which happens to be the `DateLoggerService` instance that was [provided above](guide/dependency-injection-in-action#useclass).


<div class="alert is-helpful">

This is illustrated in the following image, which displays the logging date.

<div class="lightbox">
  <img src="generated/images/guide/dependency-injection-in-action/date-logger-entry.png" alt="DateLoggerService entry">
</div>

</div>

{@a usefactory}

#### Factory providers: `useFactory`

The `useFactory` provider key lets you create a dependency object by calling a factory function,
as in the following example.

<code-example path="dependency-injection-in-action/src/app/hero-of-the-month.component.ts" region="use-factory" header="dependency-injection-in-action/src/app/hero-of-the-month.component.ts">

</code-example>

The injector provides the dependency value by invoking a factory function,
that you provide as the value of the `useFactory` key.
Notice that this form of provider has a third key, `deps`, which specifies
dependencies for the `useFactory` function.

Use this technique to create a dependency object with a factory function
whose inputs are a combination of *injected services* and *local state*.

The dependency object (returned by the factory function) is typically a class instance,
but can be other things as well.
In this example, the dependency object is a string of the names of the runners up
to the "Hero of the Month" contest.

In the example, the local state is the number `2`, the number of runners up that the component should show.
The state value is passed as an argument to `runnersUpFactory()`.
The `runnersUpFactory()` returns the *provider factory function*, which can use both
the passed-in state value and the injected services `Hero` and `HeroService`.


<code-example path="dependency-injection-in-action/src/app/runners-up.ts" region="factory-synopsis" header="runners-up.ts (excerpt)"></code-example>

The provider factory function (returned by `runnersUpFactory()`) returns the actual dependency object,
the string of names.

* The function takes a winning `Hero` and a `HeroService` as arguments.
Angular supplies these arguments from injected values identified by
the two *tokens* in the `deps` array.

* The function returns the string of names, which Angular than injects into
the `runnersUp` parameter of `HeroOfTheMonthComponent`.

<div class="alert is-helpful">

The function retrieves candidate heroes from the `HeroService`,
takes `2` of them to be the runners-up, and returns their concatenated names.
Look at the <live-example name="dependency-injection-in-action"></live-example>
for the full source code.

</div>

{@a tokens}

## Provider token alternatives: class interface and 'InjectionToken'

Angular dependency injection is easiest when the provider token is a class
that is also the type of the returned dependency object, or service.

However, a token doesn't have to be a class and even when it is a class,
it doesn't have to be the same type as the returned object.
That's the subject of the next section.
{@a class-interface}

### Class interface

The previous *Hero of the Month* example used the `MinimalLogger` class
as the token for a provider of `LoggerService`.

<code-example path="dependency-injection-in-action/src/app/hero-of-the-month.component.ts" region="use-existing" header="dependency-injection-in-action/src/app/hero-of-the-month.component.ts">

</code-example>

`MinimalLogger` is an abstract class.

<code-example path="dependency-injection-in-action/src/app/minimal-logger.service.ts" header="dependency-injection-in-action/src/app/minimal-logger.service.ts"></code-example>

An abstract class is usually a base class that you can extend.
In this app, however there is no class that inherits from `MinimalLogger`.
The `LoggerService` and the `DateLoggerService` could have inherited from `MinimalLogger`,
or they could have implemented it instead, in the manner of an interface.
But they did neither.
`MinimalLogger` is used only as a dependency injection token.

When you use a class this way, it's called a *class interface*.

As mentioned in [DI Providers](guide/dependency-injection-providers#di-and-interfaces),
an interface is not a valid DI token because it is a TypeScript artifact that doesn't exist at run time.
Use this abstract class interface to get the strong typing of an interface,
and also use it as a provider token in the way you would a normal class.

A class interface should define *only* the members that its consumers are allowed to call.
Such a narrowing interface helps decouple the concrete class from its consumers.


<div class="alert is-helpful">

Using a class as an interface gives you the characteristics of an interface in a real JavaScript object.
To minimize memory cost, however, the class should have *no implementation*.
The `MinimalLogger` transpiles to this unoptimized, pre-minified JavaScript for a constructor function.

<code-example path="dependency-injection-in-action/src/app/minimal-logger.service.ts" region="minimal-logger-transpiled" header="dependency-injection-in-action/src/app/minimal-logger.service.ts"></code-example>

Notice that it doesn't have any members. It never grows no matter how many members you add to the class,
as long as those members are typed but not implemented.

Look again at the TypeScript `MinimalLogger` class to confirm that it has no implementation.

</div>


{@a injection-token}


### 'InjectionToken' objects

Dependency objects can be simple values like dates, numbers and strings, or
shapeless objects like arrays and functions.

Such objects don't have application interfaces and therefore aren't well represented by a class.
They're better represented by a token that is both unique and symbolic,
a JavaScript object that has a friendly name but won't conflict with
another token that happens to have the same name.

`InjectionToken` has these characteristics.
You encountered them twice in the *Hero of the Month* example,
in the *title* value provider and in the *runnersUp* factory provider.

<code-example path="dependency-injection-in-action/src/app/hero-of-the-month.component.ts" region="provide-injection-token" header="dependency-injection-in-action/src/app/hero-of-the-month.component.ts"></code-example>

You created the `TITLE` token like this:

<code-example path="dependency-injection-in-action/src/app/hero-of-the-month.component.ts" region="injection-token" header="dependency-injection-in-action/src/app/hero-of-the-month.component.ts"></code-example>

The type parameter, while optional, conveys the dependency's type to developers and tooling.
The token description is another developer aid.


{@a di-inheritance}

## Inject into a derived class

Take care when writing a component that inherits from another component.
If the base component has injected dependencies,
you must re-provide and re-inject them in the derived class
and then pass them down to the base class through the constructor.

In this contrived example, `SortedHeroesComponent` inherits from `HeroesBaseComponent`
to display a *sorted* list of heroes.

<div class="lightbox">
  <img src="generated/images/guide/dependency-injection-in-action/sorted-heroes.png" alt="Sorted Heroes">
</div>

The `HeroesBaseComponent` can stand on its own.
It demands its own instance of `HeroService` to get heroes
and displays them in the order they arrive from the database.

<code-example path="dependency-injection-in-action/src/app/sorted-heroes.component.ts" region="heroes-base" header="src/app/sorted-heroes.component.ts (HeroesBaseComponent)">

</code-example>


<div class="alert is-helpful">

### Keep constructors simple

Constructors should do little more than initialize variables.
This rule makes the component safe to construct under test without fear that it will do something dramatic like talk to the server.
That's why you call the `HeroService` from within the `ngOnInit` rather than the constructor.

</div>


Users want to see the heroes in alphabetical order.
Rather than modify the original component, sub-class it and create a
`SortedHeroesComponent` that sorts the heroes before presenting them.
The `SortedHeroesComponent` lets the base class fetch the heroes.

Unfortunately, Angular cannot inject the `HeroService` directly into the base class.
You must provide the `HeroService` again for *this* component,
then pass it down to the base class inside the constructor.


<code-example path="dependency-injection-in-action/src/app/sorted-heroes.component.ts" region="sorted-heroes" header="src/app/sorted-heroes.component.ts (SortedHeroesComponent)">

</code-example>


Now take note of the `afterGetHeroes()` method.
Your first instinct might have been to create an `ngOnInit` method in `SortedHeroesComponent` and do the sorting there.
But Angular calls the *derived* class's `ngOnInit` *before* calling the base class's `ngOnInit`
so you'd be sorting the heroes array *before they arrived*. That produces a nasty error.

Overriding the base class's `afterGetHeroes()` method solves the problem.

These complications argue for *avoiding component inheritance*.


{@a forwardref}

## Break circularities with a forward class reference (*forwardRef*)

The order of class declaration matters in TypeScript.
You can't refer directly to a class until it's been defined.

This isn't usually a problem, especially if you adhere to the recommended *one class per file* rule.
But sometimes circular references are unavoidable.
You're in a bind when class 'A' refers to class 'B' and 'B' refers to 'A'.
One of them has to be defined first.

The Angular `forwardRef()` function creates an *indirect* reference that Angular can resolve later.

The *Parent Finder* sample is full of circular class references that are impossible to break.

You face this dilemma when a class makes *a reference to itself*
as does `AlexComponent` in its `providers` array.
The `providers` array is a property of the `@Component()` decorator function which must
appear *above* the class definition.

Break the circularity with `forwardRef`.

<code-example path="dependency-injection-in-action/src/app/parent-finder.component.ts" region="alex-providers" header="parent-finder.component.ts (AlexComponent providers)"></code-example>
