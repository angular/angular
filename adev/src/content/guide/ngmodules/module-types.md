# Guidelines for creating NgModules

This topic provides a conceptual overview of the different categories of NgModules you can create in order to organize your code in a modular structure.
These categories are not cast in stone —they are suggestions.
You may want to create NgModules for other purposes, or combine the characteristics of some of these categories.

NgModules are a great way to organize an application and keep code related to a specific functionality or feature separate from other code.
Use NgModules to consolidate components, directives, and pipes into cohesive blocks of functionality.
Focus each block on a feature or business domain, a workflow or navigation flow, a common collection of utilities, or one or more providers for services.

## Summary of NgModule categories

All applications start by [bootstrapping a root NgModule](/guide/ngmodules/bootstrapping "Launching an app with a root NgModule").
You can organize your other NgModules any way you want.

This topic provides some guidelines for the following general categories of NgModules:

| Category            | Details |
|:---                 |:---     |
| [Domain](#domain-ngmodules)   | Is organized around a feature, business domain, or user experience.                                                                         |
| [Routing](#routing-ngmodules) | Provides the routing configuration for another NgModule.                                                                                    |
| [Service](#service-ngmodules) | Provides utility services such as data access and messaging.                                                                                |
| [Widget](#widget-ngmodules)   | Makes a component, directive, or pipe available to other NgModules.                                                                         |
| [Shared](#shared-ngmodules)   | Makes a set of components, directives, and pipes available to other NgModules.                                                              |

The following table summarizes the key characteristics of each category.

| NgModule | Declarations | Providers      | Exports       | Imported by |
|:---      |:---          |:---            |:---           |:---         |
| Domain   | Yes          | Rare           | Top component | Another domain, `AppModule`    |
| Routed   | Yes          | Rare           | No            | None                           |
| Routing  | No           | Yes \(Guards\) | RouterModule  | Another domain \(for routing\) |
| Service  | No           | Yes            | No            | `AppModule`                    |
| Widget   | Yes          | Rare           | Yes           | Another domain                 |
| Shared   | Yes          | No             | Yes           | Another domain                 |

## Domain NgModules

Use a domain NgModule to deliver a user experience dedicated to a particular feature or application domain, such as editing a customer or placing an order.

A domain NgModule organizes the code related to a certain function, containing all of the components, routing, and templates that make up the function.
Your top component in the domain NgModule acts as the feature or domain's root, and is the only component you export.
Private supporting subcomponents descend from it.

Import a domain NgModule exactly once into another NgModule, such as a domain NgModule, or into the root NgModule (`AppModule`) of an application that contains only a few NgModules.

Domain NgModules consist mostly of declarations.
You rarely include providers.
If you do, the lifetime of the provided services should be the same as the lifetime of the NgModule.

## Routing NgModules

Use a routing NgModule to provide the routing configuration for a domain NgModule, thereby separating routing concerns from its companion domain NgModule.

HELPFUL: For an overview and details about routing, see [In-app navigation: routing to views](/guide/routing "In-app navigation: routing to views").

Use a routing NgModule to do the following tasks:

* Define routes
* Add router configuration to the NgModule via `imports`
* Add guard and resolver service providers to the NgModule's providers

The name of the routing NgModule should parallel the name of its companion NgModule, using the suffix `Routing`.
For example, consider a `ContactModule` in `contact.module.ts` has a routing NgModule named `ContactRoutingModule` in `contact-routing.module.ts`.

Import a routing NgModule only into its companion NgModule.
If the companion NgModule is the root `AppModule`, the `AppRoutingModule` adds router configuration to its imports with `RouterModule.forRoot(routes)`.
All other routing NgModules are children that import using `RouterModule.forChild(routes)`.

In your routing NgModule, re-export the `RouterModule` as a convenience so that components of the companion NgModule have access to router directives such as `RouterLink` and `RouterOutlet`.

Don't use declarations in a routing NgModule.
Components, directives, and pipes are the responsibility of the companion domain NgModule, not the routing NgModule.

## Service NgModules

Use a service NgModule to provide a utility service such as data access or messaging.
Ideal service NgModules consist entirely of providers and have no declarations.
Angular's `HttpClientModule` is a good example of a service NgModule.

Use only the root `AppModule` to import service NgModules.

## Widget NgModules

Use a widget NgModule to make a component, directive, or pipe available to external NgModules.
Import widget NgModules into any NgModules that need the widgets in their templates.
Many third-party UI component libraries are provided as widget NgModules.

A widget NgModule should consist entirely of declarations, most of them exported.
It would rarely have providers.

## Shared NgModules

Put commonly used directives, pipes, and components into one NgModule, typically named `SharedModule`, and then import just that NgModule wherever you need it in other parts of your application.
You can import the shared NgModule in your domain NgModules, including [lazy-loaded NgModules](/guide/ngmodules/lazy-loading "Lazy-loading an NgModule").

Note: Shared NgModules should not include providers, nor should any of its imported or re-exported NgModules include providers.

To learn how to use shared modules to organize and streamline your code, see [Sharing NgModules in an app](/guide/ngmodules/sharing "Sharing NgModules in an app").

## Next steps

If you want to manage NgModule loading and the use of dependencies and services, see the following:

* To learn about loading NgModules eagerly when the application starts, or lazy-loading NgModules asynchronously by the router, see [Lazy-loading feature modules](/guide/ngmodules/lazy-loading)
* To understand how to provide a service or other dependency for your app, see [Providing Dependencies for an NgModule](/guide/ngmodules/providers "Providing Dependencies for an NgModule")
* To learn how to create a singleton service to use in NgModules, see [Making a service a singleton](/guide/ngmodules/singleton-services "Making a service a singleton")
