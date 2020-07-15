# Launching an app with a root NgModule

Every Angular app needs at least one [NgModule](guide/glossary#ngmodule "Definition of NgModule"), known as the _root NgModule_, to launch the app.
The root NgModule for an app is so named because it can include child NgModules in a hierarchy of any depth.

<div class="alert is-helpful">

To examine and run the example app for this topic, see the <live-example></live-example>.

</div>

## Prerequisites

This topic requires a basic understanding of the following:

* [Typescript](guide/glossary#typescript "Definition of Typescript") and HTML5 programming
* [Templates](guide/glossary#template "Definition of a template") in HTML with CSS styles
* [Components](guide/glossary#component "Definition of a component")
* [Angular CLI](cli "Angular CLI")
* [Organizing your app with NgModules](guide/ngmodules "Organizing your app with NgModules")

## Generate the root NgModule

Use the Angular CLI command `ng new` to generate the root NgModule for a new app project.
By convention, this NgModule is named `AppModule` in the `app.module.ts` file, and contains the following code:

<code-example path="ngmodules/src/app/app.module.1.ts" header="src/app/app.module.ts (default AppModule)">
// @NgModule decorator with its metadata
</code-example>

The root NgModule code begins with `import` statements to import other modules, and to import the entry component.
It then identifies `AppModule` as an `NgModule` class by using the `@NgModule` [decorator](guide/glossary#decorator--decoration "Definition of decorator").
`@NgModule` takes a metadata object that tells Angular how to compile and launch the app.
The metadata includes the following arrays:

* [`declarations`](#declarations): Which [components](guide/glossary#component "Definition of component"), [directives](guide/glossary#directive "Definition of directive"), and [pipes](guide/glossary#pipe "Definition of pipe)") belong to the NgModule.
  These classes are called [declarables](guide/glossary#declarable "Definition of a declarable").
  The new app project currently has only one component, called `AppComponent`.

* [`imports`](#imports): Other NgModules you are importing into this NgModule, so that you can use their declarables.
  The newly generated root NgModule imports [`BrowserModule`](api/platform-browser/BrowserModule "BrowserModule NgModule") in order to use browser-specific services such as [DOM](https://www.w3.org/TR/DOM-Level-2-Core/introduction.html "Definition of Document Object Model") rendering, sanitization, and location.

* [`providers`](#providers-array): Providers of services that components in other NgModules can use.
  There are no providers in a newly generated root NgModule.

* [`bootstrap`](#bootstrap-array): The [entry component](guide/entry-components "Specifying an entry component") that Angular creates and inserts into the `index.html` host web page, thereby bootstrapping the app.
  This entry component, `AppComponent`, appears in both the `declarations` and the `bootstrap` arrays.

The rest of this topic describes how you would use each array of the metadata in the root NgModule.
For step-by-step instructions on creating your own NgModules and importing them into your app, see [Creating a new NgModule](guide/feature-modules "Creating a new NgModule"). 
For a complete description of the NgModule metadata properties, see [Using the NgModule metadata](guide/ngmodule-api "Using the NgModule metadata").

{@a declarations}

## The declarations array

The root NgModule's `declarations` array tells Angular which [declarables](guide/glossary#declarable "Definition of a declarable") ([components](guide/glossary#component "Definition of component"), [directives](guide/glossary#directive "Definition of directive"), and [pipes](guide/glossary#pipe "Definition of pipe)")) belong to the NgModule.
All of the declarables for an NgModule must be in the NgModule's `declarations` array.

### Generate a new declarable

If you use a component, directive, or pipe without declaring it, Angular returns an error message.
As you create more components, directives, and pipes for this NgModule, they must be added to `declarations` in this NgModule.
Fortunately the Angular CLI does this for you.

When you generate a new component with the CLI [`ng generate component`](cli/generate#component-command "ng generate component") command, the CLI adds the component to `declarations`.
You can also use the [`ng generate directive`](cli/generate#directive-command "ng generate directive") and [`ng generate pipe`](cli/generate#pipe-command "ng generate pipe") commands to generate these declarables for the NgModule.

The following is an example of what goes into the `declarations` array when you generate one component, pipe, and directive for the NgModule:

```typescript
  declarations: [
    YourComponent,
    YourPipe,
    YourDirective
  ],
```

The declarables for an NgModule belong only to that NgModule.
Declare a declarable in _only one_ NgModule—don't repeat the declarable in another NgModule.
To save time and keep your app lean, declare it only once, and export it to share it with other NgModules.
The other NgModules can import it, as described in the next section.
The compiler emits an error if you try to declare the same declarable in more than one NgModule.

### Export and import declarables

The declarables are visible within the NgModule that declares them, but invisible to components in a different NgModule.
To use any declarable (component, directive, or pipe) in components in another NgModule, you must _export_ it from this NgModule, and _import_ it into the other NgModule.

For example, the following code shows how you would export the directive `ItemDirective` from the generated file `item.directive.ts`:

<code-example path="bootstrapping/src/app/item.directive.ts" region="directive" header="src/app/item.directive.ts"></code-example>

If you need the declarable (`ItemDirective`) in another NgModule, open the other NgModule (`app.module.ts`) and _import_ the declarable you need:

<code-example path="bootstrapping/src/app/app.module.ts" region="directive-import" header="src/app/app.module.ts"></code-example>

Also add the imported directive to the `@NgModule` `declarations` array in `app.module.ts`, so that you can use `ItemDirective` in a component of the NgModule:

<code-example path="bootstrapping/src/app/app.module.ts" region="declarations" header="src/app/app.module.ts"></code-example>

<div class="alert is-helpful">

For more about directives, see [Attribute directives](guide/attribute-directives "Attribute directives") and [Structural directives](guide/structural-directives "Structural directives").

</div>

Use the same export and import technique for sharing [pipes](guide/pipes "Transforming Data Using Pipes") and [components](guide/architecture-components "Introduction to components and templates") among your app's NgModules.

<div class="alert is-important">

If you write code inside the root NgModule `AppModule` constructor to throw an error, that error may not appear in the console.
Move the code from the `AppModule` constructor to the `AppComponent` constructor.

</div>

{@a imports}

## The imports array

The NgModule's `imports` array, which appears exclusively in the `@NgModule` metadata object, tells Angular which _other_ NgModules are needed in order for this NgModule to function properly.
The other NgModules must export the needed components, directives, or pipes that this NgModule needs.
The `imports` array accepts only `@NgModule` references.

The root NgModule, as generated automatically by the `ng new` command, includes the [`BrowserModule` NgModule](api/platform-browser/BrowserModule "BrowserModule NgModule") in its `imports` array because a component template in the root NgModule (`AppComponent`) needs to use `BrowserModule` components, directives, or pipes.

{@a providers-array}

## The providers array

The `providers` array in the newly generated root NgModule tells Angular which services the app needs.
If you add services to the root NgModule's `providers` array, the services become available app-wide.

You can scope service usage when [creating other NgModules](guide/feature-modules "Creating a new NgModule") and [lazy-loading the NgModules](guide/lazy-loading-ngmodules "Lazy-loading an NgModule").
To learn more about service providers, see [Providing dependencies](guide/providers "Providing dependencies for an NgModule").

{@a bootstrap-array}

## The bootstrap array

The app starts by launching the [entry component](guide/entry-components "Entry components") in the root NgModule's `bootstrap` array.
The CLI-generated root NgModule designates `AppComponent` as this entry component.

Angular creates each component that appears in the `bootstrap` array and inserts it into the browser DOM.
Each bootstrapped component is the base of its own tree of components.
Inserting a bootstrapped component usually triggers a cascade of component creations that fill out that tree.
While you can put more than one component tree on a host web page, most apps use only one component tree and bootstrap a single entry component.

## Next steps

* To learn about frequently used Angular NgModules and how to import them into your app, see [Frequently-used NgModules](guide/frequent-ngmodules "Frequently-used NgModules").

* For guidance on how to use NgModules for organizing different areas of your code, see [Guidelines for creating NgModules](guide/module-types "Guidelines for creating NgModules").

* For a complete description of the NgModule metadata properties, see [Using the NgModule metadata](guide/ngmodule-api "Using the NgModule metadata").

* For step-by-step instructions on creating an NgModule and importing it into your app, see [Creating a new NgModule](guide/feature-modules "Creating a new NgModule").

* To learn how to use shared modules to organize and streamline your code, see [Sharing NgModules in an app](guide/sharing-ngmodules "Sharing NgModules in an app").

* To learn about loading NgModules eagerly when the app starts, or lazy-loading NgModules asynchronously by the router, see [Lazy-loading an NgModule](guide/lazy-loading-ngmodules "Lazy-loading an NgModule").

* To understand how to provide a service or other dependency for your app, see [Providing dependencies for an NgModule](guide/providers "Providing dependencies for an NgModule").

* To learn how to create a singleton service to use in NgModules, see [Making a service a singleton](guide/singleton-services "Making a service a singleton").
