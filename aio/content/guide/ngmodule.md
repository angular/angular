@title
Angular Modules (NgModule)

@intro
Define application modules with @NgModule

@description
**Angular Modules** help organize an application into cohesive blocks of functionality.

An Angular Module is a _class_ adorned with the **@NgModule** decorator function.
`@NgModule` takes a metadata object that tells Angular how to compile and run module code.
It identifies the module's _own_ components, directives and pipes,
making some of them public so external components can use them.
It may add service providers to the application dependency injectors.
And there are many more options covered here.

[The Root Module](appmodule.html) guide introduced Angular Modules and the essentials
of creating and maintaining a single _root_ `AppModule` for the entire application.
Read that first.

This page goes into Angular modules in much greater depth.

## Table of Contents
* [Angular modularity](#angular-modularity "Add structure to the app with NgModule")
* [The application root module](#root-module "The startup module that every app requires")
* [Bootstrap](#bootstrap "Launch the app in a browser with the root module as the entry point") the root module
* [Declarations](#declarations "Declare the components, directives, and pipes that belong to a module")
* [Providers](#providers "Extend the app with additional services")
* [Imports](#imports "Import components, directives, and pipes for use in component templates")
* [Resolve conflicts](#resolve-conflicts "When two directives have the same selector ...")
* [Feature modules](#feature-modules "Partition the app into feature modules")
* [Lazy loaded modules](#lazy-load "Load modules asynchronously") with the Router
* [Shared modules](#shared-module "Create modules for commonly used components, directives, and pipes")
* [The Core module](#core-module "Create a core module with app-wide singleton services and single-use components")
* [Configure core services with _forRoot_](#core-for-root "Configure providers during module import")
* [Prevent reimport of the _CoreModule_](#prevent-reimport "because bad things happen if a lazy loaded module imports Core")
* [NgModule metadata properties](#ngmodule-properties "A technical summary of the @NgModule metadata properties")

### Live examples
This page explains Angular Modules through a progression of improvements to a sample with a "Tour of Heroes" theme.
Here's an index to live examples at key moments in the evolution of that sample:

* <live-example plnkr="minimal.0">A minimal NgModule app</live-example>
* <live-example plnkr="contact.1b">The first contact module</live-example>
* <live-example plnkr="contact.2">The revised contact module</live-example>
* <live-example plnkr="pre-shared.3">Just before adding _SharedModule_</live-example>
* <live-example>The final version</live-example>

### Frequently Asked Questions (FAQs)

This page covers Angular Module concepts in a tutorial fashion.

The companion [Angular Module FAQs](../cookbook/ngmodule-faq.html "Angular Module FAQs") cookbook
offers ready answers to specific design and implementation questions.
Read this page first before hopping over to those FAQs.

<div class='l-hr'>

</div>



{@a angular-modularity}

## Angular Modularity

Modules are a great way to organize the application and extend it with capabilities from external libraries.

Many Angular libraries are modules (e.g, `FormsModule`, `HttpModule`, `RouterModule`).
Many third party libraries are available as Angular modules (e.g.,
<a href="https://material.angular.io/" target="_blank">Material Design</a>,
<a href="http://ionicframework.com/" target="_blank">Ionic</a>,
<a href="https://github.com/angular/angularfire2" target="_blank">AngularFire2</a>).

Angular modules consolidate components, directives and pipes into
cohesive blocks of functionality, each focused on a
feature area, application business domain, workflow, or common collection of utilities.

Modules can also add services to the application.
Such services might be internally-developed such as the application logger.
They can come from outside sources such as the Angular router and Http client.

Modules can be loaded eagerly when the application starts.
They can also be _lazy loaded_ asynchronously by the router.

An Angular module is a class decorated with `@NgModule` metadata. The metadata:

* declare which components, directives and pipes  _belong_ to the module.
* make some of those classes public so that other component templates can use them.
* import other modules with the components, directives and pipes needed by the components in _this_ module.
* provide services at the application level that any application component can use.

Every Angular app has at least one module class, the _root module_.
We bootstrap that module to launch the application.

The _root module_ is all we need in a simple application with a few components.
As the app grows, we refactor the _root module_ into **feature modules**
that represent collections of related functionality.
We then import these modules into the _root module_.

We'll see how later in the page. Let's start with the _root module_.


{@a root-module}

## _AppModule_ - the application root module

Every Angular app has a **root module** class.
By convention it's a class called `AppModule` in a file named `app.module.ts`.

The `AppModule` from the  [_QuickStart seed_](setup.html) is about as minimal as it gets:

{@example 'setup/ts/src/app/app.module.ts'}

The `@NgModule` decorator defines the metadata for the module.
We'll take an intuitive approach to understanding the metadata and fill in details as we go.

This metadata imports a single helper module, `BrowserModule`, the module every browser app must import.

`BrowserModule` registers critical application service providers.
It also includes common directives like `NgIf` and `NgFor` which become immediately visible and usable
in any of this modules component templates.

The `declarations` list identifies the application's only component,
the _root component_, the top of this app's rather bare component tree.

The example `AppComponent` simply displays a data-bound title:

{@example 'ngmodule/ts/src/app/app.component.0.ts'}

Lastly, the `@NgModule.bootstrap` property identifies this `AppComponent` as the _bootstrap component_.
When Angular launches the app, it places the HTML rendering of `AppComponent` in the DOM,
inside the `<my-app>` element tags of the `index.html`


{@a bootstrap}

## Bootstrapping in _main.ts_
We launch the application by bootstrapping the `AppModule` in the `main.ts` file.

Angular offers a variety of bootstrapping options, targeting multiple platforms.
In this page we consider two options, both targeting the browser.

### Dynamic bootstrapping with the Just-in-time (JIT) compiler
In the first, _dynamic_ option, the [Angular compiler](../cookbook/ngmodule-faq.html#q-angular-compiler "About the Angular Compiler")
compiles the application in the browser and then launches the app.


{@example 'ngmodule/ts/src/main.ts'}

The samples in this page demonstrate the dynamic bootstrapping approach.

<live-example embedded plnkr="minimal.0" img="devguide/ngmodule/minimal-plunker.png">Try the live example.</live-example>


### Static bootstrapping with the Ahead-Of-time (AOT) compiler

Consider the static alternative which can produce a much smaller application that
launches faster, especially on mobile devices and high latency networks.

In the _static_ option, the Angular compiler runs ahead-of-time as part of the build process,
producing a collection of class factories in their own files.
Among them is the `AppModuleNgFactory`.

The syntax for bootstrapping the pre-compiled `AppModuleNgFactory` is similar to
the dynamic version that bootstraps the `AppModule` class.


{@example 'ngmodule/ts/src/main-static.ts'}

Because the entire application was pre-compiled,
we don't ship the _Angular Compiler_ to the browser and we don't compile in the browser.

The application code downloaded to the browser is much smaller than the dynamic equivalent
and it is ready to execute immediately. The performance boost can be significant.

Both the JIT and AOT compilers generate an `AppModuleNgFactory` class from the same `AppModule`
 source code.
The JIT compiler creates that factory class on the fly, in memory, in the browser.
The AOT compiler outputs the factory to a physical file
that we're importing here in the static version of `main.ts`.

In general, the `AppModule` should neither know nor care how it is bootstrapped.

Although the `AppModule` evolves as the app grows, the bootstrap code in `main.ts` doesn't change.
This is the last time we'll look at `main.ts`.

<div class='l-hr'>

</div>



{@a declarations}

## Declare directives and components
The app evolves.
The first addition is a `HighlightDirective`, an [attribute directive](attribute-directives.html)
that sets the background color of the attached element.

{@example 'ngmodule/ts/src/app/highlight.directive.ts'}

We update the `AppComponent` template to attach the directive to the title:

{@example 'ngmodule/ts/src/app/app.component.1.ts' region='template'}

If we ran the app now, Angular would not recognize the `highlight` attribute and would ignore it.
We must declare the directive in `AppModule`.

Import the `HighlightDirective` class and add it to the module's `declarations` like this:

{@example 'ngmodule/ts/src/app/app.module.1.ts' region='directive'}

### Add a component

We decide to refactor the title into its own `TitleComponent`.
The component's template binds to the component's `title` and `subtitle` properties like this:

{@example 'ngmodule/ts/src/app/title.component.html' region='v1'}



{@example 'ngmodule/ts/src/app/title.component.ts' region='v1'}

We rewrite the `AppComponent` to display the new `TitleComponent` in the `<app-title>` element,
using an input binding to set the `subtitle`.

{@example 'ngmodule/ts/src/app/app.component.1.ts'}

Angular won't recognize the `<app-title>` tag until we declare it in `AppModule`.
Import the `TitleComponent` class and add it to the module's `declarations`:

{@example 'ngmodule/ts/src/app/app.module.1.ts' region='component'}



{@a providers}

## Service Providers

Modules are a great way to provide services for all of the module's components.

The [Dependency Injection](dependency-injection.html) page describes
the Angular hierarchical dependency injection system and how to configure that system
with [providers](dependency-injection.html#providers) at different levels of the
application's component tree.

A module can add providers to the application's root dependency injector, making those services
available everywhere in the application.

Many applications capture information about the currently logged-in user and make that information
accessible through a user service.
This sample application has a dummy implementation of such a `UserService`.


{@example 'ngmodule/ts/src/app/user.service.ts'}

The sample application should display a welcome message to the logged in user just below the application title.
Update the `TitleComponent` template to show the welcome message below the application title.

{@example 'ngmodule/ts/src/app/title.component.html'}

Update the `TitleComponent` class with a constructor that injects the `UserService`
and sets the component's `user` property from the service.

{@example 'ngmodule/ts/src/app/title.component.ts'}

We've _defined_ and _used_ the service. Now we _provide_ it for all components to use by
adding it to a `providers` property in the `AppModule` metadata:

{@example 'ngmodule/ts/src/app/app.module.1.ts' region='providers'}



{@a imports}

## Import supporting modules

The app shouldn't welcome a user if there is no user.

Notice in the revised `TitleComponent` that an `*ngIf` directive guards the message.
There is no message if there is no user.

{@example 'ngmodule/ts/src/app/title.component.html' region='ngIf'}

Although `AppModule` doesn't declare `NgIf`, the application still compiles and runs.
How can that be? The Angular compiler should either ignore or complain about unrecognized HTML.

Angular _does_ recognize `NgIf` because we imported it earlier.
The initial version of `AppModule` imports `BrowserModule`.

{@example 'ngmodule/ts/src/app/app.module.0.ts' region='imports'}

Importing `BrowserModule` made all of its public components, directives and pipes visible
to the component templates in `AppModule`. They are ready to use without further ado.
More accurately, `NgIf` is declared in `CommonModule` from `@angular/common`.

`CommonModule` contributes many of the common directives that applications need including `ngIf` and `ngFor`.

`BrowserModule` imports `CommonModule` and [_re-exports_](../cookbook/ngmodule-faq.html#q-re-export) it.
The net effect is that an importer of `BrowserModule` gets `CommonModule` directives automatically.Many familiar Angular directives do not belong to`CommonModule`.
For example,  `NgModel` and `RouterLink` belong to Angular's `FormsModule` and `RouterModule` respectively.
We must _import_ those modules before we can use their directives.

To illustrate this point, we extend the sample app with `ContactComponent`,
a form component that imports form support from the Angular `FormsModule`.

### Add the _ContactComponent_

[Angular Forms](forms.html) are a great way to manage user data entry.

The `ContactComponent` presents a "contact editor",
implemented with _Angular Forms_ in the [_template-driven form_](forms.html) style.

### Angular Form Styles

We write Angular form components in either the
[_template-driven form_](forms.html) style or
the [_reactive form_](../cookbook/dynamic-form.html) style.

This sample is about to import the `FormsModule` from `@angular/forms` because
the `ContactComponent` is written in the _template-driven_ style.
Modules with components written in the _reactive_ style,
should import the `ReactiveFormsModule` instead.
The `ContactComponent` selector matches an element named `<app-contact>`.
Add an element with that name to the `AppComponent` template just below the `<app-title>`:

{@example 'ngmodule/ts/src/app/app.component.1b.ts' region='template'}

The `ContactComponent` has a lot going on.
Form components are often complex anyway and this one has its own `ContactService`,
its own [custom pipe](#pipes.html#custom-pipes) called `Awesome`,
and an alternative version of the `HighlightDirective`.

To make it manageable, we place all contact-related material in an `src/app/contact` folder
and break the component into three constituent HTML, TypeScript, and css files:
<md-tab-group>

  <md-tab label="src/app/contact/contact.component.html">
    {@example 'ngmodule/ts/src/app/contact/contact.component.html'}
  </md-tab>


  <md-tab label="src/app/contact/contact.component.ts">
    {@example 'ngmodule/ts/src/app/contact/contact.component.3.ts'}
  </md-tab>


  <md-tab label="src/app/contact/contact.component.css">
    {@example 'ngmodule/ts/src/app/contact/contact.component.css'}
  </md-tab>


  <md-tab label="src/app/contact/contact.service.ts">
    {@example 'ngmodule/ts/src/app/contact/contact.service.ts'}
  </md-tab>


  <md-tab label="src/app/contact/awesome.pipe.ts">
    {@example 'ngmodule/ts/src/app/contact/awesome.pipe.ts'}
  </md-tab>


  <md-tab label="src/app/contact/highlight.directive.ts">
    {@example 'ngmodule/ts/src/app/contact/highlight.directive.ts'}
  </md-tab>


</md-tab-group>

Focus on the component template.
Notice the two-way data binding `[(ngModel)]` in the middle of the template.
`ngModel` is the selector for the `NgModel` directive.

Although `NgModel` is an Angular directive, the _Angular Compiler_ won't recognize it
because (a) `AppModule` doesn't declare it and (b) it wasn't imported via `BrowserModule`.

Less obviously, even if Angular somehow recognized `ngModel`,
this `ContactComponent` would not behave like an Angular form because
form features such as validation are not yet available.

### Import the FormsModule

Add the `FormsModule` to the `AppModule` metadata's `imports` list.

{@example 'ngmodule/ts/src/app/app.module.1.ts' region='imports'}

Now `[(ngModel)]` binding will work and the user input will be validated by Angular Forms,
once we declare our new component, pipe and directive.


~~~ {.alert.is-critical}

**Do not** add `NgModel` &mdash; or the `FORMS_DIRECTIVES` &mdash;
to the `AppModule` metadata's declarations!

These directives belong to the `FormsModule`.
Components, directives and pipes belong to one module &mdash; and _one module only_.

**Never re-declare classes that belong to another module.**


~~~



{@a declare-pipe}
### Declare the contact component, directive and pipe

The application fails to compile until we declare the contact component, directive and pipe.
Update the `declarations` in the  `AppModule` accordingly:

{@example 'ngmodule/ts/src/app/app.module.1.ts' region='declarations'}



{@a import-name-conflict}

There are two directives with the same name, both called `HighlightDirective`.

We work around it by creating an alias for the second, contact version using the `as` JavaScript import keyword:

{@example 'ngmodule/ts/src/app/app.module.1b.ts' region='import-alias'}

This solves the immediate problem of referencing both directive _types_ in the same file but
leaves another problem unresolved as we discuss [below](#resolve-conflicts).
### Provide the _ContactService_
The `ContactComponent` displays contacts retrieved by the `ContactService`
which Angular injects into its constructor.

We have to provide that service somewhere.
The `ContactComponent` _could_ provide it.
But then it would be scoped to this component _only_.
We want to share this service with other contact-related components that we will surely add later.

In this app we chose to add `ContactService` to the `AppModule` metadata's `providers` list:

{@example 'ngmodule/ts/src/app/app.module.1b.ts' region='providers'}

Now `ContactService` (like `UserService`) can be injected into any component in the application.


{@a application-scoped-providers}

### Application-scoped Providers
  The `ContactService` provider is _application_-scoped because Angular
  registers a module's `providers` with the application's **root injector**.

  Architecturally, the `ContactService` belongs to the Contact business domain.
  Classes in _other_ domains don't need the `ContactService` and shouldn't inject it.

  We might expect Angular to offer a _module_-scoping mechanism to enforce this design.
  It doesn't. Angular module instances, unlike components, do not have their own injectors
  so they can't have their own provider scopes.

  This omission is intentional.
  Angular modules are designed primarily to extend an application,
  to enrich the entire app with the module's capabilities.

  Service scoping is rarely a problem in practice.
  Non-contact components can't inject the `ContactService` by accident.
  To inject `ContactService`, you must first import its _type_.
  Only Contact components should import the `ContactService` _type_.

  See the [FAQ that pursues this issue](../cookbook/ngmodule-faq.html#q-component-scoped-providers)
  and its mitigations in greater detail.
### Run the app
Everything is now in place to run the application with its contact editor.

The app file structure looks like this:
<aio-filetree>

  <aio-folder>
    app
    <aio-file>
      app.component.ts
    </aio-file>


    <aio-file>
      app.module.ts
    </aio-file>


    <aio-file>
      highlight.directive.ts
    </aio-file>


    <aio-file>
      title.component.(html|ts)
    </aio-file>


    <aio-file>
      user.service.ts
    </aio-file>


    <aio-folder>
      contact
      <aio-file>
        awesome.pipe.ts
      </aio-file>


      <aio-file>
        contact.component.(css|html|ts)
      </aio-file>


      <aio-file>
        contact.service.ts
      </aio-file>


      <aio-file>
        highlight.directive.ts
      </aio-file>


    </aio-folder>


  </aio-folder>


</aio-filetree>

Try the example:
<live-example embedded plnkr="contact.1b" img="devguide/ngmodule/contact-1b-plunker.png"></live-example>


{@a resolve-conflicts}

## Resolve directive conflicts

We ran into trouble [above](#import-name-conflict) when we declared the contact's `HighlightDirective` because
we already had a `HighlightDirective` class at the application level.

That both directives have the same name smells of trouble.

A look at their selectors reveals that they both highlight the attached element with a different color.
<md-tab-group>

  <md-tab label="src/app/highlight.directive.ts">
    {@example 'ngmodule/ts/src/app/highlight.directive.ts'}
  </md-tab>


  <md-tab label="src/app/contact/highlight.directive.ts">
    {@example 'ngmodule/ts/src/app/contact/highlight.directive.ts'}
  </md-tab>


</md-tab-group>

Will Angular use only one of them? No.
Both directives are declared in this module so _both directives are active_.

When the two directives compete to color the same element,
the directive declared later wins because its DOM changes overwrite the first.
In this case, the contact's `HighlightDirective` colors the application title text blue
when it should stay gold.

The real problem is that there are _two different classes_ trying to do the same thing.

It's OK to import the _same_ directive class multiple times.
Angular removes duplicate classes and only registers one of them.

But these are actually two different classes, defined in different files, that happen to have the same name.

They're not duplicates from Angular's perspective. Angular keeps both directives and
they take turns modifying the same HTML element.
At least the app still compiles.
If we define two different component classes with the same selector specifying the same element tag,
the compiler reports an error. It can't insert two components in the same DOM location.

What a mess!

We can eliminate component and directive conflicts by creating feature modules
that insulate the declarations in one module from the declarations in another.


{@a feature-modules}

## Feature Modules

This application isn't big yet. But it's already suffering structural problems.

* The root `AppModule` grows larger with each new application class and shows no signs of stopping.

* We have conflicting directives.
The `HighlightDirective` in contact is re-coloring the work done by the `HighlightDirective` declared in `AppModule`.
And it's coloring the application title text when it should only color the `ContactComponent`.

* The app lacks clear boundaries between contact functionality and other application features.
That lack of clarity makes it harder to assign development responsibilities to different teams.

We mitigate these problems with _feature modules_.

### _Feature Module_

A _feature module_ is a class adorned by the `@NgModule` decorator and its metadata,
just like a root module.
Feature module metadata have the same properties as the metadata for a root module.

The root module and the feature module share the same execution context.
They share the same dependency injector which means the services in one module
are available to all.

There are two significant technical differences:

1. We _boot_ the root module to _launch_ the app;
we _import_ a feature module to _extend_ the app.

2. A feature module can expose or hide its implementation from other modules.

Otherwise, a feature module is distinguished primarily by its intent.

A feature module delivers a cohesive set of functionality
focused on an application business domain, a user workflow, a facility (forms, http, routing),
or a collection of related utilities.

While we can do everything within the root module,
feature modules help us partition the app into areas of specific interest and purpose.

A feature module collaborates with the root module and with other modules
through the services it provides and
the components, directives, and pipes that it chooses to share.

In the next section, we carve the contact functionality out of the root module
and into a dedicated feature module.

<a id="contact-module-v1"></a>
### Make _Contact_ a feature module

It's easy to refactor the contact material into a contact feature module.

1. Create the `ContactModule` in the `src/app/contact` folder.
1. Move the contact material from `AppModule` to `ContactModule`.
1. Replace the imported  `BrowserModule` with `CommonModule`.
1. Import the `ContactModule` into the `AppModule`.

`AppModule` is the only _existing_ class that changes. But we do add one new file.

### Add the _ContactModule_

Here's the new `ContactModule`

{@example 'ngmodule/ts/src/app/contact/contact.module.2.ts'}

We copy from `AppModule` the contact-related import statements and the `@NgModule` properties
that concern the contact and paste them in `ContactModule`.

We _import_ the `FormsModule` because the contact component needs it.

~~~ {.alert.is-important}

Modules do not inherit access to the components, directives or pipes that are declared in other modules.
What `AppModule` imports is irrelevant to `ContactModule` and vice versa.
Before `ContactComponent` can bind with `[(ngModel)]`, its `ContactModule` must import `FormsModule`.

~~~

We also replaced `BrowserModule` by `CommonModule` for reasons explained in
[an FAQ](../cookbook/ngmodule-faq.html#q-browser-vs-common-module).

We _declare_ the contact component, directive, and pipe in the module `declarations`.

We _export_ the `ContactComponent` so
other modules that import the `ContactModule` can include it in their component templates.

All other declared contact classes are private by default.
The `AwesomePipe` and `HighlightDirective` are hidden from the rest of the application.
The `HighlightDirective` can no longer color the `AppComponent` title text.
### Refactor the _AppModule_
Return to the `AppModule` and remove everything specific to the contact feature set.

Delete the contact import statements.
Delete the contact declarations and contact providers.
Remove the `FormsModule` from the `imports` list (`AppComponent` doesn't need it).
Leave only the classes required at the application root level.

Then import the `ContactModule` so the app can continue to display the exported `ContactComponent`.

Here's the refactored version of the `AppModule` side-by-side with the previous version.
<md-tab-group>

  <md-tab label="src/app/app.module.ts (v2)">
    {@example 'ngmodule/ts/src/app/app.module.2.ts'}
  </md-tab>


  <md-tab label="src/app/app.module.ts (v1)">
    {@example 'ngmodule/ts/src/app/app.module.1b.ts'}
  </md-tab>


</md-tab-group>

### ImprovementsThere's a lot to like in the revised `AppModule`
* It does not change as the _Contact_ domain grows.
* It only changes when we add new modules.
* It's simpler:
  * Fewer import statements
  * No `FormsModule` import
  * No contact-specific declarations
  * No `ContactService` provider
  * No `HighlightDirective` conflict

Try this `ContactModule` version of the sample.

<live-example embedded plnkr="contact.2" img="devguide/ngmodule/contact-2-plunker.png">Try the live example.</live-example>


{@a lazy-load}

## Lazy loading modules with the Router

The Heroic Staffing Agency sample app has evolved.
It has two more modules, one for managing the heroes-on-staff and another for matching crises to the heroes.
Both modules are in the early stages of development.
Their specifics aren't important to the story and we won't discuss every line of code.
Examine and download the complete source for this version from the
<live-example plnkr="pre-shared.3" img="devguide/ngmodule/v3-plunker.png">live example.</live-example>Some facets of the current application merit discussion.

* The app has three feature modules: Contact, Hero, and Crisis.
* The Angular router helps users navigate among these modules.
* The `ContactComponent` is the default destination when the app starts.
* The `ContactModule` continues to be "eagerly" loaded when the application starts.
* `HeroModule` and the `CrisisModule` are lazy loaded.

<a id="app-component-template"></a>
Let's start at the top with the new `AppComponent` template:
a title, three links, and a `<router-outlet>`.

{@example 'ngmodule/ts/src/app/app.component.3.ts' region='template'}

The `<app-contact>` element is gone; we're routing to the _Contact_ page now.

The `AppModule` has changed modestly:

{@example 'ngmodule/ts/src/app/app.module.3.ts'}


Some file names bear a `.3` extension indicating
a difference with prior or future versions.
We'll explain differences that matter in due course.
The module still imports `ContactModule` so that its routes and components are mounted when the app starts.

The module does _not_ import `HeroModule` or `CrisisModule`.
They'll be fetched and mounted asynchronously when the user navigates to one of their routes.

The significant change from version 2 is the addition of the ***AppRoutingModule*** to the module `imports`.
The `AppRoutingModule` is a [_Routing Module_](../guide/router.html#routing-module)
that handles the app's routing concerns.

### App routing

{@example 'ngmodule/ts/src/app/app-routing.module.ts'}

The router is the subject of [its own page](router.html) so we'll skip lightly over the details and
concentrate on the intersection of Angular modules and routing.

This file defines three routes.

The first redirects the empty URL (e.g., `http://host.com/`)
to another route whose path is `contact` (e.g., `http://host.com/contact`).

The `contact` route isn't defined here.
It's defined in the _Contact_ feature's _own_ routing module, `contact-routing.module.ts`.
It's standard practice for feature modules with routing components to define their own routes.
We'll get to that file in a moment.

The remaining two routes use lazy loading syntax to tell the router where to find the modules:

{@example 'ngmodule/ts/src/app/app-routing.module.ts' region='lazy-routes'}


A lazy loaded module location is a _string_, not a _type_.
In this app, the string identifies both the module _file_ and the module _class_,
the latter separated from the former by a `#`.
### RouterModule.forRoot

The `forRoot` static class method of the `RouterModule` with the provided configuration,
added to the `imports` array provides the routing concerns for the module.

{@example 'ngmodule/ts/src/app/app-routing.module.ts' region='forRoot'}

The returned `AppRoutingModule` class is a `Routing Module` containing both the `RouterModule` directives
and the Dependency Injection providers that produce a configured `Router`.

This `AppRoutingModule` is intended for the app _root_ module _only_.


~~~ {.alert.is-critical}

Never call `RouterModule.forRoot` in a feature routing module.

~~~

Back in the root `AppModule`, we add the `AppRoutingModule` to its `imports` list,
and the app is ready to navigate.

{@example 'ngmodule/ts/src/app/app.module.3.ts' region='imports'}

### Routing to a feature module
The `src/app/contact` folder holds a new file, `contact-routing.module.ts`.
It defines the `contact` route we mentioned a bit earlier and also provides a `ContactRoutingModule` like so:

{@example 'ngmodule/ts/src/app/contact/contact-routing.module.ts' region='routing'}

This time we pass the route list to the `forChild` method of the `RouterModule`.
It's only responsible for providing additional routes and is intended for feature modules.


~~~ {.alert.is-important}

Always call `RouterModule.forChild` in a feature routing module.


~~~



~~~ {.alert.is-helpful}

**_forRoot_** and **_forChild_** are conventional names for methods that
deliver different `import` values to root and feature modules.
Angular doesn't recognize them but Angular developers do.

[Follow this convention](../cookbook/ngmodule-faq.html#q-for-root) if you write a similar module
that has both shared [_declarables_](../cookbook/ngmodule-faq.html#q-declarable) and services.


~~~

`ContactModule` has changed in two small but important details
<md-tab-group>

  <md-tab label="src/app/contact/contact.module.3.ts">
    {@example 'ngmodule/ts/src/app/contact/contact.module.3.ts' region='class'}
  </md-tab>


  <md-tab label="src/app/contact/contact.module.2.ts">
    {@example 'ngmodule/ts/src/app/contact/contact.module.2.ts' region='class'}
  </md-tab>


</md-tab-group>

1. It imports the `ContactRoutingModule` object from `contact-routing.module.ts`
1. It no longer exports `ContactComponent`

Now that we navigate to `ContactComponent` with the router there's no reason to make it public.
Nor does it need a selector.
No template will ever again reference this `ContactComponent`.
It's gone from the [_AppComponent_ template](#app-component-template).


{@a hero-module}
### Lazy loaded routing to a module

The lazy loaded `HeroModule` and `CrisisModule` follow the same principles as any feature module.
They don't look different from the eagerly loaded `ContactModule`.

The `HeroModule` is a bit more complex than the `CrisisModule` which makes it
a more interesting and useful example. Here's its file structure:

<aio-filetree>

  <aio-folder>
    hero
    <aio-file>
      hero-detail.component.ts
    </aio-file>


    <aio-file>
      hero-list.component.ts
    </aio-file>


    <aio-file>
      hero.component.ts
    </aio-file>


    <aio-file>
      hero.module.ts
    </aio-file>


    <aio-file>
      hero-routing.module.ts
    </aio-file>


    <aio-file>
      hero.service.ts
    </aio-file>


    <aio-file>
      highlight.directive.ts
    </aio-file>


  </aio-folder>


</aio-filetree>

This is the child routing scenario familiar to readers of the [Router](router.html#child-routing-component) page.
The `HeroComponent` is the feature's top component and routing host.
Its template has a `<router-outlet>` that displays either a list of heroes (`HeroList`)
or an editor of a selected hero (`HeroDetail`).
Both components delegate to the `HeroService` to fetch and save data.

There's yet _another_ `HighlightDirective` that colors elements in yet a different shade.
We should [do something](#shared-module "Shared modules") about the repetition and inconsistencies.
We endure for now.

The `HeroModule` is a feature module like any other.

{@example 'ngmodule/ts/src/app/hero/hero.module.3.ts' region='class'}

It imports the `FormsModule` because the `HeroDetailComponent` template binds with `[(ngModel)]`.
It imports the `HeroRoutingModule` from `hero-routing.module.ts` just as `ContactModule` and `CrisisModule` do.

The `CrisisModule` is much the same. There's nothing more to say that's new.

<live-example embedded plnkr="pre-shared.3" img="devguide/ngmodule/v3-plunker.png">Try the live example.</live-example>


{@a shared-module}

## Shared modules

The app is shaping up.
One thing we don't like is carrying three different versions of the `HighlightDirective`.
And there's a bunch of other stuff cluttering the app folder level that could be tucked away.

Let's add a `SharedModule` to hold the common components, directives, and pipes
and share them with the modules that need them.

* create an `src/app/shared` folder
* move the `AwesomePipe` and `HighlightDirective` from `src/app/contact` to `src/app/shared`.
* delete the `HighlightDirective` classes from `src/app/` and `src/app/hero`
* create a `SharedModule` class to own the shared material
* update other feature modules to import `SharedModule`

Most of this is familiar blocking and tackling. Here is the `SharedModule`

{@example 'ngmodule/ts/src/app/shared/shared.module.ts'}

Some highlights
* It imports the `CommonModule` because its component needs common directives.
* It declares and exports the utility pipe, directive, and component classes as expected.
* It re-exports the `CommonModule` and `FormsModule`

### Re-exporting other modules

While reviewing our application, we noticed that many components requiring `SharedModule` directives
also use `NgIf` and `NgFor` from `CommonModule`
and bind to component properties with `[(ngModel)]`, a directive in the `FormsModule`.
Modules that declare these components would have to import `CommonModule`, `FormsModule` and `SharedModule`.

We can reduce the repetition by having `SharedModule` re-export `CommonModule` and `FormsModule`
so that importers of `SharedModule` get `CommonModule` and `FormsModule` _for free_.

As it happens, the components declared by `SharedModule` itself don't bind with `[(ngModel)]`.
Technically,  there is no need for `SharedModule` to import `FormsModule`.

`SharedModule` can still export `FormsModule` without listing it among its `imports`.

### Why _TitleComponent_ isn't shared

`SharedModule` exists to make commonly used components, directives and pipes available
for use in the templates of components in _many_ other modules.

The `TitleComponent` is used _only once_ by the `AppComponent`.
There's no point in sharing it.

<a id="no-shared-module-providers"></a>
### Why _UserService_ isn't shared

While many components share the same service _instances_,
they rely on Angular dependency injection to do this kind of sharing, not the module system.

Several components of our sample inject the `UserService`.
There should be _only one_ instance of the `UserService` in the entire application
and _only one_ provider of it.

`UserService` is an application-wide singleton.
We don't want each module to have its own separate instance.
Yet there is [a real danger](../cookbook/ngmodule-faq.html#q-why-it-is-bad) of that happening
if the `SharedModule` provides the `UserService`.


~~~ {.alert.is-critical}

Do **not** specify app-wide singleton `providers` in a shared module.
A lazy loaded module that imports that shared module will make its own copy of the service.


~~~



{@a core-module}

## The Core module
At the moment, our root folder is cluttered with the `UserService`
and the `TitleComponent` that only appears in the root `AppComponent`.
We did not include them in the `SharedModule` for reasons just explained.

Instead, we'll gather them in a single `CoreModule` that we **import _once_ when the app starts**
and _never import anywhere else_.

**Steps:**

* create an `src/app/core` folder
* move the `UserService` and `TitleComponent` from `src/app/` to `src/app/core`
* create a `CoreModule` class to own the core material
* update the `AppRoot` module to  import `CoreModule`

Again, most of this is familiar blocking and tackling. The interesting part is the `CoreModule`

{@example 'ngmodule/ts/src/app/core/core.module.ts' region='v4'}


We're importing some extra symbols from the Angular core library that we're not using yet.
They'll become relevant later in this page.The `@NgModule` metadata should be familiar.
We declare the `TitleComponent`  because this module _owns_ it and we export it
because `AppComponent` (which is in `AppModule`) displays the title in its template.
`TitleComponent` needs the Angular `NgIf` directive that we import from `CommonModule`.

`CoreModule` _provides_ the `UserService`. Angular registers that provider with the app root injector,
making a singleton instance of the `UserService` available to any component that needs it,
whether that component is eagerly or lazily loaded.

### Why bother?
This scenario is clearly contrived.
The app is too small to worry about a single service file and a tiny, one-time component.

A `TitleComponent` sitting in the root folder isn't bothering anyone.
The root `AppModule` can register the `UserService` itself,
as it does currently, even if we decide to relocate the `UserService` file to the `src/app/core` folder.

Real world apps have more to worry about.
They can have several single-use components (e.g., spinners, message toasts, and modal dialogs)
that appear only in the `AppComponent` template.
We don't import them elsewhere so they're not _shared_ in that sense.
Yet they're too big and messy to leave loose in the root folder.

Apps often have many singleton services like this sample's `UserService`.
Each must be registered _exactly once_, in the app root injector, when the application starts.

While many Components inject such services in their constructors &mdash;
and therefore require JavaScript `import` statements to import their symbols &mdash;
no other component or module should define or re-create the services themselves.
Their _providers_ are not shared.

We recommend collecting such single-use classes and hiding their gory details inside a `CoreModule`.
A simplified root `AppModule` imports `CoreModule` in its capacity as orchestrator of the application as a whole.

## Cleanup
Having refactored to a `CoreModule` and a `SharedModule`, it's time to cleanup the other modules.

### A trimmer _AppModule_

Here is the updated `AppModule` paired with version 3 for comparison:
<md-tab-group>

  <md-tab label="src/app/app.module.ts (v4)">
    {@example 'ngmodule/ts/src/app/app.module.ts' region='v4'}
  </md-tab>


  <md-tab label="src/app/app.module.ts (v3)">
    {@example 'ngmodule/ts/src/app/app.module.3.ts'}
  </md-tab>


</md-tab-group>

Notice that `AppModule` is ...
* a little smaller because many `src/app/root` classes have moved to other modules.
* stable because we'll add future components and providers to other modules, not this one.
* delegating to imported modules rather than doing work.
* focused on its main task, orchestrating the app as a whole.

### A trimmer _ContactModule_
Here is the new `ContactModule` paired with the prior version:
<md-tab-group>

  <md-tab label="src/app/contact/contact.module.ts (v4)">
    {@example 'ngmodule/ts/src/app/contact/contact.module.ts'}
  </md-tab>


  <md-tab label="src/app/contact/contact.module.ts (v3)">
    {@example 'ngmodule/ts/src/app/contact/contact.module.3.ts'}
  </md-tab>


</md-tab-group>

Notice that
* The `AwesomePipe` and `HighlightDirective` are gone.
* The imports include `SharedModule` instead of `CommonModule` and `FormsModule`
* This new version is leaner and cleaner.

<div class='l-hr'>

</div>



{@a core-for-root}

## Configure core services with _CoreModule.forRoot_

A module that adds providers to the application can offer a facility for configuring those providers as well.

By convention, the **_forRoot_** static method both provides and configures services at the same time.
It takes a service configuration object and returns a
[ModuleWithProviders](../api/core/index/ModuleWithProviders-interface.html) which is
a simple object with two properties:
* `ngModule` - the `CoreModule` class
* `providers` - the configured providers

The root `AppModule` imports the `CoreModule` and adds the `providers` to the `AppModule` providers.
More precisely, Angular accumulates all imported providers _before_ appending the items listed in `@NgModule.providers`.
This sequence ensures that whatever we add explicitly to the `AppModule` providers takes precedence
over the providers of imported modules.Let's add a `CoreModule.forRoot` method that configures the core `UserService`.

We've extended the core `UserService` with an optional, injected `UserServiceConfig`.
If a `UserServiceConfig` exists, the `UserService` sets the user name from that config.

{@example 'ngmodule/ts/src/app/core/user.service.ts' region='ctor'}

Here's `CoreModule.forRoot` that takes a `UserServiceConfig` object:

{@example 'ngmodule/ts/src/app/core/core.module.ts' region='for-root'}

Lastly, we call it _within the_ `imports` _list_ of the `AppModule`.

{@example 'ngmodule/ts/src/app/app.module.ts' region='import-for-root'}

The app displays "Miss Marple" as the user instead of the default "Sherlock Holmes".


~~~ {.alert.is-important}

Call `forRoot` only in the root application module, `AppModule`.
Calling it in any other module, particularly in a lazy loaded module,
is contrary to the intent and is likely to produce a runtime error.

Remember to _import_ the result; don't add it to any other `@NgModule` list.


~~~


<div class='l-hr'>

</div>



{@a prevent-reimport}

## Prevent reimport of the _CoreModule_

Only the root `AppModule` should import the `CoreModule`.
[Bad things happen](../cookbook/ngmodule-faq.html#q-why-it-is-bad) if a lazy loaded module imports it.

We could _hope_ that no developer makes that mistake.
Or we can guard against it and fail fast by adding the following `CoreModule` constructor.

{@example 'ngmodule/ts/src/app/core/core.module.ts' region='ctor'}

The constructor tells Angular to inject the `CoreModule` into itself.
That seems dangerously circular.

The injection _would be circular_ if Angular looked for `CoreModule` in the _current_ injector.
The `@SkipSelf` decorator means "_look for_ `CoreModule` _in an ancestor injector, above me in the injector hierarchy._"

If the constructor executes as intended in the `AppModule`,
there is no ancestor injector that could provide an instance of `CoreModule`.
The injector should give up.

By default the injector throws an error when it can't find a requested provider.
The `@Optional` decorator means not finding the service is OK.
The injector returns `null`, the `parentModule` parameter is null,
and the constructor concludes uneventfully.

It's a different story if we improperly import `CoreModule` into a lazy loaded module such as `HeroModule` (try it).

Angular creates a lazy loaded module with its own injector, a _child_ of the root injector.
`@SkipSelf` causes Angular to look for a `CoreModule` in the parent injector which this time is the root injector.
Of course it finds the instance imported by the root `AppModule`.
Now `parentModule` exists and the constructor throws the error.### Conclusion

You made it! You can examine and download the complete source for this final version from the live example.
<live-example embedded  img="devguide/ngmodule/final-plunker.png"></live-example>

### Frequently Asked Questions

Now that you understand Angular Modules, you may be interested
in the companion [Angular Module FAQs](../cookbook/ngmodule-faq.html "Angular Module FAQs") cookbook
with its ready answers to specific design and implementation questions.