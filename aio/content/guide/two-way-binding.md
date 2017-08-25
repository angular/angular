# Two-way binding `[(...)]`

Two-way binding allows you to both display a data property and update that property when the user makes changes.

## Prerequisites

You should already be familiar with:

* [Binding Syntax](guide/binding-syntax).
* [Property Binding](guide/property-binding).

<hr/>


## Basics of two-way binding
<!-- KW--Why do we say "on the element side"? Should we mention another "side"? -->
On the element side, two-way binding takes a combination of setting a specific element property and listening for an element change event.

Angular offers a special _two-way data binding_ syntax for this purpose, `[(x)]`.
The `[(x)]` syntax combines the brackets
of _[property binding](guide/property-binding)_, `[x]`, with the parentheses of _[event binding](guide/event-binding)_, `(x)`.

Visualize a *banana in a box* to remember that the parentheses go _inside_ the 
brackets: `[( )]` = banana in a box.


The `[(x)]` syntax is easy to demonstrate when the element has a settable property called `x`
and a corresponding event named `xChange`.
Here's a `SizerComponent` that fits the pattern.
It has a `size` value property and a companion `sizeChange` event:

<code-example path="template-syntax/src/app/sizer.component.ts" title="src/app/sizer.component.ts">
</code-example>

The initial `size` is an input value from a property binding.
Clicking the buttons increases or decreases the `size`, within min/max values constraints,
and then raises (_emits_) the `sizeChange` event with the adjusted size.

Here's an example in which the `AppComponent.fontSizePx` is two-way bound to the `SizerComponent`:

<code-example path="template-syntax/src/app/app.component.html" linenums="false" title="src/app/app.component.html (two-way-1)" region="two-way-1">
</code-example>

The `AppComponent.fontSizePx` establishes the initial `SizerComponent.size` value.

<code-example path="template-syntax/src/app/app.component.ts" title="src/app/app.component.ts" region="font-size">
</code-example>

Clicking the buttons updates the `AppComponent.fontSizePx` via the two-way binding.
The revised `AppComponent.fontSizePx` value flows through to the _style_ binding,
making the displayed text bigger or smaller.

The two-way binding syntax is really just syntactic sugar for a _property_ binding and an _event_ binding.
Angular _desugars_ the `SizerComponent` binding into this:

<code-example path="template-syntax/src/app/app.component.html" linenums="false" title="src/app/app.component.html (two-way-2)" region="two-way-2">
</code-example>

The `$event` variable contains the payload of the `SizerComponent.sizeChange` event.
Angular assigns the `$event` value to the `AppComponent.fontSizePx` when the user clicks the buttons.

## Two-way binding in forms

The two-way binding syntax is a great convenience compared to 
separate property and event bindings. It would be convenient to 
use two-way binding with HTML form elements like `<input>` and 
`<select>`. However, no native HTML element follows the `x` 
value and `xChange` event pattern.

For more on how to use two-way binding in forms, see the 
Angular [NgModel](guide/built-in-directives#ngmodel---two-way-binding-with-ngmodel) section of [Built-in Directives](guide/built-in-directives).

<hr />

## More information

You may also like:

* [Built-in Directives](guide/built-in-directives).
* [@Input and @Output Properties](guide/input-output).

