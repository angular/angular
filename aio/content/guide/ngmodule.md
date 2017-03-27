@title
NgModules

@intro
Define application modules with @NgModule.

@description

**NgModules** help organize an application into cohesive blocks of functionality.
<!-- CF: "app" and "application" are used interchangeably throughout this page.
I'm not sure what's appropriate, so I left them as is for now.  -->

An NgModule is a class adorned with the *@NgModule* decorator function.
`@NgModule` takes a metadata object that tells Angular how to compile and run module code.
It identifies the module's own components, directives, and pipes,
making some of them public so external components can use them.
`@NgModule` may add service providers to the application dependency injectors.
And there are many more options covered here.

Before reading this page, read the
[The Root Module](guide/appmodule) page, which introduces NgModules and the essentials
of creating and maintaining a single root `AppModule` for the entire application.

This page covers NgModules in greater depth.

## Table of Contents
<!-- CF: The titling for tables of contents in the advanced chapters is inconsistent: 
- some are titled "Contents" while others are titled "Table of Contents" (should probably be sentence case as it's an H2
- some headings are H2, some are H3
- some pages don't have tables of contents
I didn't make changes here as I'm not sure what the correct style is. 
--> 
* [Angular modularity](guide/ngmodule#angular-modularity "Add structure to the app with NgModule")
* [The application root module](guide/ngmodule#root-module "The startup module that every app requires")
* [Bootstrap](guide/ngmodule#bootstrap "Launch the app in a browser with the root module as the entry point") the root module
* [Declarations](guide/ngmodule#declarations "Declare the components, directives, and pipes that belong to a module")
* [Providers](guide/ngmodule#providers "Extend the app with additional services")
* [Imports](guide/ngmodule#imports "Import components, directives, and pipes for use in component templates")
* [Resolve conflicts](guide/ngmodule#resolve-conflicts "When two directives have the same selector")
<!-- CF: See my comment in the "Resolve diretive conflicts" section below proposing renaming or reorganizing that section. --> 
* [Feature modules](guide/ngmodule#feature-modules "Partition the app into feature modules")
* [Lazy loaded modules](guide/ngmodule#lazy-load "Load modules asynchronously") with the router
* [Shared modules](guide/ngmodule#shared-module "Create modules for commonly used components, directives, and pipes")
* [The Core module](guide/ngmodule#core-module "Create a core module with app-wide singleton services and single-use components")
* [Configure core services with _forRoot_](guide/ngmodule#core-for-root "Configure providers during module import")
* [Prevent reimport of the _CoreModule_](guide/ngmodule#prevent-reimport "because bad things happen if a lazy loaded module imports Core")
* [NgModule metadata properties](guide/ngmodule#ngmodule-properties "A technical summary of the @NgModule metadata properties")
<!-- CF: This link goes to the top of this page. I would expect it to go to an "NgModule metadata properties"
 section at the end of this page, but that section doesn't exist. -->

### Live examples
This page explains NgModules through a progression of improvements to a sample with a "Tour of Heroes" theme.
Here's an index to live examples at key moments in the evolution of the sample:

* <live-example plnkr="minimal.0">A minimal NgModule app</live-example>
* <live-example plnkr="contact.1b">The first contact module</live-example>
* <live-example plnkr="contact.2">The revised contact module</live-example>
* <live-example plnkr="pre-shared.3">Just before adding _SharedModule_</live-example>
* <live-example>The final version</live-example>

### Frequently asked questions (FAQs)

This page covers NgModule concepts in a tutorial fashion.

The companion [NgModule FAQs](cookbook/ngmodule-faq) cookbook
offers answers to specific design and implementation questions.
Read this page before reading those FAQs.

<div class='l-hr'>

</div>



{@a angular-modularity}

## Angular modularity

Modules are a great way to organize an application and extend it with capabilities from external libraries.

Many Angular libraries are modules (such as `FormsModule`, `HttpModule`, and `RouterModule`).
Many third-party libraries are available as NgModules (such as
<a href="https://material.angular.io/" target="_blank">Material Design</a>,
<a href="http://ionicframework.com/" target="_blank">Ionic</a>,
<a href="https://github.com/angular/angularfire2" target="_blank">AngularFire2</a>).

NgModules consolidate components, directives, and pipes into
cohesive blocks of functionality, each focused on a
feature area, application business domain, workflow, or common collection of utilities.

Modules can also add services to the application.
Such services might be internally developed, such as the application logger.
Services can come from outside sources, such as the Angular router and Http client.

Modules can be loaded eagerly when the application starts.
They can also be _lazy loaded_ asynchronously by the router.

An NgModule is a class decorated with `@NgModule` metadata. The metadata do the following:

* Declare which components, directives, and pipes belong to the module.
* Make some of those classes public so that other component templates can use them.
* Import other modules with the components, directives, and pipes needed by the components in _this_ module.
* Provide services at the application level that any application component can use.

Every Angular app has at least one module class, the _root module_.
You bootstrap that module to launch the application.

The root module is all you need in a simple application with a few components.
As the app grows, you refactor the root module into *feature modules*
that represent collections of related functionality.
You then import these modules into the root module.

Later in this page, you'll read about this process. For now, you'll start with the root module.


{@a root-module}

## _AppModule_: the application root module

Every Angular app has a *root module* class.
By convention, the *root module* class is called `AppModule` and it exists in a file named `app.module.ts`.

The `AppModule` from the QuickStart seed on the [Setup](guide/setup) page is as minimal as possible:

<code-example path="setup/src/app/app.module.ts" linenums="false">

</code-example>

The `@NgModule` decorator defines the metadata for the module.
This page takes an intuitive approach to understanding the metadata and fills in details as it progresses.

The metadata imports a single helper module, `BrowserModule`, which every browser app must import.

`BrowserModule` registers critical application service providers.
It also includes common directives like `NgIf` and `NgFor`, which become immediately visible and usable
in any of this module's component templates.

The `declarations` list identifies the application's only component,
the _root component_, the top of the app's rather bare component tree.

The example `AppComponent` simply displays a data-bound title:

<code-example path="ngmodule/src/app/app.component.0.ts" linenums="false">

</code-example>

Lastly, the `@NgModule.bootstrap` property identifies this `AppComponent` as the _bootstrap component_.
When Angular launches the app, it places the HTML rendering of `AppComponent` in the DOM,
inside the `<my-app>` element tags of the `index.html`.


{@a bootstrap}

## Bootstrapping in _main.ts_
You launch the application by bootstrapping the `AppModule` in the `main.ts` file.

Angular offers a variety of bootstrapping options targeting multiple platforms.
This page describes two options, both targeting the browser.

### Dynamic bootstrapping with the just-in-time (JIT) compiler
In the first, _dynamic_ option, the [Angular compiler](cookbook/ngmodule-faq)
compiles the application in the browser and then launches the app.


<code-example path="ngmodule/src/main.ts" linenums="false">

</code-example>

The samples in this page demonstrate the dynamic bootstrapping approach.

<live-example embedded plnkr="minimal.0" img="devguide/ngmodule/minimal-plunker.png">Try the live example.</live-example>


### Static bootstrapping with the ahead-of-time (AOT) compiler

Consider the static alternative which can produce a much smaller application that
launches faster, especially on mobile devices and high latency networks.

In the _static_ option, the Angular compiler runs ahead of time as part of the build process,
producing a collection of class factories in their own files.
Among them is the `AppModuleNgFactory`.

The syntax for bootstrapping the pre-compiled `AppModuleNgFactory` is similar to
the dynamic version that bootstraps the `AppModule` class.


<code-example path="ngmodule/src/main-static.ts" linenums="false">

</code-example>

Because the entire application was pre-compiled,
Angular doesn't ship the Angular compiler to the browser and doesn't compile in the browser.

The application code downloaded to the browser is much smaller than the dynamic equivalent
and it's ready to execute immediately. The performance boost can be significant.

Both the JIT and AOT compilers generate an `AppModuleNgFactory` class from the same `AppModule`
 source code.
The JIT compiler creates that factory class on the fly, in memory, in the browser.
The AOT compiler outputs the factory to a physical file
that is imported here in the static version of `main.ts`.

In general, the `AppModule` should neither know nor care how it is bootstrapped.

Although the `AppModule` evolves as the app grows, the bootstrap code in `main.ts` doesn't change.
This is the last time you'll look at `main.ts`.

<div class='l-hr'>

</div>



{@a declarations}

## Declare directives and components
As the app evolves,
the first addition is a `HighlightDirective`, an [attribute directive](guide/attribute-directives)
that sets the background color of the attached element.

<code-example path="ngmodule/src/app/highlight.directive.ts" linenums="false">

</code-example>

Update the `AppComponent` template to attach the directive to the title:

<code-example path="ngmodule/src/app/app.component.1.ts" region="template" linenums="false">

</code-example>

If you ran the app now, Angular wouldn't recognize the `highlight` attribute and would ignore it.
You must declare the directive in `AppModule`.

Import the `HighlightDirective` class and add it to the module's `declarations` like this:

<code-example path="ngmodule/src/app/app.module.1.ts" region="directive" linenums="false">

</code-example>

### Add a component

Refactor the title into its own `TitleComponent`.
The component's template binds to the component's `title` and `subtitle` properties like this:

<code-example path="ngmodule/src/app/title.component.html" region="v1" linenums="false">

</code-example>



<code-example path="ngmodule/src/app/title.component.ts" region="v1" linenums="false">

</code-example>

Rewrite the `AppComponent` to display the new `TitleComponent` in the `<app-title>` element,
using an input binding to set the `subtitle`.

<code-example path="ngmodule/src/app/app.component.1.ts" linenums="false">

</code-example>

Angular won't recognize the `<app-title>` tag until you declare it in `AppModule`.
Import the `TitleComponent` class and add it to the module's `declarations`:

<code-example path="ngmodule/src/app/app.module.1.ts" region="component" linenums="false">

</code-example>



{@a providers}

## Service providers

Modules are a great way to provide services for all of the module's components.

The [Dependency Injection](guide/dependency-injection) page describes
the Angular hierarchical dependency-injection system and how to configure that system
with [providers](guide/dependency-injection) at different levels of the
application's component tree.

A module can add providers to the application's root dependency injector, making those services
available everywhere in the application.

Many applications capture information about the currently logged-in user and make that information
accessible through a user service.
This sample application has a dummy implementation of such a `UserService`.


<code-example path="ngmodule/src/app/user.service.ts" linenums="false">

</code-example>

The sample application should display a welcome message to the logged-in user just below the application title.
Update the `TitleComponent` template to show the welcome message below the application title.

<code-example path="ngmodule/src/app/title.component.html" linenums="false">

</code-example>

Update the `TitleComponent` class with a constructor that injects the `UserService`
and sets the component's `user` property from the service.

<code-example path="ngmodule/src/app/title.component.ts" linenums="false">

</code-example>

You've defined and used the service. Now to _provide_ it for all components to use,
add it to a `providers` property in the `AppModule` metadata:

<code-example path="ngmodule/src/app/app.module.1.ts" region="providers" linenums="false">

</code-example>



{@a imports}

## Import supporting modules

In the revised `TitleComponent`, an `*ngIf` directive guards the message.
There is no message if there is no user.

<code-example path="ngmodule/src/app/title.component.html" region="ngIf" linenums="false">

</code-example>

Although `AppModule` doesn't declare `NgIf`, the application still compiles and runs.
How can that be? The Angular compiler should either ignore or complain about unrecognized HTML.

Angular does recognize `NgIf` because you imported it earlier.
The initial version of `AppModule` imports `BrowserModule`.

<code-example path="ngmodule/src/app/app.module.0.ts" region="imports" linenums="false">

</code-example>

Importing `BrowserModule` made all of its public components, directives, and pipes visible
to the component templates in `AppModule`.

~~~ {.l-sub-section}

More accurately, `NgIf` is declared in `CommonModule` from `@angular/common`.

`CommonModule` contributes many of the common directives that applications need, including `ngIf` and `ngFor`.

`BrowserModule` imports `CommonModule` and [re-exports](cookbook/ngmodule-faq) it.
The net effect is that an importer of `BrowserModule` gets `CommonModule` directives automatically.

~~~

Many familiar Angular directives don't belong to `CommonModule`.
For example,  `NgModel` and `RouterLink` belong to Angular's `FormsModule` and `RouterModule` respectively.
You must import those modules before you can use their directives.

To illustrate this point, you'll extend the sample app with `ContactComponent`,
a form component that imports form support from the Angular `FormsModule`.

### Add the _ContactComponent_

[Angular forms](guide/forms) are a great way to manage user data entry.

The `ContactComponent` presents a "contact editor,"
implemented with Angular forms in the [template-driven form](guide/forms) style.


~~~ {.l-sub-section}

### Angular form styles

You can write Angular form components in
template-driven or
[reactive](cookbook/dynamic-form) style.
<!-- CF: this link goes to a page titled "Dynamic Forms". Should the link text be "dynamic" instead of "reactive"? --> 

The following sample imports the `FormsModule` from `@angular/forms` because
the `ContactComponent` is written in _template-driven_ style.
Modules with components written in the _reactive_ style
import the `ReactiveFormsModule`.


~~~

The `ContactComponent` selector matches an element named `<app-contact>`.
Add an element with that name to the `AppComponent` template, just below the `<app-title>`:

<code-example path="ngmodule/src/app/app.component.1b.ts" region="template" linenums="false">

</code-example>

Form components are often complex. The `ContactComponent` has its own `ContactService`
and [custom pipe](guide/pipes) (called `Awesome`),
and an alternative version of the `HighlightDirective`.

To make it manageable, place all contact-related material in an `src/app/contact` folder
and break the component into three constituent HTML, TypeScript, and css files:

<code-tabs>

  <code-pane title="src/app/contact/contact.component.html" path="ngmodule/src/app/contact/contact.component.html">

  </code-pane>


  <code-pane title="src/app/contact/contact.component.ts" path="ngmodule/src/app/contact/contact.component.3.ts">

  </code-pane>


  <code-pane title="src/app/contact/contact.component.css" path="ngmodule/src/app/contact/contact.component.css">

  </code-pane>


  <code-pane title="src/app/contact/contact.service.ts" path="ngmodule/src/app/contact/contact.service.ts">

  </code-pane>


  <code-pane title="src/app/contact/awesome.pipe.ts" path="ngmodule/src/app/contact/awesome.pipe.ts">

  </code-pane>


  <code-pane title="src/app/contact/highlight.directive.ts" path="ngmodule/src/app/contact/highlight.directive.ts">

  </code-pane>


</code-tabs>

In the middle of the component template,
notice the two-way data binding `[(ngModel)]`.
`ngModel` is the selector for the `NgModel` directive.

Although `NgModel` is an Angular directive, the _Angular compiler_ won't recognize it for the following reasons:
* `AppModule` doesn't declare `NgModel`.
* `NgModel` wasn't imported via `BrowserModule`.

Even if Angular somehow recognized `ngModel`,
`ContactComponent` wouldn't behave like an Angular form because
form features such as validation aren't yet available.

### Import the FormsModule

Add the `FormsModule` to the `AppModule` metadata's `imports` list.

<code-example path="ngmodule/src/app/app.module.1.ts" region="imports" linenums="false">

</code-example>

Now `[(ngModel)]` binding will work and the user input will be validated by Angular forms,
once you declare the new component, pipe, and directive.


~~~ {.alert.is-critical}

*Do not* add `NgModel`&mdash;or the `FORMS_DIRECTIVES`&mdash;to 
the `AppModule` metadata's declarations.
These directives belong to the `FormsModule`.

Components, directives, and pipes belong to _one module only_.

*Never re-declare classes that belong to another module.*


~~~



{@a declare-pipe}
### Declare the contact component, directive, and pipe

The application won't compile until you declare the contact component, directive, and pipe.
Update the `declarations` in the  `AppModule` accordingly:

<code-example path="ngmodule/src/app/app.module.1.ts" region="declarations" linenums="false">

</code-example>



{@a import-name-conflict}


~~~ {.l-sub-section}

There are two directives with the same name, both called `HighlightDirective`.

To work around this, create an alias for the contact version using the `as` JavaScript import keyword.

<code-example path="ngmodule/src/app/app.module.1b.ts" region="import-alias" linenums="false">

</code-example>

This solves the immediate issue of referencing both directive _types_ in the same file but
leaves another issue unresolved. 
You'll learn more about that issue later in this page, in [Resolve directive conflicts](guide/ngmodule#resolve-conflicts).


~~~

### Provide the _ContactService_
The `ContactComponent` displays contacts retrieved by the `ContactService`,
which Angular injects into its constructor.

You have to provide that service somewhere.
The `ContactComponent` could provide it,
but then the service would be scoped to this component only.
You want to share this service with other contact-related components that you'll surely add later.

In this app, add `ContactService` to the `AppModule` metadata's `providers` list:

<code-example path="ngmodule/src/app/app.module.1b.ts" region="providers" linenums="false">

</code-example>

Now you can inject `ContactService` (like `UserService`) into any component in the application.


{@a application-scoped-providers}


~~~ {.l-sub-section}

### Application-scoped providers
  The `ContactService` provider is _application_-scoped because Angular
  registers a module's `providers` with the application's *root injector*.

  Architecturally, the `ContactService` belongs to the Contact business domain.
  Classes in other domains don't need the `ContactService` and shouldn't inject it.

  You might expect Angular to offer a _module_-scoping mechanism to enforce this design.
  It doesn't. NgModule instances, unlike components, don't have their own injectors
  so they can't have their own provider scopes.

  This omission is intentional.
  NgModules are designed primarily to extend an application,
  to enrich the entire app with the module's capabilities.

  In practice, service scoping is rarely an issue.
  Non-contact components can't accidentally inject the `ContactService`.
  To inject `ContactService`, you must first import its _type_.
  Only Contact components should import the `ContactService` type.

  Read more in the [How do I restrict service scope to a module?](cookbook/ngmodule-faq) section
  of the [NgModule FAQs](cookbook/ngmodule-faq) page.


~~~

### Run the app
Everything is in place to run the application with its contact editor.

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
<!-- CF: This section describes directive conflicts in detail, but doesn't describe how to resolve them.
 This section seems like more of an introduction to the next section, "Feature modules". 
 Consider moving this section to be a child section of "Feature modules", or striking "Resolve" from this title. -->

An issue arose [earlier](guide/ngmodule#import-name-conflict) when you declared the contact's `HighlightDirective` because
you already had a `HighlightDirective` class at the application level.

The selectors of the two directives both highlight the attached element with a different color.

<code-tabs>

  <code-pane title="src/app/highlight.directive.ts" path="ngmodule/src/app/highlight.directive.ts">

  </code-pane>


  <code-pane title="src/app/contact/highlight.directive.ts" path="ngmodule/src/app/contact/highlight.directive.ts">

  </code-pane>


</code-tabs>

Both directives are declared in this module so both directives are active.

When the two directives compete to color the same element,
the directive that's declared later wins because its DOM changes overwrite the first.
In this case, the contact's `HighlightDirective` makes the application title text blue
when it should stay gold.


~~~ {.l-sub-section}

The issue is that two different classes are trying to do the same thing.

It's OK to import the same directive class multiple times.
Angular removes duplicate classes and only registers one of them.

But from Angular's perspective, two different classes, defined in different files, that have the same name
are not duplicates. Angular keeps both directives and
they take turns modifying the same HTML element.


~~~

At least the app still compiles.
If you define two different component classes with the same selector specifying the same element tag,
the compiler reports an error. It can't insert two components in the same DOM location.

To eliminate component and directive conflicts, create feature modules
that insulate the declarations in one module from the declarations in another.


{@a feature-modules}

## Feature modules

This application isn't big yet, but it's already experiencing structural issues.

* The root `AppModule` grows larger with each new application class.
* There are conflicting directives.
The `HighlightDirective` in the contact re-colors the work done by the `HighlightDirective` declared in `AppModule`.
Also, it colors the application title text when it should color only the `ContactComponent`.
* The app lacks clear boundaries between contact functionality and other application features.
That lack of clarity makes it harder to assign development responsibilities to different teams.

You can resolve these issues with _feature modules_.

A feature module is a class adorned by the `@NgModule` decorator and its metadata,
just like a root module.
Feature module metadata have the same properties as the metadata for a root module.

The root module and the feature module share the same execution context.
They share the same dependency injector, which means the services in one module
are available to all.

The modules have the following significant technical differences:

* You _boot_ the root module to _launch_ the app;
you _import_ a feature module to _extend_ the app.
* A feature module can expose or hide its implementation from other modules.

Otherwise, a feature module is distinguished primarily by its intent.

A feature module delivers a cohesive set of functionality
focused on an application business domain, user workflow, facility (forms, http, routing),
or collection of related utilities.

While you can do everything within the root module,
feature modules help you partition the app into areas of specific interest and purpose.
<!-- CF: Is this paragraph just restating the previous paragraph? 
If so, I recommend removing it or merging the two -->

A feature module collaborates with the root module and with other modules
through the services it provides and
the components, directives, and pipes that it shares.

In the next section, you'll carve the contact functionality out of the root module
and into a dedicated feature module.

<a id="contact-module-v1"></a>
### Make _Contact_ a feature module
<!-- CF: Is "Contact" a proper noun in this context? -->

It's easy to refactor the contact material into a contact feature module.

1. Create the `ContactModule` in the `src/app/contact` folder.
1. Move the contact material from `AppModule` to `ContactModule`.
1. Replace the imported  `BrowserModule` with `CommonModule`.
1. Import the `ContactModule` into the `AppModule`.

`AppModule` is the only existing class that changes. But you do add one new file.

### Add the _ContactModule_

Here's the new `ContactModule`:

<code-example path="ngmodule/src/app/contact/contact.module.2.ts">

</code-example>

You copy from `AppModule` the contact-related import statements and `@NgModule` properties
that concern the contact, and paste them into `ContactModule`.

You _import_ the `FormsModule` because the contact component needs it.

~~~ {.alert.is-important}

Modules don't inherit access to the components, directives, or pipes that are declared in other modules.
What `AppModule` imports is irrelevant to `ContactModule` and vice versa.
Before `ContactComponent` can bind with `[(ngModel)]`, its `ContactModule` must import `FormsModule`.

~~~

You also replaced `BrowserModule` by `CommonModule`, for reasons explained in the
[Should I import BrowserModule or CommonModule?](cookbook/ngmodule-faq) 
section of the [NgModule FAQs](cookbook/ngmodule-faq) page.

You _declare_ the contact component, directive, and pipe in the module `declarations`.

You _export_ the `ContactComponent` so
other modules that import the `ContactModule` can include it in their component templates.

All other declared contact classes are private by default.
The `AwesomePipe` and `HighlightDirective` are hidden from the rest of the application.
The `HighlightDirective` can no longer color the `AppComponent` title text.
### Refactor the _AppModule_
Return to the `AppModule` and remove everything specific to the contact feature set.

* Delete the contact import statements.
* Delete the contact declarations and contact providers.
* Delete the `FormsModule` from the `imports` list (`AppComponent` doesn't need it).

Leave only the classes required at the application root level.

Then import the `ContactModule` so the app can continue to display the exported `ContactComponent`.

Here's the refactored version of the `AppModule` along with the previous version.

<code-tabs>

  <code-pane title="src/app/app.module.ts (v2)" path="ngmodule/src/app/app.module.2.ts">

  </code-pane>


  <code-pane title="src/app/app.module.ts (v1)" path="ngmodule/src/app/app.module.1b.ts">

  </code-pane>


</code-tabs>

### ImprovementsThere's a lot to like in the revised `AppModule`.
* It does not change as the _Contact_ domain grows.
* It only changes when you add new modules.
* It's simpler:
  * Fewer import statements.
  * No `FormsModule` import.
  * No contact-specific declarations.
  * No `ContactService` provider.
  * No `HighlightDirective` conflict.

Try this `ContactModule` version of the sample.

<live-example embedded plnkr="contact.2" img="devguide/ngmodule/contact-2-plunker.png">Try the live example.</live-example>


{@a lazy-load}

## Lazy-loading modules with the router

The Heroic Staffing Agency sample app has evolved.
It has two more modules, one for managing the heroes on staff and another for matching crises to the heroes.
Both modules are in the early stages of development.
Their specifics aren't important to the story and this page doesn't discuss every line of code.

~~~ {.l-sub-section}

Examine and download the complete source for this version from 
the <live-example plnkr="pre-shared.3" img="devguide/ngmodule/v3-plunker.png">live example.</live-example>

~~~

Some facets of the current application merit discussion are as follows:

* The app has three feature modules: Contact, Hero, and Crisis.
* The Angular router helps users navigate among these modules.
* The `ContactComponent` is the default destination when the app starts.
* The `ContactModule` continues to be "eagerly" loaded when the application starts.
* `HeroModule` and the `CrisisModule` are lazy loaded.

<a id="app-component-template"></a>
The new `AppComponent` template has
a title, three links, and a `<router-outlet>`.

<code-example path="ngmodule/src/app/app.component.3.ts" region="template" linenums="false">

</code-example>

The `<app-contact>` element is gone; you're routing to the _Contact_ page now.

The `AppModule` has changed modestly:

<code-example path="ngmodule/src/app/app.module.3.ts">

</code-example>



~~~ {.l-sub-section}

Some file names bear a `.3` extension that indicates
a difference with prior or future versions.
The significant differences will be explained in due course.
<!-- CF: Can you be more specific here? Are the differences explained later in this page or in another page? --> 


~~~

The module still imports `ContactModule` so that its routes and components are mounted when the app starts.

The module does _not_ import `HeroModule` or `CrisisModule`.
They'll be fetched and mounted asynchronously when the user navigates to one of their routes.

The significant change from version 2 is the addition of the *AppRoutingModule* to the module `imports`.
The `AppRoutingModule` is a [routing module](guide/router)
that handles the app's routing concerns.

### App routing

<code-example path="ngmodule/src/app/app-routing.module.ts" linenums="false">

</code-example>

The router is the subject of the [Routing & Navigation](guide/router) page, so this section skips many of the details and
concentrates on the intersection of NgModules and routing.

The `app-routing.module.ts` file defines three routes.

The first route redirects the empty URL (such as `http://host.com/`)
to another route whose path is `contact` (such as `http://host.com/contact`).

The `contact` route isn't defined here.
It's defined in the _Contact_ feature's _own_ routing module, `contact-routing.module.ts`.
It's standard practice for feature modules with routing components to define their own routes.
You'll get to that file in a moment.

The remaining two routes use lazy loading syntax to tell the router where to find the modules:

<code-example path="ngmodule/src/app/app-routing.module.ts" region="lazy-routes" linenums="false">

</code-example>



~~~ {.l-sub-section}

A lazy-loaded module location is a _string_, not a _type_.
In this app, the string identifies both the module _file_ and the module _class_,
the latter separated from the former by a `#`.


~~~

### RouterModule.forRoot

The `forRoot` static class method of the `RouterModule` with the provided configuration and
added to the `imports` array provides the routing concerns for the module.

<code-example path="ngmodule/src/app/app-routing.module.ts" region="forRoot" linenums="false">

</code-example>

The returned `AppRoutingModule` class is a `Routing Module` containing both the `RouterModule` directives
and the dependency-injection providers that produce a configured `Router`.

This `AppRoutingModule` is intended for the app _root_ module only.


~~~ {.alert.is-critical}

Never call `RouterModule.forRoot` in a feature-routing module.

~~~

Back in the root `AppModule`, add the `AppRoutingModule` to its `imports` list,
and the app is ready to navigate.

<code-example path="ngmodule/src/app/app.module.3.ts" region="imports" linenums="false">

</code-example>

### Routing to a feature module
The `src/app/contact` folder holds a new file, `contact-routing.module.ts`.
It defines the `contact` route mentioned earlier and provides a `ContactRoutingModule` as follows:

<code-example path="ngmodule/src/app/contact/contact-routing.module.ts" region="routing" linenums="false">

</code-example>

This time you pass the route list to the `forChild` method of the `RouterModule`.
The route list is only responsible for providing additional routes and is intended for feature modules.


~~~ {.alert.is-important}

Always call `RouterModule.forChild` in a feature-routing module.


~~~



~~~ {.alert.is-helpful}

_forRoot_ and _forChild_ are conventional names for methods that
deliver different `import` values to root and feature modules.
Angular doesn't recognize them but Angular developers do.

[Follow this convention](cookbook/ngmodule-faq) if you write a similar module
that has both shared [declarables](cookbook/ngmodule-faq) and services.


~~~

`ContactModule` has changed in two small but important ways.

<code-tabs>

  <code-pane title="src/app/contact/contact.module.3.ts" path="ngmodule/src/app/contact/contact.module.3.ts" region="class">

  </code-pane>


  <code-pane title="src/app/contact/contact.module.2.ts" path="ngmodule/src/app/contact/contact.module.2.ts" region="class">

  </code-pane>


</code-tabs>

* It imports the `ContactRoutingModule` object from `contact-routing.module.ts`.
* It no longer exports `ContactComponent`.

Now that you navigate to `ContactComponent` with the router, there's no reason to make it public.
Also, `ContactComponent` doesn't need a selector.
No template will ever again reference this `ContactComponent`.
It's gone from the [AppComponent template](guide/ngmodule#app-component-template).


{@a hero-module}
### Lazy-loaded routing to a module

The lazy-loaded `HeroModule` and `CrisisModule` follow the same principles as any feature module.
They don't look different from the eagerly loaded `ContactModule`.

The `HeroModule` is a bit more complex than the `CrisisModule`, which makes it
a more interesting and useful example. Its file structure is as follows:

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

This is the child routing scenario familiar to readers of the 
[Child routing component](guide/router) section of the
[Routing & Navigation](guide/router) page.
The `HeroComponent` is the feature's top component and routing host.
Its template has a `<router-outlet>` that displays either a list of heroes (`HeroList`)
or an editor of a selected hero (`HeroDetail`).
Both components delegate to the `HeroService` to fetch and save data.

Yet another `HighlightDirective` colors elements in yet a different shade.
In the next section, [Shared modules](guide/ngmodule#shared-module "Shared modules"), you'll resolve the repetition and inconsistencies.

The `HeroModule` is a feature module like any other.

<code-example path="ngmodule/src/app/hero/hero.module.3.ts" region="class" linenums="false">

</code-example>

It imports the `FormsModule` because the `HeroDetailComponent` template binds with `[(ngModel)]`.
It imports the `HeroRoutingModule` from `hero-routing.module.ts` just as `ContactModule` and `CrisisModule` do.

The `CrisisModule` is much the same.

<live-example embedded plnkr="pre-shared.3" img="devguide/ngmodule/v3-plunker.png">Try the live example.</live-example>


{@a shared-module}

## Shared modules

The app is shaping up.
But it carries three different versions of the `HighlightDirective`.
And the many files cluttering the app folder level could be better organized.

Add a `SharedModule` to hold the common components, directives, and pipes
and share them with the modules that need them.

1. Create an `src/app/shared` folder.
* Move the `AwesomePipe` and `HighlightDirective` from `src/app/contact` to `src/app/shared`.
* Delete the `HighlightDirective` classes from `src/app/` and `src/app/hero`.
* Create a `SharedModule` class to own the shared material.
* Update other feature modules to import `SharedModule`.

Here is the `SharedModule`:

<code-example path="ngmodule/src/app/shared/shared.module.ts">

</code-example>

Note the following:
* It imports the `CommonModule` because its component needs common directives.
* It declares and exports the utility pipe, directive, and component classes as expected.
* It re-exports the `CommonModule` and `FormsModule`

### Re-exporting other modules

If you review the application, you may notice that many components requiring `SharedModule` directives
also use `NgIf` and `NgFor` from `CommonModule`
and bind to component properties with `[(ngModel)]`, a directive in the `FormsModule`.
Modules that declare these components would have to import `CommonModule`, `FormsModule`, and `SharedModule`.

You can reduce the repetition by having `SharedModule` re-export `CommonModule` and `FormsModule`
so that importers of `SharedModule` get `CommonModule` and `FormsModule` for free.

As it happens, the components declared by `SharedModule` itself don't bind with `[(ngModel)]`.
Technically,  there is no need for `SharedModule` to import `FormsModule`.

`SharedModule` can still export `FormsModule` without listing it among its `imports`.

### Why _TitleComponent_ isn't shared

`SharedModule` exists to make commonly used components, directives, and pipes available
for use in the templates of components in many other modules.

The `TitleComponent` is used only once by the `AppComponent`.
There's no point in sharing it.

<a id="no-shared-module-providers"></a>
### Why _UserService_ isn't shared

While many components share the same service instances,
they rely on Angular dependency injection to do this kind of sharing, not the module system.

Several components of the sample inject the `UserService`.
There should be only one instance of the `UserService` in the entire application
and only one provider of it.

`UserService` is an application-wide singleton.
You don't want each module to have its own separate instance.
Yet there is [a real danger](cookbook/ngmodule-faq) of that happening
<!-- CF: This link goes to the top of the NgModule FAQs page. 
It looks like it is supposed to go to a specific question/section within the page. -->
if the `SharedModule` provides the `UserService`.


~~~ {.alert.is-critical}

Do *not* specify app-wide singleton `providers` in a shared module.
A lazy-loaded module that imports that shared module makes its own copy of the service.


~~~



{@a core-module}

## The Core module
At the moment, the root folder is cluttered with the `UserService`
and `TitleComponent` that only appear in the root `AppComponent`.
You didn't include them in the `SharedModule` for reasons just explained.

Instead, gather them in a single `CoreModule` that you import once when the app starts
and never import anywhere else. 

Perform the following steps:

1. Create an `src/app/core` folder.
* Move the `UserService` and `TitleComponent` from `src/app/` to `src/app/core`.
* Create a `CoreModule` class to own the core material.
* Update the `AppRoot` module to  import `CoreModule`.

Most of this work is familiar. The interesting part is the `CoreModule`.

<code-example path="ngmodule/src/app/core/core.module.ts" region="v4">

</code-example>



~~~ {.l-sub-section}

You're importing some extra symbols from the Angular core library that you're not using yet.
They'll become relevant later in this page.

~~~

The `@NgModule` metadata should be familiar.
You declare the `TitleComponent`  because this module owns it and you export it
because `AppComponent` (which is in `AppModule`) displays the title in its template.
`TitleComponent` needs the Angular `NgIf` directive that you import from `CommonModule`.

`CoreModule` provides the `UserService`. Angular registers that provider with the app root injector,
making a singleton instance of the `UserService` available to any component that needs it,
whether that component is eagerly or lazily loaded.


~~~ {.l-sub-section}

### Why bother?
This scenario is clearly contrived.
The app is too small to worry about a single service file and a tiny, one-time component.

A `TitleComponent` sitting in the root folder isn't bothering anyone.
The root `AppModule` can register the `UserService` itself,
as it does currently, even if you decide to relocate the `UserService` file to the `src/app/core` folder.

Real-world apps have more to worry about.
They can have several single-use components (such as spinners, message toasts, and modal dialogs)
that appear only in the `AppComponent` template.
You don't import them elsewhere so they're not shared in that sense.
Yet they're too big and messy to leave loose in the root folder.

Apps often have many singleton services like this sample's `UserService`.
Each must be registered exactly once, in the app root injector, when the application starts.

While many components inject such services in their constructors&mdash;and 
therefore require JavaScript `import` statements to import their symbols&mdash;no 
other component or module should define or re-create the services themselves.
Their _providers_ aren't shared.

We recommend collecting such single-use classes and hiding their details inside a `CoreModule`.
A simplified root `AppModule` imports `CoreModule` in its capacity as orchestrator of the application as a whole.


~~~


## Cleanup
Having refactored to a `CoreModule` and a `SharedModule`, it's time to clean up the other modules.

### A trimmer _AppModule_

Here is the updated `AppModule` paired with version 3 for comparison:

<code-tabs>

  <code-pane title="src/app/app.module.ts (v4)" path="ngmodule/src/app/app.module.ts" region="v4">

  </code-pane>


  <code-pane title="src/app/app.module.ts (v3)" path="ngmodule/src/app/app.module.3.ts">

  </code-pane>


</code-tabs>

`AppModule` now has the following qualities:
* A little smaller because many `src/app/root` classes have moved to other modules.
* Stable because you'll add future components and providers to other modules, not this one.
* Delegated to imported modules rather than doing work.
* Focused on its main task, orchestrating the app as a whole.

### A trimmer _ContactModule_
Here is the new `ContactModule` paired with the prior version:

<code-tabs>

  <code-pane title="src/app/contact/contact.module.ts (v4)" path="ngmodule/src/app/contact/contact.module.ts">

  </code-pane>


  <code-pane title="src/app/contact/contact.module.ts (v3)" path="ngmodule/src/app/contact/contact.module.3.ts">

  </code-pane>


</code-tabs>

Notice the following:
* The `AwesomePipe` and `HighlightDirective` are gone.
* The imports include `SharedModule` instead of `CommonModule` and `FormsModule`.
* The new version is leaner and cleaner.

<div class='l-hr'>

</div>



{@a core-for-root}

## Configure core services with _CoreModule.forRoot_

A module that adds providers to the application can offer a facility for configuring those providers as well.

By convention, the `forRoot` static method both provides and configures services at the same time.
It takes a service configuration object and returns a
[ModuleWithProviders](api/core/index/ModuleWithProviders-interface), which is
a simple object with the following properties:
* `ngModule`: the `CoreModule` class
* `providers`: the configured providers

The root `AppModule` imports the `CoreModule` and adds the `providers` to the `AppModule` providers.

~~~ {.l-sub-section}

More precisely, Angular accumulates all imported providers before appending the items listed in `@NgModule.providers`.
This sequence ensures that whatever you add explicitly to the `AppModule` providers takes precedence
over the providers of imported modules.

~~~

Add a `CoreModule.forRoot` method that configures the core `UserService`.

You've extended the core `UserService` with an optional, injected `UserServiceConfig`.
If a `UserServiceConfig` exists, the `UserService` sets the user name from that config.

<code-example path="ngmodule/src/app/core/user.service.ts" region="ctor" linenums="false">

</code-example>

Here's `CoreModule.forRoot` that takes a `UserServiceConfig` object:

<code-example path="ngmodule/src/app/core/core.module.ts" region="for-root" linenums="false">

</code-example>

Lastly, call it within the `imports` list of the `AppModule`.

<code-example path="ngmodule/src/app/app.module.ts" region="import-for-root" linenums="false">

</code-example>

The app displays "Miss Marple" as the user instead of the default "Sherlock Holmes".


~~~ {.alert.is-important}

Call `forRoot` only in the root application module, `AppModule`.
Calling it in any other module, particularly in a lazy-loaded module,
is contrary to the intent and can produce a runtime error.

Remember to _import_ the result; don't add it to any other `@NgModule` list.


~~~


<div class='l-hr'>

</div>



{@a prevent-reimport}

## Prevent reimport of the _CoreModule_

Only the root `AppModule` should import the `CoreModule`.
[Bad things happen](cookbook/ngmodule-faq) if a lazy-loaded module imports it.
<!-- CF: Again, this link goes to the top of the NgModule FAQs page. 
It looks like it is supposed to go to a specific question/section within the page. -->

You could hope that no developer makes that mistake.
Or you can guard against it and fail fast by adding the following `CoreModule` constructor.

<code-example path="ngmodule/src/app/core/core.module.ts" region="ctor" linenums="false">

</code-example>

The constructor tells Angular to inject the `CoreModule` into itself.
That seems dangerously circular.

The injection would be circular if Angular looked for `CoreModule` in the _current_ injector.
The `@SkipSelf` decorator means "look for `CoreModule` in an ancestor injector, above me in the injector hierarchy."

If the constructor executes as intended in the `AppModule`,
there is no ancestor injector that could provide an instance of `CoreModule`.
The injector should give up.

By default, the injector throws an error when it can't find a requested provider.
The `@Optional` decorator means not finding the service is OK.
The injector returns `null`, the `parentModule` parameter is null,
and the constructor concludes uneventfully.

It's a different story if you improperly import `CoreModule` into a lazy-loaded module such as `HeroModule` (try it).

Angular creates a lazy-loaded module with its own injector, a _child_ of the root injector.
`@SkipSelf` causes Angular to look for a `CoreModule` in the parent injector, which this time is the root injector.
Of course it finds the instance imported by the root `AppModule`.
Now `parentModule` exists and the constructor throws the error.### Conclusion

You made it! You can examine and download the complete source for this final version from the live example.
<live-example embedded  img="devguide/ngmodule/final-plunker.png"></live-example>

### Frequently asked questions

Now that you understand NgModules, you may be interested
in the companion [NgModule FAQs](cookbook/ngmodule-faq) page
with its ready answers to specific design and implementation questions.