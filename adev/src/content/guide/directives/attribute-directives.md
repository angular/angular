# Attribute directives

Attribute directives change the appearance or behavior of DOM elements and Angular components.

## Use template bindings for one-off behavior

Angular's template syntax already covers changing a single element's classes, styles, properties, and events:

- [Class and style bindings](guide/templates/binding#css-class-and-style-property-bindings) add and remove CSS classes and inline styles.
- [Property and attribute bindings](guide/templates/binding) set DOM properties and HTML attributes.
- [Event listeners](guide/templates/event-listeners) respond to user interaction.

Attribute directives are useful when you want to package this kind of behavior into a reusable unit that you can apply to any element or component.

## Building an attribute directive

A custom attribute directive is a JavaScript class with the `@Directive()` decorator. The decorator's `selector` defines the attribute that applies the directive. The square brackets make this an attribute selector, so the directive matches elements that carry the attribute. By convention, use a prefix such as `app` to avoid naming collisions:

```ts
import {Directive} from '@angular/core';

@Directive({
  selector: '[appHighlight]',
})
export class HighlightDirective {}
```

HELPFUL: The CLI command [`ng generate directive`](tools/cli/schematics) scaffolds a directive along with its test file.

A directive can change its host declaratively through host bindings or imperatively through a reference to the host element. This example [injects](guide/di) [`ElementRef`](api/core/ElementRef) and accesses the element through its `nativeElement` property to set the background to yellow:

<docs-code header="highlight.directive.ts" path="adev/src/content/examples/attribute-directives/src/app/highlight.directive.1.ts"/>

IMPORTANT: Directives _do not_ support namespaces.

```angular-html {avoid}
<p app:Highlight>This is invalid</p>
```

## Applying an attribute directive

To apply the directive, add its selector as an attribute on an element:

<docs-code header="app.component.html" path="adev/src/content/examples/attribute-directives/src/app/app.component.1.html" region="applied"/>

Angular creates an instance of `HighlightDirective` for that `<p>` element, injects a reference to the element, and sets its background to yellow.

## Handling user events

To respond to user interaction, bind host element events to handler methods through the `host` property of the `@Directive()` decorator. The following directive highlights the host element while the pointer is over it and clears the highlight when the pointer leaves:

<docs-code header="highlight.directive.ts" path="adev/src/content/examples/attribute-directives/src/app/highlight.directive.2.ts"/>

The `host` property maps the `mouseenter` and `mouseleave` events to the `onMouseEnter()` and `onMouseLeave()` methods, which delegate to a `highlight()` helper that sets the background color on the host element. For more on host event bindings, see [binding to the host element](guide/components/host-elements#binding-to-the-host-element).

## Accepting input values

Like components, directives accept inputs through the [`input()`](guide/components/inputs) function. Give an input the same name as the selector so that a single binding both applies the directive and passes a value to it:

<docs-code header="highlight.directive.ts" path="adev/src/content/examples/attribute-directives/src/app/highlight.directive.3.ts" region="input"/>

Read the input by calling it as a signal, and fall back to a default when no color is set:

<docs-code header="highlight.directive.ts" path="adev/src/content/examples/attribute-directives/src/app/highlight.directive.3.ts" region="mouse-enter"/>

In the template, bind the value to the selector. Because the input shares the selector's name, `[appHighlight]` both applies the directive and sets its value. Here the bound `color` is a property on the component:

<docs-code header="app.component.html" path="adev/src/content/examples/attribute-directives/src/app/app.component.html" region="color"/>

<docs-code header="app.component.ts" path="adev/src/content/examples/attribute-directives/src/app/app.component.ts" region="class"/>

A directive can declare more than one input. The following directive adds a `defaultColor` input, then falls back through `appHighlight`, `defaultColor`, and finally `red`:

<docs-code header="highlight.directive.ts" path="adev/src/content/examples/attribute-directives/src/app/highlight.directive.ts"/>

Bind both inputs on the same element. Because `defaultColor` takes a static string rather than a dynamic expression, it doesn't need square brackets:

<docs-code header="app.component.html" path="adev/src/content/examples/attribute-directives/src/app/app.component.html" region="defaultColor"/>

## Deactivating Angular processing with `NgNonBindable`

To prevent expression evaluation in the browser, add `ngNonBindable` to the host element.
`ngNonBindable` deactivates interpolation, directives, and binding in templates.

In the following example, the expression `{{ 1 + 1 }}` renders just as it does in your code editor, and does not display `2`.

<docs-code header="app.component.html" path="adev/src/content/examples/attribute-directives/src/app/app.component.html" region="ngNonBindable"/>

Applying `ngNonBindable` to an element stops binding for that element's child elements.
However, `ngNonBindable` still lets directives work on the element where you apply `ngNonBindable`.
In the following example, the `appHighlight` directive is still active but Angular does not evaluate the expression `{{ 1 + 1 }}`.

<docs-code header="app.component.html" path="adev/src/content/examples/attribute-directives/src/app/app.component.html" region="ngNonBindable-with-directive"/>

If you apply `ngNonBindable` to a parent element, Angular disables interpolation and binding of any sort, such as property binding or event binding, for the element's children.

## What's next

<docs-pill-row>
  <docs-pill href="guide/directives/structural-directives" title="Structural directives"/>
  <docs-pill href="guide/directives/directive-composition-api" title="Directive composition API"/>
</docs-pill-row>
