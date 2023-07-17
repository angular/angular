# Understanding binding

In an Angular template, a binding creates a live connection between a part of the UI created from a template (a DOM element, directive, or component) and the model (the component instance to which the template belongs). This connection can be used to synchronize the view with the model, to notify the model when an event or user action takes place in the view, or both. Angular's [Change Detection](guide/change-detection) algorithm is responsible for keeping the view and the model in sync.

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
* New [template expression operators](guide/template-expression-operators), such as `|`

## Expression context

Interpolated expressions have a context&mdash;a particular part of the application to which the expression belongs.  Typically, this context is the component instance.

In the following snippet, the expression `recommended` and the expression `itemImageUrl2` refer to properties of the `AppComponent`.

<code-example path="interpolation/src/app/app.component.html" region="component-context" header="src/app/app.component.html"></code-example>

An expression can also refer to properties of the _template's_ context such as a [template input variable](guide/structural-directives#shorthand) or a [template reference variable](guide/template-reference-variables).

The following example uses a template input variable of `customer`.

<code-example path="interpolation/src/app/app.component.html" region="template-input-variable" header="src/app/app.component.html (template input variable)"></code-example>

This next example features a template reference variable, `#customerInput`.

<code-example path="interpolation/src/app/app.component.html" region="template-reference-variable" header="src/app/app.component.html (template reference variable)"></code-example>

<div class="alert is-helpful">

Template expressions cannot refer to anything in the global namespace, except `undefined`.  They can't refer to `window` or `document`.  Additionally, they can't call `console.log()` or `Math.max()` and are restricted to referencing members of the expression context.

</div>

### Preventing name collisions

The context against which an expression evaluates is the union of the template variables, the directive's context object&mdash;if it has one&mdash;and the component's members.
If you reference a name that belongs to more than one of these namespaces, Angular applies the following precedence logic to determine the context:

1. The template variable name.
1. A name in the directive's context.
1. The component's member names.

To avoid variables shadowing variables in another context, keep variable names unique.
In the following example, the `AppComponent` template greets the `customer`, Padma.

An `ngFor` then lists each `customer` in the `customers` array.

<code-example path="interpolation/src/app/app.component.1.ts" region="var-collision" header="src/app/app.component.ts"></code-example>

The `customer` within the `ngFor` is in the context of an `<ng-template>` and so refers to the `customer` in the `customers` array, in this case Ebony and Chiho.
This list does not feature Padma because `customer` outside of the `ngFor` is in a different context.
Conversely, `customer` in the `<h1>` doesn't include Ebony or Chiho because the context for this `customer` is the class and the class value for `customer` is Padma.

## Expression best practices

When using a template expression, follow these best practices:

* **Use short expressions**

Use property names or method calls whenever possible.  Keep application and business logic in the component, where it is accessible to develop and test.

* **Quick execution**

Angular executes a template expression after every [change detection](guide/glossary#change-detection) cycle.  Many asynchronous activities trigger change detection cycles, such as promise resolutions, HTTP results, timer events, key presses, and mouse moves.

An expression should finish quickly to keep the user experience as efficient as possible, especially on slower devices.  Consider caching values when their computation requires greater resources.

## No visible side effects

According to Angular's [unidirectional data flow model](guide/glossary#unidirectional-data-flow), a template expression should not change any application state other than the value of the target property.  Reading a component value should not change some other displayed value.  The view should be stable throughout a single rendering pass.

  <div class="callout is-important">
    <header>Idempotent expressions reduce side effects</header>

An [idempotent](https://en.wikipedia.org/wiki/Idempotence) expression is free of side effects and improves Angular's change detection performance.  In Angular terms, an idempotent expression always returns *exactly the same thing* until one of its dependent values changes.

Dependent values should not change during a single turn of the event loop.  If an idempotent expression returns a string or a number, it returns the same string or number if you call it twice consecutively.  If the expression returns an object, including an `array`, it returns the same object *reference* if you call it twice consecutively.

  </div>

 ## What's next

* [Property binding](guide/property-binding)
* [Event binding](guide/event-binding)

@reviewed 2022-05-12
