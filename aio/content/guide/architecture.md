@title
Architecture Overview

@intro
The basic building blocks of Angular applications

@description
You write Angular applications by composing HTML *templates* with Angularized markup,
writing *component* classes to manage those templates, adding application logic in *services*,
and boxing components and services in *modules*.

Then you launch the app by *bootstrapping* the _root module_.
Angular takes over, presenting your application content in a browser and
responding to user interactions according to the instructions you've provided.

Of course, there is more to it than this.
You'll learn the details in the pages that follow. For now, focus on the big picture.

<figure>
  <img src="assets/images/devguide/architecture/overview2.png" alt="overview" style="margin-left:-40px;" width="700">  </img>
</figure>

The architecture diagram identifies the eight main building blocks of an Angular application:

* [Modules](#modules)
* [Components](#components)
* [Templates](#templates)
* [Metadata](#metadata)
* [Data binding](#data-binding)
* [Directives](#directives)
* [Services](#services)
* [Dependency injection](#dependency-injection)

Learn these building blocks, and you're on your way.


<p>
  The code referenced on this page is available as a <live-example></live-example>.
</p>


## Modules
<figure>
  <img src="assets/images/devguide/architecture/module.png" alt="Component" align="left" style="width:240px; margin-left:-40px;margin-right:10px">  </img>
</figure>

### Angular libraries

<figure>
  <img src="assets/images/devguide/architecture/library-module.png" alt="Component" align="left" style="width:240px; margin-left:-40px;margin-right:10px">  </img>
</figure>


<div class='l-hr'>
   
</div>


## Components

<figure>
  <img src="assets/images/devguide/architecture/hero-component.png" alt="Component" align="left" style="width:200px; margin-left:-40px;margin-right:10px">  </img>
</figure>

A _component_ controls a patch of screen called a *view*.

For example, the following views are controlled by components:

* The app root with the navigation links.
* The list of heroes.
* The hero editor.

You define a component's application logic&mdash;what it does to support the view&mdash;inside a class.
The class interacts with the view through an API of properties and methods.

<a id="component-code"></a>
For example, this `HeroListComponent` has a `heroes` property that returns !{_an} !{_array} of heroes
that it acquires from a service.
`HeroListComponent` also has a `selectHero()` method that sets a `selectedHero` property when the user clicks to choose a hero from that list.
Angular creates, updates, and destroys components as the user moves through the application.
Your app can take action at each moment in this lifecycle through optional [lifecycle hooks](lifecycle-hooks.html), like `ngOnInit()` declared above.

<div class='l-hr'>
   
</div>


## Templates
<figure>
  <img src="assets/images/devguide/architecture/template.png" alt="Template" align="left" style="width:200px; margin-left:-40px;margin-right:10px">  </img>
</figure>

You define a component's view with its companion **template**. A template is a form of HTML
that tells Angular how to render the component.

A template looks like regular HTML, except for a few differences. Here is a
template for our `HeroListComponent`:


{@example 'architecture/ts/src/app/hero-list.component.html'}

Although this template uses typical HTML elements like `<h2>` and  `<p>`, it also has some differences. Code like `*ngFor`, `{{hero.name}}`, `(click)`, `[hero]`, and `<hero-detail>` uses Angular's [template syntax](template-syntax.html).


In the last line of the template, the `<hero-detail>` tag is a custom element that represents a new component, `HeroDetailComponent`.

The `HeroDetailComponent` is a *different* component than the `HeroListComponent` you've been reviewing.
The `HeroDetailComponent` (code not shown) presents facts about a particular hero, the
hero that the user selects from the list presented by the `HeroListComponent`.
The `HeroDetailComponent` is a **child** of the `HeroListComponent`.

<figure>
  <img src="assets/images/devguide/architecture/component-tree.png" alt="Metadata" align="left" style="width:300px; margin-left:-40px;margin-right:10px">  </img>
</figure>

Notice how `<hero-detail>` rests comfortably among native HTML elements. Custom components mix seamlessly with native HTML in the same layouts.
<br class="l-clear-both">
<div class='l-hr'>
   
</div>


## Metadata
<figure>
  <img src="assets/images/devguide/architecture/metadata.png" alt="Metadata" align="left" style="width:150px; margin-left:-40px;margin-right:10px">  </img>
</figure>

<p style="padding-top:10px">Metadata tells Angular how to process a class.</p>
<br class="l-clear-both">[Looking back at the code](#component-code) for `HeroListComponent`, you can see that it's just a class.
There is no evidence of a framework, no "Angular" in it at all.

In fact, `HeroListComponent` really is *just a class*. It's not a component until you *tell Angular about it*.

To tell Angular that `HeroListComponent` is a component, attach **metadata** to the class.

In !{_Lang}, you attach metadata by using !{_a} **!{_decorator}**.
Here's some metadata for `HeroListComponent`:
Here is the `@Component` !{_decorator}, which identifies the class
immediately below it as a component class.
<ul if-docs="ts"><li>`moduleId`: sets the source of the base address (`module.id`) for module-relative URLs such as the `templateUrl`.</ul>

- `selector`: CSS selector that tells Angular to create and insert an instance of this component
where it finds a `<hero-list>` tag in *parent* HTML.
For example, if an app's  HTML contains `<hero-list></hero-list>`, then
Angular inserts an instance of the `HeroListComponent` view between those tags.

- `templateUrl`: module-relative address of this component's HTML template, shown [above](#templates).
- `providers`: !{_array} of **dependency injection providers** for services that the component requires.
This is one way to tell Angular that the component's constructor requires a `HeroService`
so it can get the list of heroes to display. 

<figure>
  <img src="assets/images/devguide/architecture/template-metadata-component.png" alt="Metadata" align="left" style="height:200px; margin-left:-40px;margin-right:10px">  </img>
</figure>

The metadata in the `@Component` tells Angular where to get the major building blocks you specify for the component.

The template, metadata, and component together describe a view.

Apply other metadata !{_decorator}s in a similar fashion to guide Angular behavior.
`@Injectable`, `@Input`, and `@Output` are a few of the more popular !{_decorator}s.<br class="l-clear-both">The architectural takeaway is that you must add metadata to your code
so that Angular knows what to do.

<div class='l-hr'>
   
</div>


## Data binding
Without a framework, you would be responsible for pushing data values into the HTML controls and turning user responses
into actions and value updates. Writing such push/pull logic by hand is tedious, error-prone, and a nightmare to
read as any experienced jQuery programmer can attest.
<figure>
  <img src="assets/images/devguide/architecture/databinding.png" alt="Data Binding" style="width:220px; float:left; margin-left:-40px;margin-right:20px">  </img>
</figure>

Angular supports **data binding**,
a mechanism for coordinating parts of a template with parts of a component.
Add binding markup to the template HTML to tell Angular how to connect both sides.

As the diagram shows, there are four forms of data binding syntax. Each form has a direction &mdash; to the DOM, from the DOM, or in both directions.<br class="l-clear-both">The `HeroListComponent` [example](#templates) template has three forms:
* The `{{hero.name}}` [*interpolation*](displaying-data.html#interpolation)
displays the component's `hero.name` property value within the `<li>` element.

* The `[hero]` [*property binding*](template-syntax.html#property-binding) passes the value of `selectedHero` from
the parent `HeroListComponent` to the `hero` property of the child `HeroDetailComponent`.

* The `(click)` [*event binding*](user-input.html#click) calls the component's `selectHero` method when the user clicks a hero's name.

**Two-way data binding** is an important fourth form
that combines property and event binding in a single notation, using the `ngModel` directive.
Here's an example from the `HeroDetailComponent` template:
In two-way binding, a data property value flows to the input box from the component as with property binding.
The user's changes also flow back to the component, resetting the property to the latest value,
as with event binding.

Angular processes *all* data bindings once per JavaScript event cycle,
from the root of the application component tree through all child components.

<figure>
  <img src="assets/images/devguide/architecture/component-databinding.png" alt="Data Binding" style="float:left; width:300px; margin-left:-40px;margin-right:10px">  </img>
</figure>

Data binding plays an important role in communication
between a template and its component.<br class="l-clear-both">
<figure>
  <img src="assets/images/devguide/architecture/parent-child-binding.png" alt="Parent/Child binding" style="float:left; width:300px; margin-left:-40px;margin-right:10px">  </img>
</figure>

Data binding is also important for communication between parent and child components.<br class="l-clear-both">
<div class='l-hr'>
   
</div>


## Directives
<figure>
  <img src="assets/images/devguide/architecture/directive.png" alt="Parent child" style="float:left; width:150px; margin-left:-40px;margin-right:10px">  </img>
</figure>

Angular templates are *dynamic*. When Angular renders them, it transforms the DOM
according to the instructions given by **directives**.

A directive is a class with a `@Directive` !{_decorator}.
A component is a *directive-with-a-template*;
a `@Component` !{_decorator} is actually a `@Directive` !{_decorator} extended with template-oriented features.
<br class="l-clear-both">

While **a component is technically a directive**,
components are so distinctive and central to Angular applications that this architectural overview  separates components from directives.Two *other* kinds of directives exist: _structural_ and _attribute_ directives.

They tend to appear within an element tag as attributes do,
sometimes by name but more often as the target of an assignment or a binding.

**Structural** directives alter layout by adding, removing, and replacing elements in DOM.

The [example template](#templates) uses two built-in structural directives:
* [`*ngFor`](displaying-data.html#ngFor) tells Angular to stamp out one `<li>` per hero in the `heroes` list.
* [`*ngIf`](displaying-data.html#ngIf) includes the `HeroDetail` component only if a selected hero exists.
**Attribute** directives alter the appearance or behavior of an existing element.
In templates they look like regular HTML attributes, hence the name.

The `ngModel` directive, which implements two-way data binding, is
an example of an attribute directive. `ngModel` modifies the behavior of
an existing element (typically an `<input>`)
by setting its display value property and responding to change events.
Angular has a few more directives that either alter the layout structure
(for example, [ngSwitch](template-syntax.html#ngSwitch))
or modify aspects of DOM elements and components
(for example, [ngStyle](template-syntax.html#ngStyle) and [ngClass](template-syntax.html#ngClass)).

Of course, you can also write your own directives. Components such as
`HeroListComponent` are one kind of custom directive.
<!-- PENDING: link to where to learn more about other kinds! -->

<div class='l-hr'>
   
</div>


## Services
<figure>
  <img src="assets/images/devguide/architecture/service.png" alt="Service" style="float:left; margin-left:-40px;margin-right:10px">  </img>
</figure>

_Service_ is a broad category encompassing any value, function, or feature that your application needs.

Almost anything can be a service.
A service is typically a class with a narrow, well-defined purpose. It should do something specific and do it well.<br class="l-clear-both">Examples include:
* logging service
* data service
* message bus
* tax calculator
* application configuration

There is nothing specifically _Angular_ about services. Angular has no definition of a service.
There is no service base class, and no place to register a service.

Yet services are fundamental to any Angular application. Components are big consumers of services.

Here's an example of a service class that logs to the browser console:
Here's a `HeroService` that uses a !{_PromiseLinked} to fetch heroes.
The `HeroService` depends on the `Logger` service and another `BackendService` that handles the server communication grunt work.
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

<div class='l-hr'>
   
</div>


## Dependency injection
<figure>
  <img src="assets/images/devguide/architecture/dependency-injection.png" alt="Service" style="float:left; width:200px; margin-left:-40px;margin-right:10px">  </img>
</figure>

_Dependency injection_ is a way to supply a new instance of a class
with the fully-formed dependencies it requires. Most dependencies are services.
Angular uses dependency injection to provide new components with the services they need.<br class="l-clear-both">Angular can tell which services a component needs by looking at the types of its constructor parameters.
For example, the constructor of your `HeroListComponent` needs a `HeroService`:
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
  <img src="assets/images/devguide/architecture/injector-injects.png" alt="Service">  </img>
</figure>

If the injector doesn't have a `HeroService`, how does it know how to make one?

In brief, you must have previously registered a **provider** of the `HeroService` with the injector.
A provider is something that can create or return a service, typically the service class itself.
Alternatively, register at a component level in the `providers` property of the `@Component` metadata:
Registering at a component level means you get a new instance of the
service with each new instance of that component.

<!-- We've vastly oversimplified dependency injection for this overview.
The full story is in the [dependency injection](dependency-injection.html) page. -->

Points to remember about dependency injection:

* Dependency injection is wired into the Angular framework and used everywhere.

* The *injector* is the main mechanism.
  * An injector maintains a *container* of service instances that it created.
  * An injector can create a new service instance from a *provider*.

* A *provider* is a recipe for creating a service.

* Register *providers* with injectors.

<div class='l-hr'>
   
</div>


## Wrap up

You've learned the basics about the eight main building blocks of an Angular application:

* [Modules](#modules)
* [Components](#components)
* [Templates](#templates)
* [Metadata](#metadata)
* [Data binding](#data-binding)
* [Directives](#directives)
* [Services](#services)
* [Dependency injection](#dependency-injection)

That's a foundation for everything else in an Angular application,
and it's more than enough to get going.
But it doesn't include everything you need to know.

Here is a brief, alphabetical list of other important Angular features and services.
Most of them are covered in this documentation (or soon will be).

> [**Animations**](animations.html): Animate component behavior
without deep knowledge of animation techniques or CSS with Angular's animation library.

> **Change detection**: The change detection documentation will cover how Angular decides that a component property value has changed,
when to update the screen, and how it uses **zones** to intercept asynchronous activity and run its change detection strategies.

> **Events**: The events documentation will cover how to use components and services to raise events with mechanisms for
publishing and subscribing to events.

> [**Forms**](forms.html): Support complex data entry scenarios with HTML-based validation and dirty checking.

> [**HTTP**](server-communication.html): Communicate with a server to get data, save data, and invoke server-side actions with an HTTP client.

> [**Lifecycle hooks**](lifecycle-hooks.html): Tap into key moments in the lifetime of a component, from its creation to its destruction,
by implementing the lifecycle hook interfaces.

> [**Pipes**](pipes.html): Use pipes in your templates to improve the user experience by transforming values for display. Consider this `currency` pipe expression:
>
> > `price | currency:'USD':true`
>
> It displays a price of 42.33 as `$42.33`.

> [**Router**](router.html): Navigate from page to page within the client
  application and never leave the browser.
