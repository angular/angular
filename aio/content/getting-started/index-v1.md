# Getting Started with Angular: Your First App

Angular is the modern web developer's platform. 
Angular gives you the tools and the ecosystem to build web applications that scale. 
Angular provides advanced capabilities for internationalization, mobile apps, server-side rendering, and more, so that you can deliver more quickly, with less risk. 

In this tutorial, we'll introduce you to the building blocks of Angular. We'll leverage what you already know about web development, and teach you the essentials of Angular so you can feel confident exploring Angular's extensive native capabilities and [network of 3rd-party tools and libraries](https://angular.io/resources). 



## Introduction

This tutorial walks you through the steps to build a simple online store application. The application displays a catalog of products and their details. It also includes a shopping cart, with check out functionality. 


<figure>
  <img src='generated/images/guide/toh/component-structure.gif' alt="Angular applications are broken down into a tree of components like on express.google.com">
</figure>


*JAF: Min: Replace image with one that is just the app without component overlays, fix sizing. Consider: Replace with final GS Store app*


{@a intro-tutorial}
### What you'll learn
<!-- Tutorial application -->

The store app is simplified to help you focus on skills that you are most likely to use in developing your own apps. The techniques that you will learn are Angular best practices, intended to scale with your Angular apps. 

This tutorial is organized into three parts:

* Part 1 - Your First App (1.5 hours): You'll create the catalog of products. You'll learn about:

    - Components, which are the building blocks of an Angular application
    - Angular's template syntax, which extends HTML to provide integration with data and services
    - How to use services to deliver data to components
    - How to use routing to synchronize URL changes and app changes in response to user actions 

* Part 2 - Managing Data (2 hours): You'll add the shopping cart and checkout features. You'll learn about: 

    - Retrieving data via an HTTP interface
    - Using forms to manage user interactions with data

* Part 3 - Deployment: You'll deploy your app to a live website (Firebase) or to your hosting environment. If you chose to deploy to your hosting environment, you'll learn how to use the [Angular CLI](cli) to build and deploy your app to the hosting environment of your choice. 

Within each section, this tutorial introduces a new concept and then provides instructions to apply that concept to the online store app. 

You can also see the <live-example noDownload></live-example>

*JAF: Verify and update time estimates for each part.*


{@a intro-skills}
### Prerequisites


To get the most benefit from Angular and this tutorial, we recommend that you have experience in the following areas: 

* Basic programming
* HTML, CSS, and JavaScript or TypeScript


<div class="alert is-helpful">

If you are new to web development, you'll find lots of resources available to compliment the Angular docs. Mozilla's MDN docs include both [HTML](https://developer.mozilla.org/en-US/docs/Learn/HTML) and [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript) introductions. [TypeScript's docs] (https://www.typescriptlang.org/docs/home.html) include a 5-minute tutorial. Various online course platforms, such as Udemy and CodeAcademy, also cover web development basics. 

</div> 

{@a stackblitz}
### Setup

You don't need to install anything. You'll build the shopping cart using [StackBlitz](https://stackblitz.com/). StackBlitz is an online development environment with accelerators that make it easy to develop an Angular application. The accelerators are similar to what is offered by the [Angular CLI](cli) when you are working locally. 


{@a components}
## Key concepts




{@a components}
### Components

Components are the building blocks of Angular apps. 
A component is comprised of three things: 

* An HTML template, which determines what is presented to the user 
* A class that handles data and functionality 
* Styles that define the look and feel 

This structure provides a consistent way to combine and present HTML, CSS, and Javascript on a page. 
Angular components behave similarly to HTML elements, and they can be given state or generate events.

An Angular application is composed of a tree of components, in which each Angular component has a specific purpose and responsibility. 
The components at each level of the tree have progressively fewer responsibilities. 

Imagine a typical shopping experience, such as [Google Express](https://express.google.com): 

*JAF: Use the shopping cart that we'll build. Fix size.*

<figure>
  <img src='generated/images/guide/toh/component-structure.png' alt="Angular applications are broken down into a tree of components like on express.google.com">
</figure>

We can organize this app into the following tree of components:

* app-root: The first component to load, the parent of all other components. You can think of this as the overall page or app shell. 
  * app-top-bar: Top bar, with branding and site-wide controls
  * app-side-nav: Side navigation, which includes the list of product categories 
  * app-product-list: Product list 
    * app-product-carousel): Product carousel, which displays a rotating series of highlighted products
    * app-product-preview: Product preview, with basic information such as name and description
    * app-product-preview: Product preview
    * app-product-preview: Product preview
    * app-product-preview: Product preview
    
Just like HTML elements, components can be referred to or nested in another component's template. A component is referred to by its `selector`. The selector is the name you give the Angular component when it is rendered as an HTML element on the page. By convention, Angular component selectors begin with the prefix such as `app-`, followed by the component name. 


{@a template-syntax}
### Template syntax

Angular extends and builds on top of HTML. Angular provides template syntax that gives components control over the display of content. 

This section introduces five of the things you can do within an Angular template to affect what your user sees, based on the component's state and behavior. You'll use these throughout this tutorial. 

Experiment by playing with different values in the input boxes below. 

#### {{ }} Interpolation

Interpolation lets you render the contents of a property of a component as text in HTML. 

<aio-gs-interpolation></aio-gs-interpolation>

#### [ ] Property binding

Following the mental model of HTML, components have state being given to them. This is accomplished by binding to the property of a component or HTML element.

You can bind to a property on an element, so that whenever the property changes, the element is updated based on the template expression.

<aio-gs-property-binding></aio-gs-property-binding>

#### ( ) Event binding

You can listen to standard HTML events or custom events (which you create through components). 

<aio-gs-event-binding></aio-gs-event-binding>

#### *ngIf

You can add and remove elements from the page dynamically using `*ngIf`. 

`*ngIf` is a "structural directive". Structural directives change which HTML or components are displayed.  Technically, they shape or reshape the DOM's structure, typically by adding, removing, and manipulating the elements to which they are attached. Any directive with an * is a structural directive.

<aio-gs-ng-if></aio-gs-ng-if>

#### *ngFor

*ngFor is another structural directive. It iterates over a list, rendering the HTML or component once for each item in the list. 

<aio-gs-ng-for></aio-gs-ng-for>


<div class="alert is-helpful">

To learn about the full capabilities of Angular's template syntax, see the [Template Syntax guide](guide/template-syntax).

</div>


{@a basic-app}
## Building the basic store app layout
<!-- skeleton, framework, site layout, app layout -->

Let's get started. 

In this section, you'll create a new project in StackBlitz, and then scaffold out some components for your store. 


#### 1. Create a new project
<!-- does this def of project match local def? when and how do we introduce workspace? -->
<!-- 
You develop apps in the context of an Angular workspace. A workspace contains the files for one or more projects. A project is the set of files that comprise an app, a library, or end-to-end (e2e) tests.  -->

To create a new project in StackBlitz, [click here](https://stackblitz.com/fork/ng-getting-started).

StackBlitz creates a new Angular workspace and an initial app project. The initial app includes the `app-root` component mentioned above, as well as other app and configuration files. The `app-root` component is responsible for displaying "Angular Getting Started" in the preview pane on the right. 

Tips for working in Stackblitz:
* If you log into StackBlitz, you can easily take breaks and return to the current state of this tutorial app. If you have a GitHub account, you can log into StackBlitz with that account. See [Working in Stackblitz](#stackblitz) for more tips. 
* If you want to save a snapshot of your work at a given point, create a fork. You can edit the name of your Stackblitz project to make it easier to return to your work (such as `getting-started-part1`). To display all of your forks, click on your name in the top bar. 
* If the preview pane isn't showing what you expect, save and then click the refresh button. 
* To copy a code example from this tutorial, click the icon at the top right of the code example box to save the example to the clipboard. Then you can paste the code snippet into Stackblitz. 


####  2. Create the top bar component

1. Right click on the `app` folder and use the `Angular Generator` to generate a new component named `top-bar`.


<code-tabs>

  <code-pane header="src/app/top-bar/top-bar.component.ts" path="getting-started-v1/src/app/top-bar/top-bar.component.ts" region="v1">
  </code-pane>

  <code-pane header="src/app/top-bar/top-bar.component.html" path="getting-started-v1/src/app/top-bar/top-bar.component.1.html" region="initial">
  </code-pane>

  <code-pane header="src/app/top-bar/top-bar.component.css" path="getting-started-v1/src/app/top-bar/top-bar.component.css">
  </code-pane>

</code-tabs>

A component definition includes: 

 * The `Component` decorator, which provides metadata about the component, including its templates, styles, and a selector.
 * An exported class, which handles functionality for the component.

*JAF: By our current definitions, a component also includes the html and css. Is there a term for the collection here, the collection of what's in the .ts file specifically? It comes up in terms of "open the component .ts file" where the other files have names "component template file" and "component style file" that are alternatives to "component .html file" and "component .css file".*

Right now, the `TopBarComponent` doesn't do much, but you'll update it to show the name of your store.

2. Define a `name` property to the `TopBarComponent` class with a value of `My Store`.

<code-example header="src/app/top-bar/top-bar.component.ts" path="getting-started-v1/src/app/top-bar/top-bar.component.ts" region="name">
</code-example>

3. Update the `TopBarComponent` template to display a welcome message with an interpolation of the `name` property. Delete the original "top bar works" message. 

<code-example header="src/app/top-bar/top-bar.component.html" path="getting-started-v1/src/app/top-bar/top-bar.component.1.html" region="header">
</code-example>

4. Replace the starter contents of `app.component.html` ("Angular Getting Started") with the `app-top-bar` component.

<code-example header="src/app/app.component.html" path="getting-started-v1/src/app/app.component.1.html" linenums="false" region="top-bar">
</code-example>

Now your shopping cart displays the title of your store at the top of your application.

#### 3. Create the side nav component

The side navigation lists categories for the products in your store.

To create the side navigation, you'll repeat the pattern of steps you did to create the top navigation component: 

1. Right click on the `app` folder, and use the `Angular Generator` to generate a component named `side-nav`.

2. Define a `categories` property in the `SideNavComponent` as an array with two items: `Phones` and `Shoes`.

<code-example header="src/app/side-nav/side-nav.component.ts" path="getting-started-v1/src/app/side-nav/side-nav.component.ts">
</code-example> 

3. Update the `side-nav.component.html` to display a list of categories using an `*ngFor` directive.

<code-example header="src/app/side-nav/side-nav.component.html" path="getting-started-v1/src/app/side-nav/side-nav.component.html" linenums="false">
</code-example>

4. To position the category names on the left side of the page, add the following styles in the `side-nav.component.css` file.

<code-example header="src/app/side-nav/side-nav.component.css" path="getting-started-v1/src/app/side-nav/side-nav.component.css" linenums="false">
</code-example>

The styles that are defined for a component are specific to that component. 
They do not impact the styles of other components in the application. 

<div class="alert is-helpful">

Global styles are defined in the app's `style.css` file. The global styles are overridden by component-specific styles. For more information about styling components, see the [Component Styles guide](guide/component-styles).

</div>

5. Add the `app-side-nav` component to your `app.component.html` under the `app-top-bar` component.

<code-example header="src/app/app.component.html" path="getting-started-v1/src/app/app.component.1.html" linenums="false" region="side-nav">
</code-example>

The `app-side-nav` component displays on the left side of the page, under the top bar.

#### Review

In this section, you learned:

* The general structure of Angular project files
* About the `app-root` component, which is generated when you create a new Angular project
* How to use the `Angular Generator` and app preview to accelerate development in StackBlitz 
* How to create all three parts of a component, following this pattern: 
    1. Generate the skeleton component
    2. Define the properties and functionality (in the component `.ts` file)
    3. Define how the component will be displayed (in the component template file)
    4. Optionally, specify component-specific styles (in the component `.css` file)

<code-tabs>

  <code-pane header="src/app/top-bar/top-bar.component.ts" path="getting-started-v1/src/app/top-bar/top-bar.component.ts">
  </code-pane>

  <code-pane header="src/app/top-bar/top-bar.component.html" path="getting-started-v1/src/app/top-bar/top-bar.component.1.html" region="header">
  </code-pane>

  <code-pane header="src/app/side-nav/side-nav.component.ts" path="getting-started-v1/src/app/side-nav/side-nav.component.ts">
  </code-pane>

  <code-pane header="src/app/side-nav/side-nav.component.html" path="getting-started-v1/src/app/side-nav/side-nav.component.html">
  </code-pane>

  <code-pane header="src/app/side-nav/side-nav.component.css" path="getting-started-v1/src/app/side-nav/side-nav.component.css">
  </code-pane>

  <code-pane header="src/app/app.component.html" path="getting-started-v1/src/app/app.component.1.html" region="layout">
  </code-pane>  

</code-tabs>

## Communcating between components

Just like any element in HTML, Angular components take state (input) and emit events (output). 

You define the inputs and outputs as properties in the component class. `Input` and `Output` are decorators provided by Angular that provide metadata for properties that are defined in the component class. Use these decorators with Angular's change detection system to communicate when changes occur from within a component and when the component conveys that some interesting event has happened.

### Providing state with an input

Below is an example of a component used to display a name.

```ts
import { Component, Input } from '@angular/core';

@Component({
  template: `
    <div>{{name}}</div>
  `
})
export class EditableNameComponent {
  @Input() name: string;
}
```

Inputs define what data can be passed into your component. This data is updated through `bindings`, defined in a parent component's template. Whenever a parent component's property binding is updated, the property you mark with `@Input()` will also be updated as a part of Angular's change detection. In the example above, the `name` property is updated when the parent component updates the `name` through a binding.

### External communication with an output

*JAF: Note that we don't use an Output in the shopping cart app in Part 1. Should we shorten this introduction? Add functionality?*

Look at the `editName` property to see how the component communicates externally.

```ts
import { Component, Input, Output } from '@angular/core';

@Component({
  template: `
    <div>{{name}}</div>

    <button (click)="editName.emit()">Edit</button>
  `
})
export class EditableNameComponent {
  @Input() name: string;
  @Output() editName = new EventEmitter();
}
```

Outputs are used to create custom events in your component. You create a new `EventEmitter` and store it as an `@Output()` property of the component. This newly created `EventEmitter` instance has a method `emit` that you call whenever your custom event has occurred, in response to some action from the template, or based on some asynchronous process.

With inputs and outputs, you can build elaborate tree structures of components that take in state, and give back events using property and event bindings. 

Read more about these bindings in the [Template Syntax Guide](guide/template-syntax).


### Displaying a product preview

The steps below show you how to use an `Input` decorator to display details for a single product. You'll create a product preview component and pass in the product to display. 

#### 1. Create a products folder

Right click on the `app` folder and create a new folder named `products`. This folder will contain the related components and functionality for the `products` feature area.

#### 2. Create a product interface

Right click on the `products` folder, and use the `Angular Generator` to generate an interface named `product`. 

Add the `name` and `description` properties shown below:  

<code-example header="src/app/products/product.ts" path="getting-started-v1/src/app/products/product.1.ts">
</code-example>

This interface defines the structure of a product, including its id, name, and description. This interface also provides you a consistent way to reference a `Product` throughout your application.

#### 3. Create a product preview component

1. Right click on the `products` folder and generate a new component named `product-preview`.

2. In the `ProductPreviewComponent` class, add `Input` to the imports from the `@angular/core` package. 

The initial component that is generated only imports the most basic functionality. As you expand the component's properties and behavior, you often need to import additional functionality, so that it's avialable to the component.

<code-example header="src/app/products/product-preview/product-preview.component.ts" path="getting-started-v1/src/app/products/product-preview/product-preview.component.ts" region="core-imports">
</code-example>

3. Import the `Product` interface using its path relative to the `product-preview` folder. Add this line below the other `import` statement. 

<code-example header="src/app/products/product-preview/product-preview.component.ts" path="getting-started-v1/src/app/products/product-preview/product-preview.component.ts" region="product-imports">
</code-example>


4. Define a property in the `ProductPreviewComponent` class named `product` and use the `Input` decorator on it. Give the `product` a defined type using the `Product` interface.

<code-example header="src/app/products/product-preview/product-preview.component.ts" path="getting-started-v1/src/app/products/product-preview/product-preview.component.ts" region="inputs-outputs">
</code-example>

When the `app-product-preview` component is used within a template and its `product` property is updated, change detection will be run on the component with the new data being displayed.

5. Update the `ProductPreviewComponent` template to display the data received from the `Input`.

<code-example header="src/app/products/product-preview/product-preview.component.html (Product Input)" path="getting-started-v1/src/app/products/product-preview/product-preview.component.1.html">
</code-example>

6. Add the `app-product-preview` component to `app.component.html` and provide a single product with a name and description.

<code-example header="src/app/app.component.html (Sample Preview)" path="getting-started-v1/src/app/app.component.1.html" linenums="false" region="product-preview">
</code-example>

The `app-product-preview` component displays a single product with the product name and description.

Let's look at that in detail. Recall that Inputs define what data can be passed into a component. The data is updated through bindings, defined in a parent component's template. Whenever a parent component's property binding is updated, the property you mark with @Input() is also updated. 

In this case: 

* `AppComponent` is the parent component, and `ProductPreviewComponent` is the child component.
* The template for `AppComponent` (`app-component.html`) contains the property binding for `[product]`. 
* When the `product` data is updated (to be Pixel 3, as shown above), the property is also updated in `ProductPreviewComponent`. 
* The `app-product-preview` component then displays the new product name and description. 

<code-tabs>

  <code-pane header="src/app/products/product.ts" path="getting-started-v1/src/app/products/product.ts">
  </code-pane>

  <code-pane header="src/app/products/product-preview/product-preview.component.ts" path="getting-started-v1/src/app/products/product-preview/product-preview.component.ts">
  </code-pane>

  <code-pane header="src/app/products/product-preview/product-preview.component.html" path="getting-started-v1/src/app/products/product-preview/product-preview.component.1.html">
  </code-pane>

  <code-pane header="src/app/app.component.html" path="getting-started-v1/src/app/app.component.1.html" region="communication">
  </code-pane>  

</code-tabs>


## Storing data with services

Services are an integral part of Angular applications. Services in Angular are an instance of a class that can be made available to any part of your application using Angular's dependency injection system.

Services are used to encapsulate data and functionality.

### Creating and providing a service

To create a service, simply create a class and decorate it with `@Injectable()`.

```ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MyService {}
```

The service now has defined metadata used for requesting an instance of the service. 

Before you use a service, you must make sure it is provided in your application. 
The `providedIn: 'root'` syntax provides the Angular compiler information to register the provider globally within Angular's dependency injection. Services necessary for your application functionality are often provided using this syntax. 

Providers created with this syntax are tree-shakable, meaning that the Angular compiler removes the associated services from the final output when it determines that they are not used in your application. This significantly reduces the size of your bundles.


<div class="alert is-helpful">

When you add a service provider to the root application injector (as shown above), it’s available throughout the app. These providers are also available to all the classes in the app, as long they have the lookup token.

You should always provide your service in the root injector unless there is a case where you want the service to be available only if the consumer imports a particular @NgModule. You don't need to focus much on how an `NgModule` works for this guide, but you can learn more about them in the [NgModules guide](guide/ngmodules).

Learn more about Angular's dependency injection system in the [Dependency Injection guide](guide/dependency-injection). 

</div>


### Creating a product service to store products

Services are the place where you share data between parts of your application. For the shopping cart, a product service is where you to store your product data and methods.

#### 1. Generate the product service

Right click on the the `products` folder, and use the `Angular Generator` to generate a service name `Product`.

<code-example header="src/app/products/product.service.ts (Initial code)" path="getting-started-v1/src/app/products/product.service.1.ts">
</code-example>

#### 2. Import functionality to manage the array of products

[Observables](guide/glossary#observable) provide support for passing messages between publishers and subscribers in your application. They are ysed for asynchronous event handling throughout Angular. 

We'll use observables from the RxJS library to manage the values for array of products. 

* Import the `Observable` type to get the type information for an observable.
* Import the `of` method to create an observable from a predefined value. We'll use this method to return an observable array of products.


<code-example header="src/app/products/product.service.ts (RxJS imports)" path="getting-started-v1/src/app/products/product.service.2.ts" linenums="false" region="rxjs-imports">
</code-example>

<div class="alert is-helpful">

Angular integrates with the popular open-source library [Reactive Extensions for Javascript](https://rxjs.dev)(RxJS), which uses [observables](guide/glossary#observable) to handle asynchronous behavior in your application. Learn more about observable streams in Angular's [Observables guide](guide/observables).

</div>

Import the `Product` interface of this shopping cart app:

<code-example header="src/app/products/product.service.ts (Product interface)" path="getting-started-v1/src/app/products/product.service.2.ts" linenums="false" region="product-import">
</code-example>

#### 3. Define data properties and methods

Use methods to expose the data from the `ProductService.data` property.

1. Define a `data` property in the `ProductService` class that contains product list data.
2. Add a `getAll()` method using the `of` method to return the products from the data property.

The complete code is below. Ensure that `@Injectable` includes `providedIn: 'root'`.

*JAF: StackBlitz doesn't create @Injectable with providedIn: 'root'.*

<code-example header="src/app/products/product.service.ts (Product Data)" path="getting-started-v1/src/app/products/product.service.2.ts" region="product-data">
</code-example>

The `ProductService` is ready to be injected into many different areas in your application using Angular's dependency injection.

### Displaying the product list using a service

The data for the products is stored in a service accessible from components and other services. The products list component displays a listing of each product available in your store with a brief description.

#### 1. Generate the product list component

Right click on the `products` folder, use the `Angular Generator` to generate a component named `product-list`.

#### 2. Import the observable and product types

1. Import the `Observable` type from the `RxJS` library.

<code-example header="src/app/products/product-list/product-list.component.ts (Observable import)" path="getting-started-v1/src/app/products/product-list/product-list.component.ts" region="rxjs-import">
</code-example>

2. Import the `ProductService` that provides the product data, and the `Product` interface.

<code-example header="src/app/products/product-list/product-list.component.ts (Product imports)" path="getting-started-v1/src/app/products/product-list/product-list.component.ts" region="product-imports">
</code-example>

#### 3. Define the products and inject the product service

1. Define a `products` property in the `ProductListComponent` as an observable array of products.
2. Inject the `ProductService` into the constructor of the `ProductListComponent` and define the `products` using the `getAll()` method from the `ProductService`.

<code-example header="src/app/products/product-list/product-list.component.ts (Products Observable)" path="getting-started-v1/src/app/products/product-list/product-list.component.ts" region="products-observable">
</code-example>

#### 4. Display the product list

To wire up the product data in the component template, you'll need to subscribe and listen to the values from the `products` observable. This is done in the component template using an `AsyncPipe` that handles subscribing to observables in the template and cleaning up after the component is destroyed.

1. Update the `product-list.component.html` to display the products using an `NgFor` directive, an `AsyncPipe`, and the `app-product-preview` component. 

<code-example header="src/app/products/product-list/product-list.component.html (Product List)" path="getting-started-v1/src/app/products/product-list/product-list.component.html">
</code-example>

The `AsyncPipe` used in the template subscribes to the `products` observable that emits the array of products. The `NgFor` directive iterates over each product and binds a `product` to an `app-product-preview` component. Learn more about pipes in the [Pipes Guide](guide/pipes).

2. Add the `app-product-list` component to your `app.component.html` below the `app-side-nav` component. Delete the `app-product-preview` component.

<code-example header="src/app/app.component.html (Product List)" path="getting-started-v1/src/app/app.component.1.html" region="product-list">
</code-example>

In this section:

<code-tabs>

  <code-pane header="src/app/products/product-list/product-list.component.ts" path="getting-started-v1/src/app/products/product-list/product-list.component.ts">
  </code-pane>

  <code-pane header="src/app/products/product-list/product-list.component.html" path="getting-started-v1/src/app/products/product-list/product-list.component.html">
  </code-pane>

  <code-pane header="src/app/products/product.service.ts" path="getting-started-v1/src/app/products/product.service.2.ts">
  </code-pane>  

  <code-pane header="src/app/app.component.html" path="getting-started-v1/src/app/app.component.2.html">
  </code-pane>  

</code-tabs>

{@a routing}
## Navigating with the Angular router

Up to this point, the application doesn't have any variable states or navigation. There is one URL, and that URL always displays the "My Store" page with a fixed list of categories and products. 

The Angular [router](guide/glossary#router) allows us to show different components and data to the user based on where the user is in the application. 

In the simplest form, the router takes the state of the browser's URL bar (also called navigation or location bar) and maps it to a set of components to render to the screen. When the user navigates to another part of the app (by performing application tasks or entering a new URL), the router swaps one set of components for another. 

In this section, you'll: 
* Learn about common types of routes
* Enable routing in the Store app
* Make the product list area routable, meaning that user actions in this area will change the URL, and changes to the URL will replace the contents of this area
* Create and configure a new product details route to transition from the product list area when a single product is selected

In this section, we'll update the Store app to use routing for the product list area of the app. 
The top bar and side navigation will remain fixed, while the product list changes. 
The URL and displayed components will change together, based on the user's selections. 

### Types of routes

A "route" defines a mapping of a URL suffix (a path) to the parent component to display. 

Most applications include these common types of routes:

* Default routes for destination pages, such as the home page:

    ```ts
    { path: '', component: HomePageComponent }
    ```

* Static routes for defined pages, such as the About page: 

    ```ts
    { path: 'about', component: AboutPageComponent }
    ```

* Variable routes, which are determined at runtime, include a variable prefixed with a colon to designate substitution. Variable routes are useful for creating URLs that correlate to data values, such as product IDs. This is the type of routing we'll use for the product details. 

    ```ts
    { path: 'products/:productId', component: ProductDetailsComponent }
    ```

* Catch-all routes for error handling, such as displaying a 404 for non-existent pages. 

    ```ts
    { path: '**', component: PageNotFoundComponent }
    ```

These routes enable you to build simple to complex URLs to navigate around your application, based on the purpose and requirements of your application.


### Configure the app to use routing

So far we've worked mostly within individual components and services. 

Some Angular features, however, are global to the app and available at all times. Because routing is pervasive--the user can enter a new URL or take an action that causes a change to the URL--routing must be enabled and configured at the app level. The Angular Router is provided as one singleton service throughout the application.

To eanble routing in the app, you will: 

1. Import and register `RouterModule.forRoot()` with an array of route definitions.
2. Set up a `RouterOutet` as a placeholder to dislay routed components.


#### 1. Open app.module.ts

Open the `app.module.ts` file. 

The root `AppModule` is an `NgModule` that contains metadata about how the application is initialized. It contains the component or components that are bootstrapped, and is the point where the top level injectors are created.

Before you register the router, look at the metadata `AppModule`.

<code-example header="src/app/app.module.ts (AppModule)" path="getting-started-v1/src/app/app.module.1.ts" region="app-module">
</code-example>

You have been using StackBlitz to generate components themselves, but as you see below, the components are also in the `declarations` of the `AppModule` NgModule metadata. That is because components need to be *declared* in an `NgModule` before they can be used in a template. Other things to note in the `AppModule`.

- The `imports` are where you register NgModules to consume their publicly available components, directives, and pipes.
- The `BrowserModule` registers specific providers needed for your app to run in a browser.
- The `declarations` are where your components, directives, and pipes are registered so they can be used within your component templates.
- The `bootstrap` array contains the components you want to initialize when the app is first initialized.

This metadata is provided for the Angular compiler when compiling your app. Adding components to your `NgModule` files, in this case the `AppModule` is handled by `StackBlitz`, or by the `Angular CLI` generation commands. You should be aware of what it is an `NgModule`, and what is defined in its metadata, but their main use is as a registration point for the compiler.

Now let's register the Angular Router and define some some routes.

#### 2. Import RouterModule

Import `RouterModule` from the `@angular/router` package into the `app.module.ts` file: 

<code-example header="src/app/app.module.ts (RouterModule)" path="getting-started-v1/src/app/app.module.1.ts" region="router-module">
</code-example>

#### 2. Register RouterModule

In the `imports` array, add the `RouterModule.forRoot([])` method with an empty array. 
Route definitions will be stored in the array.

<code-example header="src/app/app.module.ts (imports)" path="getting-started-v1/src/app/app.module.1.ts" region="router-module-imports">
</code-example>

At this point, your application is configured with Angular routing; the router is created and ready to listen.

#### 3. Add a router outlet

The template needs a placeholder where it renders routed components. That placeholder is called a "router outlet."

Recall that we're going to use routing for the product list area of the app. 
So, we'll replace the product list view with a router outlet. 
To do that, open `app.component.html` and
replace `app-product-list` with `router-outlet`. 

<code-example header="src/app/app.component.html (Router outlet)" path="getting-started-v1/src/app/app.component.html">
</code-example>

Now the router is both ready to listen for changes in the browser URL, and it has a place to display the requested component(s).
Where the product list component was rendered previously, nothing appears. The router doesn't know which component to place
beneath the router outlet until you define some routes for it to match against the browser URL.

### Create a route that shows product list

Next you need to configure the app with routes to transition from one set of components to the next.

To register a route for the product list, it must be defined in the array of routes.

#### 1. Add a product list route

In the `app.module.ts` file, add an object to the array defined in `RouterModule.forRoot()` array with an empty string as the `path` and set the `ProductListComponent` as the `component`.

<code-example header="src/app/app.module.ts (Product list route)" path="getting-started-v1/src/app/app.module.2.ts" region="product-list-route">
</code-example>

In your `StackBlitz` preview pane on the right, enter your preview URL without any additional URL paths and press the `Enter` key to reload the page. 

```
https://[your-stackblitz-subdomain].stackblitz.io
```

The preview pane displays the top bar, side-nav, and the product list as shown previously.

### Create a route for product details

Next, you'll add a variable route definition to display product details.

#### 1. Generate the product details route component

1. Right click on the `products` folder, use the `Angular Generator` and generate a component named `product-details`.

#### 2. Add a product details route

1. In the `app.module.ts` define a variable route for the product details. Use `products/:productId` as the `path`, with `productId` being substituted with the value from the URL, and `ProductDetailsComponent` for the `component`.

<code-example header="src/app/app.module.ts (Product details route)" path="getting-started-v1/src/app/app.module.2.ts" region="product-details-route">
</code-example>

2. In the `ProductPreviewComponent`, update the template to link to the product details page with the `productId` using a `RouterLink`. 

<code-example header="src/app/products/product-preview/product-preview.component.html (Product preview routerLink)" path="getting-started-v1/src/app/products/product-preview/product-preview.component.html" linenums="false">
</code-example>

Navigation is done through the `RouterLink` directive provided by the `RouterModule` in a template, or imperatively using the `Router` service. Navigation is always done by string, or by array of URL paths, such as `['path', 'to', variable]` which results in a URL that looks like 'https://example.org/path/to/42'. For the product details `routerLink`, the router constructs a complete URL based on the array of paths provided.

When the user clicks on the product title, the router will navigate to the product details route, with the specific `productId`. Only placeholder text is displayed, but you'll retrieve the product details in the [managing data](getting-started/getting-started-data) section.

### Navigating to the homepage

Router links are convenient to navigate the user around without manually entering a URL each time. After the user clicks on a product's details, you'll want to provide a link to get back to the home page.

Wrap the header in the `TopBarComponent` template in a link to navigate back to the app home page.

<code-example header="src/app/top-bar/top-bar.component.html" path="getting-started-v1/src/app/top-bar/top-bar.component.html" region="home-route">
</code-example>

<div class="alert is-helpful">

To learn more about routing, see the [Router and Navigation Guide](guide/router).

</div>

In this section:

<code-tabs>

  <code-pane header="src/app/app.component.html" path="getting-started-v1/src/app/app.component.html">
  </code-pane>

  <code-pane header="src/app/top-bar/top-bar.component.html" path="getting-started-v1/src/app/top-bar/top-bar.component.html" region="home-route">
  </code-pane>

  <code-pane header="src/app/products/product-preview/product-preview.component.html" path="getting-started-v1/src/app/products/product-preview/product-preview.component.html">
  </code-pane>

  <code-pane header="src/app/app.module.ts" path="getting-started-v1/src/app/app.module.2.ts" region="routing">
  </code-pane>  

</code-tabs>

## Review and next steps

Congratulations! You have a running Angular app. You have the first piece of the shopping cart app, which is the product catalog. 

In this part you learned:
* How to create components, the basic building block of Angular apps
* How to communicate between components with @Input and @Output
* How to create and use services to deliver data
* How to use routing to create a relationship between URLs and app states

Continue to the next part to learn more about [managing data](getting-started/getting-started-data), as you build the shopping cart and checkout features of the app. 


