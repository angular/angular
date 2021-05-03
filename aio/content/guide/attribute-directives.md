# Attribute directives

With attribute directives, you can change the appearance or behavior of DOM elements and Angular components.

<div class="alert is-helpful">

See the <live-example></live-example> for a working example containing the code snippets in this guide.

</div>

## Building an attribute directive

This section walks you through creating a highlight directive that sets the background color of the host element to yellow.

1. To create a directive, use the CLI command [`ng generate directive`](cli/generate).

  <code-example language="sh" class="code-shell">
ng generate directive highlight
</code-example>

  The CLI creates `src/app/highlight.directive.ts`, a corresponding test file `src/app/highlight.directive.spec.ts`, and declares the directive class in the `AppModule`.

  The CLI generates the default `src/app/highlight.directive.ts` as follows:

  <code-example path="attribute-directives/src/app/highlight.directive.0.ts" header="src/app/highlight.directive.ts"></code-example>

  The `@Directive()` decorator's configuration property specifies the directive's CSS attribute selector, `[appHighlight]`.

1. Import `ElementRef` from `@angular/core`.
  `ElementRef` grants direct access to the host DOM element through its `nativeElement` property.

1. Add `ElementRef` in the directive's `constructor()` to [inject](guide/dependency-injection) a reference to the host DOM element, the element to which you apply `appHighlight`.

1. Add logic to the `HighlightDirective` class that sets the background to yellow.

  <code-example path="attribute-directives/src/app/highlight.directive.1.ts" header="src/app/highlight.directive.ts"></code-example>

<div class="alert is-helpful">

  Directives _do not_ support namespaces.

  <code-example path="attribute-directives/src/app/app.component.avoid.html" header="src/app/app.component.avoid.html (unsupported)" region="unsupported"></code-example>

</div>

{@a apply-directive}
## Applying an attribute directive

1. To use the `HighlightDirective`, add a `<p>` element to the HTML template with the directive as an attribute.

  <code-example path="attribute-directives/src/app/app.component.1.html" header="src/app/app.component.html" region="applied"></code-example>

Angular creates an instance of the `HighlightDirective` class and injects a reference to the `<p>` element into the directive's constructor, which sets the `<p>` element's background style to yellow.

{@a respond-to-user}

## Handling user events

This section shows you how to detect when a user mouses into or out of the element and to respond by setting or clearing the highlight color.

1. Import `HostListener` from '@angular/core'.

  <code-example path="attribute-directives/src/app/highlight.directive.2.ts" header="src/app/highlight.directive.ts (imports)" region="imports"></code-example>

1. Add two event handlers that respond when the mouse enters or leaves, each with the `@HostListener()` decorator.

  <code-example path="attribute-directives/src/app/highlight.directive.2.ts" header="src/app/highlight.directive.ts (mouse-methods)" region="mouse-methods"></code-example>

  With the `@HostListener()` decorator, you can subscribe to events of the DOM element that hosts an attribute directive, the `<p>` in this case.

  The handlers delegate to a helper method, `highlight()`, that sets the color on the host DOM element, `el`.

The complete directive is as follows:

<code-example path="attribute-directives/src/app/highlight.directive.2.ts" header="src/app/highlight.directive.ts"></code-example>

The background color appears when the pointer hovers over the paragraph element and disappears as the pointer moves out.

<div class="lightbox">
  <img src="generated/images/guide/attribute-directives/highlight-directive-anim.gif" alt="Second Highlight">
</div>

{@a bindings}
## Passing values into an attribute directive

This section walks you through setting the highlight color while applying the `HighlightDirective`.

1. In `highlight.directive.ts`, import `Input` from `@angular/core`.

  <code-example path="attribute-directives/src/app/highlight.directive.3.ts" header="src/app/highlight.directive.ts (imports)" region="imports"></code-example>

1. Add an `appHighlight` `@Input()` property.

  <code-example path="attribute-directives/src/app/highlight.directive.3.ts" header="src/app/highlight.directive.ts" region="input"></code-example>

  The `@Input()` decorator adds metadata to the class that makes the directive's `appHighlight` property available for binding.

1. In `app.component.ts`, add a `color` property to the `AppComponent`.

  <code-example path="attribute-directives/src/app/app.component.1.ts" header="src/app/app.component.ts (class)" region="class"></code-example>

1. To simultaneously apply the directive and the color, use property binding with the `appHighlight` directive selector, setting it equal to `color`.

  <code-example path="attribute-directives/src/app/app.component.html" header="src/app/app.component.html (color)" region="color"></code-example>

  The `[appHighlight]` attribute binding performs two tasks:

    * applies the highlighting directive to the `<p>` element
    * sets the directive's highlight color with a property binding

### Setting the value with user input

This section guides you through adding radio buttons to bind your color choice to the `appHighlight` directive.

1. Add markup to `app.component.html` for choosing a color as follows:

  <code-example path="attribute-directives/src/app/app.component.html" header="src/app/app.component.html (v2)" region="v2"></code-example>

1. Revise the `AppComponent.color` so that it has no initial value.

  <code-example path="attribute-directives/src/app/app.component.ts" header="src/app/app.component.ts (class)" region="class"></code-example>

1. Serve your application to verify that the user can choose the color with the radio buttons.

  <div class="lightbox">
      <img src="generated/images/guide/attribute-directives/highlight-directive-v2-anim.gif" alt="Animated gif of the refactored highlight directive changing color according to the radio button the user selects">
  </div>

{@a second-property}

## Binding to a second property

This section guides you through configuring your application so the developer can set the default color.

1. Add a second `Input()` property to `HighlightDirective` called `defaultColor`.

  <code-example path="attribute-directives/src/app/highlight.directive.ts" header="src/app/highlight.directive.ts (defaultColor)" region="defaultColor"></code-example>

1. Revise the directive's `onMouseEnter` so that it first tries to highlight with the `highlightColor`, then with the `defaultColor`, and falls back to `red` if both properties are `undefined`.

  <code-example path="attribute-directives/src/app/highlight.directive.ts" header="src/app/highlight.directive.ts (mouse-enter)" region="mouse-enter"></code-example>

1. To bind to the `AppComponent.color` and fall back to "violet" as the default color, add the following HTML.
  In this case,  the `defaultColor` binding doesn't use square brackets, `[]`, because it is static.

  <code-example path="attribute-directives/src/app/app.component.html" header="src/app/app.component.html (defaultColor)" region="defaultColor"></code-example>

  As with components, you can add multiple directive property bindings to a host element.

The default color is red if there is no default color binding.
When the user chooses a color the selected color becomes the active highlight color.

  <div class="lightbox">
    <img src="generated/images/guide/attribute-directives/highlight-directive-final-anim.gif" alt="Animated gif of final highlight directive that shows red color with no binding and violet with the default color set. When user selects color, the selection takes precedence.">
  </div>

{@a ngNonBindable}

## Deactivating Angular processing with `NgNonBindable`

To prevent expression evaluation in the browser, add `ngNonBindable` to the host element.
`ngNonBindable` deactivates interpolation, directives, and binding in templates.

In the following example, the expression `{{ 1 + 1 }}` renders just as it does in your code editor, and does not display `2`.

<code-example path="attribute-directives/src/app/app.component.html" linenums="false" header="src/app/app.component.html" region="ngNonBindable"></code-example>

Applying `ngNonBindable` to an element stops binding for that element's child elements.
However, `ngNonBindable` still allows directives to work on the element where you apply `ngNonBindable`.
In the following example, the `appHighlight` directive is still active but Angular does not evaluate the expression `{{ 1 + 1 }}`.

<code-example path="attribute-directives/src/app/app.component.html" linenums="false" header="src/app/app.component.html" region="ngNonBindable-with-directive"></code-example>

If you apply `ngNonBindable` to a parent element, Angular disables interpolation and binding of any sort, such as property binding or event binding, for the element's children.
