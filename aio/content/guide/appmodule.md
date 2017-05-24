@title
AppModule: the root module

@intro
Tell Angular how to construct and bootstrap the app in the root "AppModule".

@description
An Angular module class describes how the application parts fit together.
Every application has at least one Angular module, the _root_ module 
that you [bootstrap](guide/appmodule#main) to launch the application.
By convention, it is usually called `AppModule`.

The [setup](guide/setup) instructions produce a new project with the following minimal `AppModule`.

<code-example path="setup/src/app/app.module.ts" title="src/app/app.module.ts" linenums="false">
</code-example>

After the `import` statements is a class with the
**`@NgModule`** [decorator](guide/glossary#decorator '"Decorator" explained').

The `@NgModule` decorator identifies `AppModule` as an Angular module class (also called an `NgModule` class).
`@NgModule` takes a metadata object that tells Angular how to compile and launch the application.

* **_imports_**&mdash;the `BrowserModule` that applications need to run in a browser.
* **_declarations_**&mdash;this application's lone component.
* **_bootstrap_**&mdash;the _root_ component that Angular creates and inserts 
into the `index.html` host web page. 

This application only has one component, `AppComponent`, so it 
is in both the `declarations` and the `bootstrap` arrays.

{@a imports}

## The `imports` array

Angular modules are a way to consolidate features that belong together into discrete units.
Many features of Angular itself are organized as Angular modules. 
For example, HTTP services are in the `HttpModule`.

Add a module to the `imports` array when the application requires its features.

Every application that executes in a browser needs the `BrowserModule` from `@angular/platform-browser`.
So every such application includes the `BrowserModule` in its root `AppModule`'s `imports` array.
**Only `NgModule` classes** go in the `imports` array. Do not put any other kind of class in `imports`.

The _module's_ `imports` array appears _exclusively_ in the `@NgModule` metadata object.
It tells Angular about specific _other_ Angular modules&mdash;all of them classes 
decorated with `@NgModule`&mdash;that the application needs to function properly.


{@a declarations}

## The `declarations` array

The module's `declarations` array tells Angular which components belong to the `AppModule`.
As you create more components, add them to `declarations`.

You must declare _every_ component in an `NgModule` class. 
If you use a component without declaring it, Angular returns a clear 
error message in the browser console.

The `declarations` array only takes declarables. Declarables 
are components, [directives](guide/attribute-directives) and [pipes](guide/pipes).
All of a module's declarables must be in the `declarations` array. 

{@a bootstrap-array}


## The `bootstrap` array

The application launches by bootstrapping the root `AppModule`. 
Among other things, the bootstrapping process creates the component(s) listed in the `bootstrap` array
and inserts each one into the browser DOM.

Each bootstrapped component is the base of its own tree of components.
Inserting a bootstrapped component usually triggers a cascade of 
component creations that fill out that tree.

While you can put more than one component tree on a host web page, 
most applications have only one component tree and bootstrap a single _root_ component.

This one root component is usually called `AppComponent`.

{@a main}

## Bootstrap in `main.ts`

In development, you can compile the application dynamically with the Just-in-Time (JIT) compiler
and run it in a browser. 

To bootstrap a JIT-compiled browser application, create a separate file 
in the `src` folder named `src/main.ts`:

<code-example path="setup/src/main.ts" title="src/main.ts" linenums="false">
</code-example>

This code creates a browser platform for dynamic (JIT) compilation and
bootstraps the `AppModule`.

The bootstrapping process sets up the execution environment,
finds the root `AppComponent` in the module's `bootstrap` array, 
creates an instance of the component, and inserts it within the 
element tag identified by the component's `selector`.

The `AppComponent` selector here is `my-app`, 
so Angular looks for a `<my-app>` tag in the `index.html` like this one 
and displays the `AppComponent` there:

<code-example path="setup/src/index.html" region="my-app" title="setup/src/index.html" linenums="false">
</code-example>

## More about Angular modules

For more detailed information on Angular modules, such as how to use 
and lazy load multiple feature modules, see [NgModule](guide/ngmodule).