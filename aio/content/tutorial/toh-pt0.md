# Tour of Heroes: Components and templates

This tutorial introduces you to Angular components.
Components are the fundamental building blocks of Angular applications.
They display data on the screen, listen for user input, and take action based on that input.

A component consists of three things:

* **A component class** that handles data and functionality.
* **An HTML template** that determines the UI.
* **Component-specific styles** that define the look and feel.

In this part of the tutorial, you'll do the following:

1. Create a new Angular project, using [Stackblitz][stackblitz].
1. Serve the application.
1. Try out [text interpolation][text-interpolation], a basic feature that allows you to incorporate dynamic string values into an Angular template.

<!-- <div class="alert is-helpful">

  For the sample application that this page describes, see the <live-example></live-example>.

</div> -->

## Create the sample project

To create the sample project:

1. Open the <live-example name="toh-pt0" noDownload>starter project</live-example>  in StackBlitz.
1. Log into Stackblitz using your GitHub account.
1. Fork the project.

## Update the application title

In this section, you'll use Angular's [text interpolation][text-interpolation] to update the application title.

To update the application title:

1. Open the component class file `app.component.ts`.
1. Locate the `title` property.
1. Change the value of the `title` property to `Tour of Heroes`.

<code-example path="toh-pt0/src/app/app.component.ts" header="app.component.ts"></code-example>

The double curly braces are Angular's *interpolation binding* syntax.
This interpolation binding presents the component's `title` property value
inside the HTML header tag.

The browser refreshes and displays the new application title.

{@a app-wide-styles}

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