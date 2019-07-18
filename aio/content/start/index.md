# Getting Started with Angular: Your First App

Welcome to Angular!

This tutorial introduces you to the essentials of Angular. 
It leverages what you already know about HTML and JavaScript&mdash;plus some useful Angular features&mdash;to build a simple online store application, with a catalog, shopping cart, and check-out form. 
You don't need to install anything: you'll build the app using the [StackBlitz](https://stackblitz.com/ "StackBlitz web site") online development environment.

<div class="alert is-helpful">

We are using the StackBlitz Generator to show you a ready-made, simple application that you can examine and play with interactively. In actual development you will typically use the [Angular CLI](guide/glossary#command-line-interface-cli), a powerful command-line tool that lets you generate and modify applications. For more information, see the [CLI Overview](cli).

</div>

<div class="callout is-helpful">
<header>New to web development?</header>


You'll find many resources to complement the Angular docs. Mozilla's MDN docs include both [HTML](https://developer.mozilla.org/en-US/docs/Learn/HTML "Learning HTML: Guides and tutorials") and [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript "JavaScript") introductions. [TypeScript's docs](https://www.typescriptlang.org/docs/home.html "TypeScript documentation") include a 5-minute tutorial. Various online course platforms, such as [Udemy](http://www.udemy.com "Udemy online courses") and [Codecademy](https://www.codecademy.com/ "Codeacademy online courses"), also cover web development basics. 


</div> 



{@a new-project}
## Create a new project

<h4>
<live-example name="getting-started-v0" noDownload>Click here to create a new project in StackBlitz.</live-example> 
</h4>

StackBlitz creates a starter Angular app. 
We've seeded this particular app with a top bar&mdash;containing the store name and checkout icon&mdash;and the title for a product list. 


<figure>
    <img src="generated/images/guide/start/new-app.png" alt="Starter online store app">
</figure>


<div class="callout is-helpful">
<header>StackBlitz tips</header>

* Log into StackBlitz, so you can save and resume your work. If you have a GitHub account, you can log into StackBlitz with that account. In order to save your progress, first fork the project using the Fork button at the top left, then you'll be able to save your work to your own StackBlitz account by clicking the Save button.
* To copy a code example from this tutorial, click the icon at the top right of the code example box, and then paste the code snippet from the clipboard into StackBlitz. 
* If the StackBlitz preview pane isn't showing what you expect, save and then click the refresh button. 
* StackBlitz is continually improving, so there may be slight differences in generated code, but the app's behavior will be the same.

</div>

{@a template-syntax}
## Template syntax

<!-- 
Angular extends HTML with a template syntax that gives components control over the display of content. 
This section introduces five things you can do in an Angular template to affect what your user sees, based on the component's state and behavior: 
-->

Angular's template syntax extends HTML and JavaScript. 
In this section, you'll learn about template syntax by enhancing the "Products" area. 

(So that you can focus on the template syntax, the following steps use predefined product data and methods from the `product-list.component.ts` file.) 

1. In the `product-list` folder, open the template file `product-list.component.html`. 

1. Modify the product list template to display a list of product names. 

    1. We want each product in the list to be displayed the same way, one after the other on the page. To iterate over the predefined list of products, use the `*ngFor` directive. Put the `*ngFor` directive on a `<div>`, as shown below:  

      <code-example header="src/app/product-list/product-list.component.html" path="getting-started/src/app/product-list/product-list.component.2.html" region="ngfor">
      </code-example>

      `*ngFor` causes the `<div>` to be repeated for each product in the list. 

      <div class="alert is-helpful">

      `*ngFor` is a "structural directive". Structural directives shape or reshape the DOM's structure, typically by adding, removing, and manipulating the elements to which they are attached. Any directive with an `*` is a structural directive.
      
      </div>

    1. To display the names of the products, use the interpolation syntax {{ }}. Interpolation renders a property's value as text. Inside the `<div>`, add an `<h3>` heading to display the interpolation of the product's name property: 

      <code-example path="getting-started/src/app/product-list/product-list.component.2.html" region="interpolation">
      </code-example>

      The preview pane immediately updates to display the name of each product in the list. 

      <figure>
        <img src="generated/images/guide/start/template-syntax-product-names.png" alt="Product names added to list">
      </figure>

1. In the final app, each product name will be a link to product details. Add the anchor now, and set the anchor's title to be the product's name by using the property binding [ ] syntax, as shown below: 

    <code-example path="getting-started/src/app/product-list/product-list.component.2.html">
    </code-example>

    <!-- 
    To do: Description and code don't match exactly. Do we want to just use product name as the anchor hover text to show a simple property or append "details" to show an expression? Also affects screen shot. 
    -->

    In the preview pane, hover over the displayed product name to see the bound name property value. They are the same. Interpolation {{ }} lets you render the property value as text; property binding [ ] lets you use the property value in a template expression. 

    <figure>
      <img src="generated/images/guide/start/template-syntax-product-anchor.png" alt="Product name anchor text is product name property">
    </figure>

  
1. Add the product descriptions. On the paragraph tag, use an `*ngIf` directive so that the paragraph element is only created if the current product has a description.

    <code-example path="getting-started/src/app/product-list/product-list.component.3.html">
    </code-example>

    The app now displays the name and description of each product in the list, as shown below. Notice that the final product does not have a description paragraph at all. Because the product's description property is empty, the paragraph element&mdash;including the word "Description"&mdash;is not created.  

    <figure>
      <img src="generated/images/guide/start/template-syntax-product-description.png" alt="Product descriptions added to list">
    </figure>

1. Add a button so users can share a product with friends. Bind the button's `click` event to the `share()` event that we defined for you (in `product-list.component.ts`). Event binding is done by using ( ) around the event, as shown below: 

    <code-example path="getting-started/src/app/product-list/product-list.component.4.html">
    </code-example>

    Each product now has a "Share" button: 

    <figure>
      <img src="generated/images/guide/start/template-syntax-product-share-button.png" alt="Share button added for each product">
    </figure>

    Test the "Share" button: 

    <figure>
      <img src="generated/images/guide/start/template-syntax-product-share-alert.png" alt="Alert box indicating product has been shared">
    </figure>

The app now has a product list and sharing feature. 
In the process, you've learned to use five common features of Angular's template syntax: 
* `*ngFor`
* `*ngIf`
* Interpolation `{{ }}`
* Property binding `[ ]`
* Event binding `( )`


<div class="alert is-helpful">

Learn more: See the [Template Syntax guide](guide/template-syntax "Template Syntax") for information about the full capabilities of Angular's template syntax.

</div>


{@a components}
## Components

*Components* define areas of responsibility in your UI that let you reuse these sets of UI functionality. 
You've already built one with the product list component. 

A component is comprised of three things: 
* **A component class,** which handles data and functionality. In the previous section, the product data and the `share()` method were defined for you in the component class. 
* **An HTML template,** which determines what is presented to the user. In the previous section, you modified the product list's HTML template to display the name, description, and a "Share" button for each product. 
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
  <img src="generated/images/guide/start/app-components.png" alt="Online store with three components">
</figure>

* `app-root` (orange box) is the application shell. This is the first component to load, and the parent of all other components. You can think of it as the base page. 
* `app-top-bar` (blue background) is the store name and checkout button.
* `app-product-list` (purple box) is the product list that you modified in the previous section. 

In the next section, you'll expand the app's capabilities by adding a new component for a product alert. You'll add it as a child of the product list component. 


<div class="alert is-helpful">

Learn more: See [Introduction to Components](guide/architecture-components "Architecture > Introduction to Components") for more information about components and how they interact with templates.

</div>


{@a input}
## Input

Currently, the product list displays the name and description of each product. 
You might have noticed that the product list component also defines a `products` property that contains imported data for each product. (See the `products` array in `products.ts`.)

We're going to create a new alert feature. The alert feature will take a product as an input. It will then check the product's price, and, if the price is greater than $700, it will display a "Notify Me" button that lets users sign up for notifications when the product goes on sale. 

1. Create a new product alerts component. 

    1. Right click on the `app` folder and use the `Angular Generator` to generate a new component named `product-alerts`.

        <figure>
          <img src="generated/images/guide/start/generate-component.png" alt="StackBlitz command to generate component">
        </figure>

        The generator creates starter files for all three parts of the component: 
        * `product-alerts.component.ts`
        * `product-alerts.component.html`
        * `product-alerts.component.css`

1. Open `product-alerts.component.ts`.

    <code-example header="src/app/product-alerts/product-alerts.component.ts" path="getting-started/src/app/product-alerts/product-alerts.component.1.ts" region="as-generated"></code-example>    

    1. Notice the `@Component` decorator. This indicates that the following class is a component. It provides metadata about the component, including its templates, styles, and a selector. 

        * The `selector` is used to identify the component. The selector is the name you give the Angular component when it is rendered as an HTML element on the page. By convention, Angular component selectors begin with the prefix `app-`, followed by the component name. 

        * The template and style filenames. These reference the other two files generated for you. 

    1. The component definition also includes an exported class (`ProductAlertsComponent`), which handles functionality for the component. 

1. Set up the new product alerts component to receive a product as input:

    1. Import `Input` from `@angular/core`.

        <code-example path="getting-started/src/app/product-alerts/product-alerts.component.1.ts" region="imports"></code-example>

    1. In the `ProductAlertsComponent` class definition, define a property named `product` with an `@Input` decorator. The `@Input` decorator indicates that the property value will be passed in from the component's parent (in this case, the product list component).

        <code-example path="getting-started/src/app/product-alerts/product-alerts.component.1.ts" region="input-decorator"></code-example>

1. Define the view for the new product alert component. 

    Open the `product-alerts.component.html` template and replace the placeholder paragraph with a "Notify Me" button that appears if the product price is over $700. 

    <code-example header="src/app/product-alerts/product-alerts.component.html" path="getting-started/src/app/product-alerts/product-alerts.component.1.html"></code-example>

1. Display the new product alert component as part of (a child of) the product list. 

    1. Open `product-list.component.html`.
    
    1. To include the new component, use its selector (`app-product-alert`) as you would an HTML element. 
    
    1. Pass the current product as input to the component using property binding. 

        <code-example header="src/app/product-list/product-list.component.html" path="getting-started/src/app/product-list/product-list.component.5.html" region="app-product-alerts"></code-example>

The new product alert component takes a product as input from the product list. With that input, it shows or hides the "Notify Me" button, based on the price of the product. The Phone XL price is over $700, so the "Notify Me" button appears on that product. 

<figure>
  <img src="generated/images/guide/start/product-alert-button.png" alt="Product alert button added to products over $700">
</figure>


<div class="alert is-helpful">

Learn more: See [Component Interaction](guide/component-interaction "Components & Templates > Component Interaction") for more information about passing data from a parent to child component, intercepting and acting upon a value from the parent, and detecting and acting on changes to input property values.

</div>


{@a output}
## Output

The "Notify Me" button doesn't do anything yet. In this section, you'll set up the product alert component so that it emits an event up to the product list component when the user clicks "Notify Me". You'll define the notification behavior in the product list component. 

1. Open `product-alerts.component.ts`.

1. Import `Output` and `EventEmitter` from `@angular/core`: 

    <code-example header="src/app/product-alerts/product-alerts.component.ts" path="getting-started/src/app/product-alerts/product-alerts.component.ts" region="imports"></code-example>

1. In the component class, define a property named `notify` with an `@Output` decorator and an instance of event emitter. This makes it possible for the product alert component to emit an event when the value of the notify property changes.

    <code-example path="getting-started/src/app/product-alerts/product-alerts.component.ts" region="input-output"></code-example>

1. In the product alert template (`product-alerts.component.html`), update the "Notify Me" button with an event binding to call the `notify.emit()` method.

    <code-example header="src/app/product-alerts/product-alerts.component.html" path="getting-started/src/app/product-alerts/product-alerts.component.html"></code-example>

1. Next, define the behavior that should happen when the button is clicked. Recall that it's the parent (product list component)&mdash;not the product alerts component&mdash;that's going to take the action. In the `product-list.component.ts` file, define an `onNotify()` method, similar to the `share()` method: 

    <code-example header="src/app/product-list/product-list.component.ts" path="getting-started/src/app/product-list/product-list.component.ts" region="on-notify"></code-example>

1. Finally, update the product list component to receive output from the product alerts component. 

    In `product-list.component.html`, bind the `app-product-alerts` component (which is what displays the "Notify Me" button) to the `onNotify()` method of the product list component. 

    <code-example header="src/app/product-list/product-list.component.html" path="getting-started/src/app/product-list/product-list.component.6.html" region="on-notify"></code-example>

1. Try out the "Notify Me" button: 

    <figure>
      <img src="generated/images/guide/start/product-alert-notification.png" alt="Product alert notification confirmation dialog">
    </figure>


<div class="alert is-helpful">

Learn more: See [Component Interaction](guide/component-interaction "Components & Templates > Component Interaction") for more information about listening for events from child components, reading child properties or invoking child methods, and using a service for bi-directional communication within the family.

</div>


{@a next-steps}
## Next steps

Congratulations! You've completed your first Angular app!

You have a basic online store catalog, with a product list, "Share" button, and "Notify Me" button. 
You've learned about the foundation of Angular: components and template syntax. 
You've also learned how the component class and template interact, and how components communicate with each other. 

To continue exploring Angular, choose either of the following options:
* [Continue to the "Routing" section](start/routing "Getting Started: Routing") to create a product details page that can be accessed by clicking a product name and that has its own URL pattern. 
* [Skip ahead to the "Deployment" section](start/deployment "Getting Started: Deployment") to move to local development, or deploy your app to Firebase or your own server.

