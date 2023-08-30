# The hero editor

The application now has a basic title.
Next, create a new component to display hero information and place that component in the application shell.

<div class="alert is-helpful">

For the sample application that this page describes, see the <live-example></live-example>.

</div>

## Create the heroes component

Use `ng generate` to create a new component named `heroes`.

<code-example format="shell" language="shell">

ng generate component heroes

</code-example>

`ng generate` creates a new directory , `src/app/heroes/`, and generates the three files of the `HeroesComponent` along with a test file.

The `HeroesComponent` class file is as follows:

<code-example header="app/heroes/heroes.component.ts (initial version)" path="toh-pt1/src/app/heroes/heroes.component.ts" region="v1"></code-example>

You always import the `Component` symbol from the Angular core library and annotate the component class with `@Component`.

`@Component` is a decorator function that specifies the Angular metadata for the component.

`ng generate` created three metadata properties:

| Properties    | Details                                             |
| :------------ | :-------------------------------------------------- |
| `selector`    | The component's CSS element selector.               |
| `templateUrl` | The location of the component's template file.      |
| `styleUrls`   | The location of the component's private CSS styles. |

<a id="selector"></a>

The [CSS element selector](https://developer.mozilla.org/docs/Web/CSS/Type_selectors), `'app-heroes'`, matches the name of the HTML element that identifies this component within a parent component's template.

Always `export` the component class so you can `import` it elsewhere &hellip; like in the `AppModule`.

### Add a `hero` property

Add a `hero` property to the `HeroesComponent` for a hero named, `Windstorm`.

<code-example header="heroes.component.ts (hero property)" path="toh-pt1/src/app/heroes/heroes.component.ts" region="add-hero"></code-example>

### Show the hero

Open the `heroes.component.html` template file.
Delete the default text that `ng generate` created and replace it with a data binding to the new `hero` property.

<code-example header="heroes.component.html" path="toh-pt1/src/app/heroes/heroes.component.1.html" region="show-hero-1"></code-example>

## Show the `HeroesComponent` view

To display the `HeroesComponent`, you must add it to the template of the shell `AppComponent`.

Remember that `app-heroes` is the [element selector](#selector) for the `HeroesComponent`.
Add an `<app-heroes>` element to the `AppComponent` template file, just below the title.

<code-example header="src/app/app.component.html" path="toh-pt1/src/app/app.component.html"></code-example>

If `ng serve` is still running,
the browser should refresh and display both the application title and the hero's name.

## Create a `Hero` interface

A real hero is more than a name.

Create a `Hero` interface in its own file in the `src/app` directory .
Give it `id` and `name` properties.

<code-example path="toh-pt1/src/app/hero.ts"  header="src/app/hero.ts"></code-example>

Return to the `HeroesComponent` class and import the `Hero` interface.

Refactor the component's `hero` property to be of type `Hero`.
Initialize it with an `id` of `1` and the name `Windstorm`.

The revised `HeroesComponent` class file should look like this:

<code-example header="src/app/heroes/heroes.component.ts" path="toh-pt1/src/app/heroes/heroes.component.ts" region="hero-property"></code-example>

The page no longer displays properly because you changed the hero from a string to an object.

## Show the hero object

Update the binding in the template to announce the hero's name and show both `id` and `name` in a details display like this:

<code-example header="heroes.component.html (HeroesComponent template)" path="toh-pt1/src/app/heroes/heroes.component.1.html" region="show-hero-2"></code-example>

The browser refreshes and displays the hero's information.

## Format with the `UppercasePipe`

Import `UppercasePipe` from `@angular/common` and add it to the component imports:

<code-example header="src/app/heroes/heroes.component.ts" path="toh-pt1/src/app/heroes/heroes.component.ts" region="uppercasepipe-import"></code-example>

Edit the `hero.name` binding like this:

<code-example header="src/app/heroes/heroes.component.html" path="toh-pt1/src/app/heroes/heroes.component.html" region="pipe"></code-example>

The browser refreshes and now the hero's name is displayed in capital letters.

The word `uppercase` in the interpolation binding after the pipe <code>&verbar;</code> character, activates the built-in `UppercasePipe`.

[Pipes](guide/pipes-overview) are a good way to format strings, currency amounts, dates, and other display data.
Angular ships with several built-in pipes, and you can create your own.

## Edit the hero

Users should be able to edit the hero's name in an `<input>` text box.

The text box should both _display_ the hero's `name` property and _update_ that property as the user types.
That means data flows from the component class _out to the screen_ and from the screen _back to the class_.

To automate that data flow, set up a two-way data binding between the `<input>` form element and the `hero.name` property.

### Two-way binding

Refactor the details area in the `HeroesComponent` template so it looks like this:

<code-example header="src/app/heroes/heroes.component.html (HeroesComponent's template)" path="toh-pt1/src/app/heroes/heroes.component.1.html" region="name-input"></code-example>

`[(ngModel)]` is Angular's two-way data binding syntax.

Here it binds the `hero.name` property to the HTML text box so that data can flow _in both directions_.
Data can flow from the `hero.name` property to the text box and from the text box back to the `hero.name`.

### The missing `FormsModule`

Notice that the application stopped working when you added `[(ngModel)]`.

To see the error, open the browser development tools and look in the console
for a message like

<code-example format="output" hideCopy language="shell">

Template parse errors:
Can't bind to 'ngModel' since it isn't a known property of 'input'.

</code-example>

Although `ngModel` is a valid Angular directive, it isn't available by default.

It belongs to the optional `FormsModule` and you must _opt in_ to using it.

### Import `FormsModule`

Open `app.module.ts` and import the `FormsModule` symbol from the `@angular/forms` library.

<code-example header="src/app/heroes/heroes.component.ts" path="toh-pt1/src/app/heroes/heroes.component.ts" region="formsmodule-import"></code-example>

Add `FormsModule` to the `imports` array in the component that contains all modules that the component needs.

<code-example header="src/app/heroes/heroes.component.ts" path="toh-pt1/src/app/heroes/heroes.component.ts" region="formsmodule-import-array"></code-example>

When the browser refreshes, the application should work again.
You can edit the hero's name and see the changes reflected immediately in the `<h2>` above the text box.

## Final code review

Here are the code files discussed on this page.

<code-tabs>
    <code-pane header="src/app/heroes/heroes.component.ts" path="toh-pt1/src/app/heroes/heroes.component.ts" region="v2"></code-pane>
    <code-pane header="src/app/heroes/heroes.component.html" path="toh-pt1/src/app/heroes/heroes.component.html"></code-pane>
    <code-pane header="src/app/app.component.ts" path="toh-pt1/src/app/app.component.ts"></code-pane>
    <code-pane header="src/app/app.component.html" path="toh-pt1/src/app/app.component.html"></code-pane>
    <code-pane header="src/app/hero.ts" path="toh-pt1/src/app/hero.ts"></code-pane>
</code-tabs>

## Summary

* You used `ng generate` to create a second `HeroesComponent`.
* You displayed the `HeroesComponent` by adding it to the `AppComponent`.
* You imported and applied the `UppercasePipe` to format the name.
* You used two-way data binding with the `ngModel` directive.
* You imported the `FormsModule` so that Angular would recognize and apply the `ngModel` directive.

@reviewed 2023-08-30
