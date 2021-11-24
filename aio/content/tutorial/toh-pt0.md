# Tour of Heroes: Getting started

This tutorial introduces you to the basics of creating an Angular application. You'll create a starter application and test out Angular text interpolation feature.

## Objectives

In this part of the tutorial, you'll do the following:

1. Create a new Angular project, using [Stackblitz][stackblitz].
1. Display the application title using [text interpolation](guide/interpolation).
1. Add a logo with [property binding](guide/property-binding).
1. Change the logo size using [attribute binding](guide/attribute-binding).

<!-- <div class="alert is-helpful">

  For the sample application that this page describes, see the <live-example></live-example>.

</div> -->

## Create the sample project

To create the sample project:

1. Open the <live-example name="toh-pt0" noDownload>starter project</live-example>  in StackBlitz.
1. Log into Stackblitz using your GitHub account.
1. Fork the project.

## Display the application title with text interpolation

In this section, you'll use Angular's [text interpolation](interpolation] to display the application's title.

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

## Add application styles

Define application-wide styles in the `app.component.css` file.
Angular applies these styles across all application components.

To add application styles:

1. Open the `src/styles.css` file.
1. Add the following code to the file.

   <code-example path="toh-pt0/src/styles.1.css" header="src/styles.css (excerpt)">
   </code-example>

## Final code review

Here are the code files discussed on this page.

<code-tabs>

  <code-pane header="src/app/app.component.ts" path="toh-pt0/src/app/app.component.ts">
  </code-pane>

  <code-pane header="src/app/app.component.html" path="toh-pt0/src/app/app.component.html">
  </code-pane>

  <code-pane
    header="src/styles.css (excerpt)"
    path="toh-pt0/src/styles.1.css">
  </code-pane>
</code-tabs>

## Summary

* You created the initial application structure using the Angular CLI.
* You learned that Angular components display data.
* You used the double curly braces of interpolation to display the application title.

[stackblitz]: https://stackblitz.com/
[text-interpolation]: guide/interpolation