# Component style

Use standard CSS to style Angular applications.
Your existing knowledge of CSS stylesheets, selectors, rules, and media queries is useful for Angular applications.

Angular allows you to bundle component styles with your component.
Since a component is modular, this allows you to use your stylesheet in a more modular way.

## Prerequisites

Before you work with styles in an Angular [component][AioGuideGlossaryComponent], verify that you have met the following prerequisites.

1.  [Install the Angular CLI][AioGuideSetupLocalInstallTheAngularCli].
1.  [Create an Angular workspace][AioGuideSetupLocalCreateAWorkspaceAndInitialApplication] with your initial application.
1.  [Create an Angular component][AioGuideComponentCreate].

## Use a style in a component

For every Angular component you write, define an HTML template and the CSS styles for the template.
In the CSS styles for the template, specify the following items.

*   Selectors
*   Rules
*   Media queries

Set the `styles` property in the component metadata.
The `styles` property takes an array of strings that contains CSS rule declarations.
The following code example shows the `styles` property with one string, which is the most common situation.

<code-example format="typescript" header="&lcub;NameOfComponent&rcub;.component.ts" language="typescript">

&commat;Component({
  selector: '{name-of-css-selector}',
  template: &grave;
    &lt;h1&gt;Hello World&lt;/h1&gt;
    &lt;p&gt;This template definition spans multiple lines.&lt;/p&gt;
  &grave;,
  styles: ['h1 { font-weight: normal; }'],
})
export class &lcub;NameOfComponent&rcub;Component {
  /* &hellip; */
}

</code-example>

## Style scope

<div class="alert is-critical">

**CRITICAL**: <br />
The styles specified in `@Component` decorator only apply to the template for that component.

</div>

Styles are not inherited by any components nested within the template nor by any content projected into the component.

In the following code example, the `h1` style only applies to the `&lcub;NameOfComponent&rcub;Component` class.

<code-example format="typescript" header="&lcub;NameOfComponent&rcub;.component.ts" language="typescript">

styles: ['h1 { font-weight: normal; }'],

</code-example>

The `h1` style does not apply to the following locations.

*   `h1` elements located elsewhere in the Angular application
*    Any component that is nested in the component

The scoping restriction is a styling modularity feature.

*   Use the CSS class names and selectors that make the most sense in the context of each component
*   Class names and selectors are local to the component and do not collide with classes and selectors used elsewhere in the Angular application
*   Changes to styles elsewhere in the application do not affect the styles of the component
*   Co-locate the CSS code for each component with the TypeScript and HTML code of the component, which leads to a neat and tidy project structure
*   Change or remove component CSS code without searching through the whole application to find where else the code is used

## Special selectors

Component styles uses a few special CSS selectors from the world of style scoping in a shadow DOM.
To learn more about shadow DOM style scoping, see [CSS Scoping Module Level 1][W3TrCssScoping1].

The following table lists the special CSS selectors.

| Selectors                                              | Status |
|:---                                                    |:---    |
| [`:host`](#host)                                       | Supported   |
| [`:host-context`](#host-context)                       | Supported   |
| [`/deep/`, `>>>`, and `::ng-deep`](#deep--and-ng-deep) | Deprecated. |

### `:host`

Every component contains a CSS selector that is the value of the `selector` property.
The value of the `selector` property is used to locate elements in HTML template that match it.
Each instance of the element tag is the host element.
The host element is the element into which the component view is rendered.

Use the `:host` pseudo-class selector to create styles that directly target the host element.
Use the `:host` pseudo-class selector to target elements inside the host element.

In the following code example, the `:host` pseudo-class selector targets the contents of `template` property.

<code-example format="typescript" header="&lcub;NameOfComponent&rcub;.component.ts" language="typescript">

&commat;Component({
  selector: '{name-of-css-selector}',
  template: &grave;
    &lt;h1&gt;Hello World&lt;/h1&gt;
    &lt;p&gt;This template definition spans multiple lines.&lt;/p&gt;
  &grave;,
  styleUrls: ['./&lcub;NameOfComponent&rcub;.component.css'],
})
export class &lcub;NameOfComponent&rcub;Component {
  /* &hellip; */
}

</code-example>

Create the following style to target the host element of the component.
Any rule applied to the selector affects the host element and all associated descendants.
In the following code example, the rule italicizes all of the text conatined in the element.

<code-example header="&lcub;NameOfComponent&rcub;.component.css: Add :host pseudo-class selector" path="component-styles/src/app/hero-details.component.css" region="host"></code-example>

The `:host()`pseudo-class selector only targets the host element of the component.
Any styles placed in the `:host()` block of a child component do not affect the assocaited parent components.

To use the function form to conditionally apply host styles, add another selector after the `:host` pseudo-class selector inside of parentheses \(`(` `)`\) characters.

In the following code example, the content of the host becomes bold when the `active` CSS class is applied to the host element.

<code-example header="&lcub;NameOfComponent&rcub;.component.css: Add :host(.active) pseudo-class selector" path="component-styles/src/app/hero-details.component.css" region="hostfunction"></code-example>

Combine the `:host` pseudo-class with other selectors.
Add CSS selectors after the `:host` statement to target child elements.
For example, use `:host h2` to target all `<h2>` elements inside the view of a component.

<div class="alert is-important">

**IMPORTANT**: <br />
If another CSS selector is placed in front of the `:host` pseudo-class selector, the CSS selector is not scoped to the view of the component and targets the outer context.
To avoid this behavior and to accurately target the outer context, use the `:host-context` pseudo-class selector in front of the `:host` pseudo-class selector.

</div>

### `:host-context`

To apply styles to elements within the template of a component based on a specific condition in an element tag that is an ancestor of the host element.
For example, a CSS theme class applied to the `<body>` element tag for the document and you want to change how your component matches the appearance.

The `:host-context()` pseudo-class selector works like the function form of the `:host()` pseudo-class selector.
The `:host-context()` pseudo-class selector looks for the specified CSS class in the ancestors of the host element for the component, up to the document root.
The `:host-context()` pseudo-class selector is only useful when combined with another CSS selector.

The following example italicizes all text inside a component, but only if some *ancestor* element tag of the host element has the `active` CSS class.

<code-example header="&lcub;NameOfComponent&rcub;.component.css: Add :host-context pseudo-class selector" path="component-styles/src/app/hero-details.component.css" region="hostcontext"></code-example>

<div class="alert is-helpful">

**NOTE**:<br />
Styles defined in the `:host-context()` pseudo-class selector only affect the host element and the associated descendants, not the ancestor that use the assigned `active` class.

</div>

### `/deep/`, `>>>` and, `::ng-deep`

<div class="alert is-critical">

**DEPRECATED**: <br />
The shadow-piercing descendant combinator is deprecated.
[Support is being removed from major browsers][ChromestatusFeature6750456638341120] and tools.
The `>>>` pseudo-class selector and `::ng-deep` pseudo-class selector are aliases for the `/deep/` combinator.
Angular plans to drop support for all 3 implementations \(`/deep/`, `>>>` and, `::ng-deep`\).
Until support is dropped, the `::ng-deep` pseudo-class selector is preferred for a broader tool compatibility.

</div>

Component styles normally apply only to the HTML in the template of the component.

If you apply the `::ng-deep` pseudo-class selector to a CSS rule, view encapsulation is completely disabled for that CSS rule.
If you apply the `::ng-deep` pseudo-class selector to a CSS rule, it becomes a global style.
Always place the `::ng-deep` pseudo-class selector after the `:host` pseudo-class selector, otherwise the CSS rule bleeds into other components.

In the following code example, the CSS rule targets all `<h3>` elements that are located in the host element and any associated child elements.

<code-example header="&lcub;NameOfComponent&rcub;.component.css: Add ::ng-deep pseudo-class selector" path="component-styles/src/app/hero-details.component.css" region="deep"></code-example>

<div class="alert is-important">

Use the `::ng-deep` pseudo-class selector only with emulated view encapsulation.
Emulated view encapsulation is the default and most commonly used view encapsulation.

To learn more about emulated view encapsulation, see [Emulated encapsulation][AioGuideComponentEncapsuleStyleEmulatedEncapsulation].

</div>

## Load a style in a component

Angular allows you to add styles to a component in the following ways

| Actions                   | Details |
|:---                       |:---     |
| In the component metadata | Use the [`styles`](#styles-in-component-metadata) or [`styleUrls`](#style-files-in-component-metadata) metadata in the component |
| In the HTML template      | Use the [`<style>`](#template-inline-styles) or [`<link>`](#template-link-tags) element tag in the HTML template                 |
| In a CSS file             | Use [CSS `@imports`](#css-imports) in the style definition                                                                       |

The scoping rules outlined earlier apply to each of these loading patterns.

### Styles in component metadata

Add a `styles` array property to the `@Component` decorator.

Each string in the array defines some CSS for this component.

<code-example format="typescript" header="&lcub;NameOfComponent&rcub;.component.ts" language="typescript">

&commat;Component({
  selector: '{name-of-css-selector}',
  template: &grave;
    &lt;h1&gt;Hello World&lt;/h1&gt;
    &lt;p&gt;This template definition spans multiple lines.&lt;/p&gt;
  &grave;,
  styles: ['h1 { font-weight: normal; }'],
})
export class &lcub;NameOfComponent&rcub;Component {
  /* &hellip; */
}

</code-example>

<div class="alert is-critical">

**CRITICAL**: <br />
The styles only apply only to the current component.
The styles are not inherited by any child components nested within the template nor by any content projected into the component.

</div>

Use the `--inline-style` flag to specify the use of inline styles.
The following Angular CLI command defines an empty `styles` array.

<code-example format="shell" header="ng generate component Angular CLI command: Add empty inline style" language="shell">

ng generate component &lcub;NameOfComponent&rcub; --inline-style

</code-example>

### Style files in component metadata

Add a `styleUrls` property to the `@Component` decorator of a component to load styles from external CSS files.

<code-tabs>
    <code-pane format="typescript" header="&lcub;NameOfComponent&rcub;.component.ts: Add styleUrls metadata" language="typescript">&commat;Component({ &NewLine;&nbsp; selector: '{name-of-css-selector}', &NewLine;&nbsp; template: &grave; &NewLine;&nbsp;&nbsp;&nbsp; &lt;h1&gt;Hello World&lt;/h1&gt; &NewLine;&nbsp;&nbsp;&nbsp; &lt;p&gt;This template definition spans multiple lines.&lt;/p&gt; &NewLine;&nbsp; &grave;, &NewLine;&nbsp; styleUrls: ['./&lcub;NameOfComponent&rcub;.component.css'], &NewLine;}) &NewLine;export class &lcub;NameOfComponent&rcub;Component { &NewLine;&nbsp; /* &hellip; */ &NewLine;} </code-pane>
    <code-pane header="./&lcub;NameOfComponent&rcub;.component.css" path="component-styles/src/app/hero-app.component.css"></code-pane>
</code-tabs>

<div class="alert is-critical">

**CRITICAL**: <br />
The styles in the styles file apply only to the current component.
The styles are not inherited by any child components that are nested within the template nor by any content projected into the component.

</div>

<div class="alert is-helpful">

You can specify more than one styles file or even a combination of `styles` and `styleUrls`.

</div>

By default, when you run the following Angular CLI command, the Angular CLI creates a component with an empty CSS styles file.

<code-example format="shell" header="ng generate component Angular CLI command" language="shell">

ng generate component &lcub;NameOfComponent&rcub;

</code-example>

Use the `--style` flag to specify the type of external styles file.
The following Angular CLI command specifies a CSS style type to create an empty styles file that uses the CSS style type and add the file path to the `styleUrls` metadata.

<code-example format="shell" header="ng generate component Angular CLI command: Add empty inline CSS styles file" language="shell">

ng generate component &lcub;NameOfComponent&rcub; --style css

</code-example>

### Template inline styles

Add the CSS styles inside `<style>` elements to embed CSS styles directly into the HTML template.

<code-example format="typescript" header="&lcub;NameOfComponent&rcub;.component.ts: Add inline styles in template metadata" language="typescript">

&commat;Component({
  selector: '{name-of-css-selector}',
  template: &grave;
    &lt;style&gt;
      button {
        background-color: white;
        border: 1px solid #777;
      }
    /style&gt;
    &lt;h3&gt;Controls&lt;/h3&gt;
    &lt;button type="button" (click)="activate()"&gt;Activate&lt;/button&gt;
  &grave;,
})
export class &lcub;NameOfComponent&rcub;Component {
  /* &hellip; */
}

</code-example>


### Template link tags

Use `<link>` elements to directly reference external CSS styles in the HTML template.

<code-example format="typescript" header="&lcub;NameOfComponent&rcub;.component.ts: Add referenced styles in template metadata" language="typescript">

&commat;Component({
  selector: '{name-of-css-selector}',
  template: &grave;
    &lt;link rel="stylesheet" href="./{path/to/css/file}.css" /&gt;
    &lt;h3&gt;Controls&lt;/h3&gt;
    &lt;button type="button" (click)="activate()"&gt;Activate&lt;/button&gt;
  &grave;,
})
export class &lcub;NameOfComponent&rcub;Component {
  /* &hellip; */
}

</code-example>

<div class="alert is-critical">

The Angular CLI requires that all linked style files must must be accessible on the same server.
To learn more about linked files in an Angular project, see [Assets configuration][AioGuideWorkspaceConfigAssetsConfiguration].

Specify the URI path value, relative to one of the following locations, in the `href` attribute of the `<link>` element tag.

| Locations                     | Examples |
|:---                           |:---      |
| The Angular application root  | `/{path/to/file}.css`                                 |
| The component TypeScript file | `./{path/to/file}.css` <br /> `../{path/to/file}.css` |

After you add the styles file, the Angular CLI includes the stylesheet.

</div>

### CSS `@imports`

Use the standard CSS `@import` at-rule to import a CSS file into another CSS styles file.
To learn more about the standard CSS `@import` at-rule, see [`@import`][MdnDocsWebCssImport].

Specify the URI path value, relative to the styles files, as the value of the `@import` at-rule.

In the following code example, the file path is to the imported styles file is relative to the CSS file into which you are importing it.

<code-example header="Import styles rules from hero-details-box.css" path="component-styles/src/app/hero-details.component.css" region="import"></code-example>

### External and global style files

Add each external asset and each external styles file to the `angular.json` file in order to successfully build with the Angular CLI.

Register each global styles file in the `styles` section.
By default, the `styles` section is pre-configured with the global `styles.css` file.

To learn more about the global `styles.css` file, see [Styles configuration guide][AioGuideWorkspaceConfigStylesAndScriptsConfiguration].

### Non-CSS style files

The Angular CLI requires that all of your styles files are written in one of the following formats.

| Formats              | Extensions |
|:---                  |:---        |
| [CSS][W3CssMain]     | `.css`     |
| [less][LesscssMain]  | `.less`    |
| [sass][SassLangMain] | `.scss`    |

Specify the relative path to your style files in the `styleUrls` metadata using the appropriate extension.

The following code example references a style file written in [sass][SassLangMain].

<code-example format="typescript" header="&lcub;NameOfComponent&rcub;.component.ts: Add styleUrls metadata for sass styles file" language="typescript">

&commat;Component({
  selector: '{name-of-css-selector}',
  templateUrl: './&lcub;NameOfComponent&rcub;.component.html',
  styleUrls: ['./&lcub;NameOfComponent&rcub;.component.scss'],
})
export class &lcub;NameOfComponent&rcub;Component {
  /* &hellip; */
}

</code-example>

The Angular CLI build process detects and runs the relevent CSS pre-processor for an external styles file.
To learn more about how to configure the Angular CLI in order to default to your preferred CSS preprocessor, see [Generation schematics][AioGuideWorkspaceConfigGenerationSchematics].

<div class="alert is-important">

**IMPORTANT**: <br />
The Angular CLI does not apply a pre-processor to inline styles.
Style strings added to the `styles` metadata must be written in CSS.

</div>

<!-- links -->

[AioCliGenerate]: cli/generate

<!-- "ng generate | CLI | Angular" -->

[AioGuideComponentCreate]: guide/component/component-create

<!-- "Create an Angular component | Angular" -->

[AioGuideComponentEncapsuleStyle]: guide/component/component-encapsulate-style

<!-- "Encapsulate style in a view | Angular" -->

[AioGuideComponentEncapsuleStyleEmulatedEncapsulation]: guide/component/component-encapsulate-style#emulated-encapsulation

<!-- "Emulated encapsulation - Encapsulate style in a view | Angular" -->

[AioGuideComponentExample]: guide/component/component-example

<!-- "Example Angular component applications | Angular" -->

[AioGuideComponentStructureStyleMetadata]: guide/component/component-structure#style-metadata 

<!-- "Style metadata - Understand the structure an Angular component | Angular" -->

[AioGuideGlossaryComponent]: guide/glossary#component

<!-- "component - Glossary | Angular" -->

[AioGuideSetupLocalCreateAWorkspaceAndInitialApplication]: guide/setup-local#create-a-workspace-and-initial-application

<!-- "Create a workspace and initial application - Setting up the local environment and workspace | Angular" -->

[AioGuideSetupLocalInstallTheAngularCli]: guide/setup-local#install-the-angular-cli

<!-- "Install the Angular CLI - Setting up the local environment and workspace | Angular" -->

[AioGuideWorkspaceConfigAssetsConfiguration]: guide/workspace-config#assets-configuration

<!-- "Assets configuration - Angular workspace configuration | Angular" -->

[AioGuideWorkspaceConfigGenerationSchematics]: guide/workspace-config#generation-schematics

<!-- "Generation schematics - Angular workspace configuration | Angular" -->

[AioGuideWorkspaceConfigStylesAndScriptsConfiguration]: guide/workspace-config#styles-and-scripts-configuration

<!-- "Styles and scripts configuration - Angular workspace configuration | Angular" -->

<!-- external links -->

[ChromestatusFeature6750456638341120]: https://www.chromestatus.com/feature/6750456638341120

<!-- "Feature: Shadow-Piercing descendant combinator, '/deep/' (removed) - Chrome Platform Status" -->

[LesscssMain]: http://lesscss.org

<!-- "less.js" -->

[MdnMain]: https://developer.mozilla.org

<!-- "MDN" -->

[MdnDocsWebCssImport]: https://developer.mozilla.org/docs/Web/CSS/@import

<!-- "@import | MDN" -->

[MdnDocsWebCssPart]: https://developer.mozilla.org/docs/Web/CSS/::part

<!-- "::part() | MDN" -->

[MdnDocsWebWebComponentsUsingShadowDom]: https://developer.mozilla.org/docs/Web/Web_Components/Using_shadow_DOM

<!-- "Using Shadow DOM | MDN" -->

[SassLangMain]: https://sass-lang.com

<!-- "Sass" -->

[W3cMain]: https://w3.org

<!-- "W3C" -->

[W3CssMain]: https://w3.org/CSS

<!-- "Cascading Style Sheets | W3C" -->

[W3TrCssScoping1]: https://w3.org/TR/css-scoping-1

<!-- "CSS Scoping Module Level 1 | W3C" -->

<!-- end links -->

@reviewed 2022-02-15
