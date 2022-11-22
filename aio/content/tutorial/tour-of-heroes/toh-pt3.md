# Create a feature component

At the moment, the `HeroesComponent` displays both the list of heroes and the selected hero's details.

Keeping all features in one component as the application grows won't be maintainable.
This tutorial splits up large components into smaller subcomponents, each focused on a specific task or workflow.

The first step is to move the hero details into a separate, reusable `HeroDetailComponent` and end up with:

* A `HeroesComponent` that presents the list of heroes.
* A `HeroDetailComponent` that presents the details of a selected hero.

<div class="alert is-helpful">

  For the sample application that this page describes, see the <live-example></live-example>.

</div>

## Make the `HeroDetailComponent`

Use this `ng generate` command to create a new component named `hero-detail`.

<code-example format="shell" language="shell">

ng generate component hero-detail

</code-example>

The command scaffolds the following:

*   Creates a directory `src/app/hero-detail`.

Inside that directory, four files are created:

*   A CSS file for the component styles.
*   An HTML file for the component template.
*   A TypeScript file with a component class named `HeroDetailComponent`.
*   A test file for the `HeroDetailComponent` class.

The command also adds the `HeroDetailComponent` as a declaration in the `@NgModule` decorator of the `src/app/app.module.ts` file.

### Write the template

Cut the HTML for the hero detail from the bottom of the `HeroesComponent` template and paste it over the boilerplate content in the `HeroDetailComponent` template.

The pasted HTML refers to a `selectedHero`.
The new `HeroDetailComponent` can present *any* hero, not just a selected hero.
Replace `selectedHero` with `hero` everywhere in the template.

When you're done, the `HeroDetailComponent` template should look like this:

<code-example header="src/app/hero-detail/hero-detail.component.html" path="toh-pt3/src/app/hero-detail/hero-detail.component.html"></code-example>

### Add the `@Input()` hero property

The `HeroDetailComponent` template binds to the component's `hero` property
which is of type `Hero`.

Open the `HeroDetailComponent` class file and import the `Hero` symbol.

<code-example path="toh-pt3/src/app/hero-detail/hero-detail.component.ts"
region="import-hero" header="src/app/hero-detail/hero-detail.component.ts (import Hero)"></code-example>

The `hero` property
[must be an `Input` property](guide/inputs-outputs "Input and Output properties"),
annotated with the `@Input()` decorator,
because the *external* `HeroesComponent` [binds to it](#heroes-component-template) like this.

<code-example path="toh-pt3/src/app/heroes/heroes.component.html" region="hero-detail-binding"></code-example>

Amend the `@angular/core` import statement to include the `Input` symbol.

<code-example header="src/app/hero-detail/hero-detail.component.ts (import Input)" path="toh-pt3/src/app/hero-detail/hero-detail.component.ts" region="import-input"></code-example>

Add a `hero` property, preceded by the `@Input()` decorator.

<code-example header="src/app/hero-detail/hero-detail.component.ts" path="toh-pt3/src/app/hero-detail/hero-detail.component.ts" region="input-hero"></code-example>

That's the only change you should make to the `HeroDetailComponent` class.
There are no more properties. There's no presentation logic.
This component only receives a hero object through its `hero` property and displays it.

## Show the `HeroDetailComponent`

The `HeroesComponent` used to display the hero details on its own, before you removed that part of the template.
This section guides you through delegating logic to the `HeroDetailComponent`.

The two components have a parent/child relationship.
The parent, `HeroesComponent`, controls the child, `HeroDetailComponent` by
sending it a new hero to display whenever the user selects a hero from the list.

You don't need to change the `HeroesComponent` *class*, instead change its *template*.

<a id="heroes-component-template"></a>

### Update the `HeroesComponent` template

The `HeroDetailComponent` selector is `'app-hero-detail'`.
Add an `<app-hero-detail>` element near the bottom of the `HeroesComponent` template, where the hero detail view used to be.

Bind the `HeroesComponent.selectedHero` to the element's `hero` property like this.

<code-example header="heroes.component.html (HeroDetail binding)" path="toh-pt3/src/app/heroes/heroes.component.html" region="hero-detail-binding"></code-example>

`[hero]="selectedHero"` is an Angular [property binding](guide/property-binding).

It's a *one-way* data binding from
the `selectedHero` property of the `HeroesComponent` to the `hero` property of the target element, which maps to the `hero` property of the `HeroDetailComponent`.

Now when the user clicks a hero in the list, the `selectedHero` changes.
When the `selectedHero` changes, the *property binding* updates `hero` and
the `HeroDetailComponent` displays the new hero.

The revised `HeroesComponent` template should look like this:

<code-example path="toh-pt3/src/app/heroes/heroes.component.html"
  header="heroes.component.html"></code-example>

The browser refreshes and the application starts working again as it did before.

## What changed?

As [before](tutorial/tour-of-heroes/toh-pt2), whenever a user clicks on a hero name,
the hero detail appears below the hero list.
Now the `HeroDetailComponent` is presenting those details instead of the `HeroesComponent`.

Refactoring the original `HeroesComponent` into two components yields benefits, both now and in the future:

1. You reduced the `HeroesComponent` responsibilities.

1. You can evolve the `HeroDetailComponent` into a rich hero editor
without touching the parent `HeroesComponent`.

1. You can evolve the `HeroesComponent` without touching the hero detail view.

1. You can re-use the `HeroDetailComponent` in the template of some future component.

## Final code review

Here are the code files discussed on this page.

<code-tabs>

  <code-pane header="src/app/hero-detail/hero-detail.component.ts" path="toh-pt3/src/app/hero-detail/hero-detail.component.ts"></code-pane>

  <code-pane header="src/app/hero-detail/hero-detail.component.html" path="toh-pt3/src/app/hero-detail/hero-detail.component.html"></code-pane>

  <code-pane header="src/app/heroes/heroes.component.html" path="toh-pt3/src/app/heroes/heroes.component.html"></code-pane>

  <code-pane header="src/app/app.module.ts" path="toh-pt3/src/app/app.module.ts"></code-pane>

</code-tabs>

## Summary

*   You created a separate, reusable `HeroDetailComponent`.

*   You used a [property binding](guide/property-binding) to give the parent `HeroesComponent` control over the child `HeroDetailComponent`.

*   You used the [`@Input` decorator](guide/inputs-outputs)
to make the `hero` property available for binding
by the external `HeroesComponent`.
