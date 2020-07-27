# Using the NgModule metadata

An [NgModule](guide/glossary#ngmodule "Definition of NgModule") is a class marked by the `@NgModule` decorator with a metadata object that describes how that particular part of the app fits together with the other parts.

## Prerequisites

This topic requires a basic understanding of the following:

* [Typescript](guide/glossary#typescript "Definition of Typescript") and HTML5 programming
* [Templates](guide/glossary#template "Definition of a template") in HTML with CSS styles
* [Components](guide/glossary#component "Definition of a component")
* [Angular CLI](cli "Angular CLI")
* [Organizing your app with NgModules](guide/ngmodules "Organizing your app with NgModules")

## How the metadata guides compilation

The `@NgModule` metadata provides important information for the Angular compilation process that converts the app code you write into highly performant JavaScript code.
The metadata provides the following arrays:

* [`declarations`](#declarations): Which [components](guide/glossary#component "Definition of component"), [directives](guide/glossary#directive "Definition of directive"), and [pipes](guide/glossary#pipe "Definition of pipe)") belong to the NgModule.
  These classes are called [declarables](guide/glossary#declarable "Definition of a declarable").

* [`entryComponents`](#entry-components): A list of [entry components](guide/entry-components "Specifying an entry component") that can be dynamically loaded into the view.

* [`providers`](#providers-array): [Providers](guide/glossary#provider "Definition of provider") of [services](guide/glossary#service "Definition of a service") that components in other NgModules can use.

* [`bootstrap`](#bootstrap-array): The entry component that Angular creates and inserts into the `index.html` host web page, thereby bootstrapping the app.

* [`imports`](#imports): Other NgModules you are importing into this NgModule, so that you can use their declarables.

* [`exports`](#exports): A list of declarations (components, directives, and pipes) that another NgModule can use after importing this NgModule.

The following code excerpt shows how the metadata appears in the `@NgModule` decorator:

```typescript
@NgModule({
  // Static, that is compiler configuration
  declarations: [], // Configure the selectors
  entryComponents: [], // Generate the host factory

  // Runtime, or injector configuration
  providers: [], // Runtime injector configuration

  // Composability / Grouping
  imports: [], // composing NgModules together
  exports: [] // making NgModules available to other parts of the app
})
```

{@a declarations}

## The declarations array

The `declarations` array identifies the [declarables](guide/glossary#declarable "Definition of a declarable") ([components](guide/glossary#component "Definition of component"), [directives](guide/glossary#directive "Definition of directive"), and [pipes](guide/glossary#pipe "Definition of pipe)")) that belong to the NgModule.

All of the declarables for an NgModule must be in the NgModule's `declarations` array.
You can use the [Angular CLI](cli "Angular CLI") to [generate](cli/generate) a new component, directive, or pipe in your NgModule, so that the CLI automatically adds the declarable to the NgModule's `declarations` array.

Each component, directive, and pipe that you include in an NgModule's `declarations` array belongs _only_ to that NgModule.

*Do not* include the following in the `declarations` array:

* A class that's already declared in another NgModule, another [Javascript module](guide/ngmodule-vs-jsmodule "JavaScript modules vs. NgModules"), or a third-party module or NgModule.
  The compiler emits an error if you try to declare the same class in more than one NgModule.
  For example, don't declare `FORMS_DIRECTIVES` from `@angular/forms` because the `FormsModule` already declares it.
  Be careful not to re-declare a class that is imported directly or indirectly from another NgModule.

* NgModule or service classes, or non-Angular classes and objects, such as strings, numbers, functions, entity models, configurations, business logic, or helper classes.

{@a entry-components}

## The entryComponents array

The `entryComponents` array describes the [entry components](guide/entry-components "Specifying an entry component") that you can dynamically load into the view.

If you use the CLI [new](cli/new "ng new") command to create an initial Angular app, the CLI creates one entry component, the root component called `AppComponent`, in the root NgModule `AppModule`.
This component serves as a point of entry into the app.
You [bootstrap](guide/glossary#bootstrap "Definition of bootstrap") it to launch the app, as described in the section about the [bootstrap array](#bootstrap-array).

[Routing components](guide/glossary#routing-component "Definition of routing component") are also entry components because they are loaded dynamically by the router.
The router creates them and drops them into the DOM near a `<router-outlet>`.
You don't have to add the routing components to an NgModule's `entryComponents` array because Angular adds them implicitly.

The only components you need to add manually to the `entryComponents` array are any components you are bootstrapping using one of the imperative techniques, such as [`ViewComponentRef.createComponent()`](api/core/ViewContainerRef#createComponent), as undiscoverable.
If you need to dynamically load components, add these components to the `entryComponents` array.
For more information, see [Specifying an entry component](guide/entry-components).

<div class="callout is-helpful">
<header>Why a component appears in both arrays</header>

`AppComponent` is listed in both the `declarations` and `bootstrap` arrays for the `AppModule` root NgModule.
You might see the same component listed in `exports` and `entryComponents`.
While that seems redundant, these metadata arrays have different functions.
Membership in one doesn't imply membership in another.
For example, you might declare `AppComponent` in your NgModule but not use it for bootstrapping, or `AppComponent` might be declared in a different NgModule.

</div>

{@a providers-array}

## The providers array

The `providers` array is a list of [dependency-injection](guide/glossary#dependency-injection-di "Definition of dependency injection") providers that describes the services that the app needs, and how to create an [injector](guide/glossary#injector "Definition of injector") at runtime for each service.
Angular registers the providers you include in this array with the NgModule's injector.

If you include a provider in the _root_ NgModule's `providers` array, it becomes the root injector.
Services for providers declared in the root become available for injection into any component, directive, pipe, or service which is a child of this injector.
You can scope service usage when [creating other NgModules](guide/feature-modules "Creating a new NgModule").

A [lazy-loaded NgModule](guide/lazy-loading-ngmodules "Lazy-loading an NgModule") has its own injector, which is typically a child of the root injector.
Lazy-loaded services are scoped to the lazy-loaded NgModule's injector.
If a lazy-loaded NgModule also provides the `UserService`, any component created within that NgModule's context (such as by router navigation) gets the local instance of the service, not the instance in the root injector.
Components in external NgModules continue to receive the instance provided by their injectors.

To learn more about service providers, see [Providing dependencies for an NgModule](guide/providers "Providing dependencies for an NgModule").

{@a bootstrap-array}

## The bootstrap array

The `bootstrap` array is list of components that Angular automatically bootstraps to start your app.

The Angular CLI command `ng new` generates the root NgModule for a new app project, as described in [Launching an app with a root NgModule](guide/bootstrapping "Launching an app with a root NgModule").
The app starts by launching the [entry component](guide/entry-components "Entry components") in the root NgModule's `bootstrap` array, which is `AppComponent`.

Your app typically has only this one component in this list.
However, Angular can launch with multiple bootstrap components, each with its own location in the host web page.
Angular creates each component that appears in the `bootstrap` array and inserts it into the browser DOM.
Each bootstrapped component is the base of its own tree of components.
Inserting a bootstrapped component usually triggers a cascade of component creations that fill out that tree.
Any component you add to `bootstrap` is automatically added to `entryComponents`.

{@a imports}

## The imports array

The NgModule's `imports` array describes other NgModules needed for this NgModule.
The `imports` array accepts only `@NgModule` references.
The other NgModules must export the needed components, directives, or pipes that this NgModule needs.

The other NgModules' exported components, directives, and pipes are treated as if they were declared in this NgModule.
You can therefore can use a component, directive, or pipe in this NgModule's templates.
For example, your component can use the `NgIf` and `NgFor` directives if your NgModule has imported `CommonModule` (perhaps indirectly by importing `BrowserModule`).

{@a exports}

## The exports array

The `exports` array is a list of declarations that another NgModule can use if the other NgModule imports this NgModule.

Export only [declarable](guide/glossary#declarable "Definition of a declarable") classes (components, directives, or pipes) that you want other NgModules to be able to use in their templates.
You can export any declarable whether it's declared in this NgModule or in an imported NgModule.
The declarables you export are your NgModule's _public_ classes.
If you don't export a declarable class, it stays _private_, visible only to other components declared in this NgModule.

For example, if an NgModule includes `UserComponent` in its `exports` array, components and templates in other NgModules can use `UserComponent` as long as the other NgModules import this NgModule.
If you don't include `UserComponent` in the `exports` array, only components and templates within this NgModule can use it.

## Re-exporting an entire NgModule

Importing an NgModule does _not_ automatically re-export the imported NgModule's imports.
For example, NgModule B can't use `ngIf` just because it imported NgModule A, which imported `CommonModule` in order to includer `ngIf`.
Module B must also import `CommonModule`.

However, you can add another NgModule to your NgModule's `exports` array so that all of the other NgModule's public components, directives, and pipes are _re-exported_ by your NgModule.
If NgModule A re-exports `CommonModule` and NgModule B imports NgModule A, NgModule B components can use `ngIf` even though NgModule B didn't import `CommonModule`.

An NgModule can export a combination of its own declarations, selected imported classes, and imported NgModules.
You can selectively aggregate classes from other NgModules and re-export them in a consolidated, convenience NgModule.
For example, Angular's own `BrowserModule` exports a couple of NgModules as follows:

```typescript
  exports: [CommonModule, ApplicationModule]
```

Don't bother re-exporting pure service NgModules, because they don't export declarables that another NgModule could use.
For example, there's no point in re-exporting `HttpClientModule` because it doesn't export anything.

## Next steps

* To learn about frequently used Angular NgModules and how to import them into your app, see [Frequently-used NgModules](guide/frequent-ngmodules "Frequently-used NgModules").

* For guidance on how to use NgModules for organizing different areas of your code, see [Guidelines for creating NgModules](guide/module-types "Guidelines for creating NgModules").

* For step-by-step instructions on creating an NgModule and importing it into your app, see [Creating a new NgModule](guide/feature-modules "Creating a new NgModule").

* To learn how to use shared modules to organize and streamline your code, see [Sharing NgModules in an app](guide/sharing-ngmodules "Sharing NgModules in an app").

* To learn about loading NgModules eagerly when the app starts, or lazy-loading NgModules asynchronously by the router, see [Lazy-loading an NgModule](guide/lazy-loading-ngmodules "Lazy-loading an NgModule").

* To understand how to provide a service or other dependency for your app, see [Providing dependencies for an NgModule](guide/providers "Providing dependencies for an NgModule").

* To learn how to create a singleton service to use in NgModules, see [Making a service a singleton](guide/singleton-services "Making a service a singleton").
