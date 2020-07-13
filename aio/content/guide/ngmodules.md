# Organizing your app with NgModules

This topic provides a conceptual overview of an [NgModule](guide/glossary#ngmodule "Definition of NgModule").
Use NgModules in your app to keep the code related to a specific feature or area of functionality separate from other code.
Keeping your code organized makes it easier to understand and debug, and can also help you optimize a large app's performance.

<div class="alert is-helpful">

For the example app used in NgModules-related topics, see the <live-example></live-example>.

</div>

## NgModules Overview

Use NgModules to create distinct and independent units of code such that each unit has everything it needs to execute.
NgModules make it easy to split up a large app into easily managed chunks, which the browser can then load when needed rather than loading everything at once.
You can also use NgModules to help simplify the process of developing a large project by having different developers work on various aspects of the project.

<div class="alert is-important">

NgModules are different from and unrelated to the JavaScript module system for managing collections of JavaScript objects.
Angular loads as a collection of JavaScript modules, but NgModules are specific to Angular apps.
For details, see [JavaScript modules vs. NgModules](guide/ngmodule-vs-jsmodule "JavaScript modules vs. NgModules").

</div>

You can consolidate [components](guide/glossary#component "Definition of component"), [directives](guide/glossary#directive "Definition of directive"), and [pipes](guide/glossary#pipe "Definition of pipe)") into cohesive NgModules, each focused on a feature area, application business domain, workflow, or common collection of utilities.
You can also declare [services](guide/glossary#service "Definition of service") that the NgModule can add to your app, including services from outside sources.

Angular libraries, such as [`FormsModule`](api/forms/FormsModule "FormsModule API"), [`HttpClientModule`](api/common/http/HttpClientModule "HttpClientModule API"), and [`RouterModule`](api/router/RouterModule "RouterModule API"), are provided as NgModules, consolidating the code needed for a particular set of features.
Many third-party libraries are also available as NgModules such as
<a href="https://material.angular.io/">Material Design</a>,
<a href="http://ionicframework.com/">Ionic</a>, and
<a href="https://github.com/angular/angularfire2">AngularFire2</a>.
You can import these and other external NgModules into your app in order to use their features.

## How the NgModule metadata works

An [NgModule](guide/glossary#ngmodule "Definition of NgModule") is a class marked by the `@NgModule` decorator with a metadata object that describes how that particular part of the app fits together with the other parts.
Every Angular app starts with the root NgModule, as described in the next section.
The NgModule metadata plays an important role in guiding the Angular compilation process that converts the app code you write into highly performant JavaScript code.

The metadata describes how to compile a component's template and how to create an [injector](guide/glossary#injector "Definition of injector") at runtime.
It identifies the NgModule's components, directives, and pipes,
and makes some of them public through the `exports` property so that external components can use them.
An NgModule can also add service [providers](guide/glossary#provider "Definition of provider") to the app's dependency injectors, so that the services are available elsewhere in your app.

Use the NgModule metadata properties to configure your code as follows:

* Declare which components, directives, and pipes belong to the NgModule.
These classes are called [declarables](guide/glossary#declarable "Definition of a declarable").
* Make some of those declarables public so that components and templates in other NgModules can use them.
* Import _other_ NgModules so that you can use their declarables in the current NgModule.
* Provide services that components in other NgModules can use.

For a complete description of the NgModule metadata properties, see [Using the NgModule metadata](guide/ngmodule-api "Using the NgModule metadata").

## Start your app with the root NgModule

Every Angular app has at least one NgModule, known as the _root NgModule_, to [launch the app](guide/bootstrapping "Launching an app with a root NgModule").
The root NgModule for an app is so named because it can include child NgModules in a hierarchy of any depth.

The [Angular CLI](cli) generates the root, called `AppModule`, in the `app.module.ts` file when you use the `ng new` command to create a new app:

<code-example path="ngmodules/src/app/app.module.1.ts" header="src/app/app.module.ts (default AppModule)"></code-example>

The root NgModule starts with `import` statements to import JavaScript modules.
It then configures the `@NgModule` by stating what components, pipes, and directives belong to it (`declarations`), and which other _NgModules_ it uses (`imports`).

The root is all you need for an app with only a few components.
As you add more components for more features, add them as NgModules.
Separate your code into NgModules for each feature or collection of related functionality.

## Next steps

1. Modify the root NgModule as needed, and use existing Angular NgModules with your app.

   * To learn more about the root NgModule, see [Launching an app with a root NgModule](guide/bootstrapping "Launching an app with a root NgModule").
   * To learn about frequently used Angular NgModules and how to import them into your app, see [Frequently-used NgModules](guide/frequent-ngmodules "Frequently-used NgModules").

2. Expand your app with features, routing, services, widgets, or other code organized with NgModules.

   * For guidance on how to use NgModules for organizing different areas of your code, see [Guidelines for creating NgModules](guide/module-types "Guidelines for creating NgModules").
   * For a complete description of the NgModule metadata properties, see [Using the NgModule metadata](guide/ngmodule-api "Using the NgModule metadata").
   * For step-by-step instructions on creating an NgModule and importing it into your app, see [Creating a new NgModule](guide/feature-modules "Creating a new NgModule").
   * To learn how to use shared modules to organize and streamline your code, see [Sharing NgModules in an app](guide/sharing-ngmodules "Sharing NgModules in an app").

3. Manage NgModule loading and the use of dependencies and services.

   * To learn about loading NgModules as part of the app launch (known as "eager loading") versus loading some NgModules only when needed by the router (known as "lazy loading"), see [Lazy-loading an NgModule](guide/lazy-loading-ngmodules "Lazy-loading an NgModule").
   * To understand how to provide a service or other dependency for your app, see [Providing dependencies for an NgModule](guide/providers "Providing dependencies for an NgModule").
   * To learn how to create a singleton service to use in NgModules, see [Making a service a singleton](guide/singleton-services "Making a service a singleton").
