# Tour of Heroes: Templates

Most Angular applications consist of the following:

* A component that defines a class that contains application data and logic
* A template that defines a view to display in a target environment.

In this tutorial, you'll explore some of the key capabilities of Angular templates.

## Prerequisites

Before you start this tutorial, you should understand the concepts covered in [Tour of Heroes: Hello Angular](tutorial/toh-hello-angular). Specifically, you'll need a Stackblitz Angular application.

## Objectives

In this tutorial, you'll do the following:

1. Display a new application title using [text interpolation](guide/interpolation).
1. Add a logo with [property binding](guide/property-binding).
1. Change the logo size using [attribute binding](guide/attribute-binding).

## Display the application title with text interpolation

In this section, you'll use Angular's [text interpolation](guide/interpolation) to display the application's title.

To update the application title:

1. Open the component class file `app.component.ts`.
1. Set the value of the `title` property to `Tour of Heroes`.

<code-example path="toh-pt0/src/app/app.component.1.ts" header="app.component.ts" region="text-interpolation"></code-example>

The double curly braces are Angular's *interpolation binding* syntax.
This interpolation binding presents the component's `title` property value
inside the HTML header tag.

The browser refreshes and displays the new application title.

{@a app-wide-styles}

## Add a logo with property binding

Next, you'll add the Angular logo to the application title using Angular's [property binding](guide/property-binding) feature.

To add the Angular logo:

1. Open the component class file `app.component.ts`.
1. Add a new property, `logo` and set its value to `https://angular.io/assets/images/logos/angular/angular.svg`.
   <code-example path="toh-pt0/src/app/app.component.1.ts" header="app.component.ts" region="property-binding"></code-example>
1. Open the component template file, `app.component.html`.
1. Update the title as follows.
   <code-example path="toh-pt0/src/app/app.component.1.html" header="app.component.html"></code-example>

The square brackets, `[]`, that surround the `src` property indicates to Angular that this property is a target property. A target property is the DOM property to which you want to assign a value.

For more information on property binding, see [Property binding](guide/property-binding).

## Change the logo size using attribute binding

At present, the logo you added in the previous section is too large. In this section, you'll adjust the size using Angular's [attribute binding](guide/attribute-binding) feature.

To change the logo size:

1. Open the component class file `app.component.ts`.
1. Add a new property, `logoWidth` and set its value to `25%`.
   <code-example path="toh-pt0/src/app/app.component.1.ts" header="app.component.ts" region="attribute-binding"></code-example>
1. Open the component template file, `app.component.html`.
1. Update the title as follows.
   <code-example path="toh-pt0/src/app/app.component.2.html" header="app.component.html"></code-example>

## Display a greeting using event binding

Another important type of binding that Angular supports is [event binding](guide/event-binding). To see event binding in action, add a button to your application that displays a greeting when clicked.

To display a greeting using event binding:

1. Open the component template file, `app.component.html`.
1. Add a `button` element as follows.
   <code-example path="toh-pt0/src/app/app.component.3.html" header="app.component.html" region="event-binding"></code-example>
1. Open the component class file, `app.component.ts`.
1. Add a `showGreeting` method, as follows.
   <code-example path="toh-pt0/src/app/app.component.3.ts" header="app.component.ts" region="event-binding"></code-example>

Your application now has a button labeled `Show Greeting`. When you click on the button, an alert box displays the message: `Hello, Angular developer!`.

## What's next

In this tutorial, you've explored how an Angular template works. You've added features such as interpolation, property binding, attribute binding, and event binding.

To continue the Tour of Heroes tutorial, see [Tour of Heroes: Components](tutorial/toh-components).
