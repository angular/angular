# Getting started with a basic Angular app

Welcome to Angular!

This tutorial introduces you to the essentials of Angular by walking you through a simple e-commerce site with a catalog, shopping cart, and check-out form.
To help you get started right away, this guide uses a simple ready-made application that you can examine and modify interactively (without having to [set up a local work environment](guide/setup-local "Setup guide")).

<div class="callout is-helpful">
<header>New to web development?</header>

 There are many resources to complement the Angular docs. Mozilla's MDN docs include both [HTML](https://developer.mozilla.org/en-US/docs/Learn/HTML "Learning HTML: Guides and tutorials") and [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript "JavaScript") introductions. [TypeScript's docs](https://www.typescriptlang.org/docs/home.html "TypeScript documentation") include a 5-minute tutorial. Various online course platforms, such as [Udemy](https://www.udemy.com/ "Udemy online courses") and [Codecademy](https://www.codecademy.com/ "Codecademy online courses"), also cover web development basics.

</div>


{@a new-project}
## Create the sample project

<h4>
<live-example name="getting-started-v0" noDownload>Click here to create the ready-made sample project in StackBlitz.</live-example>
</h4>

<div class="lightbox">
  <img src="generated/images/guide/start/new-app-all.gif" alt="Starter online store app">
</div>

* The preview pane on the right shows the starting state of the sample Angular app.
It defines a frame with a top bar (containing the store name and checkout icon) and the title for a product list (which will be populated and dynamically updated with data from the application).

* The project pane on the left shows the source files that make up the application, including all of the infrastructure and configuration files. The currently selected file shows up in the editor pane in the middle.

Before going into the source structure, the next section shows how to fill out the HTML *template* for the product list, using the provided sample data.
This should give you an idea how easy it is to modify and update the page dynamically.

<div class="callout is-helpful">
<header>StackBlitz tips</header>

* Log into StackBlitz so you can save and resume your work.
If you have a GitHub account, you can log into StackBlitz
with that account. In order to save your progress, first
fork the project using the Fork button at the top left,
then you'll be able to save your work to your own StackBlitz
account by clicking the Save button.
* To copy a code example from this tutorial, click the icon
at the top right of the code example box, and then paste the
code snippet from the clipboard into StackBlitz.
* If the StackBlitz preview pane isn't showing what you
expect, save and then click the refresh button.
* StackBlitz is continually improving, so there may be
slight differences in generated code, but the app's
behavior will be the same.
* When you generate the StackBlitz example apps that
accompany the tutorials, StackBlitz creates the starter
files and mock data for you. The files you'll use throughout
the tutorials are in the `src` folder of the StackBlitz
example apps.

</div>

<div class="alert is-important">

If you go directly to the [StackBlitz online development environment](https://stackblitz.com/) and choose to [start a new Angular workspace](https://stackblitz.com/fork/angular), you get a generic stub application, rather than this [illustrative sample](#new-project). Once you have been introduced to the basic concepts here, this can be helpful for working interactively while you are learning Angular.

In actual development you will typically use the [Angular CLI](guide/glossary#command-line-interface-cli "Definition of CLI"), a powerful command-line tool that lets you generate and modify applications. For a full step-by-step guide that shows how to use the CLI to create a new project and all of its parts, see [Tutorial: Tour of Heroes](tutorial).

</div>


{@a template-syntax}
## Template syntax

Angular's template syntax extends HTML and JavaScript.
This section introduces template syntax by enhancing the "Products" area.

<div class="alert is-helpful">

To help you get going, the following steps use predefined product data from the `products.ts` file (already created in StackBlitz example) and methods from the `product-list.component.ts` file.

</div>

1. In the `product-list` folder, open the template file `product-list.component.html`.

1. Modify the product list template to display a list of product names.

    1. Each product in the list displays the same way, one after another on the page. To iterate over the predefined list of products, put the `*ngFor` directive on a `<div>`, as follows:

      <code-example header="src/app/product-list/product-list.component.html" path="getting-started/src/app/product-list/product-list.component.2.html" region="ngfor">
      </code-example>

      With `*ngFor`, the `<div>` repeats for each product in the list.

      <div class="alert is-helpful">

      `*ngFor` is a "structural directive". Structural directives shape or reshape the DOM's structure, typically by adding, removing, and manipulating the elements to which they are attached. Directives with an asterisk, `*`, are structural directives.

      </div>

    1. To display the names of the products, use the interpolation syntax `{{ }}`. Interpolation renders a property's value as text. Inside the `<div>`, add an `<h3>` to display the interpolation of the product's name property:

      <code-example path="getting-started/src/app/product-list/product-list.component.2.html" header="src/app/product-list/product-list.component.html" region="interpolation">
      </code-example>

      The preview pane immediately updates to display the name of each product in the list.

      <div class="lightbox">
        <img src="generated/images/guide/start/template-syntax-product-names.png" alt="Product names added to list">
      </div>

1. To make each product name a link to product details, add the `<a>` element and set its title to be the product's name by using the property binding `[ ]` syntax, as follows:

    <code-example path="getting-started/src/app/product-list/product-list.component.2.html" header="src/app/product-list/product-list.component.html">
    </code-example>

    In the preview pane, hold the pointer over a product
    name to see the bound name property value, which is
    the product name plus the word "details".
    Interpolation `{{ }}` lets you render the
    property value as text; property binding `[ ]` lets you
    use the property value in a template expression.

    <div class="lightbox">
      <img src="generated/images/guide/start/template-syntax-product-anchor.png" alt="Product name anchor text is product name property">
    </div>


4. Add the product descriptions. On the `<p>` element, use an `*ngIf` directive so that Angular only creates the `<p>` element if the current product has a description.

    <code-example path="getting-started/src/app/product-list/product-list.component.3.html" header="src/app/product-list/product-list.component.html">
    </code-example>

    The app now displays the name and description of each product in the list. Notice that the final product does not have a description paragraph. Because the product's description property is empty, Angular doesn't create the `<p>` element&mdash;including the word "Description".

    <div class="lightbox">
      <img src="generated/images/guide/start/template-syntax-product-description.png" alt="Product descriptions added to list">
    </div>

5. Add a button so users can share a product with friends. Bind the button's `click` event to the `share()` method (in `product-list.component.ts`). Event binding uses a set of parentheses, `( )`, around the event, as in the following `<button>` element:

    <code-example path="getting-started/src/app/product-list/product-list.component.4.html" header="src/app/product-list/product-list.component.html">
    </code-example>

    Each product now has a "Share" button:

    <div class="lightbox">
      <img src="generated/images/guide/start/template-syntax-product-share-button.png" alt="Share button added for each product">
    </div>

    Test the "Share" button:

    <div class="lightbox">
      <img src="generated/images/guide/start/template-syntax-product-share-alert.png" alt="Alert box indicating product has been shared">
    </div>

The app now has a product list and sharing feature.
In the process, you've learned to use five common features of Angular's template syntax:
* `*ngFor`
* `*ngIf`
* Interpolation `{{ }}`
* Property binding `[ ]`
* Event binding `( )`


<div class="alert is-helpful">

For a fuller introduction to Angular's template syntax, see [Introduction to components and templates](guide/architecture-components#template-syntax "Template Syntax").

</div>


{@a components}
## Components

*Components* define areas of responsibility in the user interface, or UI,
that let you reuse sets of UI functionality.
You've already built one with the product list component.

A component consists of three things:
* **A component class** that handles data and functionality. In the previous section, the product data and the `share()` method in the component class handle data and functionality, respectively.
* **An HTML template** that determines the UI. In the previous section, the product list's HTML template displays the name, description, and a "Share" button for each product.
* **Component-specific styles** that define the look and feel.
Though product list does not define any styles, this is where component CSS
resides.

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

An Angular application comprises a tree of components, in which each Angular component has a specific purpose and responsibility.

Currently, the example app has three components:

<div class="lightbox">
  <img src="generated/images/guide/start/app-components.png" alt="Online store with three components">
</div>

* `app-root` (orange box) is the application shell. This is the first component to load and the parent of all other components. You can think of it as the base page.
* `app-top-bar` (blue background) is the store name and checkout button.
* `app-product-list` (purple box) is the product list that you modified in the previous section.

The next section expands the app's capabilities by adding a new component&mdash;a product alert&mdash;as a child of the product list component.


<div class="alert is-helpful">

For more information about components and how they interact with templates, see [Introduction to Components](guide/architecture-components "Concepts > Introduction to Components and Templates").

</div>


{@a input}
## Input

Currently, the product list displays the name and description of each product.
The product list component also defines a `products` property that contains imported data for each product from the `products` array in `products.ts`.

The next step is to create a new alert feature that takes a product as an input. The alert checks the product's price, and, if the price is greater than $700, displays a "Notify Me" button that lets users sign up for notifications when the product goes on sale.

1. Create a new product alerts component.

    1. Right click on the `app` folder and use the `Angular Generator` to generate a new component named `product-alerts`.

        <div class="lightbox">
          <img src="generated/images/guide/start/generate-component.png" alt="StackBlitz command to generate component">
        </div>

        The generator creates starter files for all three parts of the component:
        * `product-alerts.component.ts`
        * `product-alerts.component.html`
        * `product-alerts.component.css`

1. Open `product-alerts.component.ts`.

    <code-example header="src/app/product-alerts/product-alerts.component.ts" path="getting-started/src/app/product-alerts/product-alerts.component.1.ts" region="as-generated"></code-example>

    1. Notice the `@Component()` decorator. This indicates that the following class is a component. It provides metadata about the component, including its selector, templates, and styles.

        * The `selector` identifies the component. The selector is the name you give the Angular component when it is rendered as an HTML element on the page. By convention, Angular component selectors begin with the prefix `app-`, followed by the component name.

        * The template and style filenames reference the HTML and CSS files that StackBlitz generates.

    1. The component definition also exports the class, `ProductAlertsComponent`, which handles functionality for the component.

1. Set up the new product alerts component to receive a product as input:

    1. Import `Input` from `@angular/core`.

        <code-example path="getting-started/src/app/product-alerts/product-alerts.component.1.ts" region="imports" header="src/app/product-alerts/product-alerts.component.ts"></code-example>

    1. In the `ProductAlertsComponent` class definition, define a property named `product` with an `@Input()` decorator. The `@Input()` decorator indicates that the property value passes in from the component's parent, the product list component.

        <code-example path="getting-started/src/app/product-alerts/product-alerts.component.1.ts" region="input-decorator" header="src/app/product-alerts/product-alerts.component.ts"></code-example>

1. Define the view for the new product alert component.

    1. Open the `product-alerts.component.html` template and replace the placeholder paragraph with a "Notify Me" button that appears if the product price is over $700.

    <code-example header="src/app/product-alerts/product-alerts.component.html" path="getting-started/src/app/product-alerts/product-alerts.component.1.html"></code-example>

1. Display the new product alert component as a child of the product list.

    1. Open `product-list.component.html`.

    1. To include the new component, use its selector, `app-product-alerts`, as you would an HTML element.

    1. Pass the current product as input to the component using property binding.

        <code-example header="src/app/product-list/product-list.component.html" path="getting-started/src/app/product-list/product-list.component.5.html" region="app-product-alerts"></code-example>

The new product alert component takes a product as input from the product list. With that input, it shows or hides the "Notify Me" button, based on the price of the product. The Phone XL price is over $700, so the "Notify Me" button appears on that product.

<div class="lightbox">
  <img src="generated/images/guide/start/product-alert-button.png" alt="Product alert button added to products over $700">
</div>

<div class="alert is-helpful">

See [Component Interaction](guide/component-interaction "Components & Templates > Component Interaction") for more information about passing data from a parent to child component, intercepting and acting upon a value from the parent, and detecting and acting on changes to input property values.

</div>


{@a output}
## Output

To make the "Notify Me" button work, you need to configure two things:

  - the product alert component to emit an event when the user clicks "Notify Me"
  - the product list component to act on that event

1. Open `product-alerts.component.ts`.

1. Import `Output` and `EventEmitter` from `@angular/core`:

    <code-example header="src/app/product-alerts/product-alerts.component.ts" path="getting-started/src/app/product-alerts/product-alerts.component.ts" region="imports"></code-example>

1. In the component class, define a property named `notify` with an `@Output()` decorator and an instance of `EventEmitter()`. This allows the product alert component to emit an event when the value of the notify property changes.

<div class="alert is-helpful">

  When the Angular CLI generates a new component, it includes an empty constructor, the `OnInit` interface, and the `ngOnInit()` method.
  Since the following example isn't using them, they are omitted here for brevity.

</div>

    <code-example path="getting-started/src/app/product-alerts/product-alerts.component.ts" header="src/app/product-alerts/product-alerts.component.ts" region="input-output"></code-example>

1. In the product alert template, `product-alerts.component.html`, update the "Notify Me" button with an event binding to call the `notify.emit()` method.

    <code-example header="src/app/product-alerts/product-alerts.component.html" path="getting-started/src/app/product-alerts/product-alerts.component.html"></code-example>

1. Next, define the behavior that should happen when the user clicks the button. Recall that it's the parent, product list component&mdash;not the product alerts component&mdash;that acts when the child raises the event. In  `product-list.component.ts`, define an `onNotify()` method, similar to the `share()` method:

    <code-example header="src/app/product-list/product-list.component.ts" path="getting-started/src/app/product-list/product-list.component.ts" region="on-notify"></code-example>

1. Finally, update the product list component to receive output from the product alerts component.

    In `product-list.component.html`, bind the `app-product-alerts` component (which is what displays the "Notify Me" button) to the `onNotify()` method of the product list component.

    <code-example header="src/app/product-list/product-list.component.html" path="getting-started/src/app/product-list/product-list.component.6.html" region="on-notify"></code-example>

1. Try the "Notify Me" button:

    <div class="lightbox">
      <img src="generated/images/guide/start/product-alert-notification.png" alt="Product alert notification confirmation dialog">
    </div>


<div class="alert is-helpful">

See [Component Interaction](guide/component-interaction "Components & Templates > Component Interaction") for more information about listening for events from child components, reading child properties or invoking child methods, and using a service for bi-directional communication between components.

</div>


{@a next-steps}
## Next steps

Congratulations! You've completed your first Angular app!

You have a basic online store catalog with a product list, "Share" button, and "Notify Me" button.
You've learned about the foundation of Angular: components and template syntax.
You've also learned how the component class and template interact, and how components communicate with each other.

To continue exploring Angular, choose either of the following options:
* [Continue to the "In-app navigation" section](start/start-routing "Try it: In-app navigation") to create a product details page that can be accessed by clicking a product name and that has its own URL pattern.
* [Skip ahead to the "Deployment" section](start/start-deployment "Try it: Deployment") to move to local development, or deploy your app to Firebase or your own server.
