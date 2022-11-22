# Display a selection list

This tutorial shows you how to:

* Expand the Tour of Heroes application to display a list of heroes.
* Allow users to select a hero and display the hero's details.

<div class="alert is-helpful">

For the sample application that this page describes, see the <live-example></live-example>.

</div>

## Create mock heroes

The first step is to create some heroes to display.

Create a file called `mock-heroes.ts` in the `src/app/` directory.
Define a `HEROES` constant as an array of ten heroes and export it.
The file should look like this.

<code-example header="src/app/mock-heroes.ts" path="toh-pt2/src/app/mock-heroes.ts"></code-example>

## Displaying heroes

Open the `HeroesComponent` class file and import the mock `HEROES`.

<code-example header="src/app/heroes/heroes.component.ts (import HEROES)" path="toh-pt2/src/app/heroes/heroes.component.ts" region="import-heroes"></code-example>

In `HeroesComponent` class, define a component property called `heroes` to expose the `HEROES` array for binding.

<code-example header="src/app/heroes/heroes.component.ts" path="toh-pt2/src/app/heroes/heroes.component.ts" region="component"></code-example>

### List heroes with `*ngFor`

Open the `HeroesComponent` template file and make the following changes:

1.  Add an `<h2>` at the top.
2.  Below the `<h2>`, add a `<ul>` element.
3.  In the `<ul>` element, insert an `<li>`.
4.  Place a `<button>` inside the `<li>` that displays properties of a `hero` inside `<span>` elements.
5.  Add CSS classes to style the component.

to look like this:

<code-example header="heroes.component.html (heroes template)" path="toh-pt2/src/app/heroes/heroes.component.1.html" region="list"></code-example>

That displays an error since the `hero` property doesn't exist.
To have access to each individual hero and list them all, add an `*ngFor` to the `<li>` to iterate through the list of heroes:

<code-example path="toh-pt2/src/app/heroes/heroes.component.1.html" region="li"></code-example>

The [`*ngFor`](guide/built-in-directives#ngFor) is Angular's *repeater* directive.
It repeats the host element for each element in a list.

The syntax in this example is as follows:

| Syntax   | Details |
|:---      |:---     |
| `<li>`   | The host element.                                                                  |
| `heroes` | Holds the mock heroes list from the `HeroesComponent` class, the mock heroes list. |
| `hero`   | Holds the current hero object for each iteration through the list.                 |

<div class="alert is-important">

Don't forget to put the asterisk `*` in front of `ngFor`.
It's a critical part of the syntax.

</div>

After the browser refreshes, the list of heroes appears.

<div class="callout is-helpful">

<header>Interactive elements</header>

Inside the `<li>` element, add a `<button>` element to wrap the hero's details, and then make the hero clickable. To improve accessibility, use HTML elements that are inherently interactive instead of adding an event listener to a non-interactive element. In this case, the interactive `<button>` element is used instead of adding an event to the `<li>` element.

For more details on accessibility, see [Accessibility in Angular](guide/accessibility).

</div>

<a id="styles"></a>

### Style the heroes

The heroes list should be attractive and should respond visually when users
hover over and select a hero from the list.

In the [first tutorial](tutorial/tour-of-heroes/toh-pt0#app-wide-styles), you set the basic styles for the entire application in `styles.css`.
That style sheet didn't include styles for this list of heroes.

You could add more styles to `styles.css` and keep growing that style sheet as you add components.

You may prefer instead to define private styles for a specific component. This keeps everything a component needs, such as the code, the HTML, and the CSS, together in one place.

This approach makes it easier to re-use the component somewhere else and deliver the component's intended appearance even if the global styles are different.

You define private styles either inline in the `@Component.styles` array or as style sheet files identified in the `@Component.styleUrls` array.

When the `ng generate` created the `HeroesComponent`, it created an empty `heroes.component.css` style sheet for the `HeroesComponent` and pointed to it in `@Component.styleUrls` like this.

<code-example header="src/app/heroes/heroes.component.ts (@Component)" path="toh-pt2/src/app/heroes/heroes.component.ts" region="metadata"></code-example>

Open the `heroes.component.css` file and paste in the private CSS styles for the `HeroesComponent` from the [final code review](#final-code-review).

<div class="alert is-important">

Styles and style sheets identified in `@Component` metadata are scoped to that specific component.
The `heroes.component.css` styles apply only to the `HeroesComponent` and don't affect the outer HTML or the HTML in any other component.

</div>

## Viewing details

When the user clicks a hero in the list, the component should display the selected hero's details at the bottom of the page.

The code in this section listens for the hero item click event and display/update the hero details.

### Add a click event binding

Add a click event binding to the `<button>` in the `<li>` like this:

<code-example header="heroes.component.html (template excerpt)" path="toh-pt2/src/app/heroes/heroes.component.1.html" region="selectedHero-click"></code-example>

This is an example of Angular's [event binding](guide/event-binding) syntax.

The parentheses around `click` tell Angular to listen for the `<button>` element's `click` event.
When the user clicks in the `<button>`, Angular executes the `onSelect(hero)` expression.

In the next section, define an `onSelect()` method in `HeroesComponent` to display the hero that was defined in the `*ngFor` expression.

### Add the click event handler

Rename the component's `hero` property to `selectedHero` but don't assign any value to it since there is no *selected hero* when the application starts.

Add the following `onSelect()` method, which assigns the clicked hero from the template to the component's `selectedHero`.

<code-example header="src/app/heroes/heroes.component.ts (onSelect)" path="toh-pt2/src/app/heroes/heroes.component.ts" region="on-select"></code-example>

### Add a details section

Currently, you have a list in the component template.
To show details about a hero when you click their name in the list, add a section
in the template that displays their details.
Add the following to `heroes.component.html` beneath the list section:

<code-example header="heroes.component.html (selected hero details)" path="toh-pt2/src/app/heroes/heroes.component.html" region="selectedHero-details"></code-example>

The hero details should only be displayed when a hero is selected. When a component is created initially, there is no selected hero. Add the `*ngIf` directive to the `<div>` that wraps the hero details. This directive tells Angular to render the section only when the `selectedHero` is defined after it has been selected by clicking on a hero.

<div class="alert is-important">

Don't forget the asterisk `*` character in front of `ngIf`.
It's a critical part of the syntax.

</div>

### Style the selected hero

To help identify the selected hero, you can use the `.selected` CSS class in the [styles you added earlier](#styles).
To apply the `.selected` class to the `<li>` when the user clicks it, use class binding.

<div class="lightbox">

<img alt="Selected hero with dark background and light text that differentiates it from unselected list items" src="generated/images/guide/toh/heroes-list-selected.png">

</div>

Angular's [class binding](guide/class-binding) can add and remove a CSS class conditionally.
Add `[class.some-css-class]="some-condition"` to the element you want to style.

Add the following `[class.selected]` binding to the `<button>` in the `HeroesComponent` template:

<code-example header="heroes.component.html (toggle the 'selected' CSS class)" path="toh-pt2/src/app/heroes/heroes.component.1.html" region="class-selected"></code-example>

When the current row hero is the same as the `selectedHero`, Angular adds the `selected` CSS class.
When the two heroes are different, Angular removes the class.

The finished `<li>` looks like this:

<code-example header="heroes.component.html (list item hero)" path="toh-pt2/src/app/heroes/heroes.component.html" region="li"></code-example>

<a id="final-code-review"></a>

## Final code review

Here are the code files discussed on this page, including the `HeroesComponent` styles.

<code-tabs>
    <code-pane header="src/app/mock-heroes.ts" path="toh-pt2/src/app/mock-heroes.ts"></code-pane>
    <code-pane header="src/app/heroes/heroes.component.ts" path="toh-pt2/src/app/heroes/heroes.component.ts"></code-pane>
    <code-pane header="src/app/heroes/heroes.component.html" path="toh-pt2/src/app/heroes/heroes.component.html"></code-pane>
    <code-pane header="src/app/heroes/heroes.component.css" path="toh-pt2/src/app/heroes/heroes.component.css"></code-pane>
</code-tabs>

## Summary

*   The Tour of Heroes application displays a list of heroes with a detail view.
*   The user can select a hero and see that hero's details.
*   You used `*ngFor` to display a list.
*   You used `*ngIf` to conditionally include or exclude a block of HTML.
*   You can toggle a CSS style class with a `class` binding.

@reviewed 2022-05-23
