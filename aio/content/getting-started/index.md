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
<live-example name="getting-started-v0" noDownload title="Click here to create your new project in StackBlitz"></live-example>.
-->

<live-example name="getting-started-v0" noDownload>Click here to create a new Getting Started project in StackBlitz.</live-example> 

<a href="https://stackblitz.com/angular/mjovpkpbdlg"><img src='generated/images/guide/getting-started/stackblitz-icon.png' alt="Stackblitz logo"></a>

    <div class="callout is-critical">
    <header>To Do</header>

    The Stackblitz link above assumes getting-started-v0 and has never worked for me. I get a page not found in my local running AIO. For review, use https://stackblitz.com/angular/mjovpkpbdlg. 

    The `live-example` tag does not seem to allow for an image to be inside the element at all, but it would be nice to have both text and a clickable icon to open the example. I faked it here using the review URL in the comment above and regular HTML tagging for clickable image.

    Alternate icon: 
  
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

A component is comprised of three things: 
* A *component class*, which handles data and functionality. In the preview section, you used product list data from the component class. 
* An HTML template, which determines what is presented to the user.  In the previous section, 
* Styles that define the look and feel 

As you saw, an Angular project typically contains one file for each part of the component:
    * `product-list-component.ts` contains the component class definition
    * `product-list-component.html` is the HTML template 
    * `product-list-component.css` contains component-specific styles


    <div class="callout is-critical">
    <header>To Resolve</header>
    In the v1 flow, we began by explaining the structure of an app as a hierarchy of components, and then we looked at a single component. In the context of a single component, we talked about the 3 parts of a component (ts, html, css), and then we looked at the component class definition including the `@Component` decorator and the selector with the component name. These are essential foundation concepts. We lost them in v2, and in the continued move to reduce what we say about components we didn't put them back in the v3 flow. I think they need to come back. 

    Option 1:
    1. Component: parts of a component, look specifically at component class with the `@Component` decorator and the selector with the component name.
    1. Template syntax: HTML focus, changing the view using data defined in that component. 
    1. Component composition: Introduce idea of parent and child components, before input and output. 

    Option 2: 
    1. Template syntax: HTML focus, changing the view using data defined in the related component class. 
    1. Component: parts of a component, look specifically at component class with the `@Component` decorator and the selector with the component name.
    1. Component composition: Introduce idea of parent and child components, before input and output. 

    Because Stephen really wants to do template syntax first, I've tried option 2 here. 
    </div>

{@a component-composition}
## Component composition

An Angular application is composed of a tree of components, in which each Angular component has a specific purpose and responsibility. 

Our starter app has three components: 

<figure>
  <img src='generated/images/guide/getting-started/starter-app-components.png' alt="Online store with three components">
</figure>

* app-root: The application shell. This is first component to load, and the parent of all other components. You can think of it as the base page. 
* app-top-bar: The top bar for our online store, with the store name and checkout button.
* app-product-list: The product list for our online store. You modified this component's template in the previous section. 




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

