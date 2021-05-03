# Create a feature component

At the moment, the `HeroesComponent` displays both the list of heroes and the selected hero's details.

Keeping all features in one component as the application grows will not be maintainable.
You'll want to split up large components into smaller sub-components, each focused on a specific task or workflow.

In this page, you'll take the first step in that direction by moving the hero details into a separate, reusable `HeroDetailComponent`.

The `HeroesComponent` will only present the list of heroes.
The `HeroDetailComponent` will present details of a selected hero.

<div class="alert is-helpful">

  For the sample application that this page describes, see the <live-example></live-example>.

</div>

## Make the `HeroDetailComponent`

Use the Angular CLI to generate a new component named `hero-detail`.

<code-example language="sh" class="code-shell">
  ng generate component hero-detail
</code-example>

The command scaffolds the following:

* Creates a directory `src/app/hero-detail`.

Inside that directory four files are generated:

* A CSS file for the component styles.
* An HTML file for the component template.
* A TypeScript file with a component class named `HeroDetailComponent`.
* A test file for the `HeroDetailComponent` class.

The command also adds the `HeroDetailComponent` as a declaration in the `@NgModule` decorator of the `src/app/app.module.ts` file.


### Write the template

Cut the HTML for the hero detail from the bottom of the `HeroesComponent` template and paste it over the generated boilerplate in the `HeroDetailComponent` template.

The pasted HTML refers to a `selectedHero`.
The new `HeroDetailComponent` can present _any_ hero, not just a selected hero.
So replace "selectedHero" with "hero" everywhere in the template.

When you're done, the `HeroDetailComponent` template should look like this:

<code-example path="toh-pt3/src/app/hero-detail/hero-detail.component.html" header="src/app/hero-detail/hero-detail.component.html"></code-example>

### Add the `@Input()` hero property

The `HeroDetailComponent` template binds to the component's `hero` property
which is of type `Hero`.

Open the `HeroDetailComponent` class file and import the `Hero` symbol.

<code-example path="toh-pt3/src/app/hero-detail/hero-detail.component.ts"
region="import-hero" header="src/app/hero-detail/hero-detail.component.ts (import Hero)">
</code-example>

The `hero` property
[must be an _Input_ property](guide/inputs-outputs "Input and Output properties"),
annotated with the `@Input()` decorator,
because the _external_ `HeroesComponent` [will bind to it](#heroes-component-template) like this.

<code-example path="toh-pt3/src/app/heroes/heroes.component.html" region="hero-detail-binding">
</code-example>

Amend the `@angular/core` import statement to include the `Input` symbol.

<code-example path="toh-pt3/src/app/hero-detail/hero-detail.component.ts" region="import-input" header="src/app/hero-detail/hero-detail.component.ts (import Input)"></code-example>

Add a `hero` property, preceded by the `@Input()` decorator.

<code-example path="toh-pt3/src/app/hero-detail/hero-detail.component.ts" header="src/app/hero-detail/hero-detail.component.ts" region="input-hero"></code-example>

That's the only change you should make to the `HeroDetailComponent` class.
There are no more properties. There's no presentation logic.
This component only receives a hero object through its `hero` property and displays it.

## Show the `HeroDetailComponent`

The `HeroesComponent` used to display the hero details on its own, before you removed that portion of the template.
This section guides you through delegating logic to the `HeroDetailComponent`.

The two components will have a parent/child relationship.
The parent `HeroesComponent` will control the child `HeroDetailComponent`
by sending it a new hero to display whenever
the user selects a hero from the list.

You won't change the `HeroesComponent` _class_ but you will change its _template_.

{@a heroes-component-template}

### Update the `HeroesComponent` template

The `HeroDetailComponent` selector is `'app-hero-detail'`.
Add an `<app-hero-detail>` element near the bottom of the `HeroesComponent` template, where the hero detail view used to be.

Bind the `HeroesComponent.selectedHero` to the element's `hero` property like this.

<code-example path="toh-pt3/src/app/heroes/heroes.component.html" region="hero-detail-binding" header="heroes.component.html (HeroDetail binding)">

</code-example>

`[hero]="selectedHero"` is an Angular [property binding](guide/property-binding).

It's a _one way_ data binding from
the `selectedHero` property of the `HeroesComponent` to the `hero` property of the target element, which maps to the `hero` property of the `HeroDetailComponent`.

Now when the user clicks a hero in the list, the `selectedHero` changes.
When the `selectedHero` changes, the _property binding_ updates `hero`
and the `HeroDetailComponent` displays the new hero.

The revised `HeroesComponent` template should look like this:

<code-example path="toh-pt3/src/app/heroes/heroes.component.html"
  header="heroes.component.html"></code-example>

The browser refreshes and the application starts working again as it did before.

## What changed?

As [before](tutorial/toh-pt2), whenever a user clicks on a hero name,
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

  <code-pane header="src/app/hero-detail/hero-detail.component.ts" path="toh-pt3/src/app/hero-detail/hero-detail.component.ts">
  </code-pane>

  <code-pane header="src/app/hero-detail/hero-detail.component.html" path="toh-pt3/src/app/hero-detail/hero-detail.component.html">
  </code-pane>

  <code-pane header="src/app/heroes/heroes.component.html" path="toh-pt3/src/app/heroes/heroes.component.html">
  </code-pane>

  <code-pane header="src/app/app.module.ts" path="toh-pt3/src/app/app.module.ts">
  </code-pane>

</code-tabs>

## Summary

* You created a separate, reusable `HeroDetailComponent`.


* You used a [property binding](guide/property-binding) to give the parent `HeroesComponent` control over the child `HeroDetailComponent`.


* You used the [`@Input` decorator](guide/inputs-outputs)
to make the `hero` property available for binding
by the external `HeroesComponent`.
