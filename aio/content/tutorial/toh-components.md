# Tour of Heroes: Components

Most Angular applications consist of the following:

* A component that defines a class that contains application data and logic
* A template that defines a view to display in a target environment.

In this tutorial, you'll explore some of the key capabilities of Angular components.

## Prerequisites

Before you start this tutorial, you should understand the concepts covered in [Tour of Heroes: Hello Angular](tutorial/toh-hello-angular). Specifically, you'll need a Stackblitz Angular application.

## Objectives

In this tutorial, you'll do the following:

1. Use the Angular CLI to create a new component.
1. Update the application view to display the component.
1. Learn how to pass data between a parent component and a child component using Angular's `@Input` and `@Output` decorators.

## Create a heroes component

The [Angular CLI](cli) is the fastest, straightforward, and recommended way to develop Angular applications. In this section, you'll use the Angular CLI to  generate a new component named `heroes`.

To generate the `heroes` component:

1. In your Stackblitz environment, open a new terminal window. You can open a new terminal window by clicking the plus sign in the upper right corner of the terminal pane.
1. In the new terminal window, run the following Angular CLI command:
   <code-example language="sh">
   ng generate component heroes
   </code-example>

   The CLI creates a new folder, `src/app/heroes/`, and generates
   the following files:

   * heroes.component.ts, the component's TypeScript file.
   * heroes.component.html, the component's HTML template file.
   * heroes.component.css, the component's CSS file.
   * heroes.component.spec.ts, the component's testing file.

Open the component file, `heroes.component.ts`. The contents of this file should resemble the following:

<code-example path="toh-pt1/src/app/heroes/heroes.component.ts" region="v1" header="app/heroes/heroes.component.ts (initial version)"></code-example>

`@Component` is a decorator function that specifies the Angular metadata for the component. This decorator is required, and is imported from the Angular core library. The CLI command, `ng generate component`, generates three of these metadata properties:

1. `selector`&mdash; the component's CSS element selector. In this case, the selector is `app-heroes`. This selector matches the name of the HTML element that identifies this component within a parent component's template.
1. `templateUrl`&mdash; the location of the component's template file. In this tutorial, the file is `heroes.component.html`.
1. `styleUrls`&mdash; the location of the component's private CSS styles. In this tutorial, the file is `heroes.component.css`.

## Update the heroes component

In this section, you'll add some additional functionality to the new `heroes` component. You'll add a new property, `hero` and bind that to the component's template. You'll also update your application to include the `heroes` component as a child component.

To update the `heroes` component

1. Add a `hero` property to the `HeroesComponent` for a hero named "Windstorm."
   <code-example path="toh-pt1/src/app/heroes/heroes.component.ts" region="add-hero" header="heroes.component.ts (hero property)"></code-example>
1. Open the `heroes.component.html` template file and replace its contents with a data binding to the new `hero` property.
   <code-example path="toh-pt1/src/app/heroes/heroes.component.1.html" header="heroes.component.html" region="show-hero-1"></code-example>

## Show the `HeroesComponent` view

At this point, you can now display the heroes component in your application.

To display the component:

1. Open the `app.component.html` file.
1. Add an `<app-heroes>` element to the file, just below the title.

<code-example path="toh-pt1/src/app/app.component.html" header="src/app/app.component.html"></code-example>

Your application should update to display the name of a single hero, `Windstorm`.

<!-- TODO Add Feature Component, Hero Details -->
