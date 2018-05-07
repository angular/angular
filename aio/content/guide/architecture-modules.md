# Introduction to modules

<img src="generated/images/guide/architecture/module.png" alt="Module" class="left">

Angular apps are modular and Angular has its own modularity system called _NgModules_. An NgModule is a container for a cohesive block of code dedicated to an application domain, a workflow, or a closely related set of capabilities. It can contain components, service providers, and other code files whose scope is defined by the containing NgModule. It can import functionality that is exported from other NgModules, and export selected functionality for use by other NgModules.

Every Angular app has at least one NgModule class, [the _root module_](guide/bootstrapping), which is conventionally named `AppModule` and resides in a file named `app.module.ts`. You launch your app by *bootstrapping* the root NgModule.

While a small application might have only one NgModule, most apps have many more _feature modules_. The _root_ NgModule for an app is so named because it can include child NgModules in a hierarchy of any depth.

## NgModule metadata

An NgModule is defined as a class decorated with `@NgModule`. The `@NgModule` decorator is a function that takes a single metadata object, whose properties describe the module. The most important properties are as follows.

* `declarations`&mdash;The [components](guide/architecture-components), _directives_, and _pipes_ that belong to this NgModule.

* `exports`&mdash;The subset of declarations that should be visible and usable in the _component templates_ of other NgModules.

* `imports`&mdash;Other modules whose exported classes are needed by component templates declared in _this_ NgModule.

* `providers`&mdash;Creators of [services](guide/architecture-services) that this NgModule contributes to the global collection of services; they become accessible in all parts of the app. (You can also specify providers at the component level, which is often preferred.)

* `bootstrap`&mdash;The main application view, called the _root component_, which hosts all other app views. Only the _root NgModule_ should set this `bootstrap` property.

Here's a simple root NgModule definition:

<code-example path="architecture/src/app/mini-app.ts" region="module" title="src/app/app.module.ts" linenums="false"></code-example>

<div class="l-sub-section">

  The `export` of `AppComponent` is just to show how to export; it isn't actually necessary in this example. A root NgModule has no reason to _export_ anything because other modules don't need to _import_ the root NgModule.

</div>

## NgModules and components

NgModules provide a _compilation context_ for their components. A root NgModule always has a root component that is created during bootstrap, but any NgModule can include any number of additional components, which can be loaded through the router or created through the template. The components that belong to an NgModule share a compilation context.

<figure>

<img src="generated/images/guide/architecture/compilation-context.png" alt="Component compilation context" class="left">

</figure>

<br class="clear">

A component and its template together define a _view_. A component can contain a _view hierarchy_, which allows you to define arbitrarily complex areas of the screen that can be created, modified, and destroyed as a unit. A view hierarchy can mix views defined in components that belong to different NgModules. This is often the case, especially for UI libraries.

<figure>

<img src="generated/images/guide/architecture/view-hierarchy.png" alt="View hierarchy" class="left">

</figure>

<br class="clear">

When you create a component, it is associated directly with a single view, called the _host view_. The host view can be the root of a view hierarchy, which can contain _embedded views_, which are in turn the host views of other components. Those components can be in the same NgModule, or can be imported from other NgModules. Views in the tree can be nested to any depth.

<div class="l-sub-section">
    The hierarchical structure of views is a key factor in the way Angular detects and responds to changes in the DOM and app data. 
</div>

## NgModules and JavaScript modules

The NgModule system is different from and unrelated to the JavaScript (ES2015) module system for managing collections of JavaScript objects. These are two different and _complementary_ module systems. You can use them both to write your apps.

In JavaScript each _file_ is a module and all objects defined in the file belong to that module.
The module declares some objects to be public by marking them with the `export` key word.
Other JavaScript modules use *import statements* to access public objects from other modules.

<code-example path="architecture/src/app/app.module.ts" region="imports" linenums="false"></code-example>

<code-example path="architecture/src/app/app.module.ts" region="export" linenums="false"></code-example>

<div class="l-sub-section">
  <a href="http://exploringjs.com/es6/ch_modules.html">Learn more about the JavaScript module system on the web.</a>
</div>

## Angular libraries

<img src="generated/images/guide/architecture/library-module.png" alt="Component" class="left">

Angular ships as a collection of JavaScript modules. You can think of them as library modules. Each Angular library name begins with the `@angular` prefix. Install them with the `npm` package manager and import parts of them with JavaScript `import` statements.

<br class="clear">

For example, import Angular's `Component` decorator from the `@angular/core` library like this:

<code-example path="architecture/src/app/app.component.ts" region="import" linenums="false"></code-example>

You also import NgModules from Angular _libraries_ using JavaScript import statements:

<code-example path="architecture/src/app/mini-app.ts" region="import-browser-module" linenums="false"></code-example>

In the example of the simple root module above, the application module needs material from within the `BrowserModule`. To access that material, add it to the `@NgModule` metadata `imports` like this.

<code-example path="architecture/src/app/mini-app.ts" region="ngmodule-imports" linenums="false"></code-example>

In this way you're using both the Angular and JavaScript module systems _together_. Although it's easy to confuse the two systems, which share the common vocabulary of "imports" and "exports", you will become familiar with the different contexts in which they are used.

<div class="l-sub-section">

  Learn more from the [NgModules](guide/ngmodules) page.

</div>

<hr/>
