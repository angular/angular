# Attribute directives

Attribute directives change the appearance or behavior of DOM elements and Angular components.

## Built-in attribute directives

Angular includes several built-in attribute directives for common tasks:

| Common directives                                      | Details                                            |
| :----------------------------------------------------- | :------------------------------------------------- |
| [`NgClass`](#adding-and-removing-classes-with-ngclass) | Adds and removes a set of CSS classes.             |
| [`NgStyle`](#setting-inline-styles-with-ngstyle)       | Adds and removes a set of HTML styles.             |
| [`NgModel`](guide/forms/template-driven-forms)         | Adds two-way data binding to an HTML form element. |

HELPFUL: Built-in directives use only public APIs. They do not have special access to any private APIs that other directives can't access.

### Adding and removing classes with `NgClass`

Add or remove multiple CSS classes simultaneously by binding `[ngClass]` to an expression. To use `NgClass`, add it to the component's `imports` list:

```angular-ts
import {NgClass} from '@angular/common';

@Component({
  /* ... */
  imports: [NgClass],
})
export class AppComponent {}
```

To toggle a single class, bind `[ngClass]` to a conditional expression that returns the class name. In this example, `ngClass` applies the `special` class when `isSpecial` is `true`:

<docs-code header="app.component.html" path="adev/src/content/examples/built-in-directives/src/app/app.component.html" region="special-div"/>

To toggle several classes at once, bind `[ngClass]` to an object. Each key is a class name, and Angular adds the class when its value is truthy and removes it when its value is falsy:

```angular-html
<div [ngClass]="{'saveable': canSave, 'modified': !isUnchanged, 'special': isSpecial}">
  This div's classes reflect the current component state.
</div>
```

HELPFUL: To add or remove a _single_ class, use [class binding](/guide/templates/binding#css-class-and-style-property-bindings) rather than `NgClass`.

### Setting inline styles with `NgStyle`

Set multiple inline styles simultaneously by binding `[ngStyle]` to an object. To use `NgStyle`, add it to the component's `imports` list:

```angular-ts
import {NgStyle} from '@angular/common';

@Component({
  /* ... */
  imports: [NgStyle],
})
export class AppComponent {}
```

Each key in the object is a CSS property name and each value is the style to apply:

```angular-html
<div
  [ngStyle]="{
    'font-style': canSave ? 'italic' : 'normal',
    'font-weight': !isUnchanged ? 'bold' : 'normal',
    'font-size': isSpecial ? '24px' : '12px',
  }"
>
  This div's styles reflect the current component state.
</div>
```

HELPFUL: To add or remove a _single_ style, use [style bindings](guide/templates/binding#css-class-and-style-property-bindings) rather than `NgStyle`.

## Building an attribute directive

A custom attribute directive is a class with the `@Directive()` decorator. The decorator's `selector` defines the attribute that applies the directive. By convention, custom selectors use a prefix such as `app` and wrap the name in square brackets to form an attribute selector:

```angular-ts
import {Directive} from '@angular/core';

@Directive({
  selector: '[appHighlight]',
})
export class HighlightDirective {}
```

HELPFUL: The CLI command [`ng generate directive`](tools/cli/schematics) scaffolds a directive along with its test file.

To change the host element, a directive needs a reference to it. Inject [`ElementRef`](guide/di) to reach the element through its `nativeElement` property. This directive sets the background to yellow when Angular creates it:

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

<img alt="Second Highlight" src="assets/images/guide/attribute-directives/highlight-directive-anim.gif">

## Accepting input values

Like components, directives accept inputs through the [`input()`](guide/components/inputs) function. Give an input the same name as the selector so that a single binding both applies the directive and passes a value to it:

<docs-code header="highlight.directive.ts" path="adev/src/content/examples/attribute-directives/src/app/highlight.directive.3.ts" region="input"/>

Read the input by calling its signal, and fall back to a default when no value is bound:

<docs-code header="highlight.directive.ts" path="adev/src/content/examples/attribute-directives/src/app/highlight.directive.3.ts" region="mouse-enter"/>

In the template, bind the value to the selector. Because the input shares the selector's name, `[appHighlight]` both applies the directive and sets its value:

<docs-code header="app.component.html" path="adev/src/content/examples/attribute-directives/src/app/app.component.html" region="color"/>

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
