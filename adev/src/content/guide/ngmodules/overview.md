# NgModules

**NgModules** configure the injector, the compiler and help organize related things together.

An NgModule is a class marked by the `@NgModule` decorator.
`@NgModule` takes a metadata object that describes how to compile a component's template and how to create an injector at runtime.
It identifies the module's own components, directives, and pipes, making some of them public, through the `exports` property, so that external components can use them.
`@NgModule` can also add service providers to the application dependency injectors.

## Angular modularity

Modules are a great way to organize an application and extend it with capabilities from external libraries.

Angular libraries are NgModules, such as `FormsModule`, `HttpClientModule`, and `RouterModule`.
Many third-party libraries are available as NgModules such as the [Material Design component library](https://material.angular.io), [Ionic](https://ionicframework.com), or [Angular's Firebase integration](https://github.com/angular/angularfire).

NgModules consolidate components, directives, and pipes into cohesive blocks of functionality, each focused on a feature area, application business domain, workflow, or common collection of utilities.

Modules can also add services to the application.
Such services might be internally developed, like something you'd develop yourself or come from outside sources, such as the Angular router and HTTP client.

Modules can be loaded eagerly when the application starts or lazy loaded asynchronously by the router.

NgModule metadata does the following:

* Declares which components, directives, and pipes belong to the module
* Makes some of those components, directives, and pipes public so that other module's component templates can use them
* Imports other modules with the components, directives, and pipes that components in the current module need
* Provides services that other application components can use

Every Angular application has at least one module, the root module.
You [bootstrap](/guide/ngmodules/bootstrapping) that module to launch the application.

The root module is all you need in an application with few components.
As the application grows, you refactor the root module into [feature modules](/guide/ngmodules/feature-modules) that represent collections of related functionality.
You then import these modules into the root module.

## The basic NgModule

The [Angular CLI](/tools/cli) generates the following basic `AppModule` when creating a new application.

<docs-code header="src/app/app.module.ts">
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
</docs-code>

At the top are the import statements.
The next section is where you configure the `@NgModule` by stating what components and directives belong to it (`declarations`) as well as which other modules it uses (`imports`).
For more information on the structure of an `@NgModule`, be sure to read [Bootstrapping](/guide/ngmodules/bootstrapping).

## More on NgModules

<docs-pill-row>
  <docs-pill href="/guide/ngmodules/feature-modules" title="Feature Modules"/>
  <docs-pill href="/guide/ngmodules/providers" title="Providers"/>
  <docs-pill href="/guide/ngmodules/module-types" title="Types of NgModules"/>
</docs-pill-row>
