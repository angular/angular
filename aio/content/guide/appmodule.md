@title
AppModule: the root module

@intro
Tell Angular how to construct and bootstrap the app in the root "AppModule".

@description


An Angular module class describes how the application parts fit together.
Every application has at least one Angular module, the _root_ module 
that you [bootstrap](guide/appmodule#main) to launch the application.
You can call it anything you want. The conventional name is `AppModule`.

The [setup](guide/setup) instructions produce a new project with the following minimal `AppModule`.
You'll evolve this module as your application grows.


<code-example path="setup/src/app/app.module.ts" title="src/app/app.module.ts" linenums="false">

</code-example>



After the `import` statements, you come to a class adorned with the
**`@NgModule`** [_decorator_](guide/glossary#decorator '"Decorator" explained').

The `@NgModule` decorator identifies `AppModule` as an Angular module class (also called an `NgModule` class).
`@NgModule` takes a _metadata_ object that tells Angular how to compile and launch the application.

* **_imports_** &mdash; the `BrowserModule` that this and every application needs to run in a browser.
* **_declarations_** &mdash; the application's lone component, which is also ...
* **_bootstrap_** &mdash; the _root_ component that Angular creates and inserts into the `index.html` host web page.

The [Angular Modules (NgModule)](guide/ngmodule) guide dives deeply into the details of Angular modules.
All you need to know at the moment is a few basics about these three properties.  


{@a imports}


### The _imports_ array

Angular modules are a way to consolidate features that belong together into discrete units.
Many features of Angular itself are organized as Angular modules. 
HTTP services are in the `HttpModule`. The router is in the `RouterModule`.
Eventually you may create a feature module.

Add a module to the `imports` array when the application requires its features.

_This_ application, like most applications, executes in a browser.
Every application that executes in a browser needs the `BrowserModule` from `@angular/platform-browser`.
So every such application includes the `BrowserModule` in its _root_ `AppModule`'s `imports` array.
Other guide and cookbook pages will tell you when you need to add additional modules to this array.


<div class="alert is-important">



**Only `NgModule` classes** go in the `imports` array. Do not put any other kind of class in `imports`.


</div>



<div class="l-sub-section">



The `import` statements at the top of the file and the Angular module's `imports` array
are unrelated and have completely different jobs.

The _JavaScript_ `import` statements give you access to symbols _exported_ by other files
so you can reference them within _this_ file.
You add `import` statements to almost every application file. 
They have nothing to do with Angular and Angular knows nothing about them.

The _module's_ `imports` array appears _exclusively_ in the `@NgModule` metadata object.
It tells Angular about specific _other_ Angular modules &mdash; all of them classes decorated with `@NgModule` &mdash;
that the application needs to function properly.

</div>



{@a declarations}


### The _declarations_ array

You tell Angular which components belong to the `AppModule` by listing it in the module's `declarations` array.
As you create more components, you'll add them to `declarations`.

You must declare _every_ component in an `NgModule` class. 
If you use a component without declaring it, you'll see a clear error message in the browser console.

You'll learn to create two other kinds of classes &mdash; 
[directives](guide/attribute-directives) and [pipes](guide/pipes) &mdash;
that you must also add to the `declarations` array.


<div class="alert is-important">



**Only _declarables_** &mdash; _components_, _directives_ and _pipes_ &mdash; belong in the `declarations` array. 
Do not put any other kind of class in `declarations`; _not_ `NgModule` classes, _not_ service classes, _not_ model classes.


</div>



{@a bootstrap-array}


### The _bootstrap_ array

You launch the application by [_bootstrapping_](guide/appmodule#main) the root `AppModule`. 
Among other things, the _bootstrapping_ process creates the component(s) listed in the `bootstrap` array
and inserts each one into the browser DOM.

Each bootstrapped component is the base of its own tree of components.
Inserting a bootstrapped component usually triggers a cascade of component creations that fill out that tree.

While you can put more than one component tree on a host web page, that's not typical. 
Most applications have only one component tree and they bootstrap a single _root_ component.

You can call the one _root_ component anything you want but most developers call it `AppComponent`.

Which brings us to the _bootstrapping_ process itself.


{@a main}


<l-main-section>

</l-main-section>



## Bootstrap in _main.ts_

There are many ways to bootstrap an application.
The variations depend upon how you want to compile the application and where you want to run it.

In the beginning, you will compile the application dynamically with the _Just-in-Time (JIT)_ compiler
and you'll run it in a browser. You can learn about other options later.

The recommended place to bootstrap a JIT-compiled browser application is in a separate file 
in the `src` folder named `src/main.ts`

<code-example path="setup/src/main.ts" title="src/main.ts" linenums="false">

</code-example>



This code creates a browser platform for dynamic (JIT) compilation and
bootstraps the `AppModule` described above.

The _bootstrapping_ process sets up the execution environment,
digs the _root_ `AppComponent` out of the module's `bootstrap` array, 
creates an instance of the component and inserts it within the element tag identified by the component's `selector`.

The `AppComponent` selector &mdash; here and in most documentation samples &mdash; is `my-app` 
so Angular looks for a `<my-app>` tag in the `index.html` like this one ...

<code-example path="setup/src/index.html" region="my-app" title="setup/src/index.html" linenums="false">

</code-example>



... and displays the `AppComponent` there.

This file is very stable. Once you've set it up, you may never change it again.


<l-main-section>

</l-main-section>



## More about Angular Modules

Your initial app has only a single module, the _root_ module.
As your app grows, you'll consider subdividing it into multiple "feature" modules,
some of which can be loaded later ("lazy loaded") if and when the user chooses
to visit those features.

When you're ready to explore these possibilities, visit the [Angular Modules (NgModule)](guide/ngmodule) guide.