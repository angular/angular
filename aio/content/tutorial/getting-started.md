# Getting Started with Angular

Angular is the modern web developer's platform. Angular gives you the tools and the ecosystem to allow you to build and scale applications using web technologies.

Angular has many advanced features that take care of everything from internationalization and mobile to service workers and server side rendering, but this tutorial will walk you through the basics that will help you get started as a productive Angular developer.

If you are new to web development or programming in general, read our requirements for getting started with Angular.

## Components
Angular applications are composed of a tree of components that you create. Components act very similarly to HTML elements and can be given state or generate events. 

If we imagine a normal shopping experience, like the one on express.google.com:

<figure>
  <img src='generated/images/guide/toh/component-structure.gif' alt="Angular applications are broken down into a tree of components like on express.google.com">
</figure>

We can think of this as an application made up of a tree of components.

* app-root
  * app-top-bar
  * app-side-nav
  * app-product-list
    * app-product-carousel
    * app-product-preview
    * app-product-preview
    * app-product-preview

There are many valid ways you can break down your application into components. In this tutorial, we won't be separating our top bar, side nav, or product list into components.

Each component in Angular has a template and a class. The template determines what will be rendered to the screen, and the class determines the data and functionality of the component. You can nest components by referring to another component's selector in the same way that you would use an HTML element. If you have an `app-product-preview` component, you can nest one with `<app-product-preview><app-product-preview>`.


## Live Editing with StackBlitz
To demonstrate the use of Angular, we'll open an empty application using StackBlitz. StackBlitz allows us to get started building an Angular application without needing any local tooling or installs. Once you are comfortable with the basics, we recommend downloading and installing the [Angular CLI](https://cli.angular.io) for local development.

[Get your own environment](https://stackblitz.com/fork/angular)


## Template Syntax
There are 5 things you can do within an Angular template to start to control the rendering of your component. These extend and build on top of HTML.

|Symbol   |Name   |Example   |
|---|---|---|
|{{ }}   |interpolation   |`<p>Welcome to {{storeName}}</p>`   |
|[ ]   |property binding   |`<img [src]="sourceUrl">`   |
|( )   |event binding   |`<button (hover)="doHover()">Buy</button>`   |
|*ngIf   |ngIf   |`<div *ngIf="products.length < 1">No products are currently available</div>`   |
| *ngFor  |ngFor   |`<div *ngFor="let product of products">{{product.name}}</div>`   |

You can see and play with each of these in our [Angular template](https://stackblitz.com/edit/getting-started?file=src%2Fapp%2Fapp.component.ts). The root component of an application is called our App Component, we'll begin working here.

## {{ }} Interpolation

Interpolation lets you render the contents of a property of your component as text in your HTML. 

| Template                           | Data                     | Result              |
|------------------------------------|--------------------------|---------------------|
| `<h1>Welcome to {{siteName}}</h1>` | `siteName = 'My Store';` | Welcome to My Store |


### [ ] Property Binding
Following the mental model of HTML, components have state being given to them. This is accomplished by binding to the property of a component or HTML element.

| Template                           | Data                     | Result              |
|------------------------------------|--------------------------|---------------------|
|`<img [src]="sourceUrl" [title]="imageTitle">`|sourceUrl = 'image.png';|title = 'An example image';|



### ( ) Event Binding
We can listen of standard HTML events, or custom events that we will create later on our components.


| Template                           | Data                     | Result              |
|------------------------------------|--------------------------|---------------------|
|`<button (click)="hello()">Hello</button>`|`hello() {alert('Hello!')}`|Hello|



### *ngIf
*ngIf is known as a structural directive because it changes which HTML or components are rendered to the user at any given moment. Any directive with a * is called a structural directive and will have similar functionality.


| Template                           | Data                     | Result              |
|------------------------------------|--------------------------|---------------------|
|`<p *ngIf="products.length > 0">We still have products available.</p>`|`products = ['Shoes', 'Phones'];`|We still have products available.|


### *ngFor
*ngFor is another structural directive that lets you iterate over a list, rendering the HTML or component once for each item in the list. 


| Template                           | Data                     | Result              |
|------------------------------------|--------------------------|---------------------|
|`<span *ngFor="let product of products">{{product}} </span>`|`products = ['Shoes', 'Phones'];`|Shoes Phones|


### Summary
At this point you should be able to create your first Angular template, try to play around with these techniques to create HTML. You could create an entire application inside of a single component, but we recommend breaking down an application into smaller components that have fewer responsibilities.

The Angular template syntax is very powerful. To learn about more of the things it can do, see the full [Template Syntax documentation](/guide/template-syntax).



### Task
In our template, now create the scaffolding for a shopping cart.

* Create a top bar for your app
* Create a list of product categories as a side nav
* Create a container for our list of products

#### Create a top bar
In Stackblitz in a brand new project, right click on the `app` folder and create a new component. Give this component a name like `top-bar` and then add it to the template of your app component, found in `app.component.html`.

```
<app-top-bar></app-top-bar>
```

You can put any HTML you want for the header of your store in the `top-bar.component.html`.

#### Create a list of product categories as a side nav
Create another new component called `side-nav`. Reference it in your `app.component.html` with `<app-side-nav></app-side-nav>` and then add any HTML you would like for your side nav into `side-nav.component.html`

#### Create a container for our list of products
Create one more component called `product-list`. We can reference it temporarily in our `app.component.html`.



## Component Communication
Just like any element in HTML, Angular components can take state, and can emit events. We achieve these by creating Inputs and Outputs as properties on our component's TypeScript file.

```
@Component({
template: `
  <div>{{name}}</div>
  <button (click)="editName.emit()">Edit</button>`
})
export class EditableNameComponent {
  @Input() name: string;
  @Output() editName = new EventEmitter();
}
```

### @Input()
Inputs define what data can be passed INTO your component. Whenever a parent component's property binding is updated, the property you mark with `@Input` will also be updated as a part of Angular's change detection.

### @Output()
Outputs are used to create custom events in your component. We create a new EventEmitter and store it as an `@Output()` property of our component. This newly created `EventEmitter` has a method `emit` that you can call whenever your custom event has occurred, in response to some action from the template, or based on some asynchronous process.

By property binding and event binding with a nested component we can build elaborate structures of components that take in state, and give back events.



### Task
Use StackBlitz's right click menu to create a new component called `product-preview`. This will generate a `ProductPreviewComponent` which will be used to render a preview of our product on the home page.

In the ProductPreviewComponent's Class file (.ts), add an input for the product name and the product price. Add an Output that will be used whenever the user attempts to purchase the product.

```
  @Input() product;
  @Output() buy = new EventEmitter();
```

You'll need to update the imports at the top of the file to include `Input` and `Output` from `@angular/core`.

```
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
```

In the component's template `product-preview.component.html`, we will render the data we received from our `Input`.

```
<h3>{{product.name}}</h3>
<p>{{product.price}}</p>
<button>Buy</button>
```


Anywhere in our app, we can now test our `app-product-preview`, and provide a list of products, binding their names and prices.

```
<app-product-preview [product]="{product: 'Pixel 2 XL', description: 'A great phone with one of the best cameras'}"></app-product-preview>
```



## Services
Services are an important part of Angular applications. Services in Angular are a shared instance of a class that can be made available to any part of your applicatoin using the [dependency injection system](/guide/dependency-injection).

Services are used to encapsulate data and functionality.

### Creating
To create a service, simply create a class and decorate it with `@Injectable({provideIn: 'root'}`.

```
@Injectable({provideIn: 'root'})
export class MyDataService {
   data = {categories: ['shoes', 'phones']};
}
```

### Providing
Before you can use a service, you must make sure it is provided in your application. 

1st party services can often be provided automatically via the `provideIn` part of the `@Injectable` decorator. 

3rd party services are typically provided by importing a 3rd party Module as part of your NgModule definition. 

For example, to get access to Angular's HttpClient, we must add it to our imports.
import { HttpClientModule } from '@angular/common/http';

```
@NgModule({
  imports: [BrowserModule, HttpClientModule]
…
```

### Accessing
To access a service, you ask for it in a Component, Service, or NgModule constructor by supplying it's type on an argument.

```
import { MyDataService } from './my-data.service';
…
export class MyComponent {
  constructor(private myData: MyDataService) {

  }
}
```

This is called "injecting" a service and adds it to the properties on the class. Anywhere in the class you can now refer to the service directly by the name you gave it.



## Router
Up until now, our application hasn't had any variable state or navigation. We'll now add the Angular router to our project that will allow us to show different components and data to the user based on where we are in the application.

In the loosest form, the router takes the state of the URL bar, and maps it into a set of components to render to the screen. By navigating around our application, the router will swap one component for another.
Setup
To add the router to the application, you'll need to import the RouterModule and supply a configuration.

Next, decide where you want to render the current route by adding a `<router-outlet></router-outlet>`.

### Route Configuration
Most applications will want the following:

A default or catchall route: {path:  '' }
Static routes: {path: 'about', component: AboutComponent}
Variable Routes: Your paths can contain variables by prefixing the variable name with a colon.

e.g. {path: 'products/:productName', component: ProductDetailsComponent}

### Navigation
Navigation can either be done via a routerLink directive in a template, or imperatively via the router. For now we'll do this entirely in our template.

Navigation is always done by string, or by array of url pieces, such as ['path', 'to', variable] which could result in a URL that looks like 'https://example.org/path/to/42'.

### Parameters
In order to see the parameters of a component, you must inject the ActivatedRoute service, and access its params property.

```
route.params.subscribe(params => {
	this.productName = params['productName'];
});
```
### Summary
Once you have setup the router, you can continue to create more components and routes in your RouteConfig.

To learn more about the more advanced features of the router, read the Router Guide.

### Task
* Add the router to your project
* Create a route that shows product list
* Create a component for product details
* Create a route that shows product details

## Finish!
You have the basics of our shopping cart.

Now we can [wire up the Data](/tutorial/getting-started-data) of our application.
