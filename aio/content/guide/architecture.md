# Architecture Overview

Angular is a platform and framework for building client applications in HTML and
either JavaScript or a language like TypeScript that compiles to JavaScript.
Angular is itself written in TypeScript. It implements core and optional functionality as a set of TypeScript libraries that you import into your applications.

The basic building blocks of an Angular application are _NgModules_, which collect _components_, and _services_ into functional sets. An Angular application is defined by a set of modules. An application always has at least a _root module_, and typically has many more _feature modules_.

* Components define *views*, which are sets of screen elements that Angular can choose among and modify according to your program logic and data.
* Services provide specific functionality not directly related to views, which can be *injected* into components as *dependencies*, making your code even more modular and efficient.

Both components and services are simply classes, with *metadata* that controls how Angualar uses them. A component class is also associated with a *template* that defines its view. The template combines ordinary HTML with Angular *directives* and *binding markup* that allow Angular to modify the HTML before rendering it for display.

**Modules**

Angular is modular. It defines the `NgModule`, which differs from and complements the JavaScript module. An NgModule declares and serves as a manifest for a block of code dedicated to an application domain, a workflow, or a closely related set of capabilities. An NgModule collects *components*, *services*, and related code into functional units. NgModules can import functionality from other NgModules, and allow their own functionality to be exported and used by other NgModules.

**Components and injectable services**

Every Angular application has at least one component, the *root component* that connects a component hierarchy with the containing module. Each component defines a class that contains application data and logic, and includes an HTML *template* that defines a view to be displayed in a target environment.

For data or logic that is not associated with a specific view, or that you want to share across components,
you create a service class. Services can be *injected* into client components as a dependency. Dependency injection lets you keep your component classes lean and efficient. They don't fetch data from the server, validate user input, or log directly to the console; they delegate such tasks to services.

**Templates, directives, and data binding**

A template combines HTML with Angular markup that can modify the HTML elements before they are displayed.
Template *directives* provide program logic, and *binding markup* connects your application data and the document object model (DOM).

* *Event binding* lets your app respond to user input in the target environment by updating your application data.
* *Property binding* lets you interpolate values that are computed from your application data into the HTML.  

Before a view is displayed, Angular evaluates the directives in the template to modify the HTML elements and the DOM according to your program data and logic.

**Decorators and metadata**

Metadata tells Angular how to process a class. In TypeScript, you attach metadata by using a **decorator**. It is the metadata that makes a class into a component, for example, or into an injectable service or something else. The `@Component` decorator identifies the class immediately below it as a component class.

<hr/>

Each of the big pieces introduced here is further explained below. The following diagram shows how these pieces are related. (There are a lot more features, of course - for now, focus on the big picture.)

<figure>
  <img src="generated/images/guide/architecture/overview2.png" alt="overview">
</figure>

* The dependency **Injector** provides services to a component.
* Directives and binding markup in the template associated with a component modify views based on program data and logic.
* A **Decorator** associated with a component or directive adds *metadata*. Decorators are functions that modify JavaScript classes. Angular has many decorators that attach metadata to classes so that it knows what those classes mean and how they should work. <a href="https://medium.com/google-developers/exploring-es7-decorators-76ecb65fb841#.x5c2ndtx0">Learn more about decorators on the web</a> .

Together, a component, template, and metadata define an Angular view.

<div class="l-sub-section">

  The code referenced on this page is available as a <live-example></live-example>.

</div>

<hr/>

## Modules

<img src="generated/images/guide/architecture/module.png" alt="Component" class="left">

Angular apps are modular and Angular has its own modularity system called _NgModules_. An NgModule is a container for a cohesive block of code dedicated to an application domain, a workflow, or a closely related set of capabilities. It can contain components, services, and other code files whose scope is defined by the containing module. It can import functionality that is exported from other modules, and export selected functionality for use by other modules.

 Every Angular app has at least one NgModule class, [the _root module_](guide/bootstrapping "Bootstrapping"), which is conventionally named `AppModule` and resides in a file named `app.module.ts`. You launch your app by *bootstrapping* the root module. While a small application might have only one module, most apps have many more _feature modules_.  

<br class="clear">

An NgModule is a defined as a class decorated with `@NgModule`.  The `@NgModule` decorator is a function that takes a single metadata object, whose properties describe the module. The most important properties are as follows.

* `declarations` - The [components](guide/architecture#components), [directives](guide/architecture#directives), and [pipes](guide/pipes) that belong to this module.

* `exports` -  The subset of declarations that should be visible and usable in the component [templates](guide/architecture#templates) of other modules.  

* `imports` - Other modules whose exported classes are needed by component templates declared in _this_ module.

* `providers` - Creators of [services](guide/architecture#services) that this module contributes to
the global collection of services; they become accessible in all parts of the app.

* `bootstrap` - The main application view, called the _root component_, which hosts all other app views.
Only the _root module_ should set this `bootstrap` property.

Here's a simple root module definition:

<code-example path="architecture/src/app/mini-app.ts" region="module" title="src/app/app.module.ts" linenums="false"></code-example>

<div class="l-sub-section">

  The `export` of `AppComponent` is just to show how to export; it isn't actually necessary in this example. A root module has no reason to _export_ anything because other components don't need to _import_ the root module.

</div>

### NgModules vs. JavaScript modules

The NgModule system is different from and unrelated to the JavaScript module system for managing collections of JavaScript objects.  These are two different and _complementary_ module systems. You can use them both to write your apps.

In JavaScript each _file_ is a module and all objects defined in the file belong to that module.
The module declares some objects to be public by marking them with the `export` key word.
Other JavaScript modules use *import statements* to access public objects from other modules.

<code-example path="architecture/src/app/app.module.ts" region="imports" linenums="false"></code-example>

<code-example path="architecture/src/app/app.module.ts" region="export" linenums="false"></code-example>

<div class="l-sub-section">
  <a href="http://exploringjs.com/es6/ch_modules.html">Learn more about the JavaScript module system on the web.</a>
</div>

### Angular libraries

<img src="generated/images/guide/architecture/library-module.png" alt="Component" class="left">

Angular ships as a collection of JavaScript modules. You can think of them as library modules. Each Angular library name begins with the `@angular` prefix. Install them with the **npm** package manager and import parts of them with JavaScript `import` statements.

<br class="clear">

For example, import Angular's `Component` decorator from the `@angular/core` library like this:

<code-example path="architecture/src/app/app.component.ts" region="import" linenums="false"></code-example>

You also import NgModules from Angular _libraries_ using JavaScript import statements:

<code-example path="architecture/src/app/mini-app.ts" region="import-browser-module" linenums="false"></code-example>

In the example of the simple root module above, the application module needs material from within that `BrowserModule`. To access that material, add it to the `@NgModule` metadata `imports` like this.

<code-example path="architecture/src/app/mini-app.ts" region="ngmodule-imports" linenums="false"></code-example>

In this way you're using both the Angular and JavaScript module systems _together_. It's easy to confuse the two systems because they share the common vocabulary of "imports" and "exports".
Hang in there. The confusion yields to clarity with time and experience.

<div class="l-sub-section">

  Learn more from the [NgModules](guide/ngmodule) page.

</div>

<hr/>

## Components  

<img src="generated/images/guide/architecture/hero-component.png" alt="Component" class="left">

A _component_ controls a patch of screen called a *view*. For example, components define and control each of the following views from the Tutorial:

* The app root with the navigation links.
* The list of heroes.
* The hero editor.

You define a component's application logic&mdash;what it does to support the view&mdash;inside a class.
The class interacts with the view through an API of properties and methods.

{@a component-code}

For example, this `HeroListComponent` has a `heroes` property that returns an array of heroes
that it acquires from a service. `HeroListComponent` also has a `selectHero()` method that sets a `selectedHero` property when the user clicks to choose a hero from that list.

<code-example path="architecture/src/app/hero-list.component.ts" linenums="false" title="src/app/hero-list.component.ts (class)" region="class"></code-example>

Angular creates, updates, and destroys components as the user moves through the application.
Your app can take action at each moment in this lifecycle through optional [lifecycle hooks](guide/lifecycle-hooks), like `ngOnInit()` declared above.

<hr/>

## Metadata

<img src="generated/images/guide/architecture/metadata.png" alt="Metadata" class="left">

The `@Component` decorator identifies the class immediately below it as a component class, and specifies its metadata. The metadata for a component tells Angular where to get the major building blocks it needs to create and present the component and its view.

Any time you define a class, you must add metadata to it so that Angular knows how it is meant to be used. For example, the `@Injectable` decorator tell Angular that a class is meant to be used as an injectable service. `@Input`, and `@Output` are some other popular decorators.

<br class="clear">

In the [example code](guide/architecture#component-code), you can see that `HeroListComponent` really is just a vanilla class, with no special Angular notation or syntax at all. It's not a component until you *tell Angular about it* by associating it with the '@Component' decorator.  

Here's some of the metadata for `HeroListComponent`:

<code-example path="architecture/src/app/hero-list.component.ts" linenums="false" title="src/app/hero-list.component.ts (metadata)" region="metadata"></code-example>

The `@Component` decorator takes a required configuration object that contains the required metadata, as you define it for your component. Here are a few of the most useful `@Component` configuration options:

* `selector`: A CSS selector that tells Angular to create and insert an instance of this component wherever it finds the corresponding tag in template HTML. For example, if an app's  HTML contains `<hero-list></hero-list>`, then
Angular inserts an instance of the `HeroListComponent` view between those tags.

* `templateUrl`: The module-relative address of this component's HTML template.

* `providers`: An array of **dependency injection providers** for services that the component requires.
In the example, this tells Angular that the component's constructor requires a `HeroService` instance
in order to get the list of heroes to display.

<img src="generated/images/guide/architecture/template-metadata-component.png" alt="Metadata" class="left">

The component, template, and metadata together describe a view.

<br class="clear">

<hr/>

## Templates

<img src="generated/images/guide/architecture/template.png" alt="Template" class="left">

You define a component's view with its companion **template**. A template is a form of HTML
that tells Angular how to render the component. A template looks like regular HTML, except that it also contains Angular [template syntax](guide/template-syntax). For example, here is a template for the Tutorial's `HeroListComponent`:

<code-example path="architecture/src/app/hero-list.component.html" title="src/app/hero-list.component.html"></code-example>

This template uses typical HTML elements like `<h2>` and  `<p>`, and also includes Angular template-syntax elements,  `*ngFor`, `{{hero.name}}`, `(click)`, `[hero]`, and `<hero-detail>`. The template-syntax elements tell Angular how to render the HTML to the screen, using program logic and data.

* The  `*ngFor` directive tells Angular to iterate over a list.
* The `{{hero.name}}`, `(click)`, and `[hero]` bind program data to and from the DOM, responding to user input. See more about [data binding](#data-binding) below.
* The `<hero-detail>` tag in the example is a custom element that represents a new component, `HeroDetailComponent`.  The `HeroDetailComponent`  (code not shown) is a child component of the `HeroListComponent` that defines the Hero-detail view. Notice how custom components like this mix seamlessly with native HTML in the same layouts.

<img src="generated/images/guide/architecture/component-tree.png" alt="Metadata" class="left">


<hr class="clear"/>

### Data binding

Without a framework, you would be responsible for pushing data values into the HTML controls and turning user responses
into actions and value updates. Writing such push/pull logic by hand is tedious, error-prone, and a nightmare to
read as any experienced jQuery programmer can attest.

Angular supports **data binding**, a mechanism for coordinating parts of a template with parts of a component.
Add binding markup to the template HTML to tell Angular how to connect both sides.

The following diagram shows the four forms of data binding syntax. Each form has a direction &mdash; to the DOM, from the DOM, or in both directions.

<img src="generated/images/guide/architecture/databinding.png" alt="Data Binding" class="left">

<br class="clear">

This example from the `HeroListComponent` [example](guide/architecture#templates) template uses three of these forms:

<code-example path="architecture/src/app/hero-list.component.1.html" linenums="false" title="src/app/hero-list.component.html (binding)" region="binding"></code-example>

* The `{{hero.name}}` [*interpolation*](guide/displaying-data#interpolation)
displays the component's `hero.name` property value within the `<li>` element.

* The `[hero]` [*property binding*](guide/template-syntax#property-binding) passes the value of `selectedHero` from
the parent `HeroListComponent` to the `hero` property of the child `HeroDetailComponent`.

* The `(click)` [*event binding*](guide/user-input#click) calls the component's `selectHero` method when the user clicks a hero's name.

**Two-way data binding** is an important fourth form that combines property and event binding in a single notation, using the `ngModel` directive. Here's an example from the `HeroDetailComponent` template:

<code-example path="architecture/src/app/hero-detail.component.html" linenums="false" title="src/app/hero-detail.component.html (ngModel)" region="ngModel"></code-example>

In two-way binding, a data property value flows to the input box from the component as with property binding.
The user's changes also flow back to the component, resetting the property to the latest value,
as with event binding.

Angular processes *all* data bindings once per JavaScript event cycle,
from the root of the application component tree through all child components.

<figure>
  <img src="generated/images/guide/architecture/component-databinding.png" alt="Data Binding">
</figure>

Data binding plays an important role in communication between a template and its component, and is also important for communication between parent and child components.

<figure>
  <img src="generated/images/guide/architecture/parent-child-binding.png" alt="Parent/Child binding">
</figure>

<hr/>

### Directives

<img src="generated/images/guide/architecture/directive.png" alt="Parent child" class="left">

Angular templates are *dynamic*. When Angular renders them, it transforms the DOM
according to the instructions given by **directives**. A directive is a class with a `@Directive` decorator.

<div class="l-sub-section">
A component is technically a directive; it is a *directive-with-a-template*. Components are so distinctive and central to Angular applications that Angular defines the `@Component` decorator, extending the `@Directive` with template-oriented features.
</div>

There are two kinds of directives besides components:  _structural_ and _attribute_ directives.
They typically appear within an element tag as attributes, either by name or as the target of an assignment or a binding.

**Structural** directives alter layout by adding, removing, and replacing elements in DOM.

The [example template](guide/architecture#templates) uses two built-in structural directives:

<code-example path="architecture/src/app/hero-list.component.1.html" linenums="false" title="src/app/hero-list.component.html (structural)" region="structural"></code-example>

* [`*ngFor`](guide/displaying-data#ngFor) tells Angular to stamp out one `<li>` per hero in the `heroes` list.
* [`*ngIf`](guide/displaying-data#ngIf) includes the `HeroDetail` component only if a selected hero exists.

**Attribute** directives alter the appearance or behavior of an existing element.
In templates they look like regular HTML attributes, hence the name.

The `ngModel` directive, which implements two-way data binding, is an example of an attribute directive. `ngModel` modifies the behavior of an existing element (typically an `<input>`) by setting its display value property and responding to change events.

<code-example path="architecture/src/app/hero-detail.component.html" linenums="false" title="src/app/hero-detail.component.html (ngModel)" region="ngModel"></code-example>

Angular has a few more directives that either alter the layout structure
(for example, [ngSwitch](guide/template-syntax#ngSwitch))
or modify aspects of DOM elements and components
(for example, [ngStyle](guide/template-syntax#ngStyle) and [ngClass](guide/template-syntax#ngClass)).

You can also write your own directives. Components such as `HeroListComponent` are one kind of custom directive.

<!-- PENDING: link to where to learn more about other kinds! -->

<hr/>

## Injectable Services

<img src="generated/images/guide/architecture/service.png" alt="Service" class="left">

_Service_ is a broad category encompassing any value, function, or feature that your application needs.

Almost anything can be a service.
A service is typically a class with a narrow, well-defined purpose. It should do something specific and do it well.
<br class="clear">

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

### Dependency injection

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

That's a foundation for everything else in an Angular application, and it's more than enough to get going.
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
