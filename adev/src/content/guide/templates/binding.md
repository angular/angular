# Understanding binding

In an Angular template, a binding creates a live connection between a part of the UI created from a template (a DOM element, directive, or component) and the model (the component instance to which the template belongs). This connection can be used to synchronize the view with the model, to notify the model when an event or user action takes place in the view, or both. Angular's [Change Detection](best-practices/runtime-performance) algorithm is responsible for keeping the view and the model in sync.

Examples of binding include:

* text interpolations
* property binding
* event binding
* two-way binding

Bindings always have two parts: a _target_ which will receive the bound value, and a _template expression_ which produces a value from the model.

## Syntax

Template expressions are similar to JavaScript expressions.
Many JavaScript expressions are legal template expressions, with the following exceptions.

You can't use JavaScript expressions that have or promote side effects, including:

* Assignments (`=`, `+=`, `-=`, `...`)
* Operators such as `new`, `typeof`, or `instanceof`
* Chaining expressions with <code>;</code> or <code>,</code>
* The increment and decrement operators `++` and `--`
* Some of the ES2015+ operators

Other notable differences from JavaScript syntax include:

* No support for the bitwise operators such as `|` and `&`

## Expression context

Interpolated expressions have a context—a particular part of the application to which the expression belongs.  Typically, this context is the component instance.

In the following snippet, the expression `recommended` and the expression `itemImageUrl2` refer to properties of the `AppComponent`.

<docs-code path="adev/src/content/examples/interpolation/src/app/app.component.html" visibleRegion="component-context" header="src/app/app.component.html"/>

An expression can also refer to properties of the _template's_ context such as a [template input variable](guide/directives/structural-directives#shorthand) or a [template reference variable](guide/templates/reference-variables).

The following example uses a template input variable of `customer`.

<docs-code path="adev/src/content/examples/interpolation/src/app/app.component.html" visibleRegion="template-input-variable" header="src/app/app.component.html (template input variable)"/>

This next example features a template reference variable, `#customerInput`.

<docs-code path="adev/src/content/examples/interpolation/src/app/app.component.html" visibleRegion="template-reference-variable" header="src/app/app.component.html (template reference variable)"/>

HELPFUL: Template expressions cannot refer to anything in the global namespace, except `undefined`.  They can't refer to `window` or `document`.  Additionally, they can't call `console.log()` or `Math.max()` and are restricted to referencing members of the expression context.

### Preventing name collisions

The context against which an expression evaluates is the union of the template variables, the directive's context object—if it has one—and the component's members.
If you reference a name that belongs to more than one of these namespaces, Angular applies the following precedence logic to determine the context:

1. The template variable name.
1. A name in the directive's context.
1. The component's member names.

To avoid variables shadowing variables in another context, keep variable names unique.
In the following example, the `AppComponent` template greets the `customer`, Padma.

The `@for` then lists each `customer` in the `customers` array.

<docs-code path="adev/src/content/examples/interpolation/src/app/app.component.1.ts" visibleRegion="var-collision" header="src/app/app.component.ts"/>

The `customer` within the `@for` is in the context of the implicit `<ng-template>` defined by the _@for_.  It refers to each `customer` in the `customers` array and displays "Ebony" and "Chiho".  "Padma" is not displayed because that name is not in that array.

On the other hand, the `<h1>` displays "Padma" which is bound to the value of the `customer` property in the component class.

## Expression best practices

When using a template expression, follow these best practices:

* **Use short expressions**

Use property names or method calls whenever possible.  Keep application and business logic in the component, where it is accessible to develop and test.

* **Quick execution**

Angular executes a template expression after every change detection cycle.  Many asynchronous activities trigger change detection cycles, such as promise resolutions, HTTP results, timer events, key presses, and mouse moves.

An expression should finish quickly to keep the user experience as efficient as possible, especially on slower devices.  Consider caching values when their computation requires greater resources.

## No visible side effects

According to Angular's unidirectional data flow model, a template expression should not change any application state other than the value of the target property.  Reading a component value should not change some other displayed value.  The view should be stable throughout a single rendering pass.

  <docs-callout title='Idempotent expressions reduce side effects'>

An [idempotent](https://en.wikipedia.org/wiki/Idempotence) expression is free of side effects and improves Angular's change detection performance.  In Angular terms, an idempotent expression always returns _exactly the same thing_ until one of its dependent values changes.

Dependent values should not change during a single turn of the event loop.  If an idempotent expression returns a string or a number, it returns the same string or number if you call it twice consecutively.  If the expression returns an object, including an `array`, it returns the same object _reference_ if you call it twice consecutively.

  </docs-callout>

## What's next

<docs-pill-row>
  <docs-pill href="guide/templates/property-binding" title="Property binding"/>
  <docs-pill href="guide/templates/event-binding" title="Event binding"/>
</docs-pill-row>
