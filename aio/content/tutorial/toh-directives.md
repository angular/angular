# Tour of Heroes: Directives

One key feature of Angular is its support of directives. Directives are classes that add additional behavior to elements in your Angular applications.

## Prerequisites

Before you start this tutorial, you should understand the concepts covered in [Tour of Heroes: Hello Angular](tutorial/toh-hello-angular). Specifically, you'll need a Stackblitz Angular application.

## Objectives

In this tutorial, you'll do the following:

1. Display a list of of items using the `*ngFor` directive.
1. Display a selected hero in your Tour of Heroes application using `*ngIf`.

## Display a list of heroes using `*ngFor`

The `heroes` component of the current Tour of Heroes application has a property, `hero`. This property contains a single object that consists of a hero's ID and name.

<code-example path="toh-pt1/src/app/heroes/heroes.component.ts" header="src/app/heroes/heroes.component.ts" region="hero-interface"></code-example>

The template for this component displays the information about the hero to the user.

<code-example path="toh-pt1/src/app/heroes/heroes.component.1.html" region="show-hero-2" header="heroes.component.html (HeroesComponent's template)"></code-example>

In this section, you'll update this code to display a list of heroes using one of Angular's built-in directives, `*ngFor`.

To display a list of heroes using `*ngFor`:

1. Right-click the `app` folder in your Stackblitz environment and select `Add file`.
1. Name the file `mock-heroes.ts`.
1. Open the file and update its contents as follows:
   <code-example path="toh-pt2/src/app/mock-heroes.ts" header="src/app/mock-heroes.ts"></code-example>
1. Import the new file into the `heroes` component.
   <code-example path="toh-pt2/src/app/heroes/heroes.component.ts" region="import-heroes" header="src/app/heroes/heroes.component.ts (import HEROES)"></code-example>
1. In the `heroes` component file, define a component property called `heroes` to expose the `HEROES` array for binding.
   <code-example path="toh-pt2/src/app/heroes/heroes.component.ts" header="src/app/heroes/heroes.component.ts" region="component"></code-example>
1. Update the template files, `heroes.component.html` to display the information about a hero in an unordered list.
   <code-example path="toh-pt2/src/app/heroes/heroes.component.1.html" region="list" header="heroes.component.html (heroes template)"></code-example>
1. Add an `*ngFor` to the `<li>` element.
  <code-example path="toh-pt2/src/app/heroes/heroes.component.1.html" region="li"></code-example>

The application updates to display a list of heroes to the user.

<div class="alert is-helpful">

You can now delete the existing `hero` property that you created previously.

</div>

The [`*ngFor`](guide/built-in-directives#ngFor) is Angular's _repeater_ directive.
It repeats the host element for each element in a list.

The syntax in this example is as follows:

* `<li>` is the host element.
* `heroes` holds the mock heroes list from the `HeroesComponent` class, the mock heroes list.
* `hero` holds the current hero object for each iteration through the list.

<div class="alert is-important">

Don't forget the asterisk (*) in front of `ngFor`. It's a critical part of the syntax.

</div>

## Display a selected hero using `*ngIf`

Another built-in directive used in many application is `*ngIf`. With `*ngIf`, Angular renders an element in the DOM only when specific conditions are met.

In the following steps, you'll update the Tour of Heroes application to display additional information about a hero when the user selects one from the list. 

To display a selected hero using `*ngIf`:

1. Add a click event binding to the `<li>` element.
   <code-example path="toh-pt2/src/app/heroes/heroes.component.1.html" region="selectedHero-click" header="heroes.component.html (template excerpt)"></code-example>
1. Add the corresponding event handler, `onSelect()`, which assigns the clicked hero from the template to the component's `selectedHero`.
   <code-example path="toh-pt2/src/app/heroes/heroes.component.ts" region="on-select" header="src/app/heroes/heroes.component.ts (onSelect)"></code-example>
1. Update the template for the `heroes` component to include a `Hero Details` section.
   <code-example path="toh-pt2/src/app/heroes/heroes.component.html" region="ng-if" header="src/app/heroes/heroes.component.html (*ngIf)"></code-example>

Notice the `div` element that includes the `*ngIf`. This directive ensures that the application renders the hero details section only after the user selects a hero from the list.
