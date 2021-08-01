# Component styles

Angular applications are styled with standard CSS. That means you can apply
everything you know about CSS stylesheets, selectors, rules, and media queries
directly to Angular applications.

Additionally, Angular can bundle *component styles*
with components, enabling a more modular design than regular stylesheets.

This page describes how to load and apply these component styles.

You can run the <live-example></live-example> in Stackblitz and download the code from there.

## Using component styles

For every Angular component you write, you may define not only an HTML template,
but also the CSS styles that go with that template,
specifying any selectors, rules, and media queries that you need.

One way to do this is to set the `styles` property in the component metadata.
The `styles` property takes an array of strings that contain CSS code.
Usually you give it one string, as in the following example:

<code-example path="component-styles/src/app/hero-app.component.ts" header="src/app/hero-app.component.ts"></code-example>

## Style scope

<div class="alert is-critical">

The styles specified in `@Component` metadata _apply only within the template of that component_.

</div>

They are _not inherited_ by any components nested within the template nor by any content projected into the component.

In this example, the `h1` style applies only to the `HeroAppComponent`,
not to the nested `HeroMainComponent` nor to `<h1>` tags anywhere else in the application.

This scoping restriction is a ***styling modularity feature***.

* You can use the CSS class names and selectors that make the most sense in the context of each component.


* Class names and selectors are local to the component and don't collide with
  classes and selectors used elsewhere in the application.


* Changes to styles elsewhere in the application don't affect the component's styles.


* You can co-locate the CSS code of each component with the TypeScript and HTML code of the component,
  which leads to a neat and tidy project structure.


* You can change or remove component CSS code without searching through the
  whole application to find where else the code is used.

{@a special-selectors}

## Special selectors

Component styles have a few special *selectors* from the world of shadow DOM style scoping
(described in the [CSS Scoping Module Level 1](https://www.w3.org/TR/css-scoping-1) page on the
[W3C](https://www.w3.org) site).
The following sections describe these selectors.

### :host

Use the `:host` pseudo-class selector to target styles in the element that *hosts* the component (as opposed to
targeting elements *inside* the component's template).


<code-example path="component-styles/src/app/hero-details.component.css" region="host" header="src/app/hero-details.component.css"></code-example>

The `:host` selector is the only way to target the host element. You can't reach
the host element from inside the component with other selectors because it's not part of the
component's own template. The host element is in a parent component's template.

Use the *function form* to apply host styles conditionally by
including another selector inside parentheses after `:host`.

The next example targets the host element again, but only when it also has the `active` CSS class.

<code-example path="component-styles/src/app/hero-details.component.css" region="hostfunction" header="src/app/hero-details.component.css"></code-example>

The `:host` selector can also be combined with other selectors.
Add selectors behind the `:host` to select child elements, for example using `:host h2` to target all `<h2>` elements inside a component's view.

<div class="alert is-helpful">

You should not add selectors (other than `:host-context`) in front of the `:host` selector to style a component based on the outer context of the component's view. Such selectors are not scoped to a component's view and will select the outer context, but it's not native behavior. Use `:host-context` selector for that purpose instead.

</div>

### :host-context

Sometimes it's useful to apply styles based on some condition *outside* of a component's view.
For example, a CSS theme class could be applied to the document `<body>` element, and
you want to change how your component looks based on that.

Use the `:host-context()` pseudo-class selector, which works just like the function
form of `:host()`. The `:host-context()` selector looks for a CSS class in any ancestor of the component host element,
up to the document root. The `:host-context()` selector is useful when combined with another selector.

The following example applies a `background-color` style to all `<h2>` elements *inside* the component, only
if some ancestor element has the CSS class `theme-light`.

<code-example path="component-styles/src/app/hero-details.component.css" region="hostcontext" header="src/app/hero-details.component.css"></code-example>

### (deprecated) `/deep/`, `>>>`, and `::ng-deep`

Component styles normally apply only to the HTML in the component's own template.

Applying the `::ng-deep` pseudo-class to any CSS rule completely disables view-encapsulation for
that rule. Any style with `::ng-deep` applied becomes a global style. In order to scope the specified style
to the current component and all its descendants, be sure to include the `:host` selector before
`::ng-deep`. If the `::ng-deep` combinator is used without the `:host` pseudo-class selector, the style
can bleed into other components.

The following example targets all `<h3>` elements, from the host element down
through this component to all of its child elements in the DOM.

<code-example path="component-styles/src/app/hero-details.component.css" region="deep" header="src/app/hero-details.component.css"></code-example>

The `/deep/` combinator also has the aliases `>>>`, and `::ng-deep`.

<div class="alert is-important">

Use `/deep/`, `>>>` and `::ng-deep` only with *emulated* view encapsulation.
Emulated is the default and most commonly used view encapsulation. For more information, see the
[View Encapsulation](guide/view-encapsulation) section.

</div>

<div class="alert is-important">

The shadow-piercing descendant combinator is deprecated and [support is being removed from major browsers](https://www.chromestatus.com/feature/6750456638341120) and tools.
As such we plan to drop support in Angular (for all 3 of `/deep/`, `>>>` and `::ng-deep`).
Until then `::ng-deep` should be preferred for a broader compatibility with the tools.

</div>

{@a loading-styles}

## Loading component styles

There are several ways to add styles to a component:

* By setting `styles` or `styleUrls` metadata.
* Inline in the template HTML.
* With CSS imports.

The scoping rules outlined earlier apply to each of these loading patterns.

### Styles in component metadata

You can add a `styles` array property to the `@Component` decorator.

Each string in the array defines some CSS for this component.

<code-example path="component-styles/src/app/hero-app.component.ts" header="src/app/hero-app.component.ts (CSS inline)">
</code-example>

<div class="alert is-critical">

Reminder: these styles apply _only to this component_.
They are _not inherited_ by any components nested within the template nor by any content projected into the component.

</div>

The Angular CLI command [`ng generate component`](cli/generate) defines an empty `styles` array when you create the component with the `--inline-style` flag.

<code-example language="sh">
ng generate component hero-app --inline-style
</code-example>

### Style files in component metadata

You can load styles from external CSS files by adding a `styleUrls` property
to a component's `@Component` decorator:

<code-tabs>
  <code-pane header="src/app/hero-app.component.ts (CSS in file)" path="component-styles/src/app/hero-app.component.1.ts"></code-pane>
  <code-pane header="src/app/hero-app.component.css" path="component-styles/src/app/hero-app.component.css"></code-pane>
</code-tabs>

<div class="alert is-critical">

Reminder: the styles in the style file apply _only to this component_.
They are _not inherited_ by any components nested within the template nor by any content projected into the component.

</div>

<div class="alert is-helpful">

  You can specify more than one styles file or even a combination of `styles` and `styleUrls`.

</div>

When you use the Angular CLI command [`ng generate component`](cli/generate) without the `--inline-style` flag, it creates an empty styles file for you and references that file in the component's generated `styleUrls`.

<code-example language="sh">
ng generate component hero-app
</code-example>

### Template inline styles

You can embed CSS styles directly into the HTML template by putting them
inside `<style>` tags.

<code-example path="component-styles/src/app/hero-controls.component.ts" region="inlinestyles" header="src/app/hero-controls.component.ts">
</code-example>

### Template link tags

You can also write `<link>` tags into the component's HTML template.

<code-example path="component-styles/src/app/hero-team.component.ts" region="stylelink" header="src/app/hero-team.component.ts">
</code-example>

<div class="alert is-critical">

When building with the CLI, be sure to include the linked style file among the assets to be copied to the server as described in the [Assets configuration guide](guide/workspace-config#assets-configuration).

Once included, the CLI will include the stylesheet, whether the link tag's href URL is relative to the application root or the component file.

</div>

### CSS @imports

You can also import CSS files into the CSS files using the standard CSS `@import` rule.
For details, see [`@import`](https://developer.mozilla.org/en/docs/Web/CSS/@import)
on the [MDN](https://developer.mozilla.org) site.

In this case, the URL is relative to the CSS file into which you're importing.

<code-example path="component-styles/src/app/hero-details.component.css" region="import" header="src/app/hero-details.component.css (excerpt)">
</code-example>

### External and global style files

When building with the CLI, you must configure the `angular.json` to include _all external assets_, including external style files.

Register **global** style files in the `styles` section which, by default, is pre-configured with the global `styles.css` file.

See the [Styles configuration guide](guide/workspace-config#styles-and-scripts-configuration) to learn more.


### Non-CSS style files

If you're building with the CLI,
you can write style files in [sass](https://sass-lang.com/), or [less](http://lesscss.org/), and specify those files in the `@Component.styleUrls` metadata with the appropriate extensions (`.scss`, `.less`) as in the following example:

<code-example>
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
...
</code-example>

The CLI build process runs the pertinent CSS preprocessor.

When generating a component file with `ng generate component`, the CLI emits an empty CSS styles file (`.css`) by default.
You can configure the CLI to default to your preferred CSS preprocessor as explained in the [Workspace configuration guide](guide/workspace-config#generation-schematics).


<div class="alert is-important">

Style strings added to the `@Component.styles` array _must be written in CSS_ because the CLI cannot apply a preprocessor to inline styles.

</div>
