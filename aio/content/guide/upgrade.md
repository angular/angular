@title
Upgrading from AngularJS

@intro
Incrementally upgrade an AngularJS application to Angular.

@description


_Angular_ is the name for the Angular of today and tomorrow.
_AngularJS_ is the name for all v1.x versions of Angular.

AngularJS apps are great.
Always consider the business case before moving to Angular.
An important part of that case is the time and effort to get there.
This guide describes the built-in tools for efficiently migrating AngularJS projects over to the
Angular platform, a piece at a time.

Some applications will be easier to upgrade than others, and there are
ways in which we can make it easier for ourselves. It is possible to
prepare and align AngularJS applications with Angular even before beginning
the upgrade process. These preparation steps are all about making the code
more decoupled, more maintainable, and up to speed with modern development
tools. That means the preparation work will not only make the eventual upgrade
easier, but will also generally improve our AngularJS applications.

One of the keys to a successful upgrade is to do it incrementally,
by running the two frameworks side by side in the same application, and
porting AngularJS components to Angular one by one. This makes it possible
to upgrade even large and complex applications without disrupting other
business, because the work can be done collaboratively and spread over
a period of time. The `upgrade` module in Angular has been designed to
make incremental upgrading seamless.

<!--

1. [Preparation](guide/upgrade#preparation)

    1. [Follow the Angular Style Guide](guide/upgrade#follow-the-angular-styleguide)
    2. [Using a Module Loader](guide/upgrade#using-a-module-loader)
    3. [Migrating to TypeScript](guide/upgrade#migrating-to-typescript)
    4. [Using Component Directives](guide/upgrade#using-component-directives)

2. [Upgrading with The Upgrade Module](guide/upgrade#upgrading-with-the-upgrade-module)

    1. [How The Upgrade Module Works](guide/upgrade#how-the-upgrade-module-works)
    2. [Bootstrapping hybrid](guide/upgrade#bootstrapping-hybrid-applications)
    3. [Using Angular Components from AngularJS Code](guide/upgrade#using-angular-components-from-angularjs-code)
    4. [Using AngularJS Component Directives from Angular Code](guide/upgrade#using-angularjs-component-directives-from-angular-code)
    5. [Projecting AngularJS Content into Angular Components](guide/upgrade#projecting-angularjs-content-into-angular-components)
    6. [Transcluding Angular Content into AngularJS Component Directives](guide/upgrade#transcluding-angular-content-into-angularjs-component-directives)
    7. [Making AngularJS Dependencies Injectable to Angular](guide/upgrade#making-angularjs-dependencies-injectable-to-angular)
    8. [Making Angular Dependencies Injectable to AngularJS](guide/upgrade#making-angular-dependencies-injectable-to-angularjs)
    9. [Using Ahead-of-time compilation with hybrid apps](guide/upgrade#using-ahead-of-time-compilation-with-hybrid-apps)
    10. [Dividing routes between Angular and AngularJS](guide/upgrade#dividing-routes-between-angular-and-angularjs)

3. [PhoneCat Upgrade Tutorial](guide/upgrade#phonecat-upgrade-tutorial)

    1. [Switching to TypeScript](guide/upgrade#switching-to-typescript)
    2. [Installing Angular](guide/upgrade#installing-angular)
    3. [Bootstrapping a hybrid PhoneCat](guide/upgrade#bootstrapping-a-hybrid-phonecat)
    4. [Upgrading the Phone service](guide/upgrade#upgrading-the-phone-service)
    5. [Upgrading Components](guide/upgrade#upgrading-components)
    6. [AoT compile the hybrid app](guide/upgrade#aot-compile-the-hybrid-app)
    7. [Adding The Angular Router And Bootstrap](guide/upgrade#adding-the-angular-router-and-bootstrap)
    8. [Say Goodbye to AngularJS](guide/upgrade#say-goodbye-to-angularjs)

3. [Appendix: Upgrading PhoneCat Tests](guide/upgrade#appendix-upgrading-phonecat-tests)

-->

## Preparation

There are many ways to structure AngularJS applications. When we begin
to upgrade these applications to Angular, some will turn out to be
much more easy to work with than others. There are a few key techniques
and patterns that we can apply to future proof our apps even before we
begin the migration.

{@a follow-the-angular-styleguide}

### Follow the Angular Style Guide

The [AngularJS Style Guide](https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#single-responsibility)
collects patterns and practices that have been proven to result in
cleaner and more maintainable AngularJS applications. It contains a wealth
of information about how to write and organize Angular code - and equally
importantly - how **not** to write and organize Angular code.

Angular is a reimagined version of the best parts of AngularJS. In that
sense, its goals are the same as the Angular Style Guide's: To preserve
the good parts of AngularJS, and to avoid the bad parts. There's a lot
more to Angular than just that of course, but this does mean that
*following the style guide helps make your AngularJS app more closely
aligned with Angular*.

There are a few rules in particular that will make it much easier to do

*an incremental upgrade* using the Angular `upgrade` module:

* The [Rule of 1](https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#single-responsibility)
  states that there should be one component per file. This not only makes
  components easy to navigate and find, but will also allow us to migrate
  them between languages and frameworks one at a time. In this example application,
  each controller, component, service, and filter is in its own source file.

* The [Folders-by-Feature Structure](https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#folders-by-feature-structure)
  and [Modularity](https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#modularity)
  rules define similar principles on a higher level of abstraction: Different parts of the
  application should reside in different directories and Angular modules.

When an application is laid out feature per feature in this way, it can also be
migrated one feature at a time. For applications that don't already look like
this, applying the rules in the Angular style guide is a highly recommended
preparation step. And this is not just for the sake of the upgrade - it is just
solid advice in general!

### Using a Module Loader

When we break application code down into one component per file, we often end
up with a project structure with a large number of relatively small files. This is
a much neater way to organize things than a small number of large files, but it
doesn't work that well if you have to load all those files to the HTML page with
&lt;script&gt; tags. Especially when you also have to maintain those tags in the correct
order. That's why it's a good idea to start using a *module loader*.

Using a module loader such as [SystemJS](https://github.com/systemjs/systemjs),
[Webpack](http://webpack.github.io/), or [Browserify](http://browserify.org/)
allows us to use the built-in module systems of the TypeScript or ES2015 languages in our apps.
We can use the `import` and `export` features that explicitly specify what code can
and will be shared between different parts of the application. For ES5 applications
we can use CommonJS style `require` and `module.exports` features. In both cases,
the module loader will then take care of loading all the code the application needs
in the correct order.

When we then take our applications into production, module loaders also make it easier
to package them all up into production bundles with batteries included.


### Migrating to TypeScript

If part of our Angular upgrade plan is to also take TypeScript into use, it makes
sense to bring in the TypeScript compiler even before the upgrade itself begins.
This means there's one less thing to learn and think about during the actual upgrade.
It also means we can start using TypeScript features in our AngularJS code.

Since TypeScript is a superset of ECMAScript 2015, which in turn is a superset
of ECMAScript 5, "switching" to TypeScript doesn't necessarily require anything
more than installing the TypeScript compiler and switching renaming files from
`*.js` to `*.ts`. But just doing that is not hugely useful or exciting, of course.
Additional steps like the following can give us much more bang for the buck:

* For applications that use a module loader, TypeScript imports and exports
  (which are really ECMAScript 2015 imports and exports) can be used to organize
  code into modules.
* Type annotations can be gradually added to existing functions and variables
  to pin down their types and get benefits like build-time error checking,
  great autocompletion support and inline documentation.
* JavaScript features new to ES2015, like arrow functions, `let`s and `const`s,
  default function parameters, and destructuring assignments can also be gradually
  added to make the code more expressive.
* Services and controllers can be turned into *classes*. That way they'll be a step
  closer to becoming Angular service and component classes, which will make our
  life easier once we do the upgrade.

### Using Component Directives

In Angular, components are the main primitive from which user interfaces
are built. We define the different parts of our UIs as components, and then
compose the UI by using components in our templates.

You can also do this in AngularJS, using *component directives*. These are
directives that define their own templates, controllers, and input/output bindings -
the same things that Angular components define. Applications built with
component directives are much easier to migrate to Angular than applications
built with lower-level features like `ng-controller`,  `ng-include`, and scope
inheritance.

To be Angular compatible, an AngularJS component directive should configure
these attributes:

* `restrict: 'E'`. Components are usually used as elements.
* `scope: {}` - an isolate scope. In Angular, components are always isolated
  from their surroundings, and we should do this in AngularJS too.
* `bindToController: {}`. Component inputs and outputs should be bound
  to the controller instead of using the `$scope`.
* `controller` and `controllerAs`. Components have their own controllers.
* `template` or `templateUrl`. Components have their own templates.

Component directives may also use the following attributes:

* `transclude: true`, if the component needs to transclude content from elsewhere.
* `require`, if the component needs to communicate with some parent component's
  controller.

Component directives **may not** use the following attributes:

* `compile`. This will not be supported in Angular.
* `replace: true`. Angular never replaces a component element with the
  component template. This attribute is also deprecated in AngularJS.
* `priority` and `terminal`. While AngularJS components may use these,
  they are not used in Angular and it is better not to write code
  that relies on them.

An AngularJS component directive that is fully aligned with the Angular
architecture may look something like this:


<code-example path="upgrade-module/src/app/hero-detail.directive.ts" title="upgrade-module/src/app/hero-detail.directive.ts">

</code-example>



AngularJS 1.5 introduces the [component API](https://docs.angularjs.org/api/ng/type/angular.Module)
that makes it easier to define directives like these. It is a good idea to use
this API for component directives for several reasons:

* It requires less boilerplate code.
* It enforces the use of component best practices like `controllerAs`.
* It has good default values for directive attributes like `scope` and `restrict`.

The component directive example from above looks like this when expressed
using the component API:


<code-example path="upgrade-module/src/app/upgrade-io/hero-detail.component.ts" title="upgrade-module/src/app/upgrade-io/hero-detail.component.ts">

</code-example>



Controller lifecycle hook methods `$onInit()`, `$onDestroy()`, and `$onChanges()`
are another convenient feature that AngularJS 1.5 introduces. They all have nearly
exact [equivalents in Angular](guide/lifecycle-hooks), so organizing component lifecycle
logic around them will ease the eventual Angular upgrade process.



## Upgrading with The Upgrade Module

The `upgrade` module in Angular is a very useful tool for upgrading
anything but the smallest of applications. With it we can mix and match
AngularJS and Angular components in the same application and have them interoperate
seamlessly. That means we don't have to do the upgrade work all at once,
since there's a natural coexistence between the two frameworks during the
transition period.

### How The Upgrade Module Works

The primary tool provided by the upgrade module is called the `UpgradeModule`.
This is a service that can bootstrap and manage hybrid applications that support
both Angular and AngularJS code.

When we use `UpgradeModule`, what we're really doing is *running both versions
of Angular at the same time*. All Angular code is running in the Angular
framework, and AngularJS code in the AngularJS framework. Both of these are the
actual, fully featured versions of the frameworks. There is no emulation going on,
so we can expect to have all the features and natural behavior of both frameworks.

What happens on top of this is that components and services managed by one
framework can interoperate with those from the other framework. This happens
in three main areas: Dependency injection, the DOM, and change detection.

#### Dependency Injection

Dependency injection is front and center in both AngularJS and
Angular, but there are some key differences between the two
frameworks in how it actually works.


<table>

  <tr>

    <th>
      AngularJS
    </th>

    <th>
      Angular
    </th>

  </tr>

  <tr>

    <td>


      Dependency injection tokens are always strings
    </td>

    <td>


      Tokens [can have different types](guide/dependency-injection).
      They are often classes. They may also be strings.
    </td>

  </tr>

  <tr>

    <td>


      There is exactly one injector. Even in multi-module applications,
      everything is poured into one big namespace.
    </td>

    <td>


      There is a [tree hierarchy of injectors](guide/hierarchical-dependency-injection),
      with a root injector and an additional injector for each component.

    </td>

  </tr>

</table>



Even accounting for these differences we can still have dependency injection
interoperability. The `UpgradeModule` resolves the differences and makes
everything work seamlessly:

* You can make AngularJS services available for injection to Angular code
  by *upgrading* them. The same singleton instance of each service is shared
  between the frameworks. In Angular these services will always be in the
  *root injector* and available to all components.

* You can also make Angular services available for injection to AngularJS code
  by *downgrading* them. Only services from the Angular root injector can
  be downgraded. Again, the same singleton instances are shared between the frameworks.
  When we register a downgrade, we explicitly specify a *string token* that we want to
  use in AngularJS.


<figure>
  <img src="generated/images/guide/upgrade/injectors.png" alt="The two injectors in a hybrid application">
</figure>



#### Components and the DOM

What we'll find in the DOM of a hybrid application are components and
directives from both AngularJS and Angular. These components
communicate with each other by using the input and output bindings
of their respective frameworks, which the `UpgradeModule` bridges
together. They may also communicate through shared injected dependencies,
as described above.

There are two key things to understand about what happens in the DOM
of a hybrid application:

1. Every element in the DOM is owned by exactly one of the two
   frameworks. The other framework ignores it. If an element is
   owned by AngularJS, Angular treats it as if it didn't exist,
   and vice versa.

2. The root of the application *is always an AngularJS template*.

So a hybrid application begins life as an AngularJS application,
and it is AngularJS that processes its root template. Angular then steps
into the picture when an Angular component is used somewhere in
the application templates. That component's view will then be managed
by Angular, and it may use any number of Angular components and
directives.

Beyond that, we may interleave the two frameworks as much as we need to.
We always cross the boundary between the two frameworks by one of two
ways:

1. By using a component from the other framework: An AngularJS template
   using an Angular component, or an Angular template using an
   AngularJS component.

2. By transcluding or projecting content from the other framework. The
  `UpgradeModule` bridges the related concepts of  AngularJS transclusion
   and Angular content projection together.


<figure>
  <img src="generated/images/guide/upgrade/dom.png" alt="DOM element ownership in a hybrid application">
</figure>



Whenever we use a component that belongs to the other framework, a
switch between framework boundaries occurs. However, that switch only
happens to the *children* of the component element. Consider a situation
where we use an Angular component from AngularJS like this:


<code-example language="html" escape="html">
  <a-component></a-component>

</code-example>



The DOM element `<a-component>` will remain to be an AngularJS managed
element, because it's defined in an AngularJS template. That also
means you can apply additional AngularJS directives to it, but *not*
Angular directives. It is only in the template of the `<a-component>`
where Angular steps in. This same rule also applies when you
use AngularJS component directives from Angular.


#### Change Detection

Change detection in AngularJS is all about `scope.$apply()`. After every
event that occurs, `scope.$apply()` gets called. This is done either
automatically by the framework, or in some cases manually by our own
code. It is the point in time when change detection occurs and data
bindings get updated.

In Angular things are different. While change detection still
occurs after every event, no one needs to call `scope.$apply()` for
that to happen. This is because all Angular code runs inside something
called the [Angular zone](api/core/NgZone). Angular always
knows when the code finishes, so it also knows when it should kick off
change detection. The code itself doesn't have to call `scope.$apply()`
or anything like it.

In the case of hybrid applications, the `UpgradeModule` bridges the
AngularJS and Angular approaches. Here's what happens:

* Everything that happens in the application runs inside the Angular zone.
  This is true whether the event originated in AngularJS or Angular code.
  The zone triggers Angular change detection after every event.
* The `UpgradeModule` will invoke the AngularJS `$rootScope.$apply()` after
  every turn of the Angular zone. This also triggers AngularJS change
  detection after every event.


<figure>
  <img src="generated/images/guide/upgrade/change_detection.png" alt="Change detection in a hybrid application">
</figure>



What this means in practice is that we do not need to call `$apply()` in
our code, regardless of whether it is in AngularJS on Angular. The
`UpgradeModule` does it for us. We *can* still call `$apply()` so there
is no need to remove such calls from existing code. Those calls just don't
have any effect in a hybrid application.



When we downgrade an Angular component and then use it from AngularJS,
the component's inputs will be watched using AngularJS change detection.
When those inputs change, the corresponding properties in the component
are set. We can also hook into the changes by implementing the
[OnChanges](api/core/OnChanges) interface in the component,
just like we could if it hadn't been downgraded.

Correspondingly, when we upgrade an AngularJS component and use it from Angular,
all the bindings defined for the component directive's `scope` (or `bindToController`)
will be hooked into Angular change detection. They will be treated
as regular Angular inputs and set onto the scope (or controller) when
they change.

### Using UpgradeModule with Angular _NgModules_

Both AngularJS and Angular have their own concept of modules
to help organize an application into cohesive blocks of functionality.

Their details are quite different in architecture and implementation.
In AngularJS, you add Angular assets to the `angular.module` property.
In Angular, you create one or more classes adorned with an `NgModule` decorator
that describes Angular assets in metadata. The differences blossom from there.

In a hybrid application we run both versions of Angular at the same time.
That means that we need at least one module each from both AngularJS and Angular.
We will import `UpgradeModule` inside our Angular module, and then use it for
bootstrapping our AngularJS module. Let's see how.


<div class="l-sub-section">



Learn more about Angular modules at the [NgModule guide](guide/ngmodule).


</div>



### Bootstrapping hybrid applications

The first step to upgrading an application using the `UpgradeModule` is
always to bootstrap it as a hybrid that supports both AngularJS and
Angular, but still is an AngularJS app at top level.

Pure AngularJS applications can be bootstrapped in two ways: By using an `ng-app`
directive somewhere on the HTML page, or by calling
[angular.bootstrap](https://docs.angularjs.org/api/ng/function/angular.bootstrap)
from JavaScript. In Angular, only the second method is possible - there is
no `ng-app` in Angular. This is also the case for hybrid applications.
Therefore, it is a good preliminary step to switch AngularJS applications to use the
JavaScript bootstrap method even before switching them to hybrid mode.

Say we have an `ng-app` driven bootstrap such as this one:


<code-example path="upgrade-module/src/index-ng-app.html">

</code-example>



We can remove the `ng-app` and `ng-strict-di` directives from the HTML
and instead switch to calling `angular.bootstrap` from JavaScript, which
will result in the same thing:


<code-example path="upgrade-module/src/app/ajs-bootstrap/app.module.ts" region="bootstrap" title="upgrade-module/src/app/ajs-bootstrap/app.module.ts">

</code-example>



Now introduce Angular to the project. Inspired by instructions in
[the Setup](guide/setup), you can selectively copy in material from the
<a href="https://github.com/angular/quickstart">QuickStart github repository</a>.

Next, create an `app.module.ts` file and add the following `NgModule` class:


<code-example path="upgrade-module/src/app/ajs-a-hybrid-bootstrap/app.module.ts" region="ngmodule" title="upgrade-module/src/app/ajs-a-hybrid-bootstrap/app.module.ts">

</code-example>



This bare minimum `NgModule` imports `BrowserModule`, the module every Angular browser-based app must have.

It also imports `UpgradeModule` from `@angular/upgrade/static`, and adds an override to prevent
Angular from bootstrapping itself in the form of the `ngDoBootstrap` empty class method.

Now we bootstrap `AppModule` using `platformBrowserDynamic`'s `bootstrapModule` method.
Then we use dependency injection to get a hold of the `UpgradeModule` instance in `AppModule`,
and use it to bootstrap our AngularJS app.
The `upgrade.bootstrap` method takes the exact same arguments as [angular.bootstrap](https://docs.angularjs.org/api/ng/function/angular.bootstrap):


<code-example path="upgrade-module/src/app/ajs-a-hybrid-bootstrap/app.module.ts" region="bootstrap" title="upgrade-module/src/app/ajs-a-hybrid-bootstrap/app.module.ts">

</code-example>



We also need to install the `@angular/upgrade` package via `npm install @angular/upgrade --save`
and add a mapping for the `@angular/upgrade/static` package:


<code-example path="upgrade-module/src/systemjs.config.1.js" region="upgrade-static-umd" title="systemjs.config.js (map)">

</code-example>



Congratulations! You're running a hybrid application! The
existing AngularJS code works as before _and_ you're ready to run Angular code.


### Using Angular Components from AngularJS Code

<img src="generated/images/guide/upgrade/ajs-to-a.png" alt="Using an Angular component from AngularJS code" class="left">



Once we're running a hybrid app, we can start the gradual process of upgrading
code. One of the more common patterns for doing that is to use an Angular component
in an AngularJS context. This could be a completely new component or one that was
previously AngularJS but has been rewritten for Angular.

Say we have a simple Angular component that shows information about a hero:


<code-example path="upgrade-module/src/app/downgrade-static/hero-detail.component.ts" title="hero-detail.component.ts">

</code-example>



If we want to use this component from AngularJS, we need to *downgrade* it
using the `downgradeComponent()` method. What we get when we do that is an AngularJS
*directive*, which we can then register into our AngularJS module:


<code-example path="upgrade-module/src/app/downgrade-static/app.module.ts" region="downgradecomponent" title="upgrade-module/src/app/downgrade-static/app.module.ts">

</code-example>



Because `HeroDetailComponent` is an Angular component, we must also add it to the
`declarations` in the `AppModule`.

And because this component is being used from the AngularJS module, and is an entry point into
our Angular application, we also need to add it to the `entryComponents` for our
Angular module.


<code-example path="upgrade-module/src/app/downgrade-static/app.module.ts" region="ngmodule" title="upgrade-module/src/app/downgrade-static/app.module.ts">

</code-example>



<div class="l-sub-section">



All Angular components, directives and pipes must be declared in an NgModule.


</div>



The net result is an AngularJS directive called `heroDetail`, that we can
use like any other directive in our AngularJS templates.


<code-example path="upgrade-module/src/index-downgrade-static.html" region="usecomponent" title="upgrade-module/src/index-downgrade-static.html">

</code-example>



<div class="alert is-helpful">



Note that this AngularJS is an element directive (`restrict: 'E'`) called `heroDetail`.
An AngularJS element directive is matched based on its _name_.
*The `selector` metadata of the downgraded Angular component is ignored.*



</div>



Most components are not quite this simple, of course. Many of them
have *inputs and outputs* that connect them to the outside world. An
Angular hero detail component with inputs and outputs might look
like this:


<code-example path="upgrade-module/src/app/downgrade-io/hero-detail.component.ts" title="hero-detail.component.ts">

</code-example>



These inputs and outputs can be supplied from the AngularJS template, and the
`downgradeComponent()` method takes care of bridging them over via the `inputs`
and `outputs` arrays:


<code-example path="upgrade-module/src/app/downgrade-io/app.module.ts" region="downgradecomponent" title="upgrade-module/src/app/downgrade-io/app.module.ts">

</code-example>



<code-example path="upgrade-module/src/index-downgrade-io.html" region="usecomponent" title="upgrade-module/src/index-downgrade-io.html">

</code-example>



Note that even though we are in an AngularJS template, **we're using Angular
attribute syntax to bind the inputs and outputs**. This is a requirement for downgraded
components. The expressions themselves are still regular AngularJS expressions.


<div class="callout is-important">



<header>
  Use kebab-case for downgraded component attributes
</header>



There's one notable exception to the rule of using Angular attribute syntax
for downgraded components. It has to do with input or output names that consist
of multiple words. In Angular we would bind these attributes using camelCase:

<code-example format="">
  [myHero]="hero"
</code-example>



But when using them from AngularJS templates, we need to use kebab-case:

<code-example format="">
  [my-hero]="hero"

</code-example>



</div>



The `$event` variable can be used in outputs to gain access to the
object that was emitted. In this case it will be the `Hero` object, because
that is what was passed to `this.deleted.emit()`.

Since this is an AngularJS template, we can still use other AngularJS
directives on the element, even though it has Angular binding attributes on it.
For  example, we can easily make multiple copies of the component using `ng-repeat`:


<code-example path="upgrade-module/src/index-downgrade-io.html" region="userepeatedcomponent" title="upgrade-module/src/index-downgrade-io.html">

</code-example>



### Using AngularJS Component Directives from Angular Code

<img src="generated/images/guide/upgrade/a-to-ajs.png" alt="Using an AngularJS component from Angular code" class="left">


So, we can write an Angular component and then use it from AngularJS
code. This is very useful when we start our migration from lower-level
components and work our way up. But in some cases it is more convenient
to do things in the opposite order: To start with higher-level components
and work our way down. This too can be done using the `UpgradeModule`.
We can *upgrade* AngularJS component directives and then use them from
Angular.

Not all kinds of AngularJS directives can be upgraded. The directive
really has to be a *component directive*, with the characteristics
[described in the preparation guide above](guide/upgrade#using-component-directives).
Our safest bet for ensuring compatibility is using the
[component API](https://docs.angularjs.org/api/ng/type/angular.Module)
introduced in AngularJS 1.5.

A simple example of an upgradable component is one that just has a template
and a controller:


<code-example path="upgrade-module/src/app/upgrade-static/hero-detail.component.ts" region="hero-detail" title="hero-detail.component.ts">

</code-example>



We can *upgrade* this component to Angular using the `UpgradeComponent` class.
By creating a new Angular **directive** that extends `UpgradeComponent` and doing a `super` call
inside it's constructor, we have a fully upgrade AngularJS component to be used inside Angular.
All that is left is to add it to `AppModule`'s `declarations` array.


<code-example path="upgrade-module/src/app/upgrade-static/hero-detail.component.ts" region="hero-detail-upgrade" title="hero-detail.component.ts">

</code-example>



<code-example path="upgrade-module/src/app/upgrade-static/app.module.ts" region="hero-detail-upgrade" title="hero-detail.component.ts">

</code-example>



<div class="alert is-helpful">



Upgraded components are Angular **directives**, instead of **components**, because Angular
is unaware that AngularJS will create elements under it. As far as Angular knows, the upgraded
component is just a directive - a tag - and Angular doesn't have to concern itself with
it's children.


</div>



An upgraded component may also have inputs and outputs, as defined by
the scope/controller bindings of the original AngularJS component
directive. When we use the component from an Angular template,
we provide the inputs and outputs using **Angular template syntax**,
with the following rules:


<table>

  <tr>

    <th>

    </th>

    <th>
      Binding definition
    </th>

    <th>
      Template syntax
    </th>

  </tr>

  <tr>

    <th>
      Attribute binding
    </th>

    <td>


      `myAttribute: '@myAttribute'`
    </td>

    <td>


      `<my-component myAttribute="value">`
    </td>

  </tr>

  <tr>

    <th>
      Expression binding
    </th>

    <td>


      `myOutput: '&myOutput'`
    </td>

    <td>


      `<my-component (myOutput)="action()">`
    </td>

  </tr>

  <tr>

    <th>
      One-way binding
    </th>

    <td>


      `myValue: '<myValue'`
    </td>

    <td>


      `<my-component [myValue]="anExpression">`
    </td>

  </tr>

  <tr>

    <th>
      Two-way binding
    </th>

    <td>


      `myValue: '=myValue'`
    </td>

    <td>


      As a two-way binding: `<my-component [(myValue)]="anExpression">`.
      Since most AngularJS two-way bindings actually only need a one-way binding
      in practice, `<my-component [myValue]="anExpression">` is often enough.

    </td>

  </tr>

</table>



As an example, say we have a hero detail AngularJS component directive
with one input and one output:


<code-example path="upgrade-module/src/app/upgrade-io/hero-detail.component.ts" region="hero-detail-io" title="hero-detail.component.ts">

</code-example>



We can upgrade this component to Angular, annotate inputs and outputs in the upgrade directive,
and then provide the input and output using Angular template syntax:


<code-example path="upgrade-module/src/app/upgrade-io/hero-detail.component.ts" region="hero-detail-io-upgrade" title="hero-detail.component.ts">

</code-example>



<code-example path="upgrade-module/src/app/upgrade-io/container.component.ts" title="container.component.ts">

</code-example>



### Projecting AngularJS Content into Angular Components

<img src="generated/images/guide/upgrade/ajs-to-a-with-projection.png" alt="Projecting AngularJS content into Angular" class="left">


When we are using a downgraded Angular component from an AngularJS
template, the need may arise to *transclude* some content into it. This
is also possible. While there is no such thing as transclusion in Angular,
there is a very similar concept called *content projection*. The `UpgradeModule`
is able to make these two features interoperate.

Angular components that support content projection make use of an `<ng-content>`
tag within them. Here's an example of such a component:


<code-example path="upgrade-module/src/app/ajs-to-a-projection/hero-detail.component.ts" title="hero-detail.component.ts">

</code-example>



When using the component from AngularJS, we can supply contents for it. Just
like they would be transcluded in AngularJS, they get projected to the location
of the `<ng-content>` tag in Angular:


<code-example path="upgrade-module/src/index-ajs-to-a-projection.html" region="usecomponent" title="upgrade-module/src/index-ajs-to-a-projection.html">

</code-example>



<div class="alert is-helpful">



When AngularJS content gets projected inside an Angular component, it still
remains in "AngularJS land" and is managed by the AngularJS framework.


</div>



### Transcluding Angular Content into AngularJS Component Directives

<img src="generated/images/guide/upgrade/a-to-ajs-with-transclusion.png" alt="Projecting Angular content into AngularJS" class="left">

Just like we can project AngularJS content into Angular components,
we can *transclude* Angular content into AngularJS components, whenever
we are using upgraded versions from them.

When an AngularJS component directive supports transclusion, it may use
the `ng-transclude` directive in its template to mark the transclusion
point:


<code-example path="upgrade-module/src/app/a-to-ajs-transclusion/hero-detail.component.ts" title="hero-detail.component.ts">

</code-example>



<div class="alert is-helpful">



The directive also needs to have the `transclude: true` option enabled.
It is on by default for component directives defined with the
1.5 component API.


</div>



If we upgrade this component and use it from Angular, we can populate
the component tag with contents that will then get transcluded:


<code-example path="upgrade-module/src/app/a-to-ajs-transclusion/container.component.ts" title="container.component.ts">

</code-example>



### Making AngularJS Dependencies Injectable to Angular

When running a hybrid app, we may bump into situations where we need to have
some AngularJS dependencies to be injected to Angular code. This may be
because we have some business logic still in AngularJS services, or because
we need some of AngularJS's built-in services like `$location` or `$timeout`.

In these situations, it is possible to *upgrade* an AngularJS provider to
Angular. This makes it possible to then inject it somewhere in Angular
code. For example, we might have a service called `HeroesService` in AngularJS:


<code-example path="upgrade-module/src/app/ajs-to-a-providers/heroes.service.ts" title="heroes.service.ts">

</code-example>



We can upgrade the service using a Angular [Factory provider](guide/dependency-injection#factory-providers)
that requests the service from the AngularJS `$injector`.

We recommend declaring the Factory Provider in a separate `ajs-upgraded-providers.ts` file
so that they are all together, making it easier to reference them, create new ones and
delete them once the upgrade is over.

It's also recommended to export the `heroesServiceFactory` function so that Ahead-of-Time
compilation can pick it up.


<code-example path="upgrade-module/src/app/ajs-to-a-providers/ajs-upgraded-providers.ts" title="ajs-upgraded-providers.ts">

</code-example>



<code-example path="upgrade-module/src/app/ajs-to-a-providers/app.module.ts" region="register" title="app.module.ts">

</code-example>



We can then inject it in Angular using it's class as a type annotation:


<code-example path="upgrade-module/src/app/ajs-to-a-providers/hero-detail.component.ts" title="hero-detail.component.ts">

</code-example>



<div class="alert is-helpful">



In this example we upgraded a service class, which has the added benefit that
we can use a TypeScript type annotation when we inject it. While it doesn't
affect how the dependency is handled, it enables the benefits of static type
checking. This is not required though, and any AngularJS service, factory, or
provider can be upgraded.


</div>



### Making Angular Dependencies Injectable to AngularJS

In addition to upgrading AngularJS dependencies, we can also *downgrade*
Angular dependencies, so that we can use them from AngularJS. This can be
useful when we start migrating services to Angular or creating new services
in Angular while we still have components written in AngularJS.

For example, we might have an Angular service called `Heroes`:


<code-example path="upgrade-module/src/app/a-to-ajs-providers/heroes.ts" title="heroes.ts">

</code-example>



Again, as with Angular components, register the provider with the `NgModule` by adding it to the module's `providers` list.


<code-example path="upgrade-module/src/app/a-to-ajs-providers/app.module.ts" region="ngmodule" title="app.module.ts">

</code-example>



Now wrap the Angular `Heroes` in an *AngularJS factory function* using `downgradeInjectable()`.
and plug the factory into an AngularJS module.
The name of the AngularJS dependency is up to you:


<code-example path="upgrade-module/src/app/a-to-ajs-providers/app.module.ts" region="register" title="app.module.ts">

</code-example>



After this, the service is injectable anywhere in our AngularJS code:


<code-example path="upgrade-module/src/app/a-to-ajs-providers/hero-detail.component.ts" title="hero-detail.component.ts">

</code-example>



## Using Ahead-of-time compilation with hybrid apps

We can take advantage of Ahead-of-time (AoT) compilation on hybrid apps just like on any other
Angular application.
The setup for an hybrid app is mostly the same as described in
[the Ahead-of-time Compilation chapter](guide/aot-compiler)
save for differences in `index.html` and `main-aot.ts`

Our `index.html` will likely have script tags loading AngularJS files, so the `index.html` we
use for AoT must also load those files.
An easy way to copy them is by adding each to the `copy-dist-files.js` file.

We also need to use `UpgradeModule` to bootstrap a hybrid app after bootstrapping the
Module Factory:


<code-example path="upgrade-phonecat-2-hybrid/app/main-aot.ts" title="app/main-aot.ts">

</code-example>



And that's all we need to get the full benefit of AoT for Angular apps!


<div class="alert is-helpful">



The AoT metadata collector will not detect lifecycle hook methods on a parent class' prototype,
so in order for upgraded components to work we needs to implement the lifecycle hooks
on the upgraded component class and forward them to the `UpgradeComponent` parent.


</div>



## Dividing routes between Angular and AngularJS

Another important part of upgrading is upgrading routes.
We could upgrade our whole app while still using the AngularJS router and then
migrate all the routes in one fell swoop.
But it would be much better to migrate routes one by one as they become upgraded.

The first step to have a dual router setup is to add an Angular root component containing
one outlet for each router.
AngularJS will use `ng-view`, and Angular will use `router-outlet`.
When one is using it's router, the other outlet will be empty.


<code-example path="upgrade-module/src/app/divide-routes/app.component.ts" title="app.component.ts">

</code-example>



We want to use this component in the body of our `index.html` instead of an AngularJS component:


<code-example path="upgrade-module/src/index-divide-routes.html" region="body" title="app.component.ts (body)">

</code-example>



Next we declare both AngularJS and Angular routes as normal:


<code-example path="upgrade-module/src/app/divide-routes/app.module.ts" region="ajs-route" title="app.module.ts (AngularJS route)">

</code-example>



<code-example path="upgrade-module/src/app/divide-routes/hero.module.ts" region="a-route" title="hero.module.ts (Angular route)">

</code-example>



In our `app.module.ts` we need to add `AppComponent` to the declarations and boostrap array.

Next we configure the router itself.
We want to use [hash navigation](guide/router#hashlocationstrategy) in Angular
because that's what we're also using in AngularJS.

Lastly, and most importantly, we want to use a custom `UrlHandlingStrategy` that will tell
the Angular router which routes it should render - and only those.


<code-example path="upgrade-module/src/app/divide-routes/app.module.ts" region="router-config" title="app.module.ts (router config)">

</code-example>



That's it! Now we're running both routers at the same time.




## PhoneCat Upgrade Tutorial

In this section and we will look at a complete example of
preparing and upgrading an application using the `upgrade` module. The app
we're going to work on is [Angular PhoneCat](https://github.com/angular/angular-phonecat)
from [the original AngularJS tutorial](https://docs.angularjs.org/tutorial),
which is where many of us began our Angular adventures. Now we'll see how to
bring that application to the brave new world of Angular.

During the process we'll learn how to apply the steps outlined in the
[preparation guide](guide/upgrade#preparation) in practice: We'll align the application
with Angular and also take TypeScript into use.

To follow along with the tutorial, clone the
[angular-phonecat](https://github.com/angular/angular-phonecat) repository
and apply the steps as we go.

In terms of project structure, this is where our work begins:


<div class='filetree'>

  <div class='file'>
    angular-phonecat
  </div>

  <div class='children'>

    <div class='file'>
      bower.json
    </div>

    <div class='file'>
      karma.conf.js
    </div>

    <div class='file'>
      package.json
    </div>

    <div class='file'>
      app
    </div>

    <div class='children'>

      <div class='file'>
        core
      </div>

      <div class='children'>

        <div class='file'>
          checkmark
        </div>

        <div class='children'>

          <div class='file'>
            checkmark.filter.js
          </div>

          <div class='file'>
            checkmark.filter.spec.js
          </div>

        </div>

        <div class='file'>
          phone
        </div>

        <div class='children'>

          <div class='file'>
            phone.module.js
          </div>

          <div class='file'>
            phone.service.js
          </div>

          <div class='file'>
            phone.service.spec.js
          </div>

        </div>

        <div class='file'>
          core.module.js
        </div>

      </div>

      <div class='file'>
        phone-detail
      </div>

      <div class='children'>

        <div class='file'>
          phone-detail.component.js
        </div>

        <div class='file'>
          phone-detail.component.spec.js
        </div>

        <div class='file'>
          phone-detail.module.js
        </div>

        <div class='file'>
          phone-detail.template.html
        </div>

      </div>

      <div class='file'>
        phone-list
      </div>

      <div class='children'>

        <div class='file'>
          phone-list.component.js
        </div>

        <div class='file'>
          phone-list.component.spec.js
        </div>

        <div class='file'>
          phone-list.module.js
        </div>

        <div class='file'>
          phone-list.template.html
        </div>

      </div>

      <div class='file'>
        img
      </div>

      <div class='children'>

        <div class='file'>
           ...
        </div>

      </div>

      <div class='file'>
        phones
      </div>

      <div class='children'>

        <div class='file'>
           ...
        </div>

      </div>

      <div class='file'>
        app.animations.js
      </div>

      <div class='file'>
        app.config.js
      </div>

      <div class='file'>
        app.css
      </div>

      <div class='file'>
        app.module.js
      </div>

      <div class='file'>
        index.html
      </div>

    </div>

    <div class='file'>
      e2e-tests
    </div>

    <div class='children'>

      <div class='file'>
        protractor-conf.js
      </div>

      <div class='file'>
        scenarios.js
      </div>

    </div>

  </div>

</div>



This is actually a pretty good starting point. The code uses the AngularJS 1.5
component API and the organization follows the
[AngularJS Style Guide](https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md),
which is an important [preparation step](guide/upgrade#follow-the-angular-styleguide) before
a successful upgrade.

* Each component, service, and filter is in its own source file, as per the
  [Rule of 1](https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#single-responsibility).
* The `core`, `phone-detail`, and `phone-list` modules are each in their
  own subdirectory. Those subdirectories contain the JavaScript code as well as
  the HTML templates that go with each particular feature. This is in line with the
  [Folders-by-Feature Structure](https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y152)
  and [Modularity](https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#modularity)
  rules.
* Unit tests are located side-by-side with application code where they are easily
  found, as described in the rules for
  [Organizing Tests](https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y197).


### Switching to TypeScript

Since we're going to be writing our Angular code in TypeScript, it makes sense to
bring in the TypeScript compiler even before we begin upgrading.

We will also start to gradually phase out the Bower package manager in favor
of NPM. We'll install all new dependencies using NPM, and will eventually be
able to remove Bower from the project.

Let's begin by installing TypeScript to the project.


<code-example format="">
  npm i typescript --save-dev

</code-example>



Let's also add run scripts for the `tsc` TypeScript compiler to `package.json`:


We can now install type definitions for the existing libraries that
we're using but that don't come with prepackaged types: AngularJS and the
Jasmine unit test framework.


<code-example format="">
  npm install @types/jasmine @types/angular  @types/angular-animate @types/angular-cookies @types/angular-mocks @types/angular-resource @types/angular-route @types/angular-sanitize --save-dev

</code-example>



We should also configure the TypeScript compiler so that it can understand our
project. We'll add a `tsconfig.json` file to the project directory, just like we do
in the documentation [setup](guide/setup). It instructs the TypeScript compiler how
to interpret our source files.


We are telling the TypeScript compiler to turn our TypeScript files to ES5 code
bundled into CommonJS modules.

We can now launch the TypeScript compiler from the command line. It will watch
our `.ts` source files and compile them to JavaScript on the fly. Those compiled
`.js` files are then loaded into the browser by SystemJS. This is a process we'll
want to have continuously running in the background as we go along.


<code-example format="">
  npm run tsc:w

</code-example>



The next thing we'll do is convert our JavaScript files to TypeScript. Since
TypeScript is a superset of ECMAScript 2015, which in turn is a superset
of ECMAScript 5, we can simply switch the file extensions from `.js` to `.ts`
and everything will work just like it did before. As the TypeScript compiler
runs, it emits the corresponding `.js` file for every `.ts` file and the
compiled JavaScript is what actually gets executed. If you start
the project HTTP server with `npm start`, you should see the fully functional
application in your browser.

Now that we have TypeScript though, we can start benefiting from some of its
features. There's a lot of value the language can provide to AngularJS applications.

For one thing, TypeScript is a superset of ES2015. Any app that has previously
been written in ES5 - like the PhoneCat example has - can with TypeScript
start incorporating all of the JavaScript features that are new to ES2015.
These include things like `let`s and `const`s, arrow functions, default function
parameters, and destructuring assignments.

Another thing we can do is start adding *type safety* to our code. This has
actually partially already happened because of the AngularJS typings we installed.
TypeScript are checking that we are calling AngularJS APIs correctly when we do
things like register components to Angular modules.

But we can also start adding *type annotations* for our own code to get even more
out of TypeScript's type system. For instance, we can annotate the checkmark
filter so that it explicitly expects booleans as arguments. This makes it clearer
what the filter is supposed to do.


<code-example path="upgrade-phonecat-1-typescript/app/core/checkmark/checkmark.filter.ts" title="app/core/checkmark/checkmark.filter.ts">

</code-example>



In the `Phone` service we can explicitly annotate the `$resource` service dependency
as an `angular.resource.IResourceService` - a type defined by the AngularJS typings.


<code-example path="upgrade-phonecat-1-typescript/app/core/phone/phone.service.ts" title="app/core/phone/phone.service.ts">

</code-example>



We can apply the same trick to the application's route configuration file in `app.config.ts`,
where we are using the location and route services. By annotating them accordingly TypeScript
can verify we're calling their APIs with the correct kinds of arguments.


<code-example path="upgrade-phonecat-1-typescript/app/app.config.ts" title="app/app.config.ts">

</code-example>



<div class="l-sub-section">



The [AngularJS 1.x type definitions](https://www.npmjs.com/package/@types/angular)
we installed are not officially maintained by the Angular team,
but are quite comprehensive. It is possible to make an AngularJS 1.x application
fully type-annotated with the help of these definitions.

If this is something we wanted to do, it would be a good idea to enable
the `noImplicitAny` configuration option in `tsconfig.json`. This would
cause the TypeScript compiler to display a warning when there's any code that
does not yet have type annotations. We could use it as a guide to inform
us about how close we are to having a fully annotated project.


</div>



Another TypeScript feature we can make use of is *classes*. In particular, we
can turn our component controllers into classes. That way they'll be a step
closer to becoming Angular component classes, which will make our life
easier once we do the upgrade.

AngularJS expects controllers to be constructor functions. That's exactly what
ES2015/TypeScript classes are under the hood, so that means we can just plug in a
class as a component controller and AngularJS will happily use it.

Here's what our new class for the phone list component controller looks like:


<code-example path="upgrade-phonecat-1-typescript/app/phone-list/phone-list.component.ts" title="app/phone-list/phone-list.component.ts">

</code-example>



What was previously done in the controller function is now done in the class
constructor function. The dependency injection annotations are attached
to the class using a static property `$inject`. At runtime this becomes the
`PhoneListController.$inject` property.

The class additionally declares three members: The array of phones, the name of
the current sort key, and the search query. These are all things we have already
been attaching to the controller but that weren't explicitly declared anywhere.
The last one of these isn't actually used in the TypeScript code since it's only
referred to in the template, but for the sake of clarity we want to define all the
members our controller will have.

In the Phone detail controller we'll have two members: One for the phone
that the user is looking at and another for the URL of the currently displayed image:


<code-example path="upgrade-phonecat-1-typescript/app/phone-detail/phone-detail.component.ts" title="app/phone-detail/phone-detail.component.ts">

</code-example>



This makes our controller code look a lot more like Angular already. We're
all set to actually introduce Angular into the project.

If we had any AngularJS services in the project, those would also be
a good candidate for converting to classes, since like controllers,
they're also constructor functions. But we only have the `Phone` factory
in this project, and that's a bit special since it's an `ngResource`
factory. So we won't be doing anything to it in the preparation stage.
We'll instead turn it directly into an Angular service.

### Installing Angular

Having completed our preparation work, let's get going with the Angular
upgrade of PhoneCat. We'll do this incrementally with the help of the
[upgrade module](guide/upgrade#upgrading-with-the-upgrade-module) that comes with Angular.
By the time we're done, we'll be able to remove AngularJS from the project
completely, but the key is to do this piece by piece without breaking the application.


<div class="alert is-important">

The project also contains some animations, which we are not yet upgrading in this version of the guide. This will change in a later release.

</div>



Let's install Angular into the project, along with the SystemJS module loader.
Take a look at the results of the [Setup](guide/setup) instructions
and get the following configurations from there:

* Add Angular and the other new dependencies to `package.json`
* The SystemJS configuration file `systemjs.config.js` to the project root directory.

Once these are done, run:


<code-example format="">
  npm install

</code-example>



We can soon load Angular dependencies into the application via `index.html`,
but first we need to do some directory path adjustments. This is because we're going
to need to load files from `node_modules` and the project root, whereas so far
in this project everything has been loaded from the `/app` directory.

Move the `app/index.html` file to the project root directory. Then change the
development server root path in `package.json` to also point to the project root
instead of `app`:


Now we're able to serve everything from the project root to the web browser. But we do *not*
want to have to change all the image and data paths used in the application code to match
our development setup. For that reason, we'll add a `<base>` tag to `index.html`, which will
cause relative URLs to be resolved back to the `/app` directory:


<code-example path="upgrade-phonecat-2-hybrid/index.html" region="base" title="index.html">

</code-example>



Now we can load Angular via SystemJS. We'll add the Angular polyfills and the
SystemJS config to the end of the `<head>` section, and then we'll use `System.import`
to load the actual application:


<code-example path="upgrade-phonecat-2-hybrid/index.html" region="angular" title="index.html">

</code-example>



We also need to make a couple of adjustments
to the `systemjs.config.js` file installed during [setup](guide/setup).

We want to point the browser to the project root when loading things through SystemJS,
instead of using the  `<base>` URL.

We also need to install the `upgrade` package via `npm install @angular/upgrade --save`
and add a mapping for the `@angular/upgrade/static` package.


<code-example path="upgrade-phonecat-2-hybrid/systemjs.config.1.js" region="paths" title="systemjs.config.js">

</code-example>



### Creating the _AppModule_

Now create the root `NgModule` class called `AppModule`.
There is already a file named `app.module.ts` that holds the AngularJS module.
Rename it to `app.module.ajs.ts` and update the corresponding script name in the `index.html` as well.
The file contents remain:


<code-example path="upgrade-phonecat-2-hybrid/app/app.module.ajs.ts" title="app.module.ajs.ts">

</code-example>



Now create a new `app.module.ts` with the minimum `NgModule` class:


<code-example path="upgrade-phonecat-2-hybrid/app/app.module.ts" region="bare" title="app.module.ts">

</code-example>



### Bootstrapping a hybrid PhoneCat

What we'll do next is bootstrap the application as a *hybrid application*
that supports both AngularJS and Angular components. Once we've done that
we can start converting the individual pieces to Angular.

To [bootstrap a hybrid application](guide/upgrade#bootstrapping-hybrid-applications),
we first need to import `UpgradeModule` in our `AppModule`, and override it's bootstrap method:


<code-example path="upgrade-phonecat-2-hybrid/app/app.module.ts" region="upgrademodule" title="app/app.module.ts">

</code-example>



Our application is currently bootstrapped using the AngularJS `ng-app` directive
attached to the `<html>` element of the host page. This will no longer work with
Angular. We should switch to a JavaScript-driven bootstrap instead.

So, remove the `ng-app` attribute from `index.html`, and instead bootstrap via `src/main.ts`.
This file has been configured as the application entrypoint in `systemjs.config.js`,
so it is already being loaded by the browser.


<code-example path="upgrade-phonecat-2-hybrid/app/main.ts" region="bootstrap" title="upgrade-phonecat-2-hybrid/app/main.ts">

</code-example>



The arguments used here are the root element of the application (which is
the same element we had `ng-app` on earlier), and the AngularJS 1.x modules
that we want to load. Since we're bootstrapping the app through
an `UpgradeModule`, we're actually now running the app as a **hybrid app**.

This means we are now running both AngularJS and Angular at the same time. That's pretty
exciting! We're not running any actual Angular components yet though,
so let's do that next.


<div class="l-sub-section">



#### Why declare _angular_ as _angular.IAngularStatic_?

`@types/angular` is declared as a UMD module, and due to the way
<a href="https://github.com/Microsoft/TypeScript/wiki/What's-new-in-TypeScript#support-for-umd-module-definitions">UMD typings</a>
work, once you have an ES6 `import` statement in a file all UMD typed modules must also be
imported via `import` statements instead of being globally available.

AngularJS is currently loaded by a script tag in `index.html`, which means that the whole app
has access to it as a global and uses the same instance of the `angular` variable.
If we used `import * as angular from 'angular'` instead we would also need to overhaul how we
load every file in our AngularJS app to use ES6 modules in order to ensure AngularJS was being
loaded correctly.

This is a considerable effort and it often isn't worth it, especially since we are in the
process of moving our code to Angular.
Instead we declare `angular` as `angular.IAngularStatic` to indicate it is a global variable
and still have full typing support.


</div>



### Upgrading the Phone service

The first piece we'll port over to Angular is the `Phone` service, which
resides in `app/core/phone/phone.service.ts` and makes it possible for components
to load phone information from the server. Right now it's implemented with
ngResource and we're using it for two things:

* For loading the list of all phones into the phone list component
* For loading the details of a single phone into the phone detail component.

We can replace this implementation with an Angular service class, while
keeping our controllers in AngularJS land.

In the new version, we import the Angular HTTP module and call its `Http` service instead of `ngResource`.

Re-open the `app.module.ts` file, import and add `HttpModule` to the `imports` array of the `AppModule`:


<code-example path="upgrade-phonecat-2-hybrid/app/app.module.ts" region="httpmodule" title="app.module.ts">

</code-example>



Now we're ready to upgrade the Phone service itself. We replace the ngResource-based
service in `phone.service.ts` with a TypeScript class decorated as `@Injectable`:


<code-example path="upgrade-phonecat-2-hybrid/app/core/phone/phone.service.ts" region="classdef" title="app/core/phone/phone.service.ts (skeleton)" linenums="false">

</code-example>



The `@Injectable` decorator will attach some dependency injection metadata
to the class, letting Angular know about its dependencies. As described
by our [Dependency Injection Guide](guide/dependency-injection),
this is a marker decorator we need to use for classes that have no other
Angular decorators but still need to have their dependencies injected.

In its constructor the class expects to get the `Http` service. It will
be injected to it and it is stored as a private field. The service is then
used in the two instance methods, one of which loads the list of all phones,
and the other the details of a particular phone:


<code-example path="upgrade-phonecat-2-hybrid/app/core/phone/phone.service.ts" region="fullclass" title="upgrade-phonecat-2-hybrid/app/core/phone/phone.service.ts">

</code-example>



The methods now return Observables of type `PhoneData` and `PhoneData[]`. This is
a type we don't have yet, so let's add a simple interface for it:


<code-example path="upgrade-phonecat-2-hybrid/app/core/phone/phone.service.ts" region="phonedata-interface" title="app/core/phone/phone.service.ts (interface)" linenums="false">

</code-example>



`@angular/upgrade/static` has a `downgradeInjectable` method for the purpose of making
Angular services available to AngularJS code. Use it to plug in the `Phone` service:


<code-example path="upgrade-phonecat-2-hybrid/app/core/phone/phone.service.ts" region="downgrade-injectable" title="app/core/phone/phone.service.ts (downgrade)" linenums="false">

</code-example>



Here's the full, final code for the service:


<code-example path="upgrade-phonecat-2-hybrid/app/core/phone/phone.service.ts" title="app/core/phone/phone.service.ts">

</code-example>



Notice that we're importing the `map` operator of the RxJS `Observable` separately.
We need to do this for all RxJS operators that we want to use, since Angular
does not load all of them by default.

The new `Phone` service has the same features as the original, `ngResource`-based service.
Because it's an Angular service, we register it with the `NgModule` providers:


<code-example path="upgrade-phonecat-2-hybrid/app/app.module.ts" region="phone" title="app.module.ts">

</code-example>



Now that we are loading `phone.service.ts` through an import that is resolved
by SystemJS, we should **remove the &lt;script&gt; tag** for the service from `index.html`.
This is something we'll do to all our components as we upgrade them. Simultaneously
with the AngularJS to Angular upgrade we're also migrating our code from scripts to modules.

At this point we can switch our two components to use the new service
instead of the old one. We `$inject` it as the downgraded `phone` factory,
but it's really an instance of the `Phone` class and we can annotate its type
accordingly:


<code-example path="upgrade-phonecat-2-hybrid/app/phone-list/phone-list.component.ajs.ts" title="app/phone-list/phone-list.component.ts">

</code-example>



<code-example path="upgrade-phonecat-2-hybrid/app/phone-detail/phone-detail.component.ajs.ts" title="app/phone-detail/phone-detail.component.ts">

</code-example>



What we have here are two AngularJS components using an Angular service!
The components don't need to be aware of this, though the fact that the
service returns Observables and not Promises is a bit of a giveaway.
In any case, what we've achieved is a migration of a service to Angular
without having to yet migrate the components that use it.


<div class="alert is-helpful">



We could also use the `toPromise` method of `Observable` to turn those
Observables into Promises in the service. This can in many cases further
reduce the amount of changes needed in the component controllers.


</div>



### Upgrading Components

Next, let's upgrade our AngularJS components to Angular components. We'll
do it one at a time, while still keeping the application in hybrid mode.
As we make these conversions, we'll also be defining our first Angular *pipes*.

Let's look at the phone list component first. Right now it contains a TypeScript
controller class and a component definition object. We can morph this into
an Angular component by just renaming the controller class and turning the
AngularJS component definition object into an Angular `@Component` decorator.
We can then also remove the static `$inject` property from the class:


<code-example path="upgrade-phonecat-2-hybrid/app/phone-list/phone-list.component.ts" region="initialclass" title="app/phone-list/phone-list.component.ts">

</code-example>



The `selector` attribute is a CSS selector that defines where on the page the component
should go. In AngularJS we do matching based on component names, but in Angular we
have these explicit selectors. This one will match elements with the name `phone-list`,
just like the AngularJS version did.

We now also need to convert the template of this component into Angular syntax.
The search controls replace the AngularJS `$ctrl` expressions
with Angular's two-way `[(ngModel)]` binding syntax:


<code-example path="upgrade-phonecat-2-hybrid/app/phone-list/phone-list.template.html" region="controls" title="app/phone-list/phone-list.template.html (search controls)" linenums="false">

</code-example>



Replace the list's `ng-repeat` with an `*ngFor` as
[described in the Template Syntax page](guide/template-syntax#directives).
Replace the image tag's `ng-src` with a binding to the native `src` property.


<code-example path="upgrade-phonecat-2-hybrid/app/phone-list/phone-list.template.html" region="list" title="app/phone-list/phone-list.template.html (phones)" linenums="false">

</code-example>



#### No Angular _filter_ or _orderBy_ filters
The built-in AngularJS `filter` and `orderBy` filters do not exist in Angular,
so we need to do the filtering and sorting ourselves.

We replaced the `filter` and `orderBy` filters with bindings to the `getPhones()` controller method,
which implements the filtering and ordering logic inside the component itself.


<code-example path="upgrade-phonecat-2-hybrid/app/phone-list/phone-list.component.ts" region="getphones" title="app/phone-list/phone-list.component.ts">

</code-example>



Now we need to downgrade our Angular component so we can use it in AngularJS.
Instead of registering a component, we register a `phoneList` *directive*,
a downgraded version of the Angular component.

The `as angular.IDirectiveFactory` cast tells the TypeScript compiler
that the return value of the `downgradeComponent` method is a directive factory.


<code-example path="upgrade-phonecat-2-hybrid/app/phone-list/phone-list.component.ts" region="downgrade-component" title="app/phone-list/phone-list.component.ts">

</code-example>



The new `PhoneListComponent` uses the Angular `ngModel` directive, located in the `FormsModule`.
Add the `FormsModule` to `NgModule` imports, declare the new `PhoneListComponent` and
finally add it to `entryComponents` since we downgraded it:


<code-example path="upgrade-phonecat-2-hybrid/app/app.module.ts" region="phonelist" title="app.module.ts">

</code-example>



Remove the &lt;script&gt; tag for the phone list component from `index.html`.

Now set the remaining `phone-detail.component.ts` as follows:


<code-example path="upgrade-phonecat-2-hybrid/app/phone-detail/phone-detail.component.ts" title="app/phone-detail/phone-detail.component.ts">

</code-example>



This is similar to the phone list component.
The new wrinkle is the `RouteParams` type annotation that identifies the `routeParams` dependency.

The AngularJS injector has an AngularJS router dependency called `$routeParams`,
which was injected into `PhoneDetails` when it was still an AngularJS controller.
We intend to inject it into the new `PhoneDetailsComponent`.

Unfortunately, AngularJS dependencies are not automatically available to Angular components.
We must use a [Factory provider](guide/upgrade#making-angularjs-dependencies-injectable-to-angular)
to make `$routeParams` an Angular provider.
Do that in a new file called `ajs-upgraded-providers.ts` and import it in `app.module.ts`:


<code-example path="upgrade-phonecat-2-hybrid/app/ajs-upgraded-providers.ts" title="app/ajs-upgraded-providers.ts">

</code-example>



<code-example path="upgrade-phonecat-2-hybrid/app/app.module.ts" region="routeparams" title="app/app.module.ts ($routeParams)" linenums="false">

</code-example>



Convert the phone detail component template into Angular syntax as follows:


<code-example path="upgrade-phonecat-2-hybrid/app/phone-detail/phone-detail.template.html" title="app/phone-detail/phone-detail.template.html">

</code-example>



There are several notable changes here:

* We've removed the `$ctrl.` prefix from all expressions.
* Just like we did in the phone list, we've replaced `ng-src` with property
  bindings for the standard `src` property.
* We're using the property binding syntax around `ng-class`. Though Angular
  does have [a very similar `ngClass`](guide/template-syntax#directives)
  as AngularJS does, its value is not magically evaluated as an expression.
  In Angular we always specify  in the template when an attribute's value is
  a property expression, as opposed to a literal string.
* We've replaced `ng-repeat`s with `*ngFor`s.
* We've replaced `ng-click` with an event binding for the standard `click`.
* We've wrapped the whole template in an `ngIf` that causes it only to be
  rendered when there is a phone present. We need this because when the component
  first loads, we don't have `phone` yet and the expressions will refer to a
  non-existing value. Unlike in AngularJS, Angular expressions do not fail silently
  when we try to refer to properties on undefined objects. We need to be explicit
  about cases where this is expected.

Add `PhoneDetailComponent` component to the `NgModule` _declarations_ and _entryComponents_:


<code-example path="upgrade-phonecat-2-hybrid/app/app.module.ts" region="phonedetail" title="app.module.ts">

</code-example>



We should now also remove the phone detail component &lt;script&gt; tag from `index.html`.

#### Add the _CheckmarkPipe_

The AngularJS directive had a `checkmark` _filter_.
Let's turn that into an Angular **pipe**.

There is no upgrade method to convert filters into pipes.
You won't miss it.
It's easy to turn the filter function into an equivalent Pipe class.
The implementation is the same as before, repackaged in the `transform` method.
Rename the file to `checkmark.pipe.ts` to conform with Angular conventions:


<code-example path="upgrade-phonecat-2-hybrid/app/core/checkmark/checkmark.pipe.ts" title="app/core/checkmark/checkmark.pipe.ts" linenums="false">

</code-example>



Now import and declare the newly created pipe and
remove the filter &lt;script&gt; tag from `index.html`:


<code-example path="upgrade-phonecat-2-hybrid/app/app.module.ts" region="checkmarkpipe" title="app.module.ts">

</code-example>



## AoT compile the hybrid app

To use AoT with our hybrid app we have to first set it up like any other Angular application,
as shown in [the Ahead-of-time Compilation chapter](guide/aot-compiler).

Then we have to change `main-aot.ts` bootstrap also bootstrap the AngularJS app
via `UpgradeModule`:


<code-example path="upgrade-phonecat-2-hybrid/app/main-aot.ts" title="app/main-aot.ts">

</code-example>



We need to load all the AngularJS files we already use in `index.html` in `aot/index.html`
as well:


<code-example path="upgrade-phonecat-2-hybrid/aot/index.html" title="aot/index.html">

</code-example>



These files need to be copied together with the polyfills. Files our application
needs at runtime, like the `.json` phone lists and images, also need to be copied.

Install `fs-extra` via `npm install fs-extra --save-dev` for better file copying, and change
`copy-dist-files.js` to the following:


<code-example path="upgrade-phonecat-2-hybrid/copy-dist-files.js" title="copy-dist-files.js">

</code-example>



And that's all you need to use AoT while upgrading your app!


### Adding The Angular Router And Bootstrap

At this point we've replaced all AngularJS application components with
their Angular counterparts, even though we're still serving them from the AngularJS router.

Most AngularJS apps have more than a couple of routes though, and it's very helpful to migrate
one route at a time.

Let's start by migrating the initial `/` and `/phones` routes to Angular,
while keeping `/phones/:phoneId` in the AngularJS router.

#### Add the Angular router

Angular has an [all-new router](guide/router).

Like all routers, it needs a place in the UI to display routed views.
For Angular that's the `<router-outlet>` and it belongs in a *root component*
at the top of the applications component tree.

We don't yet have such a root component, because the app is still managed as an AngularJS app.
Create a new `app.component.ts` file with the following `AppComponent` class:


<code-example path="upgrade-phonecat-3-router/app/app.component.ts" title="app/app.component.ts" linenums="false">

</code-example>



It has a simple template that only includes the `<router-outlet>` for Angular routes
and `ng-view` for AngularJS routes.
This component just renders the contents of the active route and nothing else.

The selector tells Angular to plug this root component into the `<phonecat-app>`
element on the host web page when the application launches.

Add this `<phonecat-app>` element to the `index.html`.
It replaces the old AngularJS `ng-view` directive:


<code-example path="upgrade-phonecat-3-router/index.html" region="appcomponent" title="index.html (body)" linenums="false">

</code-example>



#### Create the _Routing Module_
A router needs configuration whether it's the AngularJS or Angular or any other router.

The details of Angular router configuration are best left to the [Routing documentation](guide/router)
which recommends that you create a `NgModule` dedicated to router configuration
(called a _Routing Module_).


<code-example path="upgrade-phonecat-3-router/app/app-routing.module.ts" title="app/app-routing.module.ts">

</code-example>



This module defines a `routes` object with one route to the phone list component
and a default route for the empty path.
It passes the `routes` to the `RouterModule.forRoot` method which does the rest.

A couple of extra providers enable routing with "hash" URLs such as `#!/phones`
instead of the default  "push state" strategy.

There's a twist to our Routing Module though: we're also adding a custom `UrlHandlingStrategy`
that tells the Angular router to only process the `/` and `/phones` routes.

Now update the `AppModule` to import this `AppRoutingModule` and also the
declare the root `AppComponent` as the bootstrap component.
That tells Angular that it should bootstrap the app with the _root_ `AppComponent` and
insert it's view into the host web page.

We can also remove the `ngDoBootstrap()` override from `app.module.ts` since we are now
bootstrapping from Angular.

And since `PhoneListComponent` isn't being rendered from a `<phone-list>` tag anymore,
but rather routed to, we can do away with it's Angular selector as well.


<code-example path="upgrade-phonecat-3-router/app/app.module.ts" title="app/app.module.ts">

</code-example>



Now we need to tell the AngularJS router to only process the `/phones/:phoneId` route:


<code-example path="upgrade-phonecat-3-router/app/app.config.ts" region="ajs-routes" title="app/app.config.ts (route config)">

</code-example>



#### Generate links for each phone

We no longer have to hardcode the links to phone details in the phone list.
We can generate data bindings for each phone's `id` to the `routerLink` directive
and let that directive construct the appropriate URL to the `PhoneDetailComponent`:


<code-example path="upgrade-phonecat-3-router/app/phone-list/phone-list.template.html" region="list" title="app/phone-list/phone-list.template.html (list with links)" linenums="false">

</code-example>



<div class="l-sub-section">



See the [Routing](guide/router) page for details.


</div>



We are now running both routers at the same time!
Angular is handling the initial `/` url, redirecting to `/phones`.
Meanwhile when we click a link to the phone detail, AngularJS takes over.

This way we can incrementally upgrade our app, reducing the risk of a massive one step router
swap.

The next step is to migrate the `/phones/:phoneId` route.


The Angular router passes route parameters differently.
Correct the `PhoneDetail` component constructor to expect an injected `ActivatedRoute` object.
Extract the `phoneId` from the `ActivatedRoute.snapshot.params` and fetch the phone data as before:


<code-example path="upgrade-phonecat-4-final/app/phone-detail/phone-detail.component.ts" title="app/phone-detail/phone-detail.component.ts">

</code-example>



Since this was the last route we want to migrate over, we can also now delete the last
route config from `app/app.config.ts`, and add it to the Angular router configuration.

We don't need our `UrlHandlingStrategy` anymore either, since now Angular is processing all
routes.


<code-example path="upgrade-phonecat-4-final/app/app-routing.module.ts" title="app/app-routing.module.ts">

</code-example>



You are now running a pure Angular application!

### Say Goodbye to AngularJS

It is time to take off the training wheels and let our application begin
its new life as a pure, shiny Angular app. The remaining tasks all have to
do with removing code - which of course is every programmer's favorite task!

The application is still bootstrapped as a hybrid app.
There's no need for that anymore.

Switch the bootstrap method of the application from the `UpgradeAdapter`
to the Angular way.


<code-example path="upgrade-phonecat-4-final/app/main.ts" title="main.ts">

</code-example>



If you haven't already, remove all references to the `UpgradeModule` from `app.module.ts`,
as well as any [Factory provider](guide/upgrade#making-angularjs-dependencies-injectable-to-angular)
for AngularJS services, and the `app/ajs-upgraded-providers.ts` file.

Also remove any `downgradeInjectable()` or `downgradeComponent()` you find,
together with the associated AngularJS factory or directive declarations.
Since we have no downgraded components anymore, we also don't need to have them listed
in `entryComponents` either.


<code-example path="upgrade-phonecat-4-final/app/app.module.ts" title="app.module.ts">

</code-example>



You may also completely remove the following files. They are AngularJS
module configuration files and not needed in Angular:

* `app/app.module.ajs.ts`
* `app/app.config.ts`
* `app/core/core.module.ts`
* `app/core/phone/phone.module.ts`
* `app/phone-detail/phone-detail.module.ts`
* `app/phone-list/phone-list.module.ts`

The external typings for AngularJS may be uninstalled as well. The only ones
we still need are for Jasmine and Angular polyfills.
The `@angular/upgrade` package and it's mapping in `systemjs.config.js` can also go.


<code-example format="">
  npm uninstall @angular/upgrade --save
  npm uninstall @types/angular @types/angular-animate @types/angular-cookies @types/angular-mocks @types/angular-resource @types/angular-route @types/angular-sanitize --save-dev

</code-example>



Finally, from `index.html`, remove all references to
AngularJS scripts, the Angular upgrade module, and jQuery. When we're done,
this is what it should look like:


<code-example path="upgrade-phonecat-4-final/index.html" region="full" title="index.html">

</code-example>



That is the last we'll see of AngularJS! It has served us well but now
it's time to say goodbye.





## Appendix: Upgrading PhoneCat Tests

Tests can not only be retained through an upgrade process, but they can also be
used as a valuable safety measure when ensuring that the application does not
break during the upgrade. E2E tests are especially useful for this purpose.

### E2E Tests

The PhoneCat project has both E2E Protractor tests and some Karma unit tests in it.
Of these two, E2E tests can be dealt with much more easily: By definition,
E2E tests access our application from the *outside* by interacting with
the various UI elements the app puts on the screen. E2E tests aren't really that
concerned with the internal structure of the application components. That
also means that although we modify our project quite a bit during the upgrade, the E2E
test suite should keep passing with just minor modifications. This is because
we don't change how the application behaves from the user's point of view.

During TypeScript conversion, there is nothing we have to do to keep E2E tests
working. It is only when we change our bootstrap to that of a Hybrid app that we need to
make some changes.

The following change is needed in `protractor-conf.js` to sync with hybrid apps:

<code-example format="">
  ng12Hybrid: true

</code-example>



The next set of changes is when we start to upgrade components and their template to Angular.
This is because the E2E tests have matchers that are specific to AngularJS.
For PhoneCat we need to make the following changes in order to make things work with Angular:


<table>

  <tr>

    <th>
      Previous code
    </th>

    <th>
      New code
    </th>

    <th>
      Notes
    </th>

  </tr>

  <tr>

    <td>


      `by.repeater('phone in $ctrl.phones').column('phone.name')`
    </td>

    <td>


      `by.css('.phones .name')`
    </td>

    <td>


      The repeater matcher relies on AngularJS `ng-repeat`
    </td>

  </tr>

  <tr>

    <td>


      `by.repeater('phone in $ctrl.phones')`
    </td>

    <td>


      `by.css('.phones li')`
    </td>

    <td>


      The repeater matcher relies on AngularJS `ng-repeat`
    </td>

  </tr>

  <tr>

    <td>


      `by.model('$ctrl.query')`
    </td>

    <td>


      `by.css('input')`
    </td>

    <td>


      The model matcher relies on AngularJS `ng-model`
    </td>

  </tr>

  <tr>

    <td>


      `by.model('$ctrl.orderProp')`
    </td>

    <td>


      `by.css('select')`
    </td>

    <td>


      The model matcher relies on AngularJS `ng-model`
    </td>

  </tr>

  <tr>

    <td>


      `by.binding('$ctrl.phone.name')`
    </td>

    <td>


      `by.css('h1')`
    </td>

    <td>


      The binding matcher relies on AngularJS data binding


    </td>

  </tr>

</table>



When the bootstrap method is switched from that of `UpgradeModule` to
pure Angular, AngularJS ceases to exist on the page completely.
At this point we need to tell Protractor that it should not be looking for
an AngularJS app anymore, but instead it should find *Angular apps* from
the page.

Replace the `ng12Hybrid` previously added with the following in `protractor-conf.js`:


<code-example format="">
  useAllAngular2AppRoots: true,

</code-example>



Also, there are a couple of Protractor API calls in the PhoneCat test code that
are using the AngularJS `$location` service under the hood. As that
service is no longer there after the upgrade, we need to replace those calls with ones
that use WebDriver's generic URL APIs instead. The first of these is
the redirection spec:


<code-example path="upgrade-phonecat-4-final/e2e-spec.ts" region="redirect" title="e2e-tests/scenarios.ts">

</code-example>



And the second is the phone links spec:


<code-example path="upgrade-phonecat-4-final/e2e-spec.ts" region="links" title="e2e-tests/scenarios.ts">

</code-example>



### Unit Tests

For unit tests, on the other hand, more conversion work is needed. Effectively
they need to be *upgraded* along with the production code.

During TypeScript conversion no changes are strictly necessary. But it may be
a good idea to convert the unit test code into TypeScript as well, as the same
benefits we from TypeScript in production code also applies to tests.

For instance, in the phone detail component spec we can use not only ES2015
features like arrow functions and block-scoped variables, but also type
definitions for some of the AngularJS services we're consuming:


<code-example path="upgrade-phonecat-1-typescript/app/phone-detail/phone-detail.component.spec.ts" title="app/phone-detail/phone-detail.component.spec.ts">

</code-example>



Once we start the upgrade process and bring in SystemJS, configuration changes
are needed for Karma. We need to let SystemJS load all the new Angular code,
which can be done with the following kind of shim file:


<code-example path="upgrade-phonecat-2-hybrid/karma-test-shim.1.js" title="karma-test-shim.js">

</code-example>



The shim first loads the SystemJS configuration, then Angular's test support libraries,
and then the application's spec files themselves.

Karma configuration should then be changed so that it uses the application root dir
as the base directory, instead of `app`.


<code-example path="upgrade-phonecat-2-hybrid/karma.conf.ajs.js" region="basepath" title="karma.conf.js">

</code-example>



Once this is done, we can load SystemJS and other dependencies, and also switch the configuration
for loading application files so that they are *not* included to the page by Karma. We'll let
the shim and SystemJS load them.


<code-example path="upgrade-phonecat-2-hybrid/karma.conf.ajs.js" region="files" title="karma.conf.js">

</code-example>



Since the HTML templates of Angular components will be loaded as well, we need to help
Karma out a bit so that it can route them to the right paths:


<code-example path="upgrade-phonecat-2-hybrid/karma.conf.ajs.js" region="html" title="karma.conf.js">

</code-example>



The unit test files themselves also need to be switched to Angular when their production
counterparts are switched. The specs for the checkmark pipe are probably the most straightforward,
as the pipe has no dependencies:


<code-example path="upgrade-phonecat-2-hybrid/app/core/checkmark/checkmark.pipe.spec.ts" title="app/core/checkmark/checkmark.pipe.spec.ts">

</code-example>



The unit test for the phone service is a bit more involved. We need to switch from the mocked-out
AngularJS `$httpBackend` to a mocked-out Angular Http backend.


<code-example path="upgrade-phonecat-2-hybrid/app/core/phone/phone.service.spec.ts" title="app/core/phone/phone.service.spec.ts">

</code-example>



For the component specs we can mock out the `Phone` service itself, and have it provide
canned phone data. We use Angular's component unit testing APIs for both components.


<code-example path="upgrade-phonecat-2-hybrid/app/phone-detail/phone-detail.component.spec.ts" title="app/phone-detail/phone-detail.component.spec.ts">

</code-example>



<code-example path="upgrade-phonecat-2-hybrid/app/phone-list/phone-list.component.spec.ts" title="app/phone-list/phone-list.component.spec.ts">

</code-example>



Finally, we need to revisit both of the component tests when we switch to the Angular
router. For the details component we need to provide a mock of Angular `ActivatedRoute` object
instead of using the AngularJS `$routeParams`.


<code-example path="upgrade-phonecat-4-final/app/phone-detail/phone-detail.component.spec.ts" region="activatedroute" title="app/phone-detail/phone-detail.component.spec.ts">

</code-example>



And for the phone list component we need to set up a few things for the router itself so that
the route link directive will work.


<code-example path="upgrade-phonecat-4-final/app/phone-list/phone-list.component.spec.ts" region="routestuff" title="app/phone-list/phone-list.component.spec.ts">

</code-example>

