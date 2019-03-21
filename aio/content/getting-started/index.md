# Getting Started with Angular: Your First App

Welcome to Angular! 

Angular makes it easy to build modern applications for the web, mobile, or desktop. 
Angular leverages what you already know to accelerate development in HTML and JavaScript (or TypeScript). 
Angular's extensive [native capabilities](api) and robust [ecosystem](https://angular.io/resources) deliver the productivity and scalable infrastructure that supports Google's largest applications.

<!-- 
Angular's extensive [native capabilities](api) and robust [ecosystem](https://angular.io/resources) enable you to deliver more quickly, with less risk. 

Angular's extensive native capabilities and robust [network of 3rd-party tools and libraries](https://angular.io/resources) enable you to deliver more quickly, with less risk. 

Angular's extensive and robust [ecosystem](https://angular.io/resources) enables you to leverage the power of community to deliver more quickly, with less risk.*

Angular is a platform that makes it easy to build modern applications for the web, mobile, or desktop. 

Angular is a framework for building client applications in HTML and either JavaScript or a language like TypeScript that compiles to JavaScript.

Angular is a platform and framework for building client applications in HTML and TypeScript. 

Angular is written in TypeScript. 
It implements core and optional functionality as a set of TypeScript libraries that you import into your apps.

Angular gives you the tools and the ecosystem to build web applications that scale. 
It provides advanced capabilities for internationalization, mobile apps, server-side rendering, and more, so that you can deliver more quickly, with less risk. 

popular web framework

extensible and robust ecosystem

fast, robust, scalable 

Angular delivers the productivity and scalable infrastructure that supports Google's largest applications. 

From prototype through global deployment, Angular delivers the productivity and scalable infrastructure that supports Google's largest applications.


You write Angular applications by composing HTML templates with Angularized markup, writing component classes to manage those templates, adding application logic in services, and boxing components and services in modules.
--> 

In this tutorial, you'll build a simple online store application, with a catalog, shopping cart, and check-out feature. 
You don't need to install anything: you'll build the app using the [StackBlitz](https://stackblitz.com/) online development environment.

<!-- 
In this tutorial, we'll introduce you to the building blocks of Angular. We'll leverage what you already know about web development, and teach you the essentials of Angular so you can feel confident exploring Angular's extensive native capabilities and [network of 3rd-party tools and libraries](https://angular.io/resources). 
--> 

<!-- 
*JAF: Removed picture of what you'll build.

<figure>
  <img src='generated/images/guide/toh/component-structure.gif' alt="Angular applications are broken down into a tree of components like on express.google.com">
</figure>

*JAF: Removed outline of the parts. Tell about the other parts at the end of part 1* 

*JAF: Removed the prerequisite skills. Mentioned HTML and JavaScript base above*

*JAF: Provide time estimates for each part* 

-->

<div class="callout is-helpful">
<header>New to web development?</header>

You'll find many resources to compliment the Angular docs. Mozilla's MDN docs include both [HTML](https://developer.mozilla.org/en-US/docs/Learn/HTML) and [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript) introductions. [TypeScript's docs] (https://www.typescriptlang.org/docs/home.html) include a 5-minute tutorial. Various online course platforms, such as Udemy and CodeAcademy, also cover web development basics. 

</div> 


{@a basic-app}
## Create a new project


<live-example name="getting-started-v0" noDownload title="Click here to create your new project in StackBlitz"></live-example>.


<!-- [Click here to create a new Angular project in StackBlitz.](https://stackblitz.com/edit/ng-getting-started-ed34c9)

*JAF: What is the right link to use for GDE review? live-example link commented out because it didn't work locally for me. Previous review version had https://stackblitz.com/fork/ng-getting-started*  -->

<!--
JAF: Add StackBlitz icon or Angular icon or some other graphic to launch to Stackblitz? 
-->

StackBlitz creates a new Angular app: 

<img src='generated/images/guide/getting-started/new-project.png' alt="New Angular project in Stackblitz">
<!-- 
JAF: Formal style calls for a figure tag around the image, but the white drop-shadow box looks strange on full screen shots like this one.
-->

Notice that the right pane displays the running app. 
Creating a new Angular app in Stackblitz (or locally using the Angular [CLI](cli)) always gives you a basic starter app that is ready to run. 

We've seeded this particular app with a top bar&mdash;containing the store name and checkout icon&mdash;and the title for a product catalog. 

<!-- 
<div class="alert is-helpful">

Creating a new Angular app in Stackblitz (or locally using the Angular CLI) always gives you a basic starter app that is ready to run. 
For this Getting Started, we have provided 

the Angular Console, Stackblitz, or any other CLI-based tool 

</div>
-->

<div class="callout is-helpful">
<header>Stackblitz tips</header>

* Log into StackBlitz, so you can save and resume your work. If you have a GitHub account, you can log into StackBlitz with that account. 
* To copy a code example from this tutorial, click the icon at the top right of the code example box, and then paste the code snippet from the clipboard into Stackblitz. 
* If the Stackblitz preview pane isn't showing what you expect, save and then click the refresh button. 

<!-- 
JAF: Removed tip about creating a fork, naming forks, reopening forks. Maybe introduce that at the end of Part 1 for users who continue.
-->

</div>

<!-- 
 Stackblitz has accelerators that make it easy to develop an Angular application. The accelerators are similar to what is offered by the [Angular CLI](cli) when you are working locally. 
-->

<!-- 
You develop apps in the context of an Angular workspace. A workspace contains the files for one or more projects. A project is the set of files that comprise an app, a library, or end-to-end (e2e) tests. 
-->


{@a components}
## Components

Let's take a quick look at the structure of our app.

*Components* are the building blocks of Angular apps. 
A component is comprised of three things: 
* A class that handles data and functionality 
* An HTML template, which determines what is presented to the user 
* Styles that define the look and feel 

An Angular application is composed of a tree of components, in which each Angular component has a specific purpose and responsibility. 

Our starter app has three components: 

<figure>
  <img src='generated/images/guide/getting-started/starter-app-components.png' alt="Online store with three components">
</figure>

* app-root: The application shell. This is first component to load, and the parent of all other components. You can think of it as the base page. 
* app-top-bar: The top bar for our online store, with the store name and checkout button.
* app-product-list: The product list for our online store.. 

Right now, the app displays the title "Products", but it does not display the list of products. In the next section, you'll modify the component's HTML template to display the list of products defined in the component class.


{@a template-syntax}
## Template syntax

Angular extends HTML with a template syntax that gives components control over the display of content. 
This section introduces five things you can do in an Angular template to affect what your user sees, based on the component's state and behavior: 

* `*ngFor`
* `*ngIf`
* Interpolation {{ }}
* Property binding [ ]
* Event binding ( ) 

We'll use these to add the product list to the "Products" area of the app. 


1. Open the `product-list` folder. It contains one file for each part of the component: 
    * `product-list-component.ts` contains the component class definition
    * `product-list-component.html` is the HTML template 
    * `product-list-component.css` contains component-specific styles

1. Open the `product-list-component.ts` file. The `ProductListComponent` class defines properties for two products: 

    ```ts
    export class ProductListComponent {
      products = [
        {
          id: 1,
          name: 'Phone XL',
          price: 799,
          description: 'A large phone with one of the best screens'
        },
        {
          id: 2,
          name: 'Phone Mini',
          price: 699,
          description: 'A great phone with one of the best cameras'
        }
      ];
    }
    ```

    We want to display the name and description of these products in our "Products" list. 

1. Open the component's template file `product-list-component.html`. This is the file we'll modify to display the product list.


1. We want the `<div>` element to appear once for each product in the list. To do that, use the `*ngFor` directive inside the `<div>`, as shown below:  

    ```html
    <h2>Products</h2>

    <!-- ngfor -->
    <div *ngFor="let product of products">
    </div>
    ```

    <div class="alert is-helpful">
    `*ngFor` is a "structural directive". Structural directives change which HTML or components are displayed.  Technically, they shape or reshape the DOM's structure, typically by adding, removing, and manipulating the elements to which they are attached. Any directive with an * is a structural directive.
    </div>

1. Inside the anchor, display the product's name by using the interpolation syntax {{ }}. Interpolation renders a property's value as text.  

    ```html
    <h2>Products</h2>

    <!-- ngFor -->
    <div *ngFor="let product of products">

      <h3>
        <a>
          <!-- interpolation -->
          {{ product.name }}
        </a>
      </h3>

    </div>
    ```

    The app now displays the name of each product in the list. 

    <figure>
      <img src='generated/images/guide/getting-started/template-syntax-product-names.png' alt="Product names added to list">
    </figure>

    <!--
    The product name anchors are inactive. Later we'll link the displayed names to product details.
    --> 

    <div class="alert is-helpful">
    Reminder: You might need to save the project and reload the preview pane to see the changes. 
    </div>

1. To create hover text for each anchor, we'll use property binding. Bind the anchor's title attribute to the component's product name property by using the property binding syntax [ ]. 

    <code-example header="src/app/product-list/product-list.component.html" path="getting-started/src/app/product-list/product-list.component.2.html">
    </code-example>

    <!-- 
    JAF: Can we display something different from the name?
    -->

1. Add the product descriptions. On the paragraph tag, use an `*ngIf` directive to show the element if it has a description.

    <code-example header="src/app/product-list/product-list.component.html" path="getting-started/src/app/product-list/product-list.component.3.html">
    </code-example>

    <!-- 
    JAF: This might be more compelling if we had a product without a description. Then we can go add a description later. One idea: add a product property for "in stock" and only display products that are in stock. 
    -->

    The app now displays the name and description of each product in the list, as shown here: 

    <figure>
      <img src='generated/images/guide/getting-started/template-syntax-product-description.png' alt="Product descriptions added to list">
    </figure>

1. Add a button so users can share a product with friends. The `ProductListComponent` class (in the `product-list.component.ts` file) already defines a `share()` method, which we can bind to the `click` event. Event binding is done by using ( ) around the event. 

    1. Add a button element to the HTML.
    1. Add an event binding for a `click` event to call the `share()` method in the component. 

        <code-example header="src/app/product-list/product-list.component.html" path="getting-started/src/app/product-list/product-list.component.4.html">
        </code-example>

        <figure>
          <img src='generated/images/guide/getting-started/template-syntax-product-share-button.png' alt="Share button added for each product name">
        </figure>



<div class="alert is-helpful">

To learn about the full capabilities of Angular's template syntax, see the [Template Syntax guide](guide/template-syntax).

</div>

<!-- 
JAF: I want a break here
-->

## Input

At this point, our app is just a product catalog, displaying a list of products, with names and descriptions. 

You might have noticed that the `ProductListComponent` class also defined a price property for each product. We're going to use the anchor on each product name to display additional product details, which will include the price. We'll create that product details view as a new component. We'll pass the selected product in to the product details component. 

## Output

## Next steps

Congratulations! You've completed your first Angular app!

To continue exploring Angular, we recommend any of the following options:
* Do the add-on Getting Started lessons in order: Routing, Managing Data, Forms, Deployment. The add-on modules extend the online store app to be more robust and scalable, introducing more Angular foundation skills. 
* Skip ahead to the [Deployment](getting-started/deployment) add-on lesson to deploy your app to Firebase or move to local development. 

[Continue to the next Getting Started lesson: Routing.](getting-started/data)

