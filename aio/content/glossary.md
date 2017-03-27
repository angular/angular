@description

Angular has its own vocabulary.
Most Angular terms are common English words
with a specific meaning within the Angular system.

This glossary lists the most prominent terms
and a few less familiar ones that have unusual or
unexpected definitions.

[A](glossary#A) [B](glossary#B) [C](glossary#C) [D](glossary#D) [E](glossary#E) [F](glossary#F) [G](glossary#G) [H](glossary#H) [I](glossary#I)
[J](glossary#J) [K](glossary#K) [L](glossary#L) [M](glossary#M) [N](glossary#N) [O](glossary#O) [P](glossary#P) [Q](glossary#Q) [R](glossary#R)
[S](glossary#S) [T](glossary#T) [U](glossary#U) [V](glossary#V) [W](glossary#W) [X](glossary#X) [Y](glossary#Y) [Z](glossary#Z)



{@a aot}
## Ahead-of-time (AOT) compilation

~~~ {.l-sub-section}

You can compile Angular applications at build time.
By compiling your application<span if-docs="ts"> using the compiler-cli, `ngc`</span>, you can bootstrap directly
to a<span if-docs="ts"> module</span> factory, meaning you don't need to include the Angular compiler in your JavaScript bundle.
Ahead-of-time compiled applications also benefit from decreased load time and increased performance.


~~~



{@a attribute-directive}


{@a attribute-directives}
## Attribute directives

~~~ {.l-sub-section}

A category of [directive](glossary#directive) that can listen to and modify the behavior of
other HTML elements, attributes, properties, and components. They are usually represented
as HTML attributes, hence the name.

For example, you can use the `ngClass` directive to add and remove CSS class names.

Learn about them in the [_Attribute Directives_](!{docsLatest}/guide/attribute-directives) guide.


~~~


## Binding

~~~ {.l-sub-section}

Usually refers to [data binding](glossary#data-binding) and the act of
binding an HTML object property to a data object property.

Sometimes refers to a [dependency-injection](glossary#dependency-injection) binding
between a "token"&mdash;also referred to as a "key"&mdash;and a dependency [provider](glossary#provider).
When using this more rare usage, be clear in context.


~~~

## Bootstrap

~~~ {.l-sub-section}


You launch an Angular application by "bootstrapping" it using the application root Angular module (`AppModule`). Bootstrapping identifies an application's top level "root" [component](glossary#component), which is the first component that is loaded for the application.
For more information, see the [Setup](!{docsLatest}/guide/setup) page.You can bootstrap multiple apps in the same `index.html`, each app with its own top-level root.


~~~


## camelCase

~~~ {.l-sub-section}

The practice of writing compound words or phrases such that each word or abbreviation begins with a capital letter
_except the first letter, which is lowercase_.

Function, property, and method names are typically spelled in camelCase. For example, `square`, `firstName`, and `getHeroes`. Notice that `square` is an example of how you write a single word in camelCase.

camelCase is also known as *lower camel case* to distinguish it from *upper camel case*, or [PascalCase](glossary#pascalcase).
In Angular documentation, "camelCase" always means *lower camel case*.


~~~



{@a component}
## Component

~~~ {.l-sub-section}

An Angular class responsible for exposing data to a [view](glossary#view) and handling most of the view’s display and user-interaction logic.

The *component* is one of the most important building blocks in the Angular system.
It is, in fact, an Angular [directive](glossary#directive) with a companion [template](glossary#template).

Apply the `!{_at}Component` !{_decoratorLink} to
the component class, thereby attaching to the class the essential component metadata
that Angular needs to create a component instance and render the component with its template
as a view.

Those familiar with "MVC" and "MVVM" patterns will recognize
the component in the role of "controller" or "view model".


~~~


## dash-case

~~~ {.l-sub-section}

The practice of writing compound words or phrases such that each word is separated by a dash or hyphen (`-`).
This form is also known as kebab-case.

[Directive](glossary#directive) selectors (like `my-app`) <span if-docs="ts">and
the root of filenames (such as `hero-list.component.ts`)</span> are often
spelled in dash-case.


~~~

## Data binding

~~~ {.l-sub-section}

Applications display data values to a user and respond to user
actions (such as clicks, touches, and keystrokes).

In data binding, you declare the relationship between an HTML widget and data source
and let the framework handle the details.
Data binding is an alternative to manually pushing application data values into HTML, attaching
event listeners, pulling changed values from the screen, and
updating application data values.

Angular has a rich data-binding framework with a variety of data-binding
operations and supporting declaration syntax.

 Read about the following forms of binding in the [Template Syntax](!{docsLatest}/guide/template-syntax) page:
 * [Interpolation](!{docsLatest}/guide/template-syntax).
 * [Property binding](!{docsLatest}/guide/template-syntax).
 * [Event binding](!{docsLatest}/guide/template-syntax).
 * [Attribute binding](!{docsLatest}/guide/template-syntax).
 * [Class binding](!{docsLatest}/guide/template-syntax).
 * [Style binding](!{docsLatest}/guide/template-syntax).
 * [Two-way data binding with ngModel](!{docsLatest}/guide/template-syntax).



~~~

## Dependency injection

~~~ {.l-sub-section}

A design pattern and mechanism
for creating and delivering parts of an application to other
parts of an application that request them.

Angular developers prefer to build applications by defining many simple parts
that each do one thing well and then wiring them together at runtime.

These parts often rely on other parts. An Angular [component](glossary#component)
part might rely on a service part to get data or perform a calculation. When
part "A" relies on another part "B," you say that "A" depends on "B" and
that "B" is a dependency of "A."

You can ask a "dependency injection system" to create "A"
for us and handle all the dependencies.
If "A" needs "B" and "B" needs "C," the system resolves that chain of dependencies
and returns a fully prepared instance of "A."


Angular provides and relies upon its own sophisticated
dependency-injection system
to assemble and run applications by "injecting" application parts
into other application parts where and when needed.

At the core, an [`injector`](glossary#injector) returns dependency values on request.
The expression `injector.get(token)` returns the value associated with the given token.

A token is an Angular type (`OpaqueToken`). You rarely need to work with tokens directly; most
methods accept a class name (`Foo`) or a string ("foo") and Angular converts it
to a token. When you write `injector.get(Foo)`, the injector returns
the value associated with the token for the `Foo` class, typically an instance of `Foo` itself.

During many of its operations, Angular makes similar requests internally, such as when it creates a [`component`](glossary#component) for display.

The `Injector` maintains an internal map of tokens to dependency values.
If the `Injector` can't find a value for a given token, it creates
a new value using a `Provider` for that token.

A [provider](glossary#provider) is a recipe for
creating new instances of a dependency value associated with a particular token.

An injector can only create a value for a given token if it has
a `provider` for that token in its internal provider registry.
Registering providers is a critical preparatory step.

Angular registers some of its own providers with every injector.
You can register your own providers.

Read more in the [Dependency Injection](!{docsLatest}/guide/dependency-injection) page.


~~~



{@a directive}


{@a directives}
## Directive

~~~ {.l-sub-section}

An Angular class responsible for creating, reshaping, and interacting with HTML elements
in the browser DOM. The directive is Angular's most fundamental feature.

A directive is ususally associated with an HTML element or attribute.
This element or attribute is often referred to as the directive itself.

When Angular finds a directive in an HTML template,
it creates the matching directive class instance
and gives the instance control over that portion of the browser DOM.

You can invent custom HTML markup (for example, `<my-directive>`) to
associate with your custom directives. You add this custom markup to HTML templates
as if you were writing native HTML. In this way, directives become extensions of
HTML itself.


Directives fall into one of the following categories:

* [Components](glossary#component) combine application logic with an HTML template to
render application [views](glossary#view). Components are usually represented as HTML elements.
They are the building blocks of an Angular application.

1. [Attribute directives](glossary#attribute-directive) can listen to and modify the behavior of
other HTML elements, attributes, properties, and components. They are usually represented
as HTML attributes, hence the name.

1. [Structural directives](glossary#structural-directive) are responsible for
shaping or reshaping HTML layout, typically by adding, removing, or manipulating
elements and their children.



~~~


## ECMAScript

~~~ {.l-sub-section}

The [official JavaScript language specification](https://en.wikipedia.org/wiki/ECMAScript).

The latest approved version of JavaScript is
[ECMAScript 2016](http://www.ecma-international.org/ecma-262/7.0/)
(also known as "ES2016" or "ES7"). Many Angular developers write their applications
in ES7 or a dialect that strives to be
compatible with it, such as [TypeScript](glossary#typescript).

Most modern browsers only support the much older "ECMAScript 5" (also known as "ES5") standard.
Applications written in ES2016, ES2015, or one of their dialects must be [transpiled](glossary#transpile)
to ES5 JavaScript.

Angular developers can write in ES5 directly.


~~~

## ES2015

~~~ {.l-sub-section}

Short hand for [ECMAScript](glossary#ecmascript) 2015.

~~~

## ES5

~~~ {.l-sub-section}

Short hand for [ECMAScript](glossary#ecmascript) 5, the version of JavaScript run by most modern browsers.

~~~

## ES6

~~~ {.l-sub-section}

Short hand for [ECMAScript](glossary#ecmascript) 2015.


~~~



{@a F}


{@a G}


{@a H}

## Injector

~~~ {.l-sub-section}

An object in the Angular [dependency-injection system](glossary#dependency-injection)
that can find a named dependency in its cache or create a dependency
with a registered [provider](glossary#provider).


~~~

## Input

~~~ {.l-sub-section}

A directive property that can be the *target* of a
[property binding](!{docsLatest}/guide/template-syntax) (explained in detail in the [Template Syntax](!{docsLatest}/guide/template-syntax) page).
Data values flow *into* this property from the data source identified
in the template expression to the right of the equal sign.

See the [Input and output properties](!{docsLatest}/guide/template-syntax) section of the [Template Syntax](!{docsLatest}/guide/template-syntax) page.


~~~

## Interpolation

~~~ {.l-sub-section}

A form of [property data binding](glossary#data-binding) in which a
[template expression](glossary#template-expression) between double-curly braces
renders as text.  That text may be concatenated with neighboring text
before it is assigned to an element property
or displayed between element tags, as in this example.

<code-example language="html" escape="html">
  <label>My current hero is {{hero.name}}</label>  
    
</code-example>

Read more about [interpolation](!{docsLatest}/guide/template-syntax) in the
[Template Syntax](!{docsLatest}/guide/template-syntax) page.


~~~




{@a jit}
## Just-in-time (JIT) compilation

~~~ {.l-sub-section}

A bootstrapping method of compiling components<span if-docs="ts"> and modules</span> in the browser
and launching the application dynamically. Just-in-time mode is a good choice during development.
Consider using the [ahead-of-time](glossary#aot) mode for production apps.


~~~


## kebab-case

~~~ {.l-sub-section}

See [dash-case](glossary#dash-case).


~~~


## Lifecycle hooks

~~~ {.l-sub-section}

[Directives](glossary#directive) and [components](glossary#component) have a lifecycle
managed by Angular as it creates, updates, and destroys them.

You can tap into key moments in that lifecycle by implementing
one or more of the lifecycle hook interfaces.

Each interface has a single hook method whose name is the interface name prefixed with `ng`.
For example, the `OnInit` interface has a hook method named `ngOnInit`.

Angular calls these hook methods in the following order:
* `ngOnChanges`: when an [input](glossary#input)/[output](glossary#output) binding value changes.
* `ngOnInit`: after the first `ngOnChanges`.
* `ngDoCheck`: developer's custom change detection.
* `ngAfterContentInit`: after component content initialized.
* `ngAfterContentChecked`: after every check of component content.
* `ngAfterViewInit`: after a component's views are initialized.
* `ngAfterViewChecked`: after every check of a component's views.
* `ngOnDestroy`: just before the directive is destroyed.

Read more in the [Lifecycle Hooks](!{docsLatest}/guide/lifecycle-hooks) page.


~~~


## Module

~~~ {.l-sub-section}




~~~ {.alert.is-important}

Angular has the following types of modules:
- [Angular modules](glossary#angular-module).
For details and examples, see the [Angular Modules](!{docsLatest}/guide/ngmodule) page.
- ES2015 modules, as described in this section.


~~~

A cohesive block of code dedicated to a single purpose.

Angular apps are modular.

In general, you assemble an application from many modules, both the ones you write and the ones you acquire from others.

A module *exports* something of value in that code, typically one thing such as a class;
a module that needs that class *imports* it.

The structure of Angular modules and the import/export syntax
is based on the [ES2015 module standard](http://www.2ality.com/2014/09/es6-modules-final.html).

An application that adheres to this standard requires a module loader to
load modules on request and resolve inter-module dependencies.
Angular doesn't include a module loader and doesn't have a preference
for any particular third-party library (although most examples use SystemJS).
You can use any module library that conforms to the standard.

Modules are typically named after the file in which the exported thing is defined.
The Angular [DatePipe](https://github.com/angular/angular/blob/master/modules/@angular/common/src/pipes/date_pipe.ts)
class belongs to a feature module named `date_pipe` in the file `date_pipe.ts`.

You rarely access Angular feature modules directly. You usually import them from an Angular [scoped package](glossary#scoped-package) such as `@angular/core`.


~~~



{@a N}

## Output

~~~ {.l-sub-section}

A directive property that can be the *target* of event binding
(read more in the [event binding](!{docsLatest}/guide/template-syntax)
section of the [Template Syntax](!{docsLatest}/guide/template-syntax) page).
Events stream *out* of this property to the receiver identified
in the template expression to the right of the equal sign.

See the [Input and output properties](!{docsLatest}/guide/template-syntax) section of the [Template Syntax](!{docsLatest}/guide/template-syntax) page.


~~~


## PascalCase

~~~ {.l-sub-section}

The practice of writing individual words, compound words, or phrases such that each word or abbreviation begins with a capital letter.
Class names are typically spelled in PascalCase. For example, `Person` and `HeroDetailComponent`.

This form is also known as *upper camel case* to distinguish it from *lower camel case* or simply [camelCase](glossary#camelcase).
In this documentation, "PascalCase" means *upper camel case* and  "camelCase" means *lower camel case*.


~~~

## Pipe

~~~ {.l-sub-section}

An Angular pipe is a function that transforms input values to output values for
display in a [view](glossary#view).
Here's an example that uses the built-in `currency` pipe to display
a numeric value in the local currency.

<code-example language="html" escape="html">
  <label>Price: </label>{{product.price | currency}}  
    
</code-example>

You can also write your own custom pipes.
Read more in the page on [pipes](!{docsLatest}/guide/pipes).


~~~

## Provider

~~~ {.l-sub-section}

A _provider_ creates a new instance of a dependency for the
[dependency injection](glossary#dependency-injection) system.
It relates a lookup token to code&mdash;sometimes called a "recipe"&mdash;that can create a dependency value.


~~~



{@a Q}

## Router

~~~ {.l-sub-section}

Most applications consist of many screens or [views](glossary#view).
The user navigates among them by clicking links and buttons,
and performing other similar actions that cause the application to
replace one view with another.

The Angular component router is a richly featured mechanism for configuring and managing the entire view navigation process, including the creation and destruction
of views.

~~~

## Routing component

~~~ {.l-sub-section}

An Angular [component](glossary#component) with a `RouterOutlet` that displays views based on router navigations.

For more information, see the [Routing & Navigation](!{docsLatest}/guide/router) page.


~~~


## Service

~~~ {.l-sub-section}

For data or logic that is not associated
with a specific view or that you want to share across components, build services.

Applications often require services such as a hero data service or a logging service.

A service is a class with a focused purpose.
You often create a service to implement features that are
independent from any specific view,
provide shared data or logic across components, or encapsulate external interactions.

Applications often require services such as a data service or a logging service.

For more information, see the [Services](!{docsLatest}/tutorial/toh-pt4) page of the [Tour of Heroes](!{docsLatest}/tutorial/) tutorial.


~~~



{@a snake-case}
## snake_case


~~~ {.l-sub-section}


The practice of writing compound words or phrases such that an
underscore (`_`) separates one word from the next. This form is also known as *underscore case*.


~~~



{@a structural-directive}


{@a structural-directives}
## Structural directives

~~~ {.l-sub-section}

A category of [directive](glossary#directive) that can
shape or reshape HTML layout, typically by adding and removing elements in the DOM.
The `ngIf` "conditional element" directive and the `ngFor` "repeater" directive are well-known examples.

Read more in the [_Structural Directives_](!{docsLatest}/guide/structural-directives) guide.


~~~


## Template

~~~ {.l-sub-section}

A chunk of HTML that Angular uses to render a [view](glossary#view) with
the support and guidance of an Angular [directive](glossary#directive),
most notably a [component](glossary#component).



~~~

## Template expression

~~~ {.l-sub-section}

A !{_Lang}-like syntax that Angular evaluates within
a [data binding](glossary#data-binding).

Read about how to write template expressions
in the [Template expressions](!{docsLatest}/guide/template-syntax) section
of the [Template Syntax](!{docsLatest}/guide/template-syntax) page.


~~~

## Transpile

~~~ {.l-sub-section}

The process of transforming code written in one form of JavaScript
(such as TypeScript) into another form of JavaScript  (such as [ES5](glossary#es5)).


~~~

## TypeScript

~~~ {.l-sub-section}

A version of JavaScript that supports most [ECMAScript 2015](glossary#es2015)
language features such as [decorators](glossary#decorator).

TypeScript is also notable for its optional typing system, which provides
compile-time type checking and strong tooling support (such as "intellisense,"
code completion, refactoring, and intelligent search). Many code editors
and IDEs support TypeScript either natively or with plugins.

TypeScript is the preferred language for Angular development, although
you can use other JavaScript dialects such as [ES5](glossary#es5).

Read more about TypeScript at [typescriptlang.org](http://www.typescriptlang.org/).


~~~



{@a U}

## View

~~~ {.l-sub-section}

A portion of the screen that displays information and responds
to user actions such as clicks, mouse moves, and keystrokes.

Angular renders a view under the control of one or more [directives](glossary#directive),
especially  [component](glossary#component) directives and their companion [templates](glossary#template).
The component plays such a prominent role that it's often
convenient to refer to a component as a view.

Views often contain other views. Any view might be loaded and unloaded
dynamically as the user navigates through the application, typically
under the control of a [router](glossary#router).


~~~



{@a W}


{@a X}


{@a Y}

## Zone

~~~ {.l-sub-section}


A mechanism for encapsulating and intercepting
a JavaScript application's asynchronous activity.

The browser DOM and JavaScript have a limited number
of asynchronous activities, such as DOM events (for example, clicks),
[promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise), and
[XHR](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest)
calls to remote servers.

Zones intercept all of these activities and give a "zone client" the opportunity
to take action before and after the async activity finishes.

Angular runs your application in a zone where it can respond to
asynchronous events by checking for data changes and updating
the information it displays via [data bindings](glossary#data-binding).

Learn more about zones in this
[Brian Ford video](https://www.youtube.com/watch?v=3IqtmUscE_U).

~~~

