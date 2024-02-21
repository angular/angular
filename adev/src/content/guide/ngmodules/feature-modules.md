# Feature modules

Feature modules are NgModules for the purpose of organizing code.

As your application grows, you can organize code relevant for a specific feature.
This helps apply clear boundaries for features.
With feature modules, you can keep code related to a specific functionality or feature separate from other code.
Delineating areas of your application helps with collaboration between developers and teams, separating directives, and managing the size of the root module.

## Feature modules vs. root modules

A feature module is an organizational best practice, as opposed to a concept of the core Angular API.
A feature module delivers a cohesive set of functionality focused on a specific application need such as a user workflow, routing, or forms.
While you can do everything within the root module, feature modules help you partition the application into focused areas.
A feature module collaborates with the root module and with other modules through the services it provides and the components, directives, and pipes that it shares.

## How to make a feature module

Assuming you already have an application that you created with the [Angular CLI](/tools/cli), create a feature module using the CLI by entering the following command in the root project directory.
You can omit the "Module" suffix from the name because the CLI appends it:

<docs-code language="shell">

ng generate module CustomerDashboard

</docs-code>

This causes the CLI to create a folder called `customer-dashboard` with a file inside called `customer-dashboard.module.ts` with the following contents:

<docs-code language="typescript">

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: []
})
export class CustomerDashboardModule { }

</docs-code>

The structure of an NgModule is the same whether it is a root module or a feature module.
In the CLI generated feature module, there are two JavaScript import statements at the top of the file: the first imports `NgModule`, which, like the root module, lets you use the `@NgModule` decorator; the second imports `CommonModule`, which contributes many common directives such as `ngIf` and `ngFor`.

Note: Feature modules import `CommonModule` instead of `BrowserModule`, which is only imported once in the root module.
`CommonModule` only contains information for common directives such as `ngIf` and `ngFor` which are needed in most templates, whereas `BrowserModule` configures the Angular application for the browser which needs to be done only once.

The `declarations` array is available for you to add declarables, which are components, directives, and pipes that belong exclusively to this particular module.
To add a component, enter the following command at the command line where `customer-dashboard` is the directory where the CLI generated the feature module and `CustomerDashboard` is the name of the component:

<docs-code language="shell">

ng generate component customer-dashboard/CustomerDashboard

</docs-code>

This generates a folder for the new component within the `customer-dashboard` folder and updates `CustomerDashboardModule`.

<docs-code header="src/app/customer-dashboard/customer-dashboard.module.ts"
           highlight="[4,11,14]">
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CustomerDashboardComponent } from './customer-dashboard/customer-dashboard.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    CustomerDashboardComponent
  ],
  exports: [
    CustomerDashboardComponent
  ]
})
export class CustomerDashboardModule { }
</docs-code>

The `CustomerDashboardComponent` is now in the JavaScript import list at the top and added to the `declarations` array, which lets Angular know to associate this new component with this feature module.

## Importing a feature module

To incorporate the feature module into your app, you have to let the root module, `app.module.ts`, know about it.
Notice the `CustomerDashboardModule` export at the bottom of `customer-dashboard.module.ts`.
This exposes it so that other modules can get to it.
To import it into the `AppModule`, add it to the imports in `app.module.ts` and to the `imports` array:

<docs-code header="src/app/app.module.ts" highlight="[5,6,14]">
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';

// import the feature module here so you can add it to the imports array below
import { CustomerDashboardModule } from './customer-dashboard/customer-dashboard.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    CustomerDashboardModule // add the feature module here
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
</docs-code>

Now the `AppModule` knows about the feature module and `AppComponent` can use the customer dashboard component.
More details on this in the section below.

If you were to add any service providers to the feature module, `AppModule` would know about those too, as would any other imported feature modules.

## Rendering a feature module's component template

When the CLI generated the `CustomerDashboardComponent` for the feature module, it included a template, `customer-dashboard.component.html`, with the following markup:

<docs-code header="src/app/customer-dashboard/customer-dashboard/customer-dashboard.component.html" language="html">
<p>
  customer-dashboard works!
</p>
</docs-code>

To see this HTML in the `AppComponent`, you first have to export the `CustomerDashboardComponent` in the `CustomerDashboardModule`.
In `customer-dashboard.module.ts`, just beneath the `declarations` array, add an `exports` array containing `CustomerDashboardComponent`:

<docs-code header="src/app/customer-dashboard/customer-dashboard.module.ts" highlight="[2]">
  exports: [
    CustomerDashboardComponent
  ]
</docs-code>

Next, in the `AppComponent`, `app.component.html`, add the tag `<app-customer-dashboard>`:

<docs-code header="src/app/app.component.html" highlight="[5]" language="html">
<h1>
  {{title}}
</h1>

<app-customer-dashboard></app-customer-dashboard>
</docs-code>

Now, in addition to the title that renders by default, the `CustomerDashboardComponent` template renders too:

<img alt="feature module component" src="assets/images/guide/ngmodules/feature-module.png">

## More on NgModules

<docs-pill-row>
  <docs-pill href="/guide/ngmodules/lazy-loading" title="Lazy Loading Modules with the Angular Router"/>
  <docs-pill href="/guide/ngmodules/providers" title="Providers"/>
  <docs-pill href="/guide/ngmodules/module-types" title="Types of Feature Modules"/>
</docs-pill-row>
