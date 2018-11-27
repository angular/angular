# Display a Heroes List

In this page, you'll expand the Tour of Heroes app to display a list of heroes, and
allow users to select a hero and display the hero's details.


## Create mock heroes

You'll need some heroes to display.

Eventually you'll get them from a remote data server.
For now, you'll create some _mock heroes_ and pretend they came from the server.

Create a file called `mock-heroes.ts` in the `src/app/` folder.
Define a `HEROES` constant as an array of ten heroes and export it.
The file should look like this.

<code-example path="toh-pt2/src/app/mock-heroes.ts" linenums="false"
header="src/app/mock-heroes.ts">
</code-example>

## Displaying heroes

You're about to display the list of heroes at the top of the `HeroesComponent`.

Open the `HeroesComponent` class file and import the mock `HEROES`.

<code-example path="toh-pt2/src/app/heroes/heroes.component.ts" region="import-heroes" header="src/app/heroes/heroes.component.ts (import HEROES)">
</code-example>

In the same file (`HeroesComponent` class), define a component property called `heroes` to expose `HEROES` array for binding.

<code-example path="toh-pt2/src/app/heroes/heroes.component.ts" region="component">
</code-example>

### List heroes with _*ngFor_

Open the `HeroesComponent` template file and make the following changes:

* Add an `<h2>` at the top, 
* Below it add an HTML unordered list (`<ul>`)
* Insert an `<li>` within the `<ul>` that displays properties of a `hero`.
* Sprinkle some CSS classes for styling (you'll add the CSS styles shortly).

Make it look like this:

<code-example path="toh-pt2/src/app/heroes/heroes.component.1.html" region="list" header="heroes.component.html (heroes template)" linenums="false">
</code-example>

Now change the `<li>` to this:

<code-example path="toh-pt2/src/app/heroes/heroes.component.1.html" region="li">
</code-example>

The [`*ngFor`](guide/template-syntax#ngFor) is Angular's _repeater_ directive. 
It repeats the host element for each element in a list.

In this example

* `<li>` is the host element
* `heroes` is the list from the `HeroesComponent` class.
* `hero` holds the current hero object for each iteration through the list. 

<div class="alert is-important">

Don't forget the asterisk (*) in front of `ngFor`. It's a critical part of the syntax.

</div>

After the browser refreshes, the list of heroes appears.

{@a styles}

### Style the heroes

The heroes list should be attractive and should respond visually when users 
hover over and select a hero from the list.

In the [first tutorial](tutorial/toh-pt0#app-wide-styles), you set the basic styles for the entire application in `styles.css`.
That stylesheet didn't include styles for this list of heroes.

You could add more styles to `styles.css` and keep growing that stylesheet as you add components.

You may prefer instead to define private styles for a specific component and keep everything a component needs&mdash; the code, the HTML,
and the CSS &mdash;together in one place.

This approach makes it easier to re-use the component somewhere else
and deliver the component's intended appearance even if the global styles are different.

You define private styles either inline in the `@Component.styles` array or
as stylesheet file(s) identified in the `@Component.styleUrls` array.

When the CLI generated the `HeroesComponent`, it created an empty `heroes.component.css` stylesheet for the `HeroesComponent`
and pointed to it in `@Component.styleUrls` like this.

<code-example path="toh-pt2/src/app/heroes/heroes.component.ts" region="metadata"
 header="src/app/heroes/heroes.component.ts (@Component)">
</code-example>

Open the `heroes.component.css` file and paste in the private CSS styles for the `HeroesComponent`.
You'll find them in the [final code review](#final-code-review) at the bottom of this guide.

<div class="alert is-important">

Styles and stylesheets identified in `@Component` metadata are scoped to that specific component.
The `heroes.component.css` styles apply only to the `HeroesComponent` and don't affect the outer HTML or the HTML in any other component.

</div>

## Master/Detail

When the user clicks a hero in the **master** list, 
the component should display the selected hero's **details** at the bottom of the page.

In this section, you'll listen for the hero item click event
and update the hero detail.

### Add a click event binding

Add a click event binding to the `<li>` like this:

<code-example path="toh-pt2/src/app/heroes/heroes.component.1.html" region="selectedHero-click" header="heroes.component.html (template excerpt)" linenums="false">
</code-example>

This is an example of Angular's [event binding](guide/template-syntax#event-binding) syntax.

The parentheses around `click` tell Angular to listen for the `<li>` element's  `click` event.
When the user clicks in the `<li>`, Angular executes the `onSelect(hero)` expression.

`onSelect()` is a `HeroesComponent` method that you're about to write.
Angular calls it with the `hero` object displayed in the clicked `<li>`,
the same `hero` defined previously in the `*ngFor` expression.

### Add the click event handler

Rename the component's `hero` property to `selectedHero` but don't assign it.
There is no _selected hero_ when the application starts.

Add the following `onSelect()` method, which assigns the clicked hero from the template
to the component's `selectedHero`.

<code-example path="toh-pt2/src/app/heroes/heroes.component.ts" region="on-select" header="src/app/heroes/heroes.component.ts (onSelect)" linenums="false">
</code-example>

### Update the details template

The template still refers to the component's old `hero` property which no longer exists. 
Rename `hero` to `selectedHero`.

<code-example path="toh-pt2/src/app/heroes/heroes.component.html" region="selectedHero-details" header="heroes.component.html (selected hero details)" linenums="false">
</code-example>

### Hide empty details with _*ngIf_

After the browser refreshes, the application is broken.

Open the browser developer tools and look in the console for an error message like this:

<code-example language="sh" class="code-shell">
  HeroesComponent.html:3 ERROR TypeError: Cannot read property 'name' of undefined
</code-example>

Now click one of the list items.
The app seems to be working again.
The heroes appear in a list and details about the clicked hero appear at the bottom of the page.

#### What happened?

When the app starts, the `selectedHero` is `undefined` _by design_.

Binding expressions in the template that refer to properties of `selectedHero` &mdash; expressions like `{{selectedHero.name}}` &mdash; _must fail_ because there is no selected hero.

#### The fix

The component should only display the selected hero details if the `selectedHero` exists.

Wrap the hero detail HTML in a `<div>`.
Add Angular's `*ngIf` directive to the `<div>` and set it to `selectedHero`.

<div class="alert is-important">

Don't forget the asterisk (*) in front of `ngIf`. It's a critical part of the syntax.

</div>

<code-example path="toh-pt2/src/app/heroes/heroes.component.html" region="ng-if" header="src/app/heroes/heroes.component.html (*ngIf)" linenums="false">
</code-example>

After the browser refreshes, the list of names reappears.
The details area is blank.
Click a hero and its details appear.

#### Why it works

When `selectedHero` is undefined, the `ngIf` removes the hero detail from the DOM. There are no `selectedHero` bindings to worry about.

When the user picks a hero, `selectedHero` has a value and
`ngIf` puts the hero detail into the DOM.

### Style the selected hero

It's difficult to identify the _selected hero_ in the list when all `<li>` elements look alike.

If the user clicks "Magneta", that hero should render with a distinctive but subtle background color like this:

<figure>

  <img src='generated/images/guide/toh/heroes-list-selected.png' alt="Selected hero">

</figure>

That _selected hero_ coloring is the work of the `.selected` CSS class in the [styles you added earlier](#styles).
You just have to apply the `.selected` class to the `<li>` when the user clicks it.

The Angular [class binding](guide/template-syntax#class-binding) makes it easy to add and remove a CSS class conditionally. 
Just add `[class.some-css-class]="some-condition"` to the element you want to style.

Add the following `[class.selected]` binding to  the `<li>` in the `HeroesComponent` template:

<code-example path="toh-pt2/src/app/heroes/heroes.component.1.html" region="class-selected" header="heroes.component.html (toggle the 'selected' CSS class)" linenums="false">
</code-example>

When the current row hero is the same as the `selectedHero`, Angular adds the `selected` CSS class. When the two heroes are different, Angular removes the class.

The finished `<li>` looks like this:

<code-example path="toh-pt2/src/app/heroes/heroes.component.html" region="li" header="heroes.component.html (list item hero)" linenums="false">

</code-example>

{@a final-code-review}

## Final code review

Your app should look like this <live-example></live-example>. 

Here are the code files discussed on this page, including the `HeroesComponent` styles.

<code-tabs>
  <code-pane header="src/app/heroes/heroes.component.ts" path="toh-pt2/src/app/heroes/heroes.component.ts">
  </code-pane>

  <code-pane header="src/app/heroes/heroes.component.html" path="toh-pt2/src/app/heroes/heroes.component.html">
  </code-pane>

  <code-pane header="src/app/heroes/heroes.component.css" path="toh-pt2/src/app/heroes/heroes.component.css">
  </code-pane>

</code-tabs>

## Summary

* The Tour of Heroes app displays a list of heroes in a Master/Detail view.
* The user can select a hero and see that hero's details.
* You used `*ngFor` to display a list.
* You used `*ngIf` to conditionally include or exclude a block of HTML.
* You can toggle a CSS style class with a `class` binding.
