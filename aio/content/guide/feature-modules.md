@title
Feature Modules

@intro
Create feature modules to organize your code.

@description

## Prerequisites
A basic understanding of the following:
* [Bootstrapping](guide/bootstrapping). 
* [JavaScript Modules vs. NgModules](guide/ngmodule-vs-jsmodule). 
* [Frequently Used Modules](guide/frequent-ngmodules). 

<hr>

As the app grows, you can organize code relevant to a specific feature. 
This helps apply clear boundaries for features. With feature modules, 
you can keep code related to a specific functionality or feature 
separate from other code. Delineating areas of your 
app helps with collaboration between developers and teams, separating 
directives, and managing the size of the root module.

## Feature modules vs. root modules

A feature module is a class adorned by the `@NgModule` decorator 
and its metadata, just like a root module. Also like the root module, 
a feature module has the same metadata properties and shares the same 
execution context, which means the services in one module are 
available to all modules in the app.

There are two main differences between the root module and a feature module:

* You boot the root module to launch the app whereas you import a feature module to extend the app.
* A feature module can expose or hide its implementation from other modules.

A feature module delivers a cohesive set of functionality focused on a 
specific application need such as a user workflow, routing, or forms. 
While you can do everything within the root module, feature modules 
help you partition the app into focused areas. A feature module 
collaborates with the root module and with other modules through 
the services it provides and the components, directives, and 
pipes that it shares.

## How to make a feature module

Assuming you already have a [CLI]() generated app, create a feature 
module using the CLI by entering the following command in the 
root project directory. Replace `CustomerDashboard` with the 
name of your module. You can omit the word module because the CLI appends it:

```
ng generate module CustomerDashboard

```


This causes the CLI to create a folder called `customer-dashboard` with a file inside called `customer-dashboard.module.ts` with the following contents:


```javascript

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

@NgModule({
 imports: [
   CommonModule
 ],
 declarations: []
})
export class CustomerDashboardModule { }

```


The structure of an NgModule is the same whether it is a root module or a feature module. In the CLI generated feature module, there are two JavaScript import statements at the top of the file: the first imports `NgModule`, which, like the root module, lets you use the `@NgModule` decorator; the second imports `CommonModule`, which contributes many common directives such as `ngIf` and `ngFor`. Feature modules import `CommonModule` instead of `BrowserModule`, which is only imported once in the root module.

The `declarations` array is ready for you to add declarables. Declarables
are components, directives, and pipes that belong exclusively to this particular module. To add a component, enter the following command at the command line where `customer-dashboard` is the directory where the CLI generated the feature module and `CustomerDashboard` is the name of the component:

```
ng generate component customer-dashboard/CustomerDashboard

```

This generates a folder for the new component within the customer-dashboard folder and updates the feature module with the `CustomerDashboardComponent` info:

```javascript

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerDashboardComponent } from './customer-dashboard/customer-dashboard.component';

@NgModule({
 imports: [
   CommonModule
 ],
 declarations: [CustomerDashboardComponent]
})
export class CustomerDashboardModule { }

```

The `CustomerDashboardComponent` is now in the JavaScript import list at the top and added to the `declarations` array, which lets Angular know to associate this new component with this feature module.

 ## Importing a feature module 

To incorporate the feature module into your app, you have to let the root module, `app.module.ts`, know about it. Notice the `CustomerDashboardModule` export at the bottom of `customer-dashboard.module.ts`. This exposes it so that other modules can get to it. To import it into the AppModule, add it to the imports in `app.module.ts` and to the imports array:


```javascript
...
import { CustomerDashboardModule } from './customer-dashboard/customer-dashboard.module'; // import the feature module here so you can add it to the imports array below

@NgModule({
 declarations: [
   AppComponent
 ],
 imports: [
   BrowserModule,
   FormsModule,
   HttpModule,
   CustomerDashboardModule // add the feature module here
 ],
 providers: [UserService],
 bootstrap: [AppComponent]
})
...

```

Now the `AppModule` knows about the feature module. If you were to add any service providers to the feature module, `AppModule` would know about those too, as would any other feature modules. However, NgModules don’t expose their components.


## Rendering a feature module’s component template

When the CLI generated the `CustomerDashboardComponent` for the feature module, it included a template, `customer-dashboard.component.html`, with the following markup:

```html
<p>
 customer-dashboard works!
</p>
```


To see this HTML in the `AppComponent`, you first have to export the `CustomerDashboardComponent` in the `CustomerDashboardModule`. In `customer-dashboard.module.ts`, just beneath the declarations array, add an exports array containing `CustomerDashboardModule`:


```javascript

@NgModule({
 imports: [
   CommonModule
 ],
 declarations: [CustomerDashboardComponent],
 exports: [
	CustomerDashboardComponent
 ]
})
```


Next, in the `AppComponent`, `app.component.html`, add the tag `<app-customer-dashboard>`:


```html
<h1>
 {{title}}  
</h1>

<!-- add the selector from the CustomerDashboardComponent --> 
<app-customer-dashboard></app-customer-dashboard>

```

Now, in addition to the title that renders by default, the `CustomerDashboardComponent` template renders too:


<figure>
  <img src="generated/images/guide/feature-modules/feature-module.png" alt="feature module component">
</figure>

## Duplicate classes and feature modules

Sometimes you might have an app that has more than one class, such as a directive, by the same name. Though it's better to avoid duplicate names, you can use feature modules to help mitigate potential issues.

When you have two directives with the same name, you can create an alias 
for the contact version using the `as` JavaScript import keyword.

```typescript
import {
  TestDirective as CustomerTestDirective
} from './contact/test.directive';

```

This solves the immediate issue of referencing both directive _types_ in the same file but
leaves another issue unresolved.

When two directives compete to act upon the same element, the directive that's declared later wins because its DOM changes overwrite the first. 

You can import the same directive class multiple times. Angular removes duplicate classes and only registers one of them.

But from Angular's perspective, two different classes, defined in different files, that have the same name are not duplicates. Angular keeps both directives and they take turns modifying the same HTML element.

If you define two different component classes with the same selector specifying the same element tag, the compiler reports an error. It can't insert two components in the same DOM location. To eliminate component and directive conflicts, create feature modules that insulate the declarations in one module from the declarations in another.


## More on NgModules

You may also be interested in the following:
* [Lazy Loading Modules with the Angular Router](guide/lazy-loading-ngmodules).
* [Providers](guide/providers).
* [Types of NgModules](guide/module-types).
