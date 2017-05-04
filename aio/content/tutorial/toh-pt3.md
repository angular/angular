@title
Multiple Components

@intro
Refactor the master/detail view into separate components.

@description


The `AppComponent` is doing _everything_ at the moment.
In the beginning, it showed details of a single hero.
Then it became a master/detail form with both a list of heroes and the hero detail.
Soon there will be new requirements and capabilities.
You can't keep piling features on top of features in one component; that's not maintainable.

You'll need to break it up into sub-components, each focused on a specific task or workflow.
Eventually, the `AppComponent` could become a simple shell that hosts those sub-components.

In this page, you'll take the first step in that direction by carving out the hero details into a separate, reusable component.
When you're done, the app should look like this <live-example></live-example>.



## Where you left off
Before getting started on this page, verify that you have the following structure from earlier in the Tour of Heroes.
If not, go back to the previous pages.


<div class='filetree'>

  <div class='file'>
    angular-tour-of-heroes
  </div>

  <div class='children'>

    <div class='file'>
      src
    </div>

    <div class='children'>

      <div class='file'>
        app
      </div>

      <div class='children'>

        <div class='file'>
          app.component.ts
        </div>

        <div class='file'>
          app.module.ts
        </div>

      </div>

      <div class='file'>
        main.ts
      </div>

      <div class='file'>
        index.html
      </div>

      <div class='file'>
        styles.css
      </div>

      <div class='file'>
        systemjs.config.js
      </div>

      <div class='file'>
        tsconfig.json
      </div>

    </div>

    <div class='file'>
      node_modules ...
    </div>

    <div class='file'>
      package.json
    </div>

  </div>

</div>



Keep the app transpiling and running while you build the Tour of Heroes
by entering the `npm start` command in a terminal window
[as you did before](tutorial/toh-pt1#keep-transpiling "Keep the app running").

## Make a hero detail component
Add a file named `hero-detail.component.ts` to the `app/` folder.
This file will hold the new `HeroDetailComponent`.

The file and component names follow the standard described in the Angular
[style guide](guide/styleguide#naming).

* The component _class_ name should be written in _upper camel case_ and end in the word "Component".
The hero detail component class is `HeroDetailComponent`.

* The component _file_ name should be spelled in [_lower dash case_](guide/glossary#dash-case),
each word separated by dashes, and end in `.component.ts`.
The `HeroDetailComponent` class goes in the `hero-detail.component.ts` file.

Start writing the `HeroDetailComponent` as follows:


<code-example path="toh-pt3/app/hero-detail.component.1.ts" region="v1" title="app/hero-detail.component.ts (initial version)" linenums="false">

</code-example>



{@a selector}


To define a component, you always import the `Component` symbol.

The `@Component` decorator provides the Angular metadata for the component.
The CSS selector name, `hero-detail`, will match the element tag
that identifies this component within a parent component's template.
[Near the end of this tutorial page](tutorial/toh-pt3#add-hero-detail "Add the HeroDetailComponent to the AppComponent"),
you'll add a `<hero-detail>` element to the `AppComponent` template.

Always `export` the component class because you'll always `import` it elsewhere.

### Hero detail template
To move the hero detail view to the `HeroDetailComponent`,
cut the hero detail _content_ from the bottom of the `AppComponent` template
and paste it into a new `template` property in the `@Component` metadata.

The `HeroDetailComponent` has a _hero_, not a _selected hero_.
Replace the word, "selectedHero", with the word, "hero", everywhere in the template.
When you're done, the new template should look like this:


<code-example path="toh-pt3/src/app/hero-detail.component.ts" region="template" title="src/app/hero-detail.component.ts (template)" linenums="false">

</code-example>



### Add the *hero* property

The `HeroDetailComponent` template binds to the component's `hero` property.
Add that property to the `HeroDetailComponent` class like this:

<code-example path="toh-pt3/app/hero-detail.component.1.ts" region="hero" title="src/app/hero-detail.component.ts (hero property)">

</code-example>



The `hero` property is typed as an instance of `Hero`.
The `Hero` class is still in the `app.component.ts` file.
Now there are two components that need to reference the `Hero` class.
The Angular [style guide](guide/styleguide#rule-of-one "Style guide: rule of one") recommends one class per file anyway.

Move the `Hero` class from `app.component.ts` to its own `hero.ts` file.


<code-example path="toh-pt3/src/app/hero.ts" title="src/app/hero.ts" linenums="false">

</code-example>



Now that the `Hero` class is in its own file, the `AppComponent` and the `HeroDetailComponent` have to import it.
Add the following `import` statement near the top of _both_ the `app.component.ts` and the `hero-detail.component.ts` files.

<code-example path="toh-pt3/app/hero-detail.component.1.ts" region="hero-import" title="src/app/hero-detail.component.ts">

</code-example>



### The *hero* property is an *input* property

[Later in this page](tutorial/toh-pt3#add-hero-detail "Add the HeroDetailComponent to the AppComponent"),
the parent `AppComponent` will tell the child `HeroDetailComponent` which hero to display
by binding its `selectedHero` to the `hero` property of the `HeroDetailComponent`.
The binding will look like this:

<code-example path="toh-pt3/app/app.component.1.html" region="hero-detail-binding" title="src/app/app.component.html" linenums="false">

</code-example>



Putting square brackets around the `hero` property, to the left of the equal sign (=),
makes it the *target* of a property binding expression.
You must declare a *target* binding property to be an *input* property.
Otherwise, Angular rejects the binding and throws an error.

First, amend the `@angular/core` import statement to include the `Input` symbol.

<code-example path="toh-pt3/src/app/hero-detail.component.ts" region="import-input" title="src/app/hero-detail.component.ts (excerpt)" linenums="false">

</code-example>



Then declare that `hero` is an *input* property by
preceding it with the `@Input` decorator that you imported earlier.

<code-example path="toh-pt3/src/app/hero-detail.component.ts" region="hero" title="src/app/hero-detail.component.ts (excerpt)" linenums="false">

</code-example>



<div class="l-sub-section">



Read more about _input_ properties in the
[Attribute Directives](guide/attribute-directives#why-input) page.


</div>



That's it. The `hero` property is the only thing in the `HeroDetailComponent` class.

<code-example path="toh-pt3/src/app/hero-detail.component.ts" region="class" title="src/src/app/hero-detail.component.ts" linenums="false">

</code-example>



All it does is receive a hero object through its `hero` input property and then bind to that property with its template.

Here's the complete `HeroDetailComponent`.

<code-example path="toh-pt3/src/app/hero-detail.component.ts" title="src/app/hero-detail.component.ts">

</code-example>




## Declare _HeroDetailComponent_ in the _AppModule_
Every component must be declared in one&mdash;and only one&mdash;Angular module.

Open `app.module.ts` in your editor and import the `HeroDetailComponent` so you can refer to it.

<code-example path="toh-pt3/src/app/app.module.ts" region="hero-detail-import" title="src/app/app.module.ts">

</code-example>



Add `HeroDetailComponent` to the module's `declarations` array.


<code-example path="toh-pt3/src/app/app.module.ts" region="declarations" title="src/app/app.module.ts" linenums="false">

</code-example>



In general, the `declarations` array contains a list of application components, pipes, and directives that belong to the module.
A component must be declared in a module before other components can reference it.
This module declares only the two application components, `AppComponent` and `HeroDetailComponent`.

<div class="l-sub-section">



Read more about Angular modules in the [NgModules](guide/ngmodule "Angular Modules") guide.


</div>



{@a add-hero-detail}



## Add the _HeroDetailComponent_ to the _AppComponent_

The `AppComponent` is still a master/detail view.
It used to display the hero details on its own, before you cut out that portion of the template.
Now it will delegate to the `HeroDetailComponent`.


Recall that `hero-detail` is the CSS [`selector`](tutorial/toh-pt3#selector "HeroDetailComponent selector")
in the `HeroDetailComponent` metadata.
That's the tag name of the element that represents the `HeroDetailComponent`.

Add a `<hero-detail>` element near the bottom of the `AppComponent` template,
where the hero detail view used to be.

Coordinate the master `AppComponent` with the `HeroDetailComponent`
by binding the `selectedHero` property of the `AppComponent`
to the `hero` property of the `HeroDetailComponent`.

<code-example path="toh-pt3/app/app.component.1.html" region="hero-detail-binding" title="app.component.ts (excerpt)" linenums="false">

</code-example>



Now every time the `selectedHero` changes, the `HeroDetailComponent` gets a new hero to display.

The revised `AppComponent` template should look like this:


<code-example path="toh-pt3/src/app/app.component.ts" region="hero-detail-template" title="app.component.ts (excerpt)" linenums="false">

</code-example>




## What changed?
As [before](tutorial/toh-pt2), whenever a user clicks on a hero name,
the hero detail appears below the hero list.
But now the `HeroDetailView` is presenting those details.

Refactoring the original `AppComponent` into two components yields benefits, both now and in the future:

1. You simplified the `AppComponent` by reducing its responsibilities.

1. You can evolve the `HeroDetailComponent` into a rich hero editor
without touching the parent `AppComponent`.

1. You can evolve the `AppComponent` without touching the hero detail view.

1. You can re-use the `HeroDetailComponent` in the template of some future parent component.

### Review the app structure
Verify that you have the following structure:


<div class='filetree'>

  <div class='file'>
    angular-tour-of-heroes
  </div>

  <div class='children'>

    <div class='file'>
      src
    </div>

    <div class='children'>

      <div class='file'>
        app
      </div>

      <div class='children'>

        <div class='file'>
          app.component.ts
        </div>

        <div class='file'>
          app.module.ts
        </div>

        <div class='file'>
          hero.ts
        </div>

        <div class='file'>
          hero-detail.component.ts
        </div>

      </div>

      <div class='file'>
        main.ts
      </div>

      <div class='file'>
        index.html
      </div>

      <div class='file'>
        styles.css
      </div>

      <div class='file'>
        systemjs.config.js
      </div>

      <div class='file'>
        tsconfig.json
      </div>

    </div>

    <div class='file'>
      node_modules ...
    </div>

    <div class='file'>
      package.json
    </div>

  </div>

</div>



Here are the code files discussed in this page.


<code-tabs>

  <code-pane title="src/app/hero-detail.component.ts" path="toh-pt3/src/app/hero-detail.component.ts">

  </code-pane>

  <code-pane title="src/app/app.component.ts" path="toh-pt3/src/app/app.component.ts">

  </code-pane>

  <code-pane title="src/app/hero.ts" path="toh-pt3/src/app/hero.ts">

  </code-pane>

  <code-pane title="src/app/app.module.ts" path="toh-pt3/src/app/app.module.ts">

  </code-pane>

</code-tabs>




## The road you’ve travelled

Here's what you achieved in this page:

* You created a reusable component.
* You learned how to make a component accept input.
* You learned to declare the required application directives in an Angular module. You
listed the directives in the `NgModule` decorator's `declarations` array.
* You learned to bind a parent component to a child component.

Your app should look like this <live-example></live-example>.



## The road ahead
The Tour of Heroes app is more reusable with shared components,
but its (mock) data is still hard coded within the `AppComponent`.
That's not sustainable.
Data access should be refactored to a separate service
and shared among the components that need data.

You’ll learn to create services in the [next tutorial](tutorial/toh-pt4 "Services") page.
