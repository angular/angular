@title
Architecture Overview

@intro
The basic building blocks of Angular applications.

@description

Angular is a framework for building client applications in HTML and
either JavaScript or a language like TypeScript that compiles to JavaScript.

The framework consists of several libraries, some of them core and some optional.

You write Angular applications by composing HTML *templates* with Angularized markup,
writing *component* classes to manage those templates, adding application logic in *services*,
and boxing components and services in *modules*.

Then you launch the app by *bootstrapping* the _root module_.
Angular takes over, presenting your application content in a browser and
responding to user interactions according to the instructions you've provided.

Of course, there is more to it than this.
You'll learn the details in the pages that follow. For now, focus on the big picture.

<figure>
  <img src="generated/images/guide/architecture/overview2.png" alt="overview">
</figure>

<!--

The architecture diagram identifies the eight main building blocks of an Angular application:

* [Modules](guide/architecture#modules)
* [Components](guide/architecture#components)
* [Templates](guide/architecture#templates)
* [Metadata](guide/architecture#metadata)
* [Data binding](guide/architecture#data-binding)
* [Directives](guide/architecture#directives)
* [Services](guide/architecture#services)
* [Dependency injection](guide/architecture#dependency-injection)

Learn these building blocks, and you're on your way.
-->

<div class="l-sub-section">

The code referenced on this page is available as a <live-example></live-example>.

</div>

## Modules

<img src="generated/images/guide/architecture/module.png" alt="Component" class="left">


Angular apps are modular and Angular has its own modularity system called _Angular modules_ or _NgModules_.

_Angular modules_ are a big deal.
This page introduces modules; the [Angular modules](guide/ngmodule) page covers them in depth.

<br class="clear">

Every Angular app has at least one Angular module class, [the _root module_](guide/appmodule "AppModule: the root module"),
conventionally named `AppModule`.

While the _root module_ may be the only module in a small application, most apps have many more
_feature modules_, each a cohesive block of code dedicated to an application domain,
a workflow, or a closely related set of capabilities.

An Angular module, whether a _root_ or _feature_, is a class with an `@NgModule` decorator.

<div class="l-sub-section">

Decorators are functions that modify JavaScript classes.
Angular has many decorators that attach metadata to classes so that it knows
what those classes mean and how they should work.
<a href="https://medium.com/google-developers/exploring-es7-decorators-76ecb65fb841#.x5c2ndtx0">
Learn more</a> about decorators on the web.

</div>

`NgModule` is a decorator function that takes a single metadata object whose properties describe the module.
The most important properties are:
* `declarations` - the _view classes_ that belong to this module.
Angular has three kinds of view classes: [components](guide/architecture#components), [directives](guide/architecture#directives), and [pipes](guide/pipes).

* `exports` - the subset of declarations that should be visible and usable in the component [templates](guide/architecture#templates) of other modules.

* `imports` - other modules whose exported classes are needed by component templates declared in _this_ module.

* `providers` - creators of [services](guide/architecture#services) that this module contributes to
the global collection of services; they become accessible in all parts of the app.

* `bootstrap` - the main application view, called the _root component_,
that hosts all other app views. Only the _root module_ should set this `bootstrap` property.

Here's a simple root module:

<code-example path="architecture/src/app/mini-app.ts" region="module" title="src/app/app.module.ts" linenums="false"></code-example>

<div class="l-sub-section">

The `export` of `AppComponent` is just to show how to export; it isn't actually necessary in this example. A root module has no reason to _export_ anything because other components don't need to _import_ the root module.

</div>

Launch an application by _bootstrapping_ its root module.
During development you're likely to bootstrap the `AppModule` in a `main.ts` file like this one.

<code-example path="architecture/src/main.ts" title="src/main.ts" linenums="false"></code-example>

### Angular modules vs. JavaScript modules

The Angular module &mdash; a class decorated with `@NgModule` &mdash; is a fundamental feature of Angular.

JavaScript also has its own module system for managing collections of JavaScript objects.
It's completely different and unrelated to the Angular module system.

In JavaScript each _file_ is a module and all objects defined in the file belong to that module.
The module declares some objects to be public by marking them with the `export` key word.
Other JavaScript modules use *import statements* to access public objects from other modules.

<code-example path="architecture/src/app/app.module.ts" region="imports" linenums="false"></code-example>

<code-example path="architecture/src/app/app.module.ts" region="export" linenums="false"></code-example>

<div class="l-sub-section">

<a href="http://exploringjs.com/es6/ch_modules.html">Learn more about the JavaScript module system on the web.</a>

</div>


These are two different and _complementary_ module systems. Use them both to write your apps.

### Angular libraries

<img src="generated/images/guide/architecture/library-module.png" alt="Component" class="left">

Angular ships as a collection of JavaScript modules. You can think of them as library modules.

Each Angular library name begins with the `@angular` prefix.

You install them with the **npm** package manager and import parts of them with JavaScript `import` statements.

<br class="clear">

For example, import Angular's `Component` decorator from the `@angular/core` library like this:

<code-example path="architecture/src/app/app.component.ts" region="import" linenums="false"></code-example>

You also import Angular _modules_ from Angular _libraries_ using JavaScript import statements:

<code-example path="architecture/src/app/mini-app.ts" region="import-browser-module" linenums="false"></code-example>

In the example of the simple root module above, the application module needs material from within that `BrowserModule`. To access that material, add it to the `@NgModule` metadata `imports` like this.

<code-example path="architecture/src/app/mini-app.ts" region="ngmodule-imports" linenums="false"></code-example>

In this way you're using both the Angular and JavaScript module systems _together_.

It's easy to confuse the two systems because they share the common vocabulary of "imports" and "exports".
Hang in there. The confusion yields to clarity with time and experience.

<div class="l-sub-section">

Learn more from the [Angular modules](guide/ngmodule) page.

</div>

<hr/>

## Components

<img src="generated/images/guide/architecture/hero-component.png" alt="Component" class="left">

A _component_ controls a patch of screen called a *view*.

For example, the following views are controlled by components:

* The app root with the navigation links.
* The list of heroes.
* The hero editor.

You define a component's application logic&mdash;what it does to support the view&mdash;inside a class.
The class interacts with the view through an API of properties and methods.

{@a component-code}

For example, this `HeroListComponent` has a `heroes` property that returns an array of heroes
that it acquires from a service.
`HeroListComponent` also has a `selectHero()` method that sets a `selectedHero` property when the user clicks to choose a hero from that list.

<code-example path="architecture/src/app/hero-list.component.ts" linenums="false" title="src/app/hero-list.component.ts (class)" region="class"></code-example>

Angular creates, updates, and destroys components as the user moves through the application.
Your app can take action at each moment in this lifecycle through optional [lifecycle hooks](guide/lifecycle-hooks), like `ngOnInit()` declared above.

<hr/>

## Templates

<img src="generated/images/guide/architecture/template.png" alt="Template" class="left">

You define a component's view with its companion **template**. A template is a form of HTML
that tells Angular how to render the component.

A template looks like regular HTML, except for a few differences. Here is a
template for our `HeroListComponent`:

<code-example path="architecture/src/app/hero-list.component.html" title="src/app/hero-list.component.html"></code-example>

Although this template uses typical HTML elements like `<h2>` and  `<p>`, it also has some differences. Code like `*ngFor`, `{{hero.name}}`, `(click)`, `[hero]`, and `<hero-detail>` uses Angular's [template syntax](guide/template-syntax).

In the last line of the template, the `<hero-detail>` tag is a custom element that represents a new component, `HeroDetailComponent`.

The `HeroDetailComponent` is a *different* component than the `HeroListComponent` you've been reviewing.
The `HeroDetailComponent` (code not shown) presents facts about a particular hero, the
hero that the user selects from the list presented by the `HeroListComponent`.
The `HeroDetailComponent` is a **child** of the `HeroListComponent`.

<img src="generated/images/guide/architecture/component-tree.png" alt="Metadata" class="left">

Notice how `<hero-detail>` rests comfortably among native HTML elements. Custom components mix seamlessly with native HTML in the same layouts.

<hr class="clear"/>

## Metadata

<img src="generated/images/guide/architecture/metadata.png" alt="Metadata" class="left">

Metadata tells Angular how to process a class.

<br class="clear">

[Looking back at the code](guide/architecture#component-code) for `HeroListComponent`, you can see that it's just a class.
There is no evidence of a framework, no "Angular" in it at all.

In fact, `HeroListComponent` really is *just a class*. It's not a component until you *tell Angular about it*.

To tell Angular that `HeroListComponent` is a component, attach **metadata** to the class.

In TypeScript, you attach metadata by using a **decorator**.
Here's some metadata for `HeroListComponent`:

<code-example path="architecture/src/app/hero-list.component.ts" linenums="false" title="src/app/hero-list.component.ts (metadata)" region="metadata"></code-example>

Here is the `@Component` decorator, which identifies the class
immediately below it as a component class.


The `@Component` decorator takes a required configuration object with the
information Angular needs to create and present the component and its view.

Here are a few of the most useful `@Component` configuration options:

* `selector`: CSS selector that tells Angular to create and insert an instance of this component
where it finds a `<hero-list>` tag in *parent* HTML.
For example, if an app's  HTML contains `<hero-list></hero-list>`, then
Angular inserts an instance of the `HeroListComponent` view between those tags.

* `templateUrl`: module-relative address of this component's HTML template, shown [above](guide/architecture#templates).


* `providers`: array of **dependency injection providers** for services that the component requires.
This is one way to tell Angular that the component's constructor requires a `HeroService`
so it can get the list of heroes to display.


<img src="generated/images/guide/architecture/template-metadata-component.png" alt="Metadata" class="left">

The metadata in the `@Component` tells Angular where to get the major building blocks you specify for the component.

The template, metadata, and component together describe a view.

Apply other metadata decorators in a similar fashion to guide Angular behavior.
`@Injectable`, `@Input`, and `@Output` are a few of the more popular decorators.

<br class="clear">

The architectural takeaway is that you must add metadata to your code
so that Angular knows what to do.

<hr/>

## Data binding
Without a framework, you would be responsible for pushing data values into the HTML controls and turning user responses
into actions and value updates. Writing such push/pull logic by hand is tedious, error-prone, and a nightmare to
read as any experienced jQuery programmer can attest.

<img src="generated/images/guide/architecture/databinding.png" alt="Data Binding" class="left">

Angular supports **data binding**,
a mechanism for coordinating parts of a template with parts of a component.
Add binding markup to the template HTML to tell Angular how to connect both sides.

As the diagram shows, there are four forms of data binding syntax. Each form has a direction &mdash; to the DOM, from the DOM, or in both directions.

<br class="clear">

The `HeroListComponent` [example](guide/architecture#templates) template has three forms:

<code-example path="architecture/src/app/hero-list.component.1.html" linenums="false" title="src/app/hero-list.component.html (binding)" region="binding"></code-example>

* The `{{hero.name}}` [*interpolation*](guide/displaying-data#interpolation)
displays the component's `hero.name` property value within the `<li>` element.

* The `[hero]` [*property binding*](guide/template-syntax#property-binding) passes the value of `selectedHero` from
the parent `HeroListComponent` to the `hero` property of the child `HeroDetailComponent`.

* The `(click)` [*event binding*](guide/user-input#click) calls the component's `selectHero` method when the user clicks a hero's name.

**Two-way data binding** is an important fourth form
that combines property and event binding in a single notation, using the `ngModel` directive.
Here's an example from the `HeroDetailComponent` template:

<code-example path="architecture/src/app/hero-detail.component.html" linenums="false" title="src/app/hero-detail.component.html (ngModel)" region="ngModel"></code-example>

In two-way binding, a data property value flows to the input box from the component as with property binding.
The user's changes also flow back to the component, resetting the property to the latest value,
as with event binding.

Angular processes *all* data bindings once per JavaScript event cycle,
from the root of the application component tree through all child components.

<figure>
  <img src="generated/images/guide/architecture/component-databinding.png" alt="Data Binding">
</figure>

Data binding plays an important role in communication between a template and its component.

<figure>
  <img src="generated/images/guide/architecture/parent-child-binding.png" alt="Parent/Child binding">
</figure>

Data binding is also important for communication between parent and child components.

<hr class="clear"/>

## Directives

<img src="generated/images/guide/architecture/directive.png" alt="Parent child" class="left">

Angular templates are *dynamic*. When Angular renders them, it transforms the DOM
according to the instructions given by **directives**.

A directive is a class with a `@Directive` decorator.
A component is a *directive-with-a-template*;
a `@Component` decorator is actually a `@Directive` decorator extended with template-oriented features.

<div class="l-sub-section clear">

While **a component is technically a directive**,
components are so distinctive and central to Angular applications that this architectural overview  separates components from directives.

</div>

Two *other* kinds of directives exist: _structural_ and _attribute_ directives.

They tend to appear within an element tag as attributes do,
sometimes by name but more often as the target of an assignment or a binding.

**Structural** directives alter layout by adding, removing, and replacing elements in DOM.

The [example template](guide/architecture#templates) uses two built-in structural directives:

<code-example path="architecture/src/app/hero-list.component.1.html" linenums="false" title="src/app/hero-list.component.html (structural)" region="structural"></code-example>

* [`*ngFor`](guide/displaying-data#ngFor) tells Angular to stamp out one `<li>` per hero in the `heroes` list.
* [`*ngIf`](guide/displaying-data#ngIf) includes the `HeroDetail` component only if a selected hero exists.

**Attribute** directives alter the appearance or behavior of an existing element.
In templates they look like regular HTML attributes, hence the name.

The `ngModel` directive, which implements two-way data binding, is
an example of an attribute directive. `ngModel` modifies the behavior of
an existing element (typically an `<input>`)
by setting its display value property and responding to change events.

<code-example path="architecture/src/app/hero-detail.component.html" linenums="false" title="src/app/hero-detail.component.html (ngModel)" region="ngModel"></code-example>

Angular has a few more directives that either alter the layout structure
(for example, [ngSwitch](guide/template-syntax#ngSwitch))
or modify aspects of DOM elements and components
(for example, [ngStyle](guide/template-syntax#ngStyle) and [ngClass](guide/template-syntax#ngClass)).

Of course, you can also write your own directives. Components such as
`HeroListComponent` are one kind of custom directive.
<!-- PENDING: link to where to learn more about other kinds! -->

<hr/>

## Services

<img src="generated/images/guide/architecture/service.png" alt="Service" class="left">

_Service_ is a broad category encompassing any value, function, or feature that your application needs.

Almost anything can be a service.
A service is typically a class with a narrow, well-defined purpose. It should do something specific and do it well.<br class="l-clear-both">

Examples include:

* logging service
* data service
* message bus
* tax calculator
* application configuration

There is nothing specifically _Angular_ about services. Angular has no definition of a service.
There is no service base class, and no place to register a service.

Yet services are fundamental to any Angular application. Components are big consumers of services.

Here's an example of a service class that logs to the browser console:

<code-example path="architecture/src/app/logger.service.ts" linenums="false" title="src/app/logger.service.ts (class)" region="class"></code-example>

Here's a `HeroService` that uses a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) to fetch heroes.
The `HeroService` depends on the `Logger` service and another `BackendService` that handles the server communication grunt work.

<code-example path="architecture/src/app/hero.service.ts" linenums="false" title="src/app/hero.service.ts (class)" region="class"></code-example>

Services are everywhere.

Component classes should be lean. They don't fetch data from the server,
validate user input, or log directly to the console.
They delegate such tasks to services.

A component's job is to enable the user experience and nothing more. It mediates between the view (rendered by the template)
and the application logic (which often includes some notion of a _model_).
A good component presents properties and methods for data binding.
It delegates everything nontrivial to services.

Angular doesn't *enforce* these principles.
It won't complain if you write a "kitchen sink" component with 3000 lines.

Angular does help you *follow* these principles by making it easy to factor your
application logic into services and make those services available to components through *dependency injection*.

<hr/>

## Dependency injection

<img src="generated/images/guide/architecture/dependency-injection.png" alt="Service" class="left">

_Dependency injection_ is a way to supply a new instance of a class
with the fully-formed dependencies it requires. Most dependencies are services.
Angular uses dependency injection to provide new components with the services they need.

<br class="clear">

Angular can tell which services a component needs by looking at the types of its constructor parameters.
For example, the constructor of your `HeroListComponent` needs a `HeroService`:


<code-example path="architecture/src/app/hero-list.component.ts" linenums="false" title="src/app/hero-list.component.ts (constructor)" region="ctor"></code-example>

When Angular creates a component, it first asks an **injector** for
the services that the component requires.

An injector maintains a container of service instances that it has previously created.
If a requested service instance is not in the container, the injector makes one and adds it to the container
before returning the service to Angular.
When all requested services have been resolved and returned,
Angular can call the component's constructor with those services as arguments.
This is *dependency injection*.

The process of `HeroService` injection looks a bit like this:

<figure>
  <img src="generated/images/guide/architecture/injector-injects.png" alt="Service">
</figure>


If the injector doesn't have a `HeroService`, how does it know how to make one?

In brief, you must have previously registered a **provider** of the `HeroService` with the injector.
A provider is something that can create or return a service, typically the service class itself.

You can register providers in modules or in components.

In general, add providers to the [root module](guide/architecture#modules) so that
the same instance of a service is available everywhere.

<code-example path="architecture/src/app/app.module.ts" linenums="false" title="src/app/app.module.ts (module providers)" region="providers"></code-example>

Alternatively, register at a component level in the `providers` property of the `@Component` metadata:

<code-example path="architecture/src/app/hero-list.component.ts" linenums="false" title="src/app/hero-list.component.ts (component providers)" region="providers"></code-example>

Registering at a component level means you get a new instance of the
service with each new instance of that component.

<!-- We've vastly oversimplified dependency injection for this overview.
The full story is in the [dependency injection](guide/dependency-injection) page. -->

Points to remember about dependency injection:

* Dependency injection is wired into the Angular framework and used everywhere.

* The *injector* is the main mechanism.
  * An injector maintains a *container* of service instances that it created.
  * An injector can create a new service instance from a *provider*.

* A *provider* is a recipe for creating a service.

* Register *providers* with injectors.

<hr/>

## Wrap up

You've learned the basics about the eight main building blocks of an Angular application:

* [Modules](guide/architecture#modules)
* [Components](guide/architecture#components)
* [Templates](guide/architecture#templates)
* [Metadata](guide/architecture#metadata)
* [Data binding](guide/architecture#data-binding)
* [Directives](guide/architecture#directives)
* [Services](guide/architecture#services)
* [Dependency injection](guide/architecture#dependency-injection)

That's a foundation for everything else in an Angular application,
and it's more than enough to get going.
But it doesn't include everything you need to know.

Here is a brief, alphabetical list of other important Angular features and services.
Most of them are covered in this documentation (or soon will be).

> [**Animations**](guide/animations): Animate component behavior
without deep knowledge of animation techniques or CSS with Angular's animation library.

> **Change detection**: The change detection documentation will cover how Angular decides that a component property value has changed,
when to update the screen, and how it uses **zones** to intercept asynchronous activity and run its change detection strategies.

> **Events**: The events documentation will cover how to use components and services to raise events with mechanisms for
publishing and subscribing to events.

> [**Forms**](guide/forms): Support complex data entry scenarios with HTML-based validation and dirty checking.

> [**HTTP**](guide/http): Communicate with a server to get data, save data, and invoke server-side actions with an HTTP client.

> [**Lifecycle hooks**](guide/lifecycle-hooks): Tap into key moments in the lifetime of a component, from its creation to its destruction,
by implementing the lifecycle hook interfaces.

> [**Pipes**](guide/pipes): Use pipes in your templates to improve the user experience by transforming values for display. Consider this `currency` pipe expression:
>
> > `price | currency:'USD':true`
>
> It displays a price of 42.33 as `$42.33`.

> [**Router**](guide/router): Navigate from page to page within the client
  application and never leave the browser.


> [**Testing**](guide/testing): Run unit tests on your application parts as they interact with the Angular framework
using the _Angular Testing Platform_.
