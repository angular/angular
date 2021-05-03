# Guidelines for creating NgModules

This topic provides a conceptual overview of the different categories of [NgModules](guide/glossary#ngmodule "Definition of NgModule") you can create in order to organize your code in a modular structure.
These categories are not cast in stone—they are suggestions.
You may want to create NgModules for other purposes, or combine the characteristics of some of these categories.

NgModules are a great way to organize an app and keep code related to a specific functionality or feature separate from other code.
Use NgModules to consolidate [components](guide/glossary#component "Definition of component"), [directives](guide/glossary#directive "Definition of directive"), and [pipes](guide/glossary#pipe "Definition of pipe)") into cohesive blocks of functionality.
Focus each block on a feature or business domain, a workflow or navigation flow, a common collection of utilities, or one or more [providers](guide/glossary#provider "Definition of provider") for [services](guide/glossary#service "Definition of service").

For more about NgModules, see [Organizing your app with NgModules](guide/ngmodules "Organizing your app with NgModules").

<div class="alert is-helpful">

For the example app used in NgModules-related topics, see the <live-example name="ngmodules"></live-example>.

</div>

## Summary of NgModule categories

All apps start by [bootstrapping a root NgModule](guide/bootstrapping "Launching an app with a root NgModule").
You can organize your other NgModules any way you wish.

This topic provides some guidelines for the following general categories of NgModules:

* [Domain](#domain): A domain NgModule is organized around a feature, business domain, or user experience.
* [Routed](#routed): The top component of the NgModule acts as the destination of a [router](guide/glossary#router "Definition of router") navigation route.
* [Routing](#routing): A routing NgModule provides the routing configuration for another NgModule.
* [Service](#service): A service NgModule provides utility services such as data access and messaging.
* [Widget](#widget): A widget NgModule makes a component, directive, or pipe available to other NgModules.
* [Shared](#shared): A shared NgModule makes a set of components, directives, and pipes available to other NgModules.

The following table summarizes the key characteristics of each category.

<table>
 <tr>
   <th style="vertical-align: top">
     NgModule
   </th>

   <th style="vertical-align: top">
     Declarations
   </th>

   <th style="vertical-align: top">
     Providers
   </th>

   <th style="vertical-align: top">
     Exports
   </th>

   <th style="vertical-align: top">
     Imported by
   </th>
 </tr>

 <tr>
   <td>Domain</td>
   <td>Yes</td>
   <td>Rare</td>
   <td>Top component</td>
   <td>Another domain, AppModule</td>
 </tr>

 <tr>
   <td>Routed</td>
   <td>Yes</td>
   <td>Rare</td>
   <td>No</td>
   <td>None</td>
 </tr>

 <tr>
   <td>Routing</td>
   <td>No</td>
   <td>Yes (Guards)</td>
   <td>RouterModule</td>
   <td>Another domain (for routing)</td>
 </tr>

 <tr>
   <td>Service</td>
   <td>No</td>
   <td>Yes</td>
   <td>No</td>
   <td>AppModule</td>
 </tr>

 <tr>
   <td>Widget</td>
   <td>Yes</td>
   <td>Rare</td>
   <td>Yes</td>
   <td>Another domain</td>
 </tr>

 <tr>
   <td>Shared</td>
   <td>Yes</td>
   <td>No</td>
   <td>Yes</td>
   <td>Another domain</td>
 </tr>
</table>

{@a domain}

## Domain NgModules

Use a domain NgModule to deliver a user experience dedicated to a particular feature or app domain, such as editing a customer or placing an order.
One example is `ContactModule` in the <live-example name="ngmodules"></live-example>.

A domain NgModule organizes the code related to a certain function, containing all of the components, routing, and templates that make up the function.
Your top component in the domain NgModule acts as the feature or domain's root, and is the only component you export.
Private supporting subcomponents descend from it.

Import a domain NgModule exactly once into another NgModule, such as a domain NgModule, or into the root NgModule (`AppModule`) of an app that contains only a few NgModules.

Domain NgModules consist mostly of declarations.
You rarely include providers.
If you do, the lifetime of the provided services should be the same as the lifetime of the NgModule.

<div class="alert is-helpful">

For more information about lifecycles, see [Hooking into the component lifecycle](guide/lifecycle-hooks "Hooking into the component lifecycle").

</div>

{@a routed}

## Routed NgModules

Use a routed NgModule for all [lazy-loaded NgModules](guide/lazy-loading-ngmodules "Lazy-loading an NgModule").
Use the top component of the NgModule as the destination of a router navigation route.
Routed NgModules don’t export anything because their components never appear in the template of an external component.

Don't import a lazy-loaded routed NgModule into another NgModule, as this would trigger an eager load, defeating the purpose of lazy loading.

Routed NgModules rarely have providers because you load a routed NgModule only when needed (such as for routing).
Services listed in the NgModules' `provider` array would not be available because the root injector wouldn’t know about the lazy-loaded NgModule.
If you include providers, the lifetime of the provided services should be the same as the lifetime of the NgModule.
Don't provide app-wide [singleton services](guide/singleton-services) in a routed NgModule or in an NgModule that the routed NgModule imports.

<div class="alert is-helpful">

For more information about providers and lazy-loaded routed NgModules, see [Limiting provider scope](guide/providers#limiting-provider-scope-by-lazy-loading-modules "Providing dependencies: Limiting provider scope").

</div>

{@a routing}

## Routing NgModules

Use a routing NgModule to provide the routing configuration for a domain NgModule, thereby separating routing concerns from its companion domain NgModule.
One example is `ContactRoutingModule` in the <live-example name="ngmodules"></live-example>, which provides the routing for its companion domain NgModule `ContactModule`.

<div class="alert is-helpful">

For an overview and details about routing, see [In-app navigation: routing to views](guide/router "In-app navigation: routing to views").

</div>

Use a routing NgModule to do the following tasks:

* Define routes.
* Add router configuration to the NgModule's import.
* Add guard and resolver service providers to the NgModule's providers.

The name of the routing NgModule should parallel the name of its companion NgModule, using the suffix `Routing`.
For example, <code>ContactModule</code> in <code>contact.module.ts</code> has a routing NgModule named <code>ContactRoutingModule</code> in <code>contact-routing.module.ts</code>.

Import a routing NgModule only into its companion NgModule.
If the companion NgModule is the root <code>AppModule</code>, the <code>AppRoutingModule</code> adds router configuration to its imports with <code>RouterModule.forRoot(routes)</code>.
All other routing NgModules are children that import <code>RouterModule.forChild(routes)</code>.

In your routing NgModule, re-export the <code>RouterModule</code> as a convenience so that components of the companion NgModule have access to router directives such as <code>RouterLink</code> and <code>RouterOutlet</code>.

Don't use declarations in a routing NgModule.
Components, directives, and pipes are the responsibility of the companion domain NgModule, not the routing NgModule.

{@a service}

## Service NgModules

Use a service NgModule to provide a utility service such as data access or messaging.
Ideal service NgModules consist entirely of providers and have no declarations.
Angular's `HttpClientModule` is a good example of a service NgModule.

Use only the root `AppModule` to import service NgModules.

{@a widget}

## Widget NgModules

Use a widget NgModule to make a component, directive, or pipe available to external NgModules.
Import widget NgModules into any NgModules that need the widgets in their templates.
Many third-party UI component libraries are provided as widget NgModules.

A widget NgModule should consist entirely of declarations, most of them exported.
It would rarely have providers.

{@a shared}

## Shared NgModules

Put commonly used directives, pipes, and components into one NgModule, typically named `SharedModule`, and then import just that NgModule wherever you need it in other parts of your app.
You can import the shared NgModule in your domain NgModules, including [lazy-loaded NgModules](guide/lazy-loading-ngmodules "Lazy-loading an NgModule").
One example is `SharedModule` in the <live-example name="ngmodules"></live-example>, which provides the `AwesomePipe` custom pipe and `HighlightDirective` directive.

Shared NgModules should not include providers, nor should any of its imported or re-exported NgModules include providers.

To learn how to use shared modules to organize and streamline your code, see [Sharing NgModules in an app](guide/sharing-ngmodules "Sharing NgModules in an app").

## Next steps

You may also be interested in the following:

* For more about NgModules, see [Organizing your app with NgModules](guide/ngmodules "Organizing your app with NgModules").
* To learn more about the root NgModule, see [Launching an app with a root NgModule](guide/bootstrapping "Launching an app with a root NgModule").
* To learn about frequently used Angular NgModules and how to import them into your app, see [Frequently-used modules](guide/frequent-ngmodules "Frequently-used modules").
* For a complete description of the NgModule metadata properties, see [Using the NgModule metadata](guide/ngmodule-api "Using the NgModule metadata").

If you want to manage NgModule loading and the use of dependencies and services, see the following:

* To learn about loading NgModules eagerly when the app starts, or lazy-loading NgModules asynchronously by the router, see [Lazy-loading feature modules](guide/lazy-loading-ngmodules).
* To understand how to provide a service or other dependency for your app, see [Providing Dependencies for an NgModule](guide/providers "Providing Dependencies for an NgModule").
* To learn how to create a singleton service to use in NgModules, see [Making a service a singleton](guide/singleton-services "Making a service a singleton").
