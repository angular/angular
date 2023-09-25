# Introduction to Angular concepts

Angular is a platform and framework for building single-page client applications using HTML and TypeScript.
Angular is written in TypeScript.
It implements core and optional functionality as a set of TypeScript libraries that you import into your applications.

The architecture of an Angular application relies on certain fundamental concepts.
The basic building blocks of the Angular framework are Angular components.

Components define *views*, which are sets of screen elements that Angular can choose among and modify according to your program logic and data

Components use *services*, which provide background functionality not directly related to views such as fetching data.
Such services can be *injected* into components as *dependencies*, making your code modular, reusable, and efficient.

Components and services are classes marked with *decorators*.
These decorators provide metadata that tells Angular how to use them.

*   The metadata for a component class associates it with a *template* that defines a view.
    A template combines ordinary HTML with Angular *directives* and *binding markup* that allow Angular to modify the HTML before rendering it for display.

*   The metadata for a service class provides the information Angular needs to make it available to components through *dependency injection \(DI\)*

An application's components typically define many views, arranged hierarchically.
Angular provides the `Router` service to help you define navigation paths among views.
The router provides sophisticated in-browser navigational capabilities.

<div class="alert is-helpful">

See the [Angular Glossary](guide/glossary) for basic definitions of important Angular terms and usage.

</div>

<div class="alert is-helpful">

For the sample application that this page describes, see the <live-example></live-example>.

</div>

## Components

Every Angular application has at least one component, the *root component* that connects a component hierarchy with the page document object model \(DOM\).
Each component defines a class that contains application data and logic, and is associated with an HTML *template* that defines a view to be displayed in a target environment.

The `@Component()` decorator identifies the class immediately below it as a component, and provides the template and related component-specific metadata.

<div class="alert is-helpful">

Decorators are functions that modify JavaScript classes.
Angular defines a number of decorators that attach specific kinds of metadata to classes, so that the system knows what those classes mean and how they should work.

<a href="https://medium.com/google-developers/exploring-es7-decorators-76ecb65fb841#.x5c2ndtx0">Learn more about decorators on the web.</a>

</div>

### Templates, directives, and data binding

A template combines HTML with Angular markup that can modify HTML elements before they are displayed.
Template *directives* provide program logic, and *binding markup* connects your application data and the DOM.
There are two types of data binding:

| Data bindings    | Details |
|:---              |:---     |
| Event binding    | Lets your application respond to user input in the target environment by updating your application data. |
| Property binding | Lets you interpolate values that are computed from your application data into the HTML.                  |

Before a view is displayed, Angular evaluates the directives and resolves the binding syntax in the template to modify the HTML elements and the DOM, according to your program data and logic.
Angular supports *two-way data binding*, meaning that changes in the DOM, such as user choices, are also reflected in your program data.

Your templates can use *pipes* to improve the user experience by transforming values for display.
For example, use pipes to display dates and currency values that are appropriate for a user's locale.
Angular provides predefined pipes for common transformations, and you can also define your own pipes.

<div class="alert is-helpful">

For a more detailed discussion of these concepts, see [Introduction to components](guide/architecture-components).

</div>

<a id="dependency-injection"></a>

## Services and dependency injection

For data or logic that isn't associated with a specific view, and that you want to share across components, you create a *service* class.
A service class definition is immediately preceded by the `@Injectable()` decorator.
The decorator provides the metadata that allows other providers to be **injected** as dependencies into your class.

*Dependency injection* \(DI\) lets you keep your component classes lean and efficient.
They don't fetch data from the server, validate user input, or log directly to the console; they delegate such tasks to services.

<div class="alert is-helpful">

For a more detailed discussion, see [Introduction to services and DI](guide/architecture-services).

</div>

### Routing

The Angular `Router` package provides a service that lets you define a navigation path among the different application states and view hierarchies in your application.
It is modeled on the familiar browser navigation conventions:

*   Enter a URL in the address bar and the browser navigates to a corresponding page
*   Click links on the page and the browser navigates to a new page
*   Click the browser's back and forward buttons and the browser navigates backward and forward through the history of pages you've seen

The router maps URL-like paths to components instead of pages.
When a user performs an action, such as clicking a link, that would load a new component in the browser, the router intercepts the browser's behavior, and shows or hides that component (and its child components).

If the router determines that the current application state requires a component that hasn't been loaded, the router can *lazy-load* that component and its related dependencies.

The router interprets a link URL according to your application's view navigation rules and data state.
You can navigate to new views when the user clicks a button or selects from a drop box, or in response to some other stimulus from any source.
The router logs activity in the browser's history, so the back and forward buttons work as well.

To define navigation rules, you associate *navigation paths* with your components.
A path uses a URL-like syntax that integrates your program data, in much the same way that template syntax integrates your views with your program data.
You can then apply program logic to choose which views to show or to hide, in response to user input and your own access rules.

<div class="alert is-helpful">

For a more detailed discussion, see [Routing and navigation](guide/router).

</div>

## What's next

You've discovered the main building blocks of an Angular application.
Learn a bit more about them in the following architecture pages.

*   [Introduction to Components](guide/architecture-components)
    *   [Templates and views](guide/architecture-components#templates-and-views)
    *   [Component metadata](guide/architecture-components#component-metadata)
    *   [Data binding](guide/architecture-components#data-binding)
    *   [Directives](guide/architecture-components#directives)
    *   [Pipes](guide/architecture-components#pipes)
*   [Introduction to services and dependency injection](guide/architecture-services)

When you're familiar with these fundamental building blocks, you can explore them in greater detail in the documentation.

You may also be interested in [tools and techniques](guide/architecture-next-steps) to help you build and deploy Angular applications.

</div>

<!-- links -->

<!-- external links -->

<!-- end links -->

@reviewed 2023-09-25
