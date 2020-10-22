# Two-way binding `[(...)]`

Two-way binding gives your app a way to share data between a component class and
its template.

<div class="alert is-helpful">

See the <live-example></live-example> for a working example containing the code snippets in this guide.

</div>

## Basics of two-way binding

Two-way binding does two things:

1. Sets a specific element property.
1. Listens for an element change event.

Angular offers a special _two-way data binding_ syntax for this purpose, `[()]`.
The `[()]` syntax combines the brackets
of property binding, `[]`, with the parentheses of event binding, `()`.

<div class="callout is-important">

<header>
  [( )] = banana in a box
</header>

Visualize a *banana in a box* to remember that the parentheses go _inside_ the brackets.

</div>

The `[()]` syntax is easy to demonstrate when the element has a settable
property called `x` and a corresponding event named `xChange`.
Here's a `SizerComponent` that fits this pattern.
It has a `size` value property and a companion `sizeChange` event:

<code-example path="two-way-binding/src/app/sizer/sizer.component.ts" header="src/app/sizer.component.ts"></code-example>

<code-example path="two-way-binding/src/app/sizer/sizer.component.html" header="src/app/sizer.component.html"></code-example>

The initial `size` is an input value from a property binding.
Clicking the buttons increases or decreases the `size`, within
min/max value constraints,
and then raises, or emits, the `sizeChange` event with the adjusted size.

Here's an example in which the `AppComponent.fontSizePx` is two-way bound to the `SizerComponent`:

<code-example path="two-way-binding/src/app/app.component.html" header="src/app/app.component.html (two-way-1)" region="two-way-1"></code-example>

The `AppComponent.fontSizePx` establishes the initial `SizerComponent.size` value.

<code-example path="two-way-binding/src/app/app.component.ts" header="src/app/app.component.ts" region="font-size"></code-example>

Clicking the buttons updates the `AppComponent.fontSizePx` via the two-way binding.
The revised `AppComponent.fontSizePx` value flows through to the _style_ binding,
making the displayed text bigger or smaller.

The two-way binding syntax is really just syntactic sugar for a _property_ binding and an _event_ binding.
Angular desugars the `SizerComponent` binding into this:

<code-example path="two-way-binding/src/app/app.component.html" header="src/app/app.component.html (two-way-2)" region="two-way-2"></code-example>

The `$event` variable contains the payload of the `SizerComponent.sizeChange` event.
Angular assigns the `$event` value to the `AppComponent.fontSizePx` when the user clicks the buttons.

## Two-way binding in forms

The two-way binding syntax is a great convenience compared to
separate property and event bindings. It would be convenient to
use two-way binding with HTML form elements like `<input>` and
`<select>`. However, no native HTML element follows the `x`
value and `xChange` event pattern.

For more on how to use two-way binding in forms, see
Angular [NgModel](guide/built-in-directives#ngModel).
