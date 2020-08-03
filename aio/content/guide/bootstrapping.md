# Overview of the `AppModule`

Every Angular app needs at least one [NgModule](guide/glossary#ngmodule "Definition of NgModule"), known as the _root NgModule_ or `AppModule`, to launch the app.
The root NgModule for an app is so named because it can include child NgModules in a hierarchy of any depth.

<div class="alert is-helpful">

To examine and run the example app for this topic, see the <live-example></live-example>.

</div>

## Prerequisites

This topic requires a basic understanding of the following:

* [Typescript](guide/glossary#typescript "Definition of Typescript")
* [Templates](guide/glossary#template "Definition of a template") in HTML with CSS styles
* [Components](guide/glossary#component "Definition of a component")
* [Angular CLI](cli "Angular CLI")
* [NgModules](guide/ngmodules "NgModules")

## Generate `AppModule`

Use the Angular CLI command `ng new` to generate the root NgModule for a new app project.
By convention, this NgModule is named `AppModule` in the `app.module.ts` file, and contains the following code:

<code-example path="ngmodules/src/app/app.module.1.ts" header="src/app/app.module.ts (default AppModule)">
// @NgModule decorator with its metadata
</code-example>

`AppModule` begins with `import` statements to import other modules, and to import the entry component.
It then identifies `AppModule` as an `NgModule` class by using the `@NgModule()` [decorator](guide/glossary#decorator--decoration "Definition of decorator").
`@NgModule()` takes a metadata object that tells Angular how to compile and launch the app.
The metadata includes the following arrays:

* [`declarations`](#declarations): Which [components](guide/glossary#component "Definition of component"), [directives](guide/glossary#directive "Definition of directive"), and [pipes](guide/glossary#pipe "Definition of pipe)") belong to the NgModule.
  These classes are called [declarables](guide/glossary#declarable "Definition of a declarable").
  The CLI-generated initial `AppModule` has only one component, called `AppComponent`.

* [`imports`](#imports): Other NgModules you are importing into this NgModule, so that you can use their declarables.
  The CLI-generated initial `AppModule` imports [`BrowserModule`](api/platform-browser/BrowserModule "BrowserModule NgModule") in order to use browser-specific services such as [DOM](https://www.w3.org/TR/DOM-Level-2-Core/introduction.html "Definition of Document Object Model") rendering, sanitization, and location.

* [`providers`](#providers-array): Providers of services that components in other NgModules can use.
  There are no providers in a newly generated root NgModule.

* [`bootstrap`](#bootstrap-array): The [entry component](guide/entry-components "Entry components") that Angular creates and inserts into the `index.html` host web page, thereby bootstrapping the app.
  This entry component, `AppComponent`, appears in both the `declarations` and the `bootstrap` arrays.

The rest of this topic describes how you would use each array of the metadata in the `AppModule`.
For step-by-step instructions on creating your own NgModules and importing them into your app, see [Feature modules](guide/feature-modules "Feature modules").
For a complete description of the NgModule metadata properties, see [Using the NgModule metadata](guide/ngmodule-api#ngmodule-metadata "NgModule metadata").

{@a declarations}

## The `declarations` array

The `declarations` array in the `AppModule` NgModule tells Angular which [declarables](guide/glossary#declarable "Definition of a declarable") ([components](guide/glossary#component "Definition of component"), [directives](guide/glossary#directive "Definition of directive"), and [pipes](guide/glossary#pipe "Definition of pipe)")) belong to the NgModule.
All of the declarables for an NgModule must be in the NgModule's `declarations` array.

### Generate a new declarable

When you generate a new component with the CLI [`ng generate component`](cli/generate#component-command "ng generate component") command, the CLI adds the component to `declarations`.
You can also use the [`ng generate directive`](cli/generate#directive-command "ng generate directive") and [`ng generate pipe`](cli/generate#pipe-command "ng generate pipe") commands to generate these declarables for the NgModule.

If you use a component, directive, or pipe with an NgModule without declaring it, Angular returns an error message.

The following is an example of what goes into the `declarations` array when you generate one component, pipe, and directive for the NgModule:

```typescript
  declarations: [
    YourComponent,
    YourPipe,
    YourDirective
  ],
```

Declare a pipe, component, or directive only once, and export it to share it with other NgModules.
The other NgModules can import them, as described in the next section.
The declarables for an NgModule belong only to that NgModule.
Declare a declarable in _only one_ NgModule—don't repeat the declarable in another NgModule.
The compiler emits an error if you try to declare the same declarable in more than one NgModule.

### Export and import declarables

The declarables are visible within the NgModule that declares them, but invisible to components outside the NgModule.
To use any declarable in components outside the NgModule, you must _export_ the class.
For example, the following code shows how you would export the directive `ItemDirective` from the generated file `item.directive.ts`:

<code-example path="bootstrapping/src/app/item.directive.ts" region="directive" header="src/app/item.directive.ts"></code-example>

If you need the declarable `ItemDirective` in an NgModule, open the NgModule and _import_ the declarable you need, as shown in `app.module.ts` :

<code-example path="bootstrapping/src/app/app.module.ts" region="directive-import" header="src/app/app.module.ts"></code-example>

Also add the imported directive to the `@NgModule()` `declarations` array in `app.module.ts`, so that you can use `ItemDirective` in a component of the NgModule:

<code-example path="bootstrapping/src/app/app.module.ts" region="declarations" header="src/app/app.module.ts"></code-example>

<div class="alert is-helpful">

For more about directives, see [Attribute directives](guide/attribute-directives "Attribute directives") and [Structural directives](guide/structural-directives "Structural directives").

</div>

Use the same export and import technique for sharing [pipes](guide/pipes "Transforming Data Using Pipes") and [components](guide/architecture-components "Introduction to components and templates") among your app's NgModules.

<div class="alert is-important">

If you write code inside the `AppModule` constructor to throw an error, that error may not appear in the console.
Move the code from the `AppModule` constructor to the `AppComponent` constructor.

</div>

{@a imports}

## The `imports` array

The NgModule's `imports` array tells Angular which _other_ NgModules this NgModule needs in order to function properly.
The other NgModules must export the components, directives, or pipes that this NgModule needs.
The `imports` array accepts only NgModule references.

In a CLI-generated app, the `AppModule` imports the [`BrowserModule` NgModule](api/platform-browser/BrowserModule "BrowserModule NgModule") for browser-specific services such as DOM rendering, sanitization, and location.

{@a providers-array}

## The `providers` array

Use the `AppModule` `providers` array to make services your app needs available app-wide.

You can scope service visibility when [creating other modules](guide/feature-modules "Feature models") and [lazy-loading modules](guide/lazy-loading-ngmodules "Lazy-loading feature modules").
To learn more about service providers, see [Providing dependencies in modules](guide/providers "Providing dependencies in modules").

{@a bootstrap-array}

## The `bootstrap` array

An Angular app starts by launching the [entry component](guide/entry-components "Entry components") in the `bootstrap` array of the `AppModule`.
The CLI-generated `AppModule` designates `AppComponent` as this entry component.

Angular creates each component that appears in the `bootstrap` array and inserts it into the browser DOM.
Each bootstrapped component is the base of its own tree of components.
Inserting a bootstrapped component usually triggers a cascade of component creations that fill out that tree.
While you can put more than one component tree on a host web page, most apps use only one component tree and bootstrap a single entry component.

## What's next

After learning about this topic, you may be interested in the following:

* [Frequently-used modules](guide/frequent-ngmodules "Frequently-used modules"): The most commonly used NgModules and how to import them into your app.

* [Guidelines for creating NgModules](guide/module-types "Guidelines for creating NgModules"): How to use NgModules to organize different areas of your code. 

* [NgModule API](guide/ngmodule-api "NgModule API"): A summary of the NgModule metadata properties. 

* [Feature modules](guide/feature-modules "Feature modules"): Step-by-step instructions on creating an NgModule and importing it into your app.
