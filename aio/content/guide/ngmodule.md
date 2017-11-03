# NgModules

## Prerequisites

A basic understanding of the following concepts:
* [Bootstrapping](guide/bootstrapping).
* [JavaScript Modules vs. NgModules](guide/ngmodule-vs-jsmodule).

<hr>

**NgModules** help organize an application into cohesive blocks of functionality.

An NgModule is a class adorned with the `@NgModule` decorator function.
`@NgModule` takes a metadata object that tells Angular how to compile and run module code.
It identifies the module's own components, directives, and pipes,
making some of them public so external components can use them.
<!--KW--Making which ones public?-->
`@NgModule` can also add service providers to the application dependency injectors.
<!--KW--How so?-->

## Angular modularity

Modules are a great way to organize an application and extend it with capabilities from external libraries.

Many Angular libraries are modules (such as `FormsModule`, `HttpModule`, and `RouterModule`).
Many third-party libraries are available as NgModules such as
<a href="https://material.angular.io/">Material Design</a>,
<a href="http://ionicframework.com/">Ionic</a>, and
<a href="https://github.com/angular/angularfire2">AngularFire2</a>.

NgModules consolidate components, directives, and pipes into
cohesive blocks of functionality, each focused on a
feature area, application business domain, workflow, or common collection of utilities.

Modules can also add services to the application.
Such services might be internally developed, like something you'd develop yourself or come from outside sources, such as the Angular router and HTTP client.

Modules can be loaded eagerly when the application starts or lazy loaded asynchronously by the router.

An NgModule is a class decorated with `@NgModule` metadata. The metadata does the following:

* Declares which components, directives, and pipes belong to the module.
* Makes some of those classes public so that other component templates can use them.
* Imports other modules with the components, directives, and pipes the components in the current module need.
* Provides services at the application level that any application component can use.

Every Angular app has at least one module class, the root module.
You [bootstrap](guide/bootstrapping) that module to launch the application.

The root module is all you need in a simple application with a few components.
As the app grows, you refactor the root module into [feature modules](guide/feature-modules)
that represent collections of related functionality.
You then import these modules into the root module.


<hr/>

<!--KW--where does this belog? This whole section should be elsewhere/another page if not covered already.-->
## Declare directives and components

When you create a directive and use it in a template, such as in the [Attribute Directives](guide/attribute-directives) page, you need to add it to the relevant NgModule `declarations` array. Relevant here means the NgModule that the directive or component belongs to. In simple apps with only the root module, everything belongs to that one module. However, for apps with more than one module, certain directives, components, and pipes belong to one module or another. To use a directive, component, or pipe in a module, you must do a few things:

1. Export it from the file where you wrote it.
2. Import it into the appropriate module.
3. Declare it in the `@NgModule` `declarations` array.


Those three steps look like the following. In the file where you create your directive, export it. 
The following example, named `TestDirective` is the default directive structure that the CLI generates in its own file, `test.directive.ts`:

```typescript

import { Directive } from '@angular/core';

@Directive({
  selector: '[appTest]'
})
export class TestDirective {
// you'd put all your code in here
  constructor() { }

}
```

The key point here is that you have to export it so you can import it elsewhere. Next, import it 
into the `NgModule`, in this example `app.module.ts`, with a JavaScript import statement:

```typescript
import { TestDirective } from 'test.directive';
```

And in the same file, add it to the `@NgModule` `declarations` array:

```typescript
declarations: [
  AppComponent,
  TestDirective
],

```
Now you could use your `TestDirective` in a component. This example uses `AppModule`, but you'd do it the same way for a feature module. For more about directives, see [Attribute Directives](guide/attribute-directives) and [Structural Directives](guide/structural-directives).

Remember, components, directives, and pipes belong to one module only. Share them by importing the necessary modules. You only need to declare them once in your app.


## Providers

The `@NgModule` `providers` array is how you make services available via modules. 
Providers are a robust feature of Angular that let you customize how and where you 
make services avilable in your app. For more information on providers, see 
the table below and [Providers](guide/providers).



## NgModule API

The following table summarizes the `NgModule` metadata properties.

<table>

  <tr>

    <th>
      Property
    </th>

    <th>
      Description
    </th>

  </tr>

  <tr>

    <td style="vertical-align: top">
      <code>declarations</code>
    </td>

    <td>


      A list of [declarable](guide/ngmodule-faq#q-declarable) classes,
      the *component*, *directive*, and *pipe* classes that _belong to this module_.

      These declared classes are visible within the module but invisible to
      components in a different module unless they are _exported_ from this module and
      the other module _imports_ this one.

      Components, directives, and pipes must belong to _exactly_ one module.
      The compiler emits an error if you try to declare the same class in more than one module.

      Don't re-declare a class imported from another module.

    </td>

  </tr>

  <tr>

    <td style="vertical-align: top">
      <code>providers</code>
    </td>

    <td>


      A list of dependency-injection providers.

      Angular registers these providers with the root injector of the module's execution context.
      That's the application's root injector for all modules loaded when the application starts.

      Angular can inject one of these provider services into any component in the application.
      If this module or any module loaded at launch provides the `UserService`,
      Angular can inject the same `UserService` instance into any app component.

      A lazy-loaded module has its own sub-root injector which typically
      is a direct child of the application root injector.

      Lazy-loaded services are scoped to the lazy module's injector.
      If a lazy-loaded module also provides the `UserService`,
      any component created within that module's context (such as by router navigation)
      gets the local instance of the service, not the instance in the root application injector.

      Components in external modules continue to receive the instance created for the application root.

      For more information, see [Providers](guide/providers).

    </td>

  </tr>

  <tr>

    <td style="vertical-align: top">
      <code>imports</code>
    </td>

    <td>


      A list of supporting modules.

      Specifically, the list of modules whose exported components, directives, or pipes
      are referenced by the component templates declared in this module.

      A component template can [reference](guide/ngmodule-faq#q-template-reference) another component, directive, or pipe
      when the referenced class is declared in this module
      or the class was imported from another module.

      A component can use the `NgIf` and `NgFor` directives only because its parent module
      imported the Angular `CommonModule` (perhaps indirectly by importing `BrowserModule`).

      You can import many standard directives with the `CommonModule`
      but some familiar directives belong to other modules.
      For example, a component template can bind with `[(ngModel)]` 
      only after importing the Angular `FormsModule`.
    </td>

  </tr>

  <tr>

    <td style="vertical-align: top">
      <code>exports</code>
    </td>

    <td>


      A list of declarations&mdash;*component*, *directive*, and *pipe* classes&mdash;that
      an importing module can use.

      Exported declarations are the module's _public API_.
      A component in another module can [reference](guide/ngmodule-faq#q-template-reference) _this_ module's `UserComponent`
      if it imports this module and this module exports `UserComponent`.

      Declarations are private by default.
      If this module does _not_ export `UserComponent`, no other module can see it.

      Importing a module does _not_ automatically re-export the imported module's imports.
      Module 'B' can't use `ngIf` just because it imported module `A` which imported `CommonModule`.
      Module 'B' must import `CommonModule` itself.

      A module can list another module among its `exports`, in which case
      all of that module's public components, directives, and pipes are exported.

      [Re-export](guide/ngmodule-faq#q-re-export) makes module transitivity explicit.
      If Module 'A' re-exports `CommonModule` and Module 'B' imports Module 'A',
      Module 'B' components can use `ngIf` even though 'B' itself didn't import `CommonModule`.

    </td>

  </tr>

  <tr>

    <td style="vertical-align: top">
      <code>bootstrap</code>
    </td>

    <td>


      A list of components that can be bootstrapped.

      Usually there's only one component in this list, the _root component_ of the application.

      Angular can launch with multiple bootstrap components,
      each with its own location in the host web page.

      A bootstrap component is automatically an `entryComponent`.

    </td>

  </tr>

  <tr>

    <td style="vertical-align: top">
      <code>entryComponents</code>
    </td>

    <td>


      A list of components that are _not_ [referenced](guide/ngmodule-faq#q-template-reference) in a reachable component template.

      Most developers never set this property.
      The [Angular compiler](guide/ngmodule-faq#q-angular-compiler) must know about every component actually used in the application.
      The compiler can discover most components by walking the tree of references
      from one component template to another.

      But there's always at least one component that's not referenced in any template:
      the root component, `AppComponent`, that you bootstrap to launch the app.
      That's why it's called an _entry component_.

      Routed components are also _entry components_ because they aren't referenced in a template either.
      The router creates them and drops them into the DOM near a `<router-outlet>`.

      While the bootstrapped and routed components are _entry components_,
      you usually don't have to add them to a module's `entryComponents` list.

      Angular automatically adds components in the module's `bootstrap` list to the `entryComponents` list.
      The `RouterModule` adds routed components to that list.

      That leaves only the following sources of undiscoverable components:

      * Components bootstrapped using one of the imperative techniques.
      * Components dynamically loaded into the DOM by some means other than the router.

      Both are advanced techniques that few developers ever employ.
      If you are one of those few, you must add these components to the
      `entryComponents` list yourself, either programmatically or by hand.

      For more information, see [Entry Components](guide/entry-components).
    </td>

  </tr>

</table>

## More on NgModules

You may also be interested in the following:
* [Feature Modules](guide/feature-modules).
* [Entry Components](guide/entry-components).
* [Providers](guide/providers).
* [Types of NgModules](guide/module-types).


