# Component styles

Angular applications are styled with standard CSS.
That means you may apply everything you know about CSS stylesheets, selectors, rules, and media queries directly to Angular applications.

Additionally, Angular is able to bundle component styles with components, enabling a more modular design than regular stylesheets.

This page describes how to load and apply these component styles.

<div class="alert is-helpful">

For the sample application that this page describes, see the <live-example name="component-styles"></live-example>.

</div>

## Using component styles

For every Angular component you write, you may define not only an HTML template, but also the CSS styles that go with that template, specifying any selectors, rules, and media queries that you need.

One way to do this is to set the `styles` property in the component metadata.
The `styles` property takes an array of strings that contain CSS code.
Usually you give it one string, as in the following example:

<code-example path="component-styles/src/app/hero-app.component.ts" header="src/app/hero-app.component.ts"></code-example>

## Style scope

<div class="alert is-critical">

The styles specified in `@Component` metadata apply only within the template of that component.

</div>

They are not inherited by any components nested within the template nor by any content projected into the component.

In this example, the `h1` style applies only to the `HeroAppComponent`, not to the nested `HeroMainComponent` nor to `<h1>` tags anywhere else in the application.

This scoping restriction is a styling modularity feature.

*   You may use the CSS class names and selectors that make the most sense in the context of each component.
*   Class names and selectors are local to the component and don't collide with classes and selectors used elsewhere in the application.
*   Changes to styles elsewhere in the application don't affect the component's styles.
*   You may co-locate the CSS code of each component with the TypeScript and HTML code of the component, which leads to a neat and tidy project structure.
*   You may change or remove component CSS code without searching through the whole application to find where else the code is used.

## Special selectors

{@a special-selectors}

Component styles have a few special selectors from the world of shadow DOM style scoping (described in the [CSS Scoping Module Level 1][W3TrCssScoping1] page on the [W3C][W3Main] site).
The following sections describe these selectors.

### :host

Every component is associated within an element that matches the component's selector.
This element, into which the template is rendered, is called the *host element*.
The `:host` pseudo-class selector may be used to create styles that target the host element itself, as opposed to targeting elements inside the host.

Use the `:host` pseudo-class selector to target styles in the element that hosts the component (as opposed to targeting elements inside the component's template).

<code-example path="component-styles/src/app/hero-details.component.css" region="host" header="src/app/hero-details.component.css"></code-example>

The `:host` selector is the only way to target the host element.
You may ot reach the host element from inside the component with other selectors because it's not part of the component's own template.
The host element is in a parent component's template.

Use the function form to apply host styles conditionally by including another selector inside parentheses after `:host`.

In this example the host's content also becomes bold when the `active` CSS class is applied to the host element.

<code-example path="component-styles/src/app/hero-details.component.css" region="hostfunction" header="src/app/hero-details.component.css"></code-example>

The `:host` selector is able to also be combined with other selectors.
Add selectors behind the `:host` to select child elements, for example using `:host h2` to target all `<h2>` elements inside a component's view.

<div class="alert is-helpful">

You should not add selectors (other than `:host-context`) in front of the `:host` selector to style a component based on the outer context of the component's view.
Such selectors are not scoped to a component's view and will select the outer context, but it's not built-in behavior.
Use `:host-context` selector for that purpose instead.

</div>

### :host-context

Sometimes it's useful to apply styles based on some condition outside of a component's view.
For example, a CSS theme class could be applied to the document `<body>` element, and you want to change how your component looks based on that.

Use the `:host-context()` pseudo-class selector, which works just like the function form of `:host()`.
The `:host-context()` selector looks for a CSS class in any ancestor of the component host element, up to the document root.
The `:host-context()` selector is useful when combined with another selector.

The following example applies a `background-color` style to all `<h2>` elements inside the component, only if some ancestor element has the CSS class `theme-light`.

<code-example path="component-styles/src/app/hero-details.component.css" region="hostcontext" header="src/app/hero-details.component.css"></code-example>

Note that only the host element and its descendants will be affected, not the ancestor with the assigned `active` class.

### (deprecated) `/deep/`, `>>>`, and `::ng-deep`

Component styles normally apply only to the HTML in the component's own template.

Applying the `::ng-deep` pseudo-class to any CSS rule completely disables view-encapsulation for that rule.
Any style with `::ng-deep` applied becomes a global style.
In order to scope the specified style to the current component and all its descendants, be sure to include the `:host` selector before `::ng-deep`.
If the `::ng-deep` combinator is used without the `:host` pseudo-class selector, it is possible for the style to bleed into other components.

The following example targets all `<h3>` elements, from the host element down through this component to all of its child elements in the DOM.

<code-example path="component-styles/src/app/hero-details.component.css" region="deep" header="src/app/hero-details.component.css"></code-example>

The `/deep/` combinator also has the aliases `>>>` and `::ng-deep`.

<div class="alert is-important">

Use `/deep/`, `>>>`, and `::ng-deep` only with emulated view encapsulation.
Emulated is the default and most commonly used view encapsulation.
For more information, see the [View Encapsulation][AioGuideViewEncapsulation] section.

</div>

<div class="alert is-important">

The shadow-piercing descendant combinator is deprecated and [support is being removed from major browsers][ChromestatusFeature6750456638341120] and tools.
As such we plan to drop support in Angular (for all 3 of `/deep/`, `>>>`, and `::ng-deep`).
Until then `::ng-deep` should be preferred for a broader compatibility with the tools.

</div>

## Loading component styles

{@a loading-styles}

There are several ways to add styles to a component:

*   By setting `styles` or `styleUrls` metadata
*   Inline in the template HTML
*   With CSS imports

The scoping rules outlined earlier apply to each of these loading patterns.

### Styles in component metadata

Add a `styles` array property to the `@Component` decorator.

Each string in the array defines some CSS for this component.

<code-example path="component-styles/src/app/hero-app.component.ts" header="src/app/hero-app.component.ts (CSS inline)"></code-example>

<div class="alert is-critical">

Reminder: these styles apply only to this component.
They are not inherited by any components nested within the template nor by any content projected into the component.

</div>

The Angular CLI command [`ng generate component`][AioCliGenerate] defines an empty `styles` array when you create the component with the `--inline-style` flag.

<!--todo: replace with code-example -->

<code-example format="shell" language="shell">

ng generate component hero-app --inline-style

</code-example>

### Style files in component metadata

You may load styles from external CSS files by adding a `styleUrls` property to a component's `@Component` decorator:

<code-tabs>
    <code-pane header="src/app/hero-app.component.ts (CSS in file)" path="component-styles/src/app/hero-app.component.1.ts"></code-pane>
    <code-pane header="src/app/hero-app.component.css" path="component-styles/src/app/hero-app.component.css"></code-pane>
</code-tabs>

<div class="alert is-critical">

Reminder: the styles in the style file apply only to this component.
They are not inherited by any components nested within the template nor by any content projected into the component.

</div>

<div class="alert is-helpful">

You may specify more than one styles file or even a combination of `styles` and `styleUrls`.

</div>

When you use the Angular CLI command [`ng generate component`][AioCliGenerate] without the `--inline-style` flag, it creates an empty styles file for you and references that file in the component's generated `styleUrls`.

<!--todo: replace with code-example -->

<code-example format="shell" language="shell">

ng generate component hero-app

</code-example>

### Template inline styles

You may embed CSS styles directly into the HTML template by putting them inside `<style>` tags.

<code-example path="component-styles/src/app/hero-controls.component.ts" region="inlinestyles" header="src/app/hero-controls.component.ts"></code-example>

### Template link tags

You may also write `<link>` tags into the component's HTML template.

<code-example path="component-styles/src/app/hero-team.component.ts" region="stylelink" header="src/app/hero-team.component.ts"></code-example>

<div class="alert is-critical">

When building with the CLI, be sure to include the linked style file among the assets to be copied to the server as described in the [Assets configuration guide][AioGuideWorkspaceConfigAssetsConfiguration].

Once included, the CLI includes the stylesheet, whether the link tag's href URL is relative to the application root or the component file.

</div>

### CSS @imports

You may also import CSS files into the CSS files using the standard CSS `@import` rule.
For details, see [`@import`][MozillaDeveloperDocsWebCssImport] on the [MDN][MozillaDeveloperMain] site.

In this case, the URL is relative to the CSS file into which you're importing.

<code-example path="component-styles/src/app/hero-details.component.css" region="import" header="src/app/hero-details.component.css (excerpt)"> </code-example>

### External and global style files

When building with the CLI, you must configure the `angular.json` to include all external assets, including external style files.

Register global style files in the `styles` section which, by default, is pre-configured with the global `styles.css` file.

See the [Styles configuration guide][AioGuideWorkspaceConfigStylesAndScriptsConfiguration] to learn more.

### Non-CSS style files

If you're building with the CLI, you may write style files in [sass][SassLangMain], or [less][LesscssMain], and specify those files in the `@Component.styleUrls` metadata with the appropriate extensions (`.scss`, `.less`) as in the following example:

<!--todo: replace with code-example -->

<code-example format="css" language="css">

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
...

</code-example>

The CLI build process runs the pertinent CSS preprocessor.

When generating a component file with `ng generate component`, the CLI emits an empty CSS styles file (`.css`) by default.
You may configure the CLI to default to your preferred CSS preprocessor as explained in the [Workspace configuration guide][AioGuideWorkspaceConfigGenerationSchematics].

<div class="alert is-important">

Style strings added to the `@Component.styles` array must be written in CSS because the Angular CLI is not able to apply a preprocessor to inline styles.

</div>

<!-- links -->

[AioCliGenerate]: cli/generate "ng generate | CLI | Angular"

[AioGuideViewEncapsulation]: guide/view-encapsulation "View encapsulation | Angular"

[AioGuideWorkspaceConfigAssetsConfiguration]: guide/workspace-config#assets-configuration "Assets configuration - Angular workspace configuration | Angular"
[AioGuideWorkspaceConfigGenerationSchematics]: guide/workspace-config#generation-schematics "Generation schematics - Angular workspace configuration | Angular"
[AioGuideWorkspaceConfigStylesAndScriptsConfiguration]: guide/workspace-config#styles-and-scripts-configuration "Styles and scripts configuration - Angular workspace configuration | Angular"

[SassLangMain]: https://sass-lang.com "Sass"

[less][LesscssMain]
[LesscssMain]: http://lesscss.org "Less.js"

<!-- external links -->

[ChromestatusFeature6750456638341120]: https://www.chromestatus.com/feature/6750456638341120 "Feature: Shadow-Piercing descendant combinator, '/deep/' (removed) | Chrome Platform Status"

[MozillaDeveloperMain]: https://developer.mozilla.org "MDN Web Docs"
[MozillaDeveloperDocsWebCssImport]: https://developer.mozilla.org/docs/Web/CSS/@import "@import | MDN Web Docs"

[W3Main]: https://www.w3.org "W3C"
[W3TrCssScoping1]: https://www.w3.org/TR/css-scoping-1 "CSS Scoping Module Level 1 | W3C"

<!-- end links -->

@reviewed 2021-11-02
