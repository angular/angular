# Architecture Overview

Angular is a platform and framework for building client applications in HTML and TypeScript.
Angular is itself written in TypeScript. It implements core and optional functionality as a set of TypeScript libraries that you import into your apps.

The basic building blocks of an Angular application are _NgModules_, which provide a compilation context for _components_. NgModules collect related code into functional sets; an Angular app is defined by a set of NgModules. An app always has at least a _root module_ that enables bootstrapping, and typically has many more _feature modules_.

* Components define *views*, which are sets of screen elements that Angular can choose among and modify according to your program logic and data. Every app has at least a root component.

* Components use *services*, which provide specific functionality not directly related to views. Service providers can be *injected* into components as *dependencies*, making your code modular, reusable, and efficient.

Both components and services are simply classes, with *decorators* that mark their type and provide metadata that tells Angular how to use them.

* The metadata for a component class associates it with a *template* that defines a view. A template combines ordinary HTML with Angular *directives* and *binding markup* that allow Angular to modify the HTML before rendering it for display.

* The metadata for a service class provides the information Angular needs to make it available to components through *Dependency Injections (DI)*.

An app's components typically define many views, arranged hierarchically. Angular provides the *Router* service to help you define navigation paths among views. The router provides sophisticated in-browser navigational capabilities.

## Modules

Angular defines the `NgModule`, which differs from and complements the JavaScript module. An NgModule declares a compilation context for a set of components that is dedicated to an application domain, a workflow, or a closely related set of capabilities. An NgModule can associate its components with related code, such as services, to form functional units.

Every Angular app has a _root module_, conventionally named `AppModule`, which provides the bootstrap mechanism that launches the application. An app typically contains many functional modules.

Like JavaScript modules, NgModules can import functionality from other NgModules, and allow their own functionality to be exported and used by other NgModules.

Organizing your code into distinct functional modules helps in managing development of complex applications, and in designing for reusability. In addition, this technique lets you take advantage of _lazy-loading_&mdash;that is, loading modules on demand&mdash;in order to minimize the amount of code that needs to be loaded at startup.

<div class="l-sub-section">

  For a more detailed discussion, see [Introduction to Modules](guide/architecture-modules).

</div>

## Components

Every Angular application has at least one component, the *root component* that connects a component hierarchy with the page DOM. Each component defines a class that contains application data and logic, and is associated with an HTML *template* that defines a view to be displayed in a target environment.

The `@Component` decorator identifies the class immediately below it as a component, and provides the template and related component-specific metadata.

<div class="l-sub-section">

   Decorators are functions that modify JavaScript classes. Angular defines a number of such decorators that attach specific kinds of metadata to classes, so that it knows what those classes mean and how they should work.

   <a href="https://medium.com/google-developers/exploring-es7-decorators-76ecb65fb841#.x5c2ndtx0">Learn more about decorators on the web.</a>

</div>

### Templates, directives, and data binding

A template combines HTML with Angular markup that can modify the HTML elements before they are displayed.
Template *directives* provide program logic, and *binding markup* connects your application data and the document object model (DOM).

* *Event binding* lets your app respond to user input in the target environment by updating your application data.
* *Property binding* lets you interpolate values that are computed from your application data into the HTML.  

Before a view is displayed, Angular evaluates the directives and resolves the binding syntax in the template to modify the HTML elements and the DOM, according to your program data and logic. Angular supports *two-way data binding*, meaning that changes in the DOM, such as user choices, can also be reflected back into your program data.

Your templates can also use *pipes* to improve the user experience by transforming values for display. Use pipes to display, for example, dates and currency values in a way appropriate to the user's locale. Angular provides predefined pipes for common transformations, and you can also define your own.

<div class="l-sub-section">

  For a more detailed discussion of these concepts, see [Introduction to Components](guide/architecture-components).

</div>

## Services

For data or logic that is not associated with a specific view, and that you want to share across components, you create a *service* class. A service class definition is immediately preceded by the `@Injectable` decorator. The decorator provides the metadata that allows your service to be *injected* into client components as a dependency.

 *Dependency injection* (or DI) lets you keep your component classes lean and efficient. They don't fetch data from the server, validate user input, or log directly to the console; they delegate such tasks to services.

<div class="l-sub-section">

  For a more detailed discusssion, see [Introduction to Services and DI](guide/architecture-services).

</div>

## Routing

The Angular Router is a service that lets you define a navigation path among the different application states and view hierarchies in your app. It is modeled on the familiar browser navigation conventions:

* Enter a URL in the address bar and the browser navigates to a corresponding page.
* Click links on the page and the browser navigates to a new page.
* Click the browser's back and forward buttons and the browser navigates
  backward and forward through the history of pages you've seen.

The Router maps URL-like paths to views instead of pages. When a user performs an action, such as clicking a link, that would load a new page in the browser, the router intercepts the browser's behavior, and shows or hides view hierarchies.  

If the router determines that the current application state requires particular functionality, and the module that defines it has not been loaded, the router can _lazy-load_ the module on demand.

The Router interprets a link URL according to your app's view navigation rules and data state. You can navigate to new views when the user clicks a button, selects from a drop box, or in response to some other stimulus from any source. The Router logs activity in the browser's history journal, so the back and forward buttons work as well.

To define navigation rules, you associate *navigation paths* with your components. A path uses a URL-like syntax that integrates your program data, in much the same way that template syntax integrates your views with your program data. You can then apply program logic to choose which views to show or to hide, in response to user input and your own access rules.

 <div class="l-sub-section">

   For a more detailed discussion, see **Introduction to Routing** (link tbd).

 </div>

<hr/>

## What's next

You've learned the basics about the main building blocks of an Angular application. The following diagram shows how these basic pieces are related. _(new, better picutre -- add router?)_

<figure>
  <img src="generated/images/guide/architecture/overview2.png" alt="overview">
</figure>

* Together, a component and template define an Angular view.
  * A decorator on a component class adds the metadata, including a pointer to the associated template.
  * Directives and binding markup in a component's template modify views based on program data and logic.
* The Dependency Injector provides services to a component, such as the Router service that lets you define navigation among views.

Each of these subjects is introduced in more detail in the following pages.

* [Modules](guide/architecture-modules)
* [Components](guide/architecture-components)
  * [Templates](guide/architecture-components#templates)
  * [Metadata](guide/architecture-components#component-metadata)
  * [Data binding](guide/architecture-components#data-binding)
  * [Directives](guide/architecture-components#directives)
  * [Pipes](guide/pipes) (intro section tbd)
* [Services and dependency injection](guide/architecture-services)
* [Routing and navigation](guide/router) (intro page TBD)

<div class="l-sub-section">

  The code referenced on these pages is available as a <live-example></live-example>.

</div>

### What else is there?

 Angular provides a lot more features and services that are (or soon will be) covered in this documentation.

#### Responsive programming tools

   * [Lifecycle hooks](guide/lifecycle-hooks): Tap into key moments in the lifetime of a component, from its creation to its destruction, by implementing the lifecycle hook interfaces.

   * _Observables and event processing_: (link TBD) How to use Observables with components and services to publish and subscribe to messages of any type, such as user-interaction events and asynchronous operation results.

   * _Change detection_: (link TBD) How Angular decides that a component property value has changed and when to update the screen, and how Angular uses _zones_ to intercept asynchronous activity and run its change detection strategies.

#### Client-server interaction tools

  * [HTTP](guide/http): Communicate with a server to get data, save data, and invoke server-side actions with an HTTP client.

  * [Server-side Rendering](guide/universal): Angular Universal generates static application pages on the server through server-side rendering (SSR). This allows you to run your Angular app on the server in order to improve performance and show the first page quickly on mobile and low-powered devices, and also facilitate web crawlers.

  * *Service Workers*: (link TBD) A service worker is a script that runs in the web browser and manages caching for an application. Service workers function as a network proxy. They intercept outgoing HTTP requests and can, for example, deliver a cached response if one is available. You can significantly improve the user experience by using a service worker to reduce dependency on the network.

#### Libraries for complex tasks   

   * [Animations](guide/animations): Animate component behavior
without deep knowledge of animation techniques or CSS with Angular's animation library.

   * [Forms](guide/forms): Support complex data entry scenarios with HTML-based validation and dirty checking.

#### Support for the development cycle

   * [Testing Platform](guide/testing): Run unit tests on your application parts as they interact with the Angular framework.

   * [Internationalization](guide/i18n):  Angular's internationalization (i18n) tools can help you make your app available in multiple languages.

   * [Compilation](guide/aot-compiler): Angular provides just-in-time (JIT) and ahead-of-time (AOT) compilation.

   * [Security guidelines](guide/security):

#### Setup and deployment tools

   * [Setup for local development](guide/setup): _includes guide/setup-systemjs-anatomy, guide/visual-studio-2015_

   * [Installation](guide/npm-packages):

   * [Configuration](guide/typescript-configuration):

   * [Browser support](guide/browser-support):

   * [Deployment](guide/deployment):

<hr/>
