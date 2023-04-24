# Getting started with Angular

Welcome to Angular!

This tutorial introduces you to the essentials of Angular by walking you through building an e-commerce site with a catalog, shopping cart, and check-out form.

To help you get started right away, this tutorial uses a ready-made application that you can examine and modify interactively on [StackBlitz](https://stackblitz.com) &mdash;without having to [set up a local work environment](guide/setup-local "Setup guide").
StackBlitz is a browser-based development environment where you can create, save, and share projects using a variety of technologies.

## Prerequisites

To get the most out of this tutorial, you should already have a basic understanding of the following.

*   [HTML](https://developer.mozilla.org/docs/Learn/HTML "Learning HTML: Guides and tutorials")
*   [JavaScript](https://developer.mozilla.org/docs/Web/JavaScript "JavaScript")
*   [TypeScript](https://www.typescriptlang.org/ "The TypeScript language")

<a id="components"></a>

## Take a tour of the example application

You build Angular applications with components.
Components define areas of responsibility in the UI that let you reuse sets of UI functionality.

A component consists of three things:

| Component Part            | Details |
|:---                       |:---     |
| A component class         | Handles data and functionality |
| An HTML template          | Determines the UI              |
| Component-specific styles | Define the look and feel       |

This guide demonstrates building an application with the following components:

| Components             | Details |
|:---                    |:---     |
| `<app-root>`           | The first component to load and the container for the other components |
| `<app-top-bar>`        | The store name and checkout button                                     |
| `<app-product-list>`   | The product list                                                       |
| `<app-product-alerts>` | A component that contains the application's alerts                     |

<div class="lightbox">

<img alt="Online store with three components" src="generated/images/guide/start/app-components.png">

</div>

For more information about components, see [Introduction to Components](guide/architecture-components "Introduction to Components and Templates").

<a id="new-project"></a>

## Create the sample project

To create the sample project, generate the <live-example name="getting-started-v0" noDownload>ready-made sample project in StackBlitz</live-example>.
To save your work:

1.  Log into StackBlitz.
1.  Fork the project you generated.
1.  Save periodically.

<div class="lightbox">

<img alt="Fork the project" src="generated/images/guide/start/fork-the-project.png">

</div>

In StackBlitz, the preview pane on the right shows the starting state of the example application.
The preview features two areas:

*   A top bar with the store name, `My Store`, and a checkout button
*   A header for a product list, `Products`

<div class="lightbox">

<img alt="Starter online store application" src="generated/images/guide/start/new-app-all.gif">

</div>

The project section on the left shows the source files that make up the application, including the infrastructure and configuration files.

When you generate the StackBlitz example applications that accompany the tutorials, StackBlitz creates the starter files and mock data for you.
The files you use throughout the tutorial are in the `src` folder.

For more information on how to use StackBlitz, see the [StackBlitz documentation](https://developer.stackblitz.com/docs/platform).

<a id="product-list"></a>

## Create the product list

In this section, you'll update the application to display a list of products.
You'll use predefined product data from the `products.ts` file and methods from the `product-list.component.ts` file.
This section guides you through editing the HTML, also known as the template.

1.  In the `product-list` folder, open the template file `product-list.component.html`.

1.  Add an `*ngFor` structural directive on a `<div>`, as follows.

    <code-example header="src/app/product-list/product-list.component.html" path="getting-started/src/app/product-list/product-list.component.2.html" region="ngfor"></code-example>

    With `*ngFor`, the `<div>` repeats for each product in the list.

    Structural directives shape or reshape the DOM's structure, by adding, removing, and manipulating elements.
    For more information about structural directives, see [Structural directives](guide/structural-directives).

1.  Inside the `<div>`, add an `<h3>` and `{{ product.name }}`.
    The `{{ product.name }}` statement is an example of Angular's interpolation syntax.
    Interpolation `{{ }}` lets you render the property value as text.

    <code-example header="src/app/product-list/product-list.component.html" path="getting-started/src/app/product-list/product-list.component.2.html" region="interpolation"></code-example>

    The preview pane updates to display the name of each product in the list.

    <div class="lightbox">

    <img alt="Product names added to list" src="generated/images/guide/start/template-syntax-product-names.png">

    </div>

1.  To make each product name a link to product details, add the `<a>` element around `{{ product.name }}`.

1.  Set the title to be the product's name by using the property binding `[ ]` syntax, as follows:

    <code-example header="src/app/product-list/product-list.component.html" path="getting-started/src/app/product-list/product-list.component.2.html"></code-example>

    In the preview pane, hover over a product name to see the bound name property value, which is the product name plus the word "details".
    Property binding `[ ]` lets you use the property value in a template expression.

    <div class="lightbox">

    <img alt="Product name anchor text is product name property" src="generated/images/guide/start/template-syntax-product-anchor.png">

    </div>

1.  Add the product descriptions.
    On a `<p>` element, use an `*ngIf` directive so that Angular only creates the `<p>` element if the current product has a description.

    <code-example header="src/app/product-list/product-list.component.html" path="getting-started/src/app/product-list/product-list.component.3.html"></code-example>

    The application now displays the name and description of each product in the list.
    Notice that the final product does not have a description paragraph.
    Angular doesn't create the `<p>` element because the product's description property is empty.

    <div class="lightbox">

    <img alt="Product descriptions added to list" src="generated/images/guide/start/template-syntax-product-description.png">

    </div>

1.  Add a button so users can share a product.
    Bind the button's `click` event to the `share()` method in `product-list.component.ts`.
    Event binding uses a set of parentheses, `( )`, around the event, as in the `(click)` event on the  `<button>` element.

    <code-example header="src/app/product-list/product-list.component.html" path="getting-started/src/app/product-list/product-list.component.4.html"></code-example>

    Each product now has a **Share** button.

    <div class="lightbox">

    <img alt="Share button added for each product" src="generated/images/guide/start/template-syntax-product-share-button.png">

    </div>

    Clicking the **Share** button triggers an alert that states, "The product has been shared!".

    <div class="lightbox">

    <img alt="Alert box indicating product has been shared" src="generated/images/guide/start/template-syntax-product-share-alert.png">

    </div>

In editing the template, you have explored some of the most popular features of Angular templates.
For more information, see [Introduction to components and templates](guide/architecture-components#template-syntax "Template Syntax").

<a id="passing-data-in"></a>

## Pass data to a child component

Currently, the product list displays the name and description of each product.
The `ProductListComponent` also defines a `products` property that contains imported data for each product from the `products` array in `products.ts`.

The next step is to create a new alert feature that uses product data from the `ProductListComponent`.
The alert checks the product's price, and, if the price is greater than &dollar;700, displays a **Notify Me** button that lets users sign up for notifications when the product goes on sale.

This section walks you through creating a child component, `ProductAlertsComponent`, that can receive data from its parent component, `ProductListComponent`.

1.  Click on the plus sign above the current terminal to create a new terminal to run the command to generate the component.

    <div class="lightbox">

    <img alt="StackBlitz command to generate component" src="generated/images/guide/start/create-new-terminal.png">

    </div>

1.  In the new terminal, generate a new component named `product-alerts` by running the following command:

    <code-example format="shell" language="shell">

    ng generate component product-alerts
  
    </code-example>

    The generator creates starter files for the three parts of the component:

    *   `product-alerts.component.ts`
    *   `product-alerts.component.html`
    *   `product-alerts.component.css`

1.  Open `product-alerts.component.ts`.
    The `@Component()` decorator indicates that the following class is a component.
    `@Component()` also provides metadata about the component, including its selector, templates, and styles.

    <code-example header="src/app/product-alerts/product-alerts.component.ts" path="getting-started/src/app/product-alerts/product-alerts.component.1.ts" region="as-generated"></code-example>

    Key features in the `@Component()` are as follows:

    *   The `selector`, `app-product-alerts`, identifies the component.
        By convention, Angular component selectors begin with the prefix `app-`, followed by the component name.

    *   The template and style filenames reference the component's HTML and CSS
    *   The `@Component()` definition also exports the class, `ProductAlertsComponent`, which handles functionality for the component

1.  To set up `ProductAlertsComponent` to receive product data, first import `Input` from `@angular/core`.

    <code-example header="src/app/product-alerts/product-alerts.component.ts" path="getting-started/src/app/product-alerts/product-alerts.component.1.ts" region="imports"></code-example>

1.  In the `ProductAlertsComponent` class definition, define a property named `product` with an `@Input()` decorator.
    The `@Input()` decorator indicates that the property value passes in from the component's parent, `ProductListComponent`.

    <code-example header="src/app/product-alerts/product-alerts.component.ts" path="getting-started/src/app/product-alerts/product-alerts.component.1.ts" region="input-decorator"></code-example>

1.  Open `product-alerts.component.html` and replace the placeholder paragraph with a **Notify Me** button that appears if the product price is over &dollar;700.

    <code-example header="src/app/product-alerts/product-alerts.component.html" path="getting-started/src/app/product-alerts/product-alerts.component.1.html"></code-example>

1.  The generator automatically added the `ProductAlertsComponent` to the `AppModule` to make it available to other components in the application.

    <code-example header="src/app/app.module.ts" path="getting-started/src/app/app.module.ts" region="declare-product-alerts"></code-example>

1.  Finally, to display `ProductAlertsComponent` as a child of `ProductListComponent`, add the `<app-product-alerts>` element to `product-list.component.html`.
    Pass the current product as input to the component using property binding.

    <code-example header="src/app/product-list/product-list.component.html" path="getting-started/src/app/product-list/product-list.component.5.html" region="app-product-alerts"></code-example>

The new product alert component takes a product as input from the product list.
With that input, it shows or hides the **Notify Me** button, based on the price of the product.
The Phone XL price is over &dollar;700, so the **Notify Me** button appears on that product.

<div class="lightbox">

<img alt="Product alert button added to products over $700" src="generated/images/guide/start/product-alert-button.png">

</div>

<a id="output"></a>

## Pass data to a parent component

To make the **Notify Me** button work, the child component needs to notify and pass the data to the parent component.
The `ProductAlertsComponent` needs to emit an event when the user clicks **Notify Me** and the `ProductListComponent` needs to respond to the event.

<div class="alert is-helpful">

In new components, the Angular Generator includes an empty `constructor()`, the `OnInit` interface, and the `ngOnInit()` method.
Since these steps don't use them, the following code examples omit them for brevity.

</div>

1.  In `product-alerts.component.ts`, import `Output` and `EventEmitter` from `@angular/core`.

    <code-example header="src/app/product-alerts/product-alerts.component.ts" path="getting-started/src/app/product-alerts/product-alerts.component.ts" region="imports"></code-example>

1.  In the component class, define a property named `notify` with an `@Output()` decorator and an instance of `EventEmitter()`.
    Configuring `ProductAlertsComponent` with an `@Output()` allows the `ProductAlertsComponent` to emit an event when the value of the `notify` property changes.

    <code-example header="src/app/product-alerts/product-alerts.component.ts" path="getting-started/src/app/product-alerts/product-alerts.component.ts" region="input-output"></code-example>

1.  In `product-alerts.component.html`, update the **Notify Me** button with an event binding to call the `notify.emit()` method.

    <code-example header="src/app/product-alerts/product-alerts.component.html" path="getting-started/src/app/product-alerts/product-alerts.component.html"></code-example>

1.  Define the behavior that happens when the user clicks the button.
    The parent, `ProductListComponent` &mdash;not the `ProductAlertsComponent`&mdash; acts when the child raises the event.
    In  `product-list.component.ts`, define an `onNotify()` method, similar to the `share()` method.

    <code-example header="src/app/product-list/product-list.component.ts" path="getting-started/src/app/product-list/product-list.component.ts" region="on-notify"></code-example>

1.  Update the `ProductListComponent` to receive data from the `ProductAlertsComponent`.

    In `product-list.component.html`, bind `<app-product-alerts>`  to the `onNotify()` method of the product list component.
    `<app-product-alerts>` is what displays the **Notify Me** button.

    <code-example header="src/app/product-list/product-list.component.html" path="getting-started/src/app/product-list/product-list.component.6.html" region="on-notify"></code-example>

1.  Click the **Notify Me** button to trigger an alert which reads, "You will be notified when the product goes on sale".

    <div class="lightbox">

    <img alt="Product alert notification confirmation dialog" src="generated/images/guide/start/product-alert-notification.png">

    </div>

For more information on communication between components, see [Component Interaction](guide/component-interaction "Component interaction").

<a id="whats-next"></a>

## What's next

In this section, you've created an application that iterates through data and features components that communicate with each other.

To continue exploring Angular and developing this application:

*   Continue to [In-app navigation](start/start-routing "Getting started: In-app navigation") to create a product details page.
*   Skip ahead to [Deployment](start/start-deployment "Getting started: Deployment") to move to local development, or deploy your application to Firebase or your own server.

@reviewed 2022-02-28
