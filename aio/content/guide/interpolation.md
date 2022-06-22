# Displaying values with interpolation

## Prerequisites

* [Basics of components](guide/architecture-components)
* [Basics of templates](guide/glossary#template)
* [Binding syntax](guide/binding-syntax)

<!--todo: needs a level 2 heading for info below -->

Interpolation refers to embedding expressions into marked up text. By default, interpolation uses the double curly braces `{{` and `}}` as delimiters.

To illustrate how interpolation works, consider an Angular component that contains a `currentCustomer` variable:

<code-example path="interpolation/src/app/app.component.ts" region="customer"></code-example>

Use interpolation to display the value of this variable in the corresponding component template:

<code-example path="interpolation/src/app/app.component.html" region="interpolation-example1"></code-example>

Angular replaces `currentCustomer` with the string value of the corresponding component property. In this case, the value is `Maria`.

In the following example, Angular evaluates the `title` and `itemImageUrl` properties to display some title text and an image.

<code-example path="interpolation/src/app/app.component.html" region="component-property"></code-example>

## What's Next

* [Property binding](guide/property-binding)
* [Event binding](guide/event-binding)

@reviewed 2022-04-14
