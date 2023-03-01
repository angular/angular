# Attribute binding

Attribute binding in Angular helps you set values for attributes directly.
With attribute binding, you can improve accessibility, style your application dynamically, and manage multiple CSS classes or styles simultaneously.

<div class="alert is-helpful">

See the <live-example></live-example> for a working example containing the code snippets in this guide.

</div>

## Prerequisites

* [Property Binding](guide/property-binding)

## Syntax

Attribute binding syntax resembles [property binding](guide/property-binding), but instead of an element property between brackets, you precede the name of the attribute with the prefix `attr`, followed by a dot.
Then, you set the attribute value with an expression that resolves to a string.

<code-example format="html" language="html">

&lt;p [attr.attribute-you-are-targeting]="expression"&gt;&lt;/p&gt;

</code-example>

<div class="alert is-helpful">

When the expression resolves to `null` or `undefined`, Angular removes the attribute altogether.

</div>

## Binding ARIA attributes

One of the primary use cases for attribute binding is to set ARIA attributes.

To bind to an ARIA attribute, type the following:

<code-example header="src/app/app.component.html" path="attribute-binding/src/app/app.component.html" region="attrib-binding-aria"></code-example>

<a id="colspan"></a>

## Binding to `colspan`

Another common use case for attribute binding is with the `colspan` attribute in tables.  Binding to the `colspan` attribute helps you to keep your tables programmatically dynamic.  Depending on the amount of data that your application populates a table with, the number of columns that a row spans could change.

To use attribute binding with the `<td>` attribute `colspan`
1. Specify the `colspan` attribute by using the following syntax: `[attr.colspan]`.
1. Set `[attr.colspan]` equal to an expression.

In the following example, you bind the `colspan` attribute to the expression `1 + 1`.

<code-example header="src/app/app.component.html" path="attribute-binding/src/app/app.component.html" region="colspan"></code-example>

This binding causes the `<tr>` to span two columns.

<div class="alert is-helpful">

Sometimes there are differences between the name of property and an attribute.

`colspan` is an attribute of `<td>`, while `colSpan`  with a capital "S" is a property.
When using attribute binding, use `colspan` with a lowercase "s".

For more information on how to bind to the `colSpan` property, see the [`colspan` and `colSpan`](guide/property-binding#colspan) section of [Property Binding](guide/property-binding).

</div>

## What’s next

* [Class & Style Binding](guide/class-binding)

@reviewed 2022-05-02
