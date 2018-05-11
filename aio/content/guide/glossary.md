# Angular Glossary

Angular has its own vocabulary.
Most Angular terms are common English words or computing terms
that have a specific meaning within the Angular system.

This glossary lists the most prominent terms
and a few less familiar ones that have unusual or
unexpected definitions.

[A](guide/glossary#A) [B](guide/glossary#B) [C](guide/glossary#C) [D](guide/glossary#D) [E](guide/glossary#E) [F](guide/glossary#F) [G](guide/glossary#G) [H](guide/glossary#H) [I](guide/glossary#I)
[J](guide/glossary#J) [K](guide/glossary#K) [L](guide/glossary#L) [M](guide/glossary#M) [N](guide/glossary#N) [O](guide/glossary#O) [P](guide/glossary#P) [Q](guide/glossary#Q) [R](guide/glossary#R)
[S](guide/glossary#S) [T](guide/glossary#T) [U](guide/glossary#U) [V](guide/glossary#V) [W](guide/glossary#W) [X](guide/glossary#X) [Y](guide/glossary#Y) [Z](guide/glossary#Z)


{@a A}
{@a aot}


## Ahead-of-time (AOT) compilation

The Angular ahead-of-time (AOT) compiler converts your Angular HTML and TypeScript code 
into efficient JavaScript code during the build phase before the browser downloads 
and runs that code. 
This is the best compilation mode for production environments, with decreased load time and increased performance.

By compiling your application using the `ngc` command-line tool, you can bootstrap directly to a module factory, meaning you don't need to include the Angular compiler in your JavaScript bundle.

Compare [just-in-time (JIT) compilation](guide/glossary#jit).

## Angular element

An Angular [component](guide/glossary#component) that has been packaged as a [custom element](guide/glossary#custom-element). 

Learn more in the [_Angular Elements_](guide/elements) guide.

## Annotation

A structure that provides metadata for a class. See [Decorator](guide/glossary#decorator).


{@a attribute-directive}


{@a attribute-directives}


## Attribute directives

A category of [directive](guide/glossary#directive) that can listen to and modify the behavior of
other HTML elements, attributes, properties, and components. They are usually represented
as HTML attributes, hence the name.

Learn more in the [_Attribute Directives_](guide/attribute-directives) guide.


{@a B}


## Binding

Generally, the practice of setting a variable or property to a data value. 
Within Angular, typically refers to [data binding](guide/glossary#data-binding), 
which coordinates DOM object properties with data object properties.

Sometimes refers to a [dependency-injection](guide/glossary#dependency-injection) binding
between a [token](guide/glossary#token) and a dependency [provider](guide/glossary#provider).


## Bootstrap

A way to initialize and launch an app or system.

In Angular, an app's root NgModule (`AppModule`) has a `bootstrap` property that identifies the app's top-level [components](guide/glossary#component). 
During the bootstrap process, Angular creates and inserts these components into the `index.html` host web page. 
You can bootstrap multiple apps in the same `index.html`, each app with its own components.

Learn more in the [_Bootstrapping_](guide/bootstrapping) guide.

{@a C}

{@a case-conventions}
{@a dash-case}
{@a camelcase}
{@a kebab-case}

## Case conventions

Angular uses capitalization conventions to distinguish the names of various types, as described in the [Style Guide "Naming" section](guide/styleguide#02-01). 

- camelCase : symbols, properties, methods, pipe names, non-component directive selectors, constants 
- UpperCamelCase (or PascalCase): Class names, including classes that define components, interfaces, NgModules, directives, pipes, and so on. 
- dash-case (or "kebab-case"): descriptive part of file names, component selectors
- underscore_case (or "snake_case"): not typically used in Angular 
- UPPER_UNDERSCORE_CASE (or UPPER_SNAKE_CASE): traditional for constants (acceptable, but prefer camelCase)

{@a class-decorator}

## Class decorator

A [decorator](guide/glossary#decorator) statement immediately before a class definition that declares the class to be of the given type, and provides metadata suitable to the type.

The following class types can be declared:
- `@Component`
- `@Directive`
- `@Pipe`
- `@Injectable`
- `@NgModule`


{@a class-field-decorator}

## Class field decorator

A [decorator](guide/glossary#decorator) statement immediately before a field in a class definition that declares the type of that field. Some examples are `@Input` and `@Output`. 

## CLI

The [Angular CLI](https://cli.angular.io/) is a command-line tool that can create a project, add files, and perform a variety of ongoing development tasks such as testing, bundling, and deployment.

Learn more in the [Getting Started](guide/quickstart) guide. 

{@a component}

## Component

A class with the `@Component` [decorator](guide/glossary#decorator) that associates it with a companion [template](guide/glossary#template). 

A component is a special type of [directive](guide/glossary#directive) that represents a [view](guide/glossary#view).The `@Component` decorator extends the `@Directive` decorator with template-oriented features. 

An Angular component class is responsible for exposing data and handling most of the view's display and user-interaction logic through [data binding](guide/glossary#data-binding).

Read more about components, templates, and views in the [Architecture](guide/architecture) guide.

{@a custom-element}

## Custom element

A Web Platform feature, currently supported by most browsers, and available in other browsers through polyfills (see [Browser Support](guide/browser-support)). 

The custom element feature extends HTML by allowing you to define a tag whose content is created and controlled by JavaScript code. A custom element (also called a *web component*) is recognized by a browser when it is added to the [CustomElementRegistry](https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry).

You can use the API to transform an Angular component so that it can be registered with the browser and used in any HTML that you add directly to the DOM within an Angular app. The custom element tag inserts the component's view, with change-detection and data-binding functionality, into content that would otherwise be displayed without Angular processing.

See also [Dynamic components](guide/glossary#dynamic-components).


{@a D}


## Data binding

Data binding allow apps to display data values to a user and respond to user
actions (such as clicks, touches, and keystrokes).

In data binding, you declare the relationship between an HTML widget and data source
and let the framework handle the details.
Data binding is an alternative to manually pushing application data values into HTML, attaching
event listeners, pulling changed values from the screen, and
updating application data values.

Read about the following forms of binding in the [Template Syntax](guide/template-syntax) page:

 * [Interpolation](guide/template-syntax#interpolation).
 * [Property binding](guide/template-syntax#property-binding).
 * [Event binding](guide/template-syntax#event-binding).
 * [Attribute binding](guide/template-syntax#attribute-binding).
 * [Class binding](guide/template-syntax#class-binding).
 * [Style binding](guide/template-syntax#style-binding).
 * [Two-way data binding with ngModel](guide/template-syntax#ngModel).

{@a declarable}

## Declarable

A class type that you can add to the `declarations` list of an [NgModule](guide/glossary#ngmodule). 

You can declare [components](guide/glossary#component), [directives](guide/glossary#directive), and [pipes](guide/glossary#pipe).

Do not declare the following:
- A class that's already declared in another NgModule.
- An array of directives imported from another package. For example, don't declare `FORMS_DIRECTIVES` from `@angular/forms`.
- NgModule classes.
- Service classes.
- Non-Angular classes and objects, such as strings, numbers, functions, entity models, configurations, business logic, and helper classes


{@a decorator}

{@a decoration}


## Decorator | decoration


A function that modifies the immediately following class or property definition.  
Decorators (also called annotations) are an experimental (stage 2), JavaScript language [feature](https://github.com/wycats/javascript-decorators). 
TypeScript adds support for decorators.

Angular defines decorators that attach metadata to classes or properties so that it knows what those classes or properties mean and how they should work. 

See [Class decorator](guide/glossary#class-decorator), [Class field decorator](guide/glossary#class-field-decorator). 

{@a di}


## Dependency injection

A design pattern and mechanism for creating and delivering parts of an application (dependencies) to other parts of an application that require them.

In Angular, dependencies are typically services, but can also be values, such as strings or functions. An [injector](guide/glossary#injector) for an app (created automatically during bootstrap) creates dependencies when needed, using a registered [provider](guide/glossary#provider) of the service or value. Different providers can provide different implementations of the same service. 

Learn more in the [Dependency Injection](guide/dependency-injection) guide.

{@a di-token}

## DI token

A lookup token associated with a dependency [provider](guide/glossary#provider), for use with the [dependency injection](guide/glossary#di) system.


{@a directive}


{@a directives}


## Directive

A class with the `@Directive` [decorator](guide/glossary#decorator) that can modify the structure of the DOM, or modify attributes in the DOM and component data model.

A directive class is usually associated with an HTML element or attribute, and that element or attribute is often referred to as the directive itself.  
When Angular finds a directive in an HTML [template](guide/glossary#template), it creates the matching directive class instance and gives the instance control over that portion of the browser DOM.

There are three categories of directive:
- [Components](guide/glossary#component) use `@Component` (an extension of `@Directive`) to associate a template with a class.
- [Attribute directives](guide/glossary#attribute-directive) modify behavior and appearance of page elements.
- [Structural directives](guide/glossary#structural-directive) modify the structure of the DOM.

Angular supplies a number of built-in directives that begin with the `ng` prefix. You can also create new directives to implement your own functionality. 
You associate a _selector_ (an HTML tag such as `<my-directive>`) with a custom directive, thereby extending the [template syntax](guide/template-syntax) that you can use in your apps.


## Domain-specific language (DSL)

A special-purpose library or API; see [Domain-specific language](https://en.wikipedia.org/wiki/Domain-specific_language).

Angular extends TypeScript with domain-specific languages for a number of domains relevant to Angular apps, defined in ngModules such as [animations](guide/animations), [forms](guide/forms), and [routing and navigation](guide/router).

{@a dynamic-components}

## Dynamic component loading

A technique for adding a component to the DOM at run time, which requires that you exclude the component from compilation, then connect it to Angular's change-detection and event handling framework when you add it to the DOM.

See also [Custom element](guide/glossary#custom-element), which provides an easier path with the same result.

{@a E}

{@a ecma}

## ECMAScript

The [official JavaScript language specification](https://en.wikipedia.org/wiki/ECMAScript).

Not all browsers support the latest ECMAScript standard, but you can use a [transpiler](guide/glossary#transpile) (like [TypeScript](guide/glossary#typescript)) to write code using the latest features, which will then be transpiled to code that runs on versions that are supported by browsers. 

To learn more, see the [Browser Support](guide/browser-support) page.


{@a element}

## Element

Angular defines an `ElementRef` class to wrap render-specific native UI elements. This allows you use Angular templates and  data-binding to access DOM elements without reference to the native element in most cases.

The documentation generally refers to either elements (`ElementRef` instances) or  DOM elements (which could be accessed directly if necessary).

Compare [Custom element](guide/glossary#custom-element).

## Entry point

A JavaScript ID that makes parts of an NPM package available for import by other code. 
The Angular [scoped packages](guide/glossary#scoped-package) each have an entry point named `index`.

Within Angular, use [NgModules](guide/glossary#ngmodule) to achieve the same result.


{@a F}


{@a G}


{@a H}

{@a I}

{@a injectable}

## Injectable

An Angular class or other definition that provides a dependency using the [dependency injection](guide/glossary#di) mechanism. An injectable class is marked by the `@Injectable` [decorator](guide/glossary#decorator).

Both a [service](guide/glossary#service) and a [component](guide/glossary#component) that depends on that service must be marked as injectable. Other items, such as constant values, can be injectable.

{@a injector}

## Injector

An object in the Angular [dependency-injection system](guide/glossary#dependency-injection)
that can find a named dependency in its cache or create a dependency
with a registered [provider](guide/glossary#provider). Injectors are created for NgModules automatically as part of the bootstrap process, and inherited through the component hierarchy.


## Input

When defining a [directive](guide/glossary#directive), the `@Input` decorator on a directive property makes that property available as a *target* of a
[property binding](guide/template-syntax#property-binding).
Data values flow into an input property from the data source identified
in the [template expression](guide/glossary#template-expression) to the right of the equal sign.

To learn more, see [input and output properties](guide/template-syntax#inputs-outputs).


## Interpolation

A form of [property data binding](guide/glossary#data-binding) in which a
[template expression](guide/glossary#template-expression) between double-curly braces
renders as text.  That text can be concatenated with neighboring text
before it is assigned to an element property
or displayed between element tags, as in this example.


<code-example language="html" escape="html">
  <label>My current hero is {{hero.name}}</label>

</code-example>


Read more about [interpolation](guide/template-syntax#interpolation) in the
[Template Syntax](guide/template-syntax) page.


{@a J}

## JavaScript

See [ECMAScript](guide/glossary#ecma), [TypeScript](guide/glossary#typescript).


{@a jit}


## Just-in-time (JIT) compilation

The Angular Just-in-Time (JIT) compiler converts your Angular HTML and TypeScript code into efficient JavaScript code at run time, as part of bootstrapping. 
JIT compilation is the default when you run Angular's `ng build` and `ng serve` CLI commands, and is a good choice during development. JIT mode is strongly discouraged for production use because it results in large application payloads that hinder the bootstrap performance.

Compare [ahead-of-time (AOT) compilation](guide/glossary#aot).


{@a K}


{@a L}

{@a lazy-load}

## Lazy loading

Lazy loading speeds up application load time by splitting the application into multiple bundles and loading them on demand. 
For example, dependencies can be lazy-loaded as needed&emdash;as opposed to "eager-loaded" modules that are required by the root module, and are thus loaded on launch. 
Similarly, the [router](guide/glossary#router) can load child views only when the parent view is activated, and you can build custom elements that can be loaded into an Angular app when needed.

## Lifecycle hook

An interface that allows you to tap into the lifecycle of [directives](guide/glossary#directive) and [components](guide/glossary#component) as they are created, updated, and destroyed.

Each interface has a single hook method whose name is the interface name prefixed with `ng`.
For example, the `OnInit` interface has a hook method named `ngOnInit`.

Angular calls these hook methods in the following order:

* `ngOnChanges`: when an [input](guide/glossary#input)/[output](guide/glossary#output) binding value changes.
* `ngOnInit`: after the first `ngOnChanges`.
* `ngDoCheck`: developer's custom change detection.
* `ngAfterContentInit`: after component content initialized.
* `ngAfterContentChecked`: after every check of component content.
* `ngAfterViewInit`: after a component's views are initialized.
* `ngAfterViewChecked`: after every check of a component's views.
* `ngOnDestroy`: just before the directive is destroyed.

To learn more, see the [Lifecycle Hooks](guide/lifecycle-hooks) page.


{@a M}

## Module

In general, a module collects a block of code dedicated to a single purpose. Angular uses standard JavaScript modules, and also defines an Angular module, `NgModule`. 

In JavaScript (ECMAScript), each file is a module and all objects defined in the file belong to that module. Objects can exported, making them public, and public objects can be imported for use by other modules.

Angular ships as a collection of JavaScript modules, or libraries. Each Angular library name begins with the `@angular` prefix. Install them with the NPM package manager and import parts of them with JavaScript `import` declarations.

Compare the Angular [NgModule](guide/glossary#ngmodule).


{@a N}

{@a ngmodule}

## NgModule

A class definition with an `@NgModule` [decorator](guide/glossary#decorator), that declares and serves as a manifest for a block of code dedicated to an application domain, a workflow, or a closely related set of capabilities.

Like a [JavaScript module](guide/glossary#module), an NgModule can export functionality for use by other NgModules, and import public functionality from other NgModules.

The metadata for an NgModule class collects components, directives, and pipes that the application uses along with the list of imports and exports. See also [Declarable](guide/glossary#declarable).

NgModules are typically named after the file in which the exported thing is defined; for example, the Angular [DatePipe](api/common/DatePipe) class belongs to a feature module named `date_pipe` in the file `date_pipe.ts`. You import them from an Angular [scoped package](guide/glossary#scoped-package) such as `@angular/core`.

Every Angular application has a root module. By convention, the class is called `AppModule` and resides in a file named `app.module.ts`.

To learn more, see the [NgModules](guide/ngmodules) guide.


{@a O}

{@a observable}


## Observable

A producer of multiple values, which it pushes to [subscribers](guide/glossary#subscriber). Used for asynchronous event handling throughout Angular. You execute an observable by subscribing to it with its `subscribe()` method, passing callbacks for notifications of new values, errors, or completion. 

Observables can deliver single or multiple values of any type to subscribers, either synchronously (as a function delivers a value to its caller), or on a schedule. A subscriber receives notification of new values as they are produced, and of either error or normal completion. 

Angular uses a third-party library called [Reactive Extensions (RxJS)](http://reactivex.io/rxjs/). 

To learn more, see the [Observables](guide/observables) guide.


{@a observer}

## Observer

An object passed to the `subscribe()` method for an [observable](guide/glossary#observable) that defines the callbacks for the [subscriber](guide/glossary#subscriber).

## Output

When defining a [directive](guide/glossary#directive), the `@Output` decorator on a directive property makes that property available as a *target* of [event binding](guide/template-syntax#event-binding).

Events stream *out* of this property to the receiver identified
in the [template expression](guide/glossary#template-expression) to the right of the equal sign.

To learn more, see [input and output properties](guide/template-syntax#inputs-outputs).


{@a P}

## Pipe

A class with the `@Pipe` decorator which defines a function that transforms input values to output values for display in a [view](guide/glossary#view).

Angular defines various pipes, and you can define new pipes.
 
To learn more, see the [pipes](guide/pipes) page.

## Polyfill

An [NPM package](guide/npm-packages) that plugs gaps in a browser's JavaScript implementation. See the [Browser Support](guide/browser-support) guide for polyfills that support particular functionality for particular platforms. 


## Provider

A provider of an injectable service&mdash;specifically, a code recipe associated with a [DI token](guide/glossary#token), which an [injector](guide/glossary#injector) uses to create a new instance of a dependency for a class that requires it.

Angular registers its own providers with every injector, for services that Angular defines. You can register your own providers for services that your app needs.

See also [Service](guide/glossary#service), [Dependency Injection](guide/glossary#di).


{@a Q}

{@a R}

## Reactive forms

A technique for building Angular forms through code in a component.
The alternative technique is [template-driven forms](guide/glossary#template-driven-forms).

When building reactive forms:

* The "source of truth" is the component. The validation is defined using code in the component.
* Each control is explicitly created in the component class with `new FormControl()` or with `FormBuilder`.
* The template input elements do *not* use `ngModel`.
* The associated Angular directives are all prefixed with `Form`, such as `FormGroup`, `FormControl`, and `FormControlName`.

Reactive forms are powerful, flexible, and a good choice for more complex data-entry form scenarios, such as dynamic generation of form controls.


## Router

A tool that configures and implements navigation among states and [views](guide/glossary#view) within an Angular app.

The Router module is an [NgModule](guide/glossary#ngmodule) that provides the necessary service providers and directives for navigating through application views. A [routing component](guide/glossary#routing-component) is one that imports the Router module and whose template contains a `RouterOutlet` element where it can display views produced by the router.
 
The Router defines navigation among views on a single page, as opposed to navigation among pages. It interprets URL-like links to determine which views to create or destroy, and which components to load or unload. It allows you to take advantage of [lazy-loading](guide/glossary#lazy-load) in your Angular apps.

To learn more, see the [Routing & Navigation](guide/router) guide.


## Router module

A separate [NgModule](guide/glossary#ngmodule) that provides the necessary service providers and directives for navigating through application views.

For more information, see the [Routing & Navigation](guide/router) page.

## Router outlet

A directive that acts as a placeholder in a routing component's template, which Angular dynamically fills based on the current router state.

## Routing component

An Angular [component](guide/glossary#component) with a `RouterOutlet` that displays views based on router navigations.

For more information, see the [Routing & Navigation](guide/router) page.


{@a S}

## Scoped package

A way to group related NPM packages. 
NgModules are delivered within *scoped packages* whose names begin with the Angular *scope name* `@angular`. For example, `@angular/core`, `@angular/common`, `@angular/http`, and `@angular/router`.

Import a scoped package in the same way that you import a normal package. 

<code-example path="architecture/src/app/app.component.ts" linenums="false" title="architecture/src/app/app.component.ts (import)" region="import">

</code-example>


## Service

In Angular, a service is a class with the [@Injectable](guide/glossary#injectable) decorator that encapsulates non-UI logic and code that can be re-used across an application. 
Angular distinguishes components from services in order to increase modularity and reusability.

The `@Injectable` metadata allows the service class to be used with the [dependency injection](guide/glossary#di) mechanism. The injectable class is instantiated by a [provider](guide/glossary#provider), and a module maintains a list of providers that can provide a particular type of service as needed by components or other services that require it.

To learn more, see [Introduction to Services](guide/architecture-services).

{@a structural-directive}


{@a structural-directives}


## Structural directives

A category of [directive](guide/glossary#directive) that is responsible for shaping or reshaping HTML layout by modifying the DOM (adding, removing, or manipulating elements and their children).

To learn more, see the [Structural Directives](guide/structural-directives) page.

{@a subscriber}

## Subscriber

A function that defines how to obtain or generate values or messages to be published. This function is executed when a consumer calls the `subscribe()` method of an [observable](guide/glossary#observable).

The act of subscribing to an observable triggers its execution, associates callbacks with it, and creates a `Subscription` object that lets you unsubscribe.

The `subscribe()` method takes a JavaScript object (called an "observer") with up to three callbacks, one for each type of notification that an observable can deliver:

- The `next` notification: sends a value such as a Number, a String, an Object, etc.
- The `error` notification sends a JavaScript Error or exception.
- The `complete` notification does not send a value, but the handler is called when the call completes. Scheduled values can continue to be returned after the call completes.

{@a T}

## Template

A template defines how to render a component's [view](guide/glossary#view) in HTML  

A template combines straight HTML with Angular [data-binding](guide/glossary#data-binding) syntax, [directives](guide/glossary#directive),  and [template expressions](guide/glossary#template-expression) (logical constructs). The Angular elements insert or calculate values that modify the HTML elements before the page is displayed.
 
A template is associated with a [component](guide/glossary#component) class through `@Component` [decorator](guide/glossary#decorator). The HTML can be provided inline, as the value of the `template` property, or in a separate HTML file linked through the `templateUrl` property. 

Additional templates, represented by a `TemplateRef` object, can define alternative or _embedded_ views, which can be referenced from multiple components.

## Template-driven forms

A technique for building Angular forms using HTML forms and input elements in the view.
The alternate technique is [Reactive Forms](guide/glossary#reactive-forms).

When building template-driven forms:

* The "source of truth" is the template. The validation is defined using attributes on the individual input elements.
* [Two-way binding](guide/glossary#data-binding) with `ngModel` keeps the component model synchronized with the user's entry into the input elements.
* Behind the scenes, Angular creates a new control for each input element, provided you have set up a `name` attribute and two-way binding for each input.
* The associated Angular directives are all prefixed with `ng` such as `ngForm`, `ngModel`, and `ngModelGroup`.

Template-driven forms are convenient, quick, and simple. They are a good choice for many basic data-entry form scenarios.

Read about how to build template-driven forms
in the [Forms](guide/forms) page.

{@a template-expression}


## Template expression

A TypeScript-like syntax that Angular evaluates within
a [data binding](guide/glossary#data-binding).

Read about how to write template expressions
in the [Template expressions](guide/template-syntax#template-expressions) section
of the [Template Syntax](guide/template-syntax) page.

{@a token}

## Token

An opaque identifier used for efficient table lookup. In Angular, a [DI token](guide/glossary#di-token) is used to find [providers](guide/glossary#provider) of dependencies in the [dependency injection](guide/glossary#di) system.

{@a transpile}

## Transpile

The translation process that tranforms one version of JavaScript to another version; for example, down-leveling ES2015 to the older ES5 version.


{@a typescript}

## TypeScript

TypeScript is a programming language notable for its optional typing system, which provides
compile-time type checking and strong tooling support (such as
code completion, refactoring, inline documentation, and intelligent search). Many code editors
and IDEs support TypeScript either natively or with plug-ins.

TypeScript is the preferred language for Angular development. Read more about TypeScript at [typescriptlang.org](http://www.typescriptlang.org/).


{@a U}

{@a V}

## View

A view is the smallest grouping of display elements that can be created and destroyed together. 

Angular renders a view under the control of one or more [directives](guide/glossary#directive),
especially  [component](guide/glossary#component) directives and their companion [templates](guide/glossary#template). 

A view is specifically represented by a `ViewRef` instance associated with the component. 
A view that belongs to a component is called a  _host view_. 
Views are typically collected into [view hierarchies](guide/glossary#view-tree). 

Properties of elements in a view can change dynamically, in response to user actions; the structure (number and order) of elements in a view cannot. You can change the structure of elements by inserting, moving, or removing nested views within their view containers.

View hierarchies can be loaded and unloaded dynamically as the user navigates through the application, typically under the control of a [router](guide/glossary#router).

{@a view-tree}

## View hierarchy

A tree of related views that can be acted on as a unit. The root view is a component's _host view_.  A host view can be the root of a tree of _embedded views_, collected in a _view container_ (`ViewContainerRef`) attached to an anchor element in the hosting component. The view hierarchy is a key part of Angular change detection. 

The view hierarchy does not imply a component hierarchy. Views that are embedded in the context of a particular hierarchy can be host views of other components. Those components can be in the same NgModule as the hosting component, or belong to other NgModules.

{@a W}

## Web component

See [Custom element](guide/glossary#custom-element)


{@a X}


{@a Y}


{@a Z}

## Zone

An execution context for a set of asynchronous tasks. Useful for debugging, profiling, and testing apps that include asynchronous operations such as event processing, promises, and calls to remote servers.

An Angular app runs in a zone where it can respond to asynchronous events by checking for data changes and updating the information it displays by resolving [data bindings](guide/glossary#data-binding).

A zone client can take action before and after an async operation completes. 

Learn more about zones in this
[Brian Ford video](https://www.youtube.com/watch?v=3IqtmUscE_U).
