# Getting Started with Angular: Your First App

Welcome to Angular! 

Angular makes it easy to build modern applications for the web, mobile, or desktop. 
Angular leverages what you already know to accelerate development in HTML and JavaScript (or TypeScript). 
Angular's extensive [native capabilities](api) and robust [ecosystem](https://angular.io/resources) deliver the productivity and scalable infrastructure that supports Google's largest applications.

In this tutorial, you'll build a simple online store application, with a catalog, shopping cart, and check-out feature. 
You don't need to install anything: you'll build the app using the [StackBlitz](https://stackblitz.com/) online development environment.

<div class="callout is-helpful">
<header>New to web development?</header>

You'll find many resources to compliment the Angular docs. Mozilla's MDN docs include both [HTML](https://developer.mozilla.org/en-US/docs/Learn/HTML) and [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript) introductions. [TypeScript's docs] (https://www.typescriptlang.org/docs/home.html) include a 5-minute tutorial. Various online course platforms, such as Udemy and CodeAcademy, also cover web development basics. 

</div> 


{@a basic-app}
## Create a new project

<!--
<live-example name="getting-started" noDownload title="Click here to create your new project in StackBlitz"></live-example>.
-->

<a href="https://stackblitz.com/angular/mjovpkpbdlg"><img src='generated/images/guide/getting-started/stackblitz-icon.png' alt="Stackblitz logo"></a> <live-example name="getting-started" noDownload>Click here to create a new Getting Started project in StackBlitz.</live-example> 



    <div class="callout is-critical">
    <header>To Do</header>

    The Stackblitz link above assumed getting-started-v0, but I changed it to getting-started without a version. Also, the link has has never worked for me. I get a page not found in my local running AIO. For review, use https://stackblitz.com/angular/mjovpkpbdlg. 

    The `live-example` tag does not seem to allow for an image to be inside the element at all, but it would be nice to have both text and a clickable icon to open the example. I faked it here using the review URL in the comment above and regular HTML tagging for clickable image. 

    Alternate icons: 
  
    <a href="https://stackblitz.com/angular/mjovpkpbdlg"><img src='generated/images/guide/getting-started/stackblitz-angular-icon.png' alt="Stackblitz and Angular project logo"></a>

    </div>

StackBlitz creates a new Angular app. 
We've seeded this particular app with a top bar&mdash;containing the store name and checkout icon&mdash;and the title for a product catalog. 

<!-- 
<img src='generated/images/guide/getting-started/new-project.png' alt="New Angular project in Stackblitz">
-->

<figure>
    <img src='generated/images/guide/getting-started/new-app.png' alt="Starter online store app in Stackblitz">
</figure>

In the next section, you'll modify the app to display a list of products under the "Products" heading. 

<div class="callout is-helpful">
<header>Stackblitz tips</header>

* Log into StackBlitz, so you can save and resume your work. If you have a GitHub account, you can log into StackBlitz with that account. 
* To copy a code example from this tutorial, click the icon at the top right of the code example box, and then paste the code snippet from the clipboard into Stackblitz. 
* If the Stackblitz preview pane isn't showing what you expect, save and then click the refresh button. 

</div>

{@a template-syntax}
## Template syntax

<!-- 
Angular extends HTML with a template syntax that gives components control over the display of content. 
This section introduces five things you can do in an Angular template to affect what your user sees, based on the component's state and behavior: 
-->

Angular extends HTML and JavaScript. 
In this section, you'll learn about Angular's template syntax by enhancing the "Products" section. 

1. In the `product-list` folder, open the template file `product-list-component.html`. 

    Notice that only the "Products" heading is defined. 

1. Modify the app to display a list of product names. 

    The following steps leverage the product data defined in the associated `product-list-component.ts` file. 

    1. To iterate over the predefined list of products, use the `*ngFor` directive. Put the `*ngFor` directive on a `<div>`, as shown below:  

      ```html
      <h2>Products</h2>

      <!-- ngfor -->
      <div *ngFor="let product of products">
      </div>
      ```

      `*ngFor` repeats the host element for each element in a list. 
      In this case, the contents of the `<div>` will be repeated for each product in the list. 

      <div class="alert is-helpful">
      `*ngFor` is a "structural directive". Structural directives shape or reshape the DOM's structure, typically by adding, removing, and manipulating the elements to which they are attached. Any directive with an * is a structural directive.
      </div>

    1. To display the product names, use the interpolation syntax {{ }}. Interpolation renders a property's value as text.  

      Inside the `<div>`, add an `<h3>` heading with the interpolation of the product's name property: 

      ```html
      <h2>Products</h2>

      <!-- ngFor -->
      <div *ngFor="let product of products">

        <h3>
            <!-- interpolation -->
            {{ product.name }}
        </h3>

      </div>
      ```

      The app now displays the name of each product in the list. 

      <figure>
        <img src='generated/images/guide/getting-started/template-syntax-product-names.png' alt="Product names added to list">
      </figure>

1. In the final app, each product name will be a link to product details. Add the anchor now, and set the anchor's title to the product name by using property binding [ ], as shown below: 

    <code-example header="src/app/product-list/product-list.component.html" path="getting-started/src/app/product-list/product-list.component.2.html">
    </code-example>

    Hover over the product name to see the bound property, which also happens to be the name. 
    
    Property binding sets (or binds) a property to the value of a template expression. 
    In this case, it binds the anchor's title property to the component's name property value. 
  
    <div class="alert is-important">
    JAF: Can we display something different from the name? Normally for anchor hover text, I'd use the name of the page to which we are going, such as Product Name Details, but I couldn't figure out how to concatenate with property binding. Maybe use product description? 

    Also: I need to figure out how to take screen cap with hover active.
    </div>

1. Add the product descriptions. On the paragraph tag, use an `*ngIf` directive to show the element only if it has a description.

    <code-example header="src/app/product-list/product-list.component.html" path="getting-started/src/app/product-list/product-list.component.3.html">
    </code-example>

    <div class="alert is-important">
    JAF: This might be more compelling if we 1) had a product without a description, and 2) hid or showed the entire product based on the ngIf. Right now, all products have descriptions, so ngIf is never false. Right now,  if a product doesn't have a description, the name is displayed without a description...with or without using ngIf. It makes no difference at all. 
    Ideas, assuming a new "inStock" property: 
    * If product is in stock, add "in stock" below the description. 
    * If instock, display price. 
    * A product property for "in stock" and only display products that are in stock (via another div). 
    * Only create the anchor if the product is in stock. If not in stock, then no point in going to details. 
    
    </div>

    The app now displays the name and description of each product in the list, as shown here: 

    <figure>
      <img src='generated/images/guide/getting-started/template-syntax-product-description.png' alt="Product descriptions added to list">
    </figure>

1. Add a button so users can share a product with friends. The `ProductListComponent` class (in the same `product-list.component.ts` file as the product data) already defines a `share()` method, which we can bind to the `click` event. Event binding is done by using ( ) around the event. 

    1. Add a button element to the HTML.
    1. Add an event binding for a `click` event to call the `share()` method in the component. 

        <code-example header="src/app/product-list/product-list.component.html" path="getting-started/src/app/product-list/product-list.component.4.html">
        </code-example>

        <figure>
          <img src='generated/images/guide/getting-started/template-syntax-product-share-button.png' alt="Share button added for each product name">
        </figure>

    1. Test the Share button: 

        <figure>
          <img src='generated/images/guide/getting-started/template-syntax-product-share-alert.png' alt="Alert box indicating product has been shared">
        </figure>

The app now has a product list and sharing feature. 
In the process, you've learned to use five common features of Angular's template syntax: 
* `*ngFor`
* `*ngIf`
* Interpolation {{ }}
* Property binding [ ]
* Event binding ( ) 


<div class="alert is-helpful">

To learn about the full capabilities of Angular's template syntax, see the [Template Syntax guide](guide/template-syntax).

</div>


{@a components}
## Components

*Components* are the building blocks of Angular apps. 
You've already been working with the product list component. 

A component is comprised of three things: 
* **A component class,** which handles data and functionality. In the previous section, the product data and the `Share()` method were defined for you in the component class. 
* **An HTML template,** which determines what is presented to the user. In the previous section, you modified the product list's HTML template to display the name, description, and a share button for each product. 
* **Component-specific styles** that define the look and feel. The product list does not define any styles.  

<!-- 
### Class definition

Let's take a quick look a the product list component's class definition: 

1. In the `product-list` directory, open `product-list.component.ts`. 

1. Notice the `@Component` decorator. This provides metadata about the component, including its templates, styles, and a selector. 

    * The `selector` is used to identify the component. The selector is the name you give the Angular component when it is rendered as an HTML element on the page. By convention, Angular component selectors begin with the prefix such as `app-`, followed by the component name. 

    * The template and style filename also are provided here. By convention each of the component's parts is in a separate file, all in the same directory and with the same prefix. 

1. The component definition also includes an exported class, which handles functionality for the component. This is where the product list data and `Share()` method are defined. 

### Composition
-->

An Angular application is composed of a tree of components, in which each Angular component has a specific purpose and responsibility. 

Currently, our app has three components: 

<figure>
  <img src='generated/images/guide/getting-started/starter-app-components.png' alt="Online store with three components">
</figure>

* `app-root` is the application shell. This is first component to load, and the parent of all other components. You can think of it as the base page. 
* `app-top-bar` is the store name and checkout button.
* `app-product-list` is the product list that you modified in the previous section. 

In the next section, you'll expand the app's capabilities by adding new component for a product alert. You'll add it as a child of the product list component. 

    <div class="callout is-critical">
    <header>To Do</header>
    In the v1 flow, we began by explaining the structure of an app as a hierarchy of components, and then we looked at a single component. In the context of a single component, we talked about the 3 parts of a component (ts, html, css), and then we looked at the component class definition including the `@Component` decorator and the selector with the component name. In a desire to simplify and focus on template syntax, these details were largely lost in v2 and weren't in the v3 flow. 
    
    I think they need to come back, so I've tried inserting the definition of components and the composition here. I've deferred @Component and selectors to Input, which is when we create a component. Upside: Small bites without a big conceptual thing about components. Downside: Component essentials are scattered a bit. 

    Alternatives: 

    Option 2:
    1. Component, focusing on a single pre-defined component: 3 parts of a component. Describe @Component and the selector. Look at product-list.component.ts but don't touch.
    1. Template syntax: HTML focus, changing the view using data defined in that component. 
    1. Component composition: Introduce idea of parent and child components
    1. Input and output. 
    
    Option 3:
    1. Template syntax: HTML focus, changing the view using data defined in that component. 
    1. Components and composition:  3 parts of a component. Describe @Component and the selector. Introduce idea of parent and child components. It's all here together. 
    1. Input. 
       
    I like option 2, even though users look (read) a component before they start typing anything. It provides context to what happens in template syntax and keeps the essential aspects of a single component in one place. 

    Terminology challenge: If we don't introduce component before template syntax, we can't define template syntax in terms of what it does for the component. 

    Terminology challenge: We casually use the word "component" to mean the entire component (ts, html, css), the entire .ts file, just the component class inside the ts file. We also use several things to identify the component: an English phrase ("the product list component"), the selector (app-product-list), the class name (ProductListComponent), and the filename prefix (product-list). We need to be more precise. 
    </div>


## Input

<!--
You might have noticed that the `ProductListComponent` class also defined a price property for each product. We're going to use the anchor on each product name to display a new view with additional product details, including the price. We'll create that product details view as a new component. We'll pass the selected product in to the product details component. 
-->

Currently, the product list displays the name and description for each product. 
You might have noticed that product list component also defines a price property for each product. (See the `ProductListComponent` class in `product-list.component.ts`.)

We're going to create a new alert feature. The alert feature will take a product as input. It will then check the product's price, and, if the price is greater than $700, it will display a " Notify Me" button that lets users sign up for notifications when the product goes on sale. 

1. Generate a new product alerts component. 

    1. Right click on the `app` folder and use the `Angular Generator` to generate a new component named `product-alerts`.

        <figure>
          <img src='generated/images/guide/getting-started/generate-component.png' alt="Stackblitz generate component">
        </figure>

        The generator creates starter files for all three parts of the component: 
        * `product-alerts.component.ts`
        * `product-alerts.component.html`
        * `product-alerts.component.css`

    1. Open `product-alerts.component.ts`.

    1. Notice the `@Component` decorator. This indicates that the following class is a component. It provides metadata about the component, including its templates, styles, and a selector. 

        * The `selector` is used to identify the component. The selector is the name you give the Angular component when it is rendered as an HTML element on the page. By convention, Angular component selectors begin with the prefix such as `app-`, followed by the component name. 

        * The template and style filenames. These reference the other two files generated for you. 

    1. The component definition also includes an exported class (`ProductAlertsComponent`), which handles functionality for the component. 

1. To set up the component to accept input, import `Inputs` from `@angular/core`:

    <code-example
      path="getting-started/src/app/product-alerts/product-alerts-component.1.ts"
      region="imports">
    </code-example>

    ```
    import { Component, OnInit } from '@angular/core';
    import { Input } from '@angular/core';
    ```

1. Define a property named `product` with an `@Input` decorator. The `@Input` decorator indicates that the property value will be passed in from the component's parent (in this case, the product list component).

    ```
    export class ProductAlertsComponent {
      @Input() product;
    }
    ```

1. Update the template to define the view for the product alert component. Replace the placeholder paragraph with a "Notify Me" button that appears if the product price is over $700. 

    ```
    <p *ngIf="product.price > 700">
      <button>Notify Me</button>
    </p>
    ```

1. Display the new product alert as part of (a child of) the existing product list. 

    1. Open `product-list.component.html`.

    1. Below the "Share" button, include the new product alert component. 
    
        To include a component, use its selector as you would an element. Pass the current product as input to product-alert. 

        ```
          <button (click)="share()">
            Share
        </button>   

        <app-product-alerts
          [product]="product">
        </app-product-alerts>
        ```


<figure>
  <img src='generated/images/guide/getting-started/product-alert-button.png' alt="Product alert button added to products over $700">
</figure>

The product alert component takes a product as input from the product list. With that input, the product alert component shows or hides the "Notify Me" button. The Phone XL price is over $700, so the "Notify Me" button appears on that product. 


## Output

The "Notify Me" button doesn't do anything yet. In this section, you'll set up the product alert component so that it emits an event up to the product list when the user clicks Notify Me. You'll define the notification behavior in the product list component. 

1. Open `product-list.component.ts`.

1. Import `Output` and `EventEmitter` from `@angular/core`: 

    ```
    import { Component, OnInit } from '@angular/core';
    import { Input } from '@angular/core';
    import { Output, EventEmitter } from '@angular/core';
    ```

1. In the component class, define a property named `notify` with an `@Output` decorator and an instance of event emitter. This makes it possible for the product list component to emit an event when the value of the notify property changes.

    ```
    export class ProductAlertsComponent {
      @Input() product;
      @Output() notify = new EventEmitter();
      
    }
    ```

1. In the product alert template (`product-alert.component.html`), update the "Notify Me" button with an event binding to call the `notify.emit()` method.

    ```
    <p *ngIf="product.price < 700">
      <button (click)="notify.emit()">Notify Me</button>
    </p>
    ```

1. Next, define the behavior that should happen when the button is clicked. In the `product-list.component.ts` file, define an `onNotify()` method, similar to the `Share()` method: 

    ```
      onNotify() {
        window.alert('You will be notified when the product goes on sale');
      }
    ```

1. Finally, update product list component to receive output from the product alerts component. 

    In `product-list.component.html`, bind the `app-product-alerts` component (which is what displays the Notify Me button) to the `onNotify()` method of the product list component. 

      ```
      <button (click)="share()">
          Share
      </button>   

      <app-product-alerts
        [product]="product"
        (notify)="onNotify()">
      </app-product-alerts>
      ```

1. Try out the "Notify Me" Button: 

    <figure>
      <img src='generated/images/guide/getting-started/product-alert-notification.png' alt="Product alert notification confirmation dialog">
    </figure>


## Next steps

Congratulations! You've completed your first Angular app!

You have a product list, with Share and Notify Me buttons. You've learned about the foundation of Angular: components and template syntax. You've learned how the component class and template interact, and how components communicate with each other. 

To continue exploring Angular, we recommend any of the following options:
* [Continue to the next Getting Started lesson: Routing](getting-started/routing)
* [Skip ahead to the Deployment section](getting-started/deployment) to deploy your app to Firebase or move to local development. 

