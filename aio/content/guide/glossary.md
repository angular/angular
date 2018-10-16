# Glossary

Angular has its own vocabulary.
Most Angular terms are common English words or computing terms
that have a specific meaning within the Angular system.

This glossary lists the most prominent terms
and a few less familiar ones with unusual or
unexpected definitions.

[A](guide/glossary#A) [B](guide/glossary#B) [C](guide/glossary#C) [D](guide/glossary#D) [E](guide/glossary#E) [F](guide/glossary#F) [G](guide/glossary#G) [H](guide/glossary#H) [I](guide/glossary#I)
[J](guide/glossary#J) [K](guide/glossary#K) [L](guide/glossary#L) [M](guide/glossary#M) [N](guide/glossary#N) [O](guide/glossary#O) [P](guide/glossary#P) [Q](guide/glossary#Q) [R](guide/glossary#R)
[S](guide/glossary#S) [T](guide/glossary#T) [U](guide/glossary#U) [V](guide/glossary#V) [W](guide/glossary#W) [X](guide/glossary#X) [Y](guide/glossary#Y) [Z](guide/glossary#Z)


{@a A}
{@a aot}


## ahead-of-time (AOT) compilation

The Angular ahead-of-time (AOT) compiler converts Angular HTML and TypeScript code 
into efficient JavaScript code during the build phase, before the browser downloads 
and runs that code. 
This is the best compilation mode for production environments, with decreased load time and increased performance compared to [just-in-time (JIT) compilation](guide/glossary#jit).

By compiling your application using the `ngc` command-line tool, you can bootstrap directly to a module factory, so you don't need to include the Angular compiler in your JavaScript bundle.

{@a angular-element} 

## Angular element

An Angular [component](guide/glossary#component) packaged as a [custom element](guide/glossary#custom-element). 

Learn more in [Angular Elements Overview](guide/elements).

{@a annotation}

## annotation

A structure that provides metadata for a class. See [decorator](guide/glossary#decorator).


{@a attribute-directive}


{@a attribute-directives}


## attribute directives

A category of [directive](guide/glossary#directive) that can listen to and modify the behavior of
other HTML elements, attributes, properties, and components. They are usually represented
as HTML attributes, hence the name.

Learn more in [Attribute Directives](guide/attribute-directives).


{@a B}

{@a binding}

## binding

Generally, the practice of setting a variable or property to a data value. 
Within Angular, typically refers to [data binding](guide/glossary#data-binding), 
which coordinates DOM object properties with data object properties.

Sometimes refers to a [dependency-injection](guide/glossary#dependency-injection) binding
between a [token](guide/glossary#token) and a dependency [provider](guide/glossary#provider).

{@a bootstrap}

## bootstrap

A way to initialize and launch an app or system.

In Angular, an app's root NgModule (`AppModule`) has a `bootstrap` property that identifies the app's top-level [components](guide/glossary#component). 
During the bootstrap process, Angular creates and inserts these components into the `index.html` host web page.
You can bootstrap multiple apps in the same `index.html`. Each app contains its own components.

Learn more in [Bootstrapping](guide/bootstrapping).

{@a C}

{@a case-conventions}
{@a dash-case}
{@a camelcase}
{@a kebab-case}

## case types

Angular uses capitalization conventions to distinguish the names of various types, as described in the [naming guidelines section](guide/styleguide#02-01) of the Style Guide. Here's a summary of the case types: 

* camelCase : Symbols, properties, methods, pipe names, non-component directive selectors, constants.
Standard or lower camel case uses lowercase on the first letter of the item. For example, "selectedHero".

* UpperCamelCase (or PascalCase): Class names, including classes that define components, interfaces, NgModules, directives, and pipes,
Upper camel case uses uppercase on the first letter of the item. For example, "HeroListComponent".

* dash-case (or "kebab-case"): Descriptive part of file names, component selectors. For example, "app-hero-list".

* underscore_case (or "snake_case"): Not typically used in Angular. Snake case uses words connected with underscores.
For example, "convert_link_mode".

* UPPER_UNDERSCORE_CASE (or UPPER_SNAKE_CASE, or SCREAMING_SNAKE_CASE): Traditional for constants (acceptable, but prefer camelCase).
Upper snake case uses words in all capital letters connected with underscores. For example, "FIX_ME".

{@a class-decorator}

## class decorator

A [decorator](guide/glossary#decorator) that appears immediately before a class definition, which declares the class to be of the given type, and provides metadata suitable to the type.

The following decorators can declare Angular class types:
* `@Component()`
* `@Directive()`
* `@Pipe()`
* `@Injectable()`
* `@NgModule()`


{@a class-field-decorator}

## class field decorator

A [decorator](guide/glossary#decorator) statement immediately before a field in a class definition that declares the type of that field. Some examples are `@Input` and `@Output`. 

{@a cli}

## command-line interface (CLI)

The [Angular CLI](cli) is a command-line tool for managing the Angular development cycle. Use it to create the initial filesystem scaffolding for a [workspace](guide/glossary#workspace) or [project](guide/glossary#project), and to run [schematics](guide/glossary#schematic) that add and modify code for initial generic versions of various elements. The CLI supports all stages of the development cycle, including building, testing, bundling, and deployment.

* To begin using the CLI for a new project, see [Getting Started](guide/quickstart).
* To learn more about the full capabilities of the CLI, see the [CLI command reference](cli).

{@a component}

## component

A class with the `@Component()` [decorator](guide/glossary#decorator) that associates it with a companion [template](guide/glossary#template). Together, the component and template define a [view](guide/glossary#view).
A component is a special type of [directive](guide/glossary#directive).
The `@Component()` decorator extends the `@Directive()` decorator with template-oriented features. 

An Angular component class is responsible for exposing data and handling most of the view's display and user-interaction logic through [data binding](guide/glossary#data-binding).

Read more about components, templates, and views in [Architecture Overview](guide/architecture).

{@a custom-element}

## custom element

A web platform feature, currently supported by most browsers and available in other browsers through polyfills (see [Browser support](guide/browser-support)). 

The custom element feature extends HTML by allowing you to define a tag whose content is created and controlled by JavaScript code. A custom element (also called a *web component*) is recognized by a browser when it's added to the [CustomElementRegistry](https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry).

You can use the API to transform an Angular component so that it can be registered with the browser and used in any HTML that you add directly to the DOM within an Angular app. The custom element tag inserts the component's view, with change-detection and data-binding functionality, into content that would otherwise be displayed without Angular processing.

See also [dynamic component loading](guide/glossary#dynamic-components).


{@a D}

{@a data-binding}

## data binding

A process that allows apps to display data values to a user and respond to user
actions (such as clicks, touches, and keystrokes).

In data binding, you declare the relationship between an HTML widget and a data source
and let the framework handle the details.
Data binding is an alternative to manually pushing application data values into HTML, attaching
event listeners, pulling changed values from the screen, and
updating application data values.

Read about the following forms of binding in [Template Syntax](guide/template-syntax):

 * [Interpolation](guide/template-syntax#interpolation)
 * [Property binding](guide/template-syntax#property-binding)
 * [Event binding](guide/template-syntax#event-binding)
 * [Attribute binding](guide/template-syntax#attribute-binding)
 * [Class binding](guide/template-syntax#class-binding)
 * [Style binding](guide/template-syntax#style-binding)
 * [Two-way data binding with ngModel](guide/template-syntax#ngModel)

{@a declarable}

## declarable

A class type that you can add to the `declarations` list of an [NgModule](guide/glossary#ngmodule). 
You can declare [components](guide/glossary#component), [directives](guide/glossary#directive), and [pipes](guide/glossary#pipe).

Don't declare the following:
* A class that's already declared in another NgModule
* An array of directives imported from another package. For example, don't declare `FORMS_DIRECTIVES` from `@angular/forms`
* NgModule classes
* Service classes
* Non-Angular classes and objects, such as strings, numbers, functions, entity models, configurations, business logic, and helper classes


{@a decorator}

{@a decoration}


## decorator | decoration

A function that modifies a class or property definition. Decorators (also called *annotations*) are an experimental (stage 2) [JavaScript language feature](https://github.com/wycats/javascript-decorators). 
TypeScript adds support for decorators.

Angular defines decorators that attach metadata to classes or properties
so that it knows what those classes or properties mean and how they should work. 

See [class decorator](guide/glossary#class-decorator), [class field decorator](guide/glossary#class-field-decorator). 

{@a di}

{@a dependency-injection}

## dependency injection (DI)

A design pattern and mechanism for creating and delivering some parts of an application (dependencies) to other parts of an application that require them.

In Angular, dependencies are typically services, but they also can be values, such as strings or functions.
An [injector](guide/glossary#injector) for an app (created automatically during bootstrap) instantiates dependencies when needed, using a configured [provider](guide/glossary#provider) of the service or value.

Learn more in [Dependency Injection in Angular](guide/dependency-injection).

{@a di-token}

## DI token

A lookup token associated with a dependency [provider](guide/glossary#provider), for use with the [dependency injection](guide/glossary#di) system.


{@a directive}
{@a directives}

## directive

A class that can modify the structure of the DOM or modify attributes in the DOM and component data model. A directive class definition is immediately preceded by a `@Directive()` [decorator](guide/glossary#decorator) that supplies metadata.

A directive class is usually associated with an HTML element or attribute, and that element or attribute is often referred to as the directive itself. When Angular finds a directive in an HTML [template](guide/glossary#template), it creates the matching directive class instance and gives the instance control over that portion of the browser DOM.

There are three categories of directive:
* [Components](guide/glossary#component) use `@Component()` (an extension of `@Directive()`) to associate a template with a class.

* [Attribute directives](guide/glossary#attribute-directive) modify behavior and appearance of page elements.

* [Structural directives](guide/glossary#structural-directive) modify the structure of the DOM.

Angular supplies a number of built-in directives that begin with the `ng` prefix. 
You can also create new directives to implement your own functionality. 
You associate a *selector* (an HTML tag such as `<my-directive>`) with a custom directive, thereby extending the [template syntax](guide/template-syntax) that you can use in your apps.

{@a dom}

## domain-specific language (DSL)

A special-purpose library or API; see [Domain-specific language](https://en.wikipedia.org/wiki/Domain-specific_language). 
Angular extends TypeScript with domain-specific languages for a number of domains relevant to Angular apps, defined in NgModules such as [animations](guide/animations), [forms](guide/forms), and [routing and navigation](guide/router).

{@a dynamic-components}

## dynamic component loading

A technique for adding a component to the DOM at run time. Requires that you exclude the component from compilation and then connect it to Angular's change-detection and event-handling framework when you add it to the DOM.

See also [custom element](guide/glossary#custom-element), which provides an easier path with the same result.

{@a E}

{@a eager-loading}

## eager loading

NgModules or components that are loaded on launch are called eager-loaded, to distinguish them from those
that are loaded at run time (lazy-loaded).
See [lazy loading](guide/glossary#lazy-load).


{@a ecma}

## ECMAScript

The [official JavaScript language specification](https://en.wikipedia.org/wiki/ECMAScript).

Not all browsers support the latest ECMAScript standard, but you can use a [transpiler](guide/glossary#transpile) (like [TypeScript](guide/glossary#typescript)) to write code using the latest features, which will then be transpiled to code that runs on versions that are supported by browsers. 

To learn more, see [Browser Support](guide/browser-support).


{@a element}

## element

Angular defines an `ElementRef` class to wrap render-specific native UI elements. 
In most cases, this allows you to use Angular templates and  data binding to access DOM elements 
without reference to the native element.

The documentation generally refers to *elements* (`ElementRef` instances), as distinct from  *DOM elements*
(which can be accessed directly if necessary).

Compare to [custom element](guide/glossary#custom-element).

{@a entry-point}

## entry point

A JavaScript symbol that makes parts of an [npm package](guide/npm-packages) available for import by other code. 
The Angular [scoped packages](guide/glossary#scoped-package) each have an entry point named `index`.

Within Angular, use [NgModules](guide/glossary#ngmodule) to make public parts available for import by other NgModules.


{@a F}


{@a G}


{@a H}

{@a I}

{@a injectable}

## injectable

An Angular class or other definition that provides a dependency using the [dependency injection](guide/glossary#di) mechanism. An injectable [service](guide/glossary#service) class must be marked by the `@Injectable()` [decorator](guide/glossary#decorator). Other items, such as constant values, can also be injectable.

{@a injector}

## injector

An object in the Angular [dependency-injection](guide/glossary#dependency-injection) system
that can find a named dependency in its cache or create a dependency
using a configured [provider](guide/glossary#provider). 
Injectors are created for NgModules automatically as part of the bootstrap process
and are inherited through the component hierarchy.

* An injector provides a singleton instance of a dependency, and can inject this same instance in multiple components.

* A hierarchy of injectors at the NgModule and component level can provide different instances of a dependency to their own components and child components.

* You can configure injectors with different providers that can provide different implementations of the same dependency.

Learn more about the injector hierarchy in [Hierarchical Dependency Injectors](guide/hierarchical-dependency-injection).

{@a input}

## input

When defining a [directive](guide/glossary#directive), the `@Input()` decorator on a directive property 
makes that property available as a *target* of a [property binding](guide/template-syntax#property-binding).
Data values flow into an input property from the data source identified
in the [template expression](guide/glossary#template-expression) to the right of the equal sign.

To learn more, see [input and output properties](guide/template-syntax#inputs-outputs).

{@a interpolation}

## interpolation

A form of property [data binding](guide/glossary#data-binding) in which a [template expression](guide/glossary#template-expression) between double-curly braces renders as text.  
That text can be concatenated with neighboring text before it is assigned to an element property
or displayed between element tags, as in this example.

<code-example language="html" escape="html">
  <label>My current hero is {{hero.name}}</label>

</code-example>


Read more about [interpolation](guide/template-syntax#interpolation) in [Template Syntax](guide/template-syntax).


{@a J}

{@a javascript}

## JavaScript

See [ECMAScript](guide/glossary#ecma), [TypeScript](guide/glossary#typescript).


{@a jit}


## just-in-time (JIT) compilation

The Angular just-in-time (JIT) compiler converts your Angular HTML and TypeScript code into 
efficient JavaScript code at run time, as part of bootstrapping.

JIT compilation is the default (as opposed to AOT compilation) when you run Angular's `ng build` and `ng serve` CLI commands, and is a good choice during development. 
JIT mode is strongly discouraged for production use 
because it results in large application payloads that hinder the bootstrap performance.

Compare to [ahead-of-time (AOT) compilation](guide/glossary#aot).


{@a K}


{@a L}

{@a lazy-load}

## lazy loading

A process that speeds up application load time by splitting the application into multiple bundles and loading them on demand. 
For example, dependencies can be lazy loaded as needed&mdash;as opposed to [eager-loaded](guide/glossary#eager-loading) modules that are required by the root module and are thus loaded on launch. 

The [router](guide/glossary#router) makes use of lazy loading to load child views only when the parent view is activated. 
Similarly, you can build custom elements that can be loaded into an Angular app when needed.

{@a library}

## library

In Angular, a [project](guide/glossary#project) that provides functionality that can be included in other Angular apps. 
A library isn't a complete Angular app and can't run independently. 

* Library developers can use the [CLI](guide/glossary#cli) to `generate` scaffolding for a new library in an existing [workspace](guide/glossary#workspace), and can publish a library as an `npm` package. 

* App developers can use the [CLI](guide/glossary#cli) to `add` a published library for use with an app in the same [workspace](guide/glossary#workspace). 

{@a lifecycle-hook}

## lifecycle hook

An interface that allows you to tap into the lifecycle of [directives](guide/glossary#directive) and [components](guide/glossary#component) as they are created, updated, and destroyed.

Each interface has a single hook method whose name is the interface name prefixed with `ng`.
For example, the `OnInit` interface has a hook method named `ngOnInit`.

Angular calls these hook methods in the following order:

* `ngOnChanges`: When an [input](guide/glossary#input)/[output](guide/glossary#output) binding value changes.
* `ngOnInit`: After the first `ngOnChanges`.
* `ngDoCheck`: Developer's custom change detection.
* `ngAfterContentInit`: After component content initialized.
* `ngAfterContentChecked`: After every check of component content.
* `ngAfterViewInit`: After a component's views are initialized.
* `ngAfterViewChecked`: After every check of a component's views.
* `ngOnDestroy`: Just before the directive is destroyed.

To learn more, see [Lifecycle Hooks](guide/lifecycle-hooks).


{@a M}

{@a module}

## module

In general, a module collects a block of code dedicated to a single purpose. Angular uses standard JavaScript modules and also defines an Angular module, `NgModule`. 

In JavaScript (ECMAScript), each file is a module and all objects defined in the file belong to that module. Objects can exported, making them public, and public objects can be imported for use by other modules.

Angular ships as a collection of JavaScript modules (also called libraries). Each Angular library name begins with the `@angular` prefix. Install Angular libraries with the [npm package manager](https://docs.npmjs.com/getting-started/what-is-npm) and import parts of them with JavaScript `import` declarations.

Compare to [NgModule](guide/glossary#ngmodule).


{@a N}

{@a ngmodule}

## NgModule

A class definition preceded by the `@NgModule()` [decorator](guide/glossary#decorator), which declares and serves as a manifest for a block of code dedicated to an application domain, a workflow, or a closely related set of capabilities.

Like a [JavaScript module](guide/glossary#module), an NgModule can export functionality for use by other NgModules and import public functionality from other NgModules.
The metadata for an NgModule class collects components, directives, and pipes that the application uses along with the list of imports and exports. See also [declarable](guide/glossary#declarable).

NgModules are typically named after the file in which the exported thing is defined. For example, the Angular [DatePipe](api/common/DatePipe) class belongs to a feature module named `date_pipe` in the file `date_pipe.ts`. You import them from an Angular [scoped package](guide/glossary#scoped-package) such as `@angular/core`.

Every Angular application has a root module. By convention, the class is called `AppModule` and resides in a file named `app.module.ts`.

To learn more, see [NgModules](guide/ngmodules).

{@a npm-package}

## npm package 

The [npm package manager](https://docs.npmjs.com/getting-started/what-is-npm) is used to distribute and load Angular modules and libraries. 

Learn more about how Angular uses [Npm Packages](guide/npm-packages).

{@a O}

{@a observable}

## observable

A producer of multiple values, which it pushes to [subscribers](guide/glossary#subscriber). Used for asynchronous event handling throughout Angular. You execute an observable by subscribing to it with its `subscribe()` method, passing callbacks for notifications of new values, errors, or completion. 

Observables can deliver single or multiple values of any type to subscribers, either synchronously (as a function delivers a value to its caller) or on a schedule. A subscriber receives notification of new values as they are produced and notification of either normal completion or error completion. 

Angular uses a third-party library called [Reactive Extensions (RxJS)](http://reactivex.io/rxjs/). 

To learn more, see [Observables](guide/observables).


{@a observer}

## observer

An object passed to the `subscribe()` method for an [observable](guide/glossary#observable). The object defines the callbacks for the [subscriber](guide/glossary#subscriber).

{@a output}

## output

When defining a [directive](guide/glossary#directive), the `@Output{}` decorator on a directive property 
makes that property available as a *target* of [event binding](guide/template-syntax#event-binding). 
Events stream *out* of this property to the receiver identified
in the [template expression](guide/glossary#template-expression) to the right of the equal sign.

To learn more, see [Input and Output Properties](guide/template-syntax#inputs-outputs).


{@a P}

{@a pipe}

## pipe

A class which is preceded by the `@Pipe{}` decorator and which defines a function that transforms input values to output values for display in a [view](guide/glossary#view). Angular defines various pipes, and you can define new pipes.
 
To learn more, see [Pipes](guide/pipes).

{@a polyfill}

## polyfill

An [npm package](guide/npm-packages) that plugs gaps in a browser's JavaScript implementation. 
See [Browser Support](guide/browser-support) for polyfills that support particular functionality for particular platforms. 

{@a project}

## project

In Angular, a folder within a [workspace](guide/glossary#workspace) that contains an Angular app or [library](guide/glossary#library).
A workspace can contain multiple projects. 
All apps in a workspace can use libraries in the same workspace.

{@a provider}

## provider

An object that implements one of the [`Provider`](api/core/Provider) interfaces. A provider object defines how to obtain an injectable dependency associated with a [DI token](guide/glossary#token).
An [injector](guide/glossary#injector) uses the provider to create a new instance of a dependency
for a class that requires it.

Angular registers its own providers with every injector, for services that Angular defines. 
You can register your own providers for services that your app needs.

See also [service](guide/glossary#service), [dependency injection](guide/glossary#di).

Learn more in [Dependency Injection](guide/dependency-injection).


{@a Q}

{@a R}

{@a reactive-forms}

## reactive forms

A framework for building Angular forms through code in a component.
The alternative is a [template-driven form](guide/glossary#template-driven-forms).

When building reactive forms:

* The "source of truth" is the component. The validation is defined using code in the component.
* Each control is explicitly created in the component class with `new FormControl()` or with `FormBuilder`.
* The template input elements do *not* use `ngModel`.
* The associated Angular directives are prefixed with `Form`, such as `FormGroup()`, `FormControl()`, and `FormControlName()`.

Reactive forms are powerful, flexible, and a good choice for more complex data-entry form scenarios, such as dynamic generation of form controls.

{@a router}
{@a router-module}

## router

A tool that configures and implements navigation among states and [views](guide/glossary#view) within an Angular app.

The `Router` module is an [NgModule](guide/glossary#ngmodule) that provides the necessary service providers and directives for navigating through application views. A [routing component](guide/glossary#routing-component) is one that imports the `Router` module and whose template contains a `RouterOutlet` element where it can display views produced by the router.
 
The router defines navigation among views on a single page, as opposed to navigation among pages. It interprets URL-like links to determine which views to create or destroy, and which components to load or unload. It allows you to take advantage of [lazy loading](guide/glossary#lazy-load) in your Angular apps.

To learn more, see [Routing and Navigation](guide/router).

{@a router-outlet}

## router outlet

A [directive](guide/glossary#directive) that acts as a placeholder in a routing component's template. Angular dynamically renders the template based on the current router state.

{@a router-component}

## routing component

An Angular [component](guide/glossary#component) with a `RouterOutlet` directive in its template that displays views based on router navigations.

For more information, see [Routing and Navigation](guide/router).


{@a S}

{@a schematic}

## schematic

A scaffolding library that defines how to generate or transform a programming project by creating, modifying, refactoring, or moving files and code. 
The Angular [CLI](guide/glossary#cli) uses schematics to generate and modify [Angular projects](guide/glossary#project) and parts of projects.

* Angular provides a set of schematics for use with the CLI. See the [Angular CLI command reference](cli). The [`ng add`](cli/add) command runs schematics as part of adding a library to your project. The [`ng generate`](cli/generate) command runs schematics to create apps, libraries, and Angular code constructs. 

* Library developers can create schematics that enable the CLI to generate their published libraries.
For more information, see [devkit documentation](https://www.npmjs.com/package/@angular-devkit/schematics). 

{@a scoped-package}

## scoped package

A way to group related [npm packages](guide/npm-packages). 
NgModules are delivered within scoped packages whose names begin with the Angular *scope name* `@angular`. For example, `@angular/core`, `@angular/common`, `@angular/forms`, and `@angular/router`.

Import a scoped package in the same way that you import a normal package. 

<code-example path="architecture/src/app/app.component.ts" linenums="false" header="architecture/src/app/app.component.ts (import)" region="import">

</code-example>

{@a service}

## service

In Angular, a class with the [@Injectable()](guide/glossary#injectable) decorator that encapsulates non-UI logic and code that can be reused across an application. 
Angular distinguishes components from services to increase modularity and reusability.

The `@Injectable()` metadata allows the service class to be used with the [dependency injection](guide/glossary#di) mechanism. 
The injectable class is instantiated by a [provider](guide/glossary#provider). 
[Injectors](guide/glossary#injector) maintain lists of providers and use them to provide service instances when they are required by components or other services.

To learn more, see [Introduction to Services and Dependency Injection](guide/architecture-services).

{@a structural-directive}
{@a structural-directives}

## structural directives

A category of [directive](guide/glossary#directive) that is responsible for shaping HTML layout by modifying the DOM&mdashthat is, adding, removing, or manipulating elements and their children.

To learn more, see [Structural Directives](guide/structural-directives).

{@a subscriber}

## subscriber

A function that defines how to obtain or generate values or messages to be published. This function is executed when a consumer calls the `subscribe()` method of an [observable](guide/glossary#observable).

The act of subscribing to an observable triggers its execution, associates callbacks with it, and creates a `Subscription` object that lets you unsubscribe.

The `subscribe()` method takes a JavaScript object (called an [observer](guide/glossary#observer)) with up to three callbacks, one for each type of notification that an observable can deliver:

* The `next` notification sends a value such as a number, a string, or an object.
* The `error` notification sends a JavaScript Error or exception.
* The `complete` notification doesn't send a value, but the handler is called when the call completes. Scheduled values can continue to be returned after the call completes.

{@a T}
{@a template}

## template

Code associated with a component that defines how to render the component's [view](guide/glossary#view). 

A template combines straight HTML with Angular [data-binding](guide/glossary#data-binding) syntax, [directives](guide/glossary#directive), 
and [template expressions](guide/glossary#template-expression) (logical constructs). 
The Angular elements insert or calculate values that modify the HTML elements before the page is displayed.
 
A template is associated with a [component](guide/glossary#component) class through the `@Component()` [decorator](guide/glossary#decorator). The HTML can be provided inline, as the value of the `template` property, or in a separate HTML file linked through the `templateUrl` property. 

Additional templates, represented by `TemplateRef` objects, can define alternative or *embedded* views, which can be referenced from multiple components.

{@a template-drive-forms}

## template-driven forms

A format for building Angular forms using HTML forms and input elements in the view.
The alternative format uses the [reactive forms](guide/glossary#reactive-forms) framework.

When building template-driven forms:

* The "source of truth" is the template. The validation is defined using attributes on the individual input elements.
* [Two-way binding](guide/glossary#data-binding) with `ngModel` keeps the component model synchronized with the user's entry into the input elements.
* Behind the scenes, Angular creates a new control for each input element, provided you have set up a `name` attribute and two-way binding for each input.
* The associated Angular directives are prefixed with `ng` such as `ngForm`, `ngModel`, and `ngModelGroup`.

Template-driven forms are convenient, quick, and simple. They are a good choice for many basic data-entry form scenarios.

Read about how to build template-driven forms in [Forms](guide/forms).

{@a template-expression}

## template expression

A TypeScript-like syntax that Angular evaluates within a [data binding](guide/glossary#data-binding).

Read about how to write template expressions in  [Template expressions](guide/template-syntax#template-expressions).

{@a token}

## token

An opaque identifier used for efficient table lookup. In Angular, a [DI token](guide/glossary#di-token) is used to find [providers](guide/glossary#provider) of dependencies in the [dependency injection](guide/glossary#di) system.

{@a transpile}

## transpile

The translation process that transforms one version of JavaScript to another version; for example, down-leveling ES2015 to the older ES5 version.


{@a typescript}

## TypeScript

A programming language based on JavaScript that is notable for its optional typing system. 
TypeScript provides compile-time type checking and strong tooling support (such as
code completion, refactoring, inline documentation, and intelligent search). 
Many code editors and IDEs support TypeScript either natively or with plug-ins.

TypeScript is the preferred language for Angular development. 
Read more about TypeScript at [typescriptlang.org](http://www.typescriptlang.org/).


{@a U}

{@a V}

{@a view}

## view

The smallest grouping of display elements that can be created and destroyed together. 
Angular renders a view under the control of one or more [directives](guide/glossary#directive),
especially [component](guide/glossary#component) directives and their companion [templates](guide/glossary#template). 

A view is specifically represented by a `ViewRef` instance associated with the component. 
A view that belongs to a component is called a *host view*. 
Views are typically collected into [view hierarchies](guide/glossary#view-tree). 

Properties of elements in a view can change dynamically, in response to user actions; 
the structure (number and order) of elements in a view can't. 
You can change the structure of elements by inserting, moving, or removing nested views within their view containers.

View hierarchies can be loaded and unloaded dynamically as the user navigates through the application, typically under the control of a [router](guide/glossary#router).

{@a view-tree}

## view hierarchy

A tree of related views that can be acted on as a unit. The root view is a component's *host view*.  A host view can be the root of a tree of *embedded views*, collected in a *view container* (`ViewContainerRef`) attached to an anchor element in the hosting component. The view hierarchy is a key part of Angular change detection. 

The view hierarchy doesn't imply a component hierarchy. Views that are embedded in the context of a particular hierarchy can be host views of other components. Those components can be in the same NgModule as the hosting component, or belong to other NgModules.

{@a W}
{@a web-component}

## web component

See [custom element](guide/glossary#custom-element).

{@a workspace}

## workspace

In Angular, a folder that contains [projects](guide/glossary#project) (that is, apps and libraries).
The [CLI](guide/glossary#cli) `ng new` command creates a workspace to contain projects. 
Commands that create or operate on apps and libraries (such as `add` and `generate`) must be executed from within a workspace folder. 

{@a X}


{@a Y}


{@a Z}
{@a zone}

## zone

An execution context for a set of asynchronous tasks. Useful for debugging, profiling, and testing apps that include asynchronous operations such as event processing, promises, and calls to remote servers.

An Angular app runs in a zone where it can respond to asynchronous events by checking for data changes and updating the information it displays by resolving [data bindings](guide/glossary#data-binding).

A zone client can take action before and after an async operation completes. 

Learn more about zones in this
[Brian Ford video](https://www.youtube.com/watch?v=3IqtmUscE_U).
