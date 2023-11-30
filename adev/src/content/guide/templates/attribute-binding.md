# Attribute binding

Attribute binding in Angular helps you set values for attributes directly.
With attribute binding, you can improve accessibility, style your application dynamically, and manage multiple CSS classes or styles simultaneously.

## Syntax

Attribute binding syntax resembles [property binding](guide/templates/property-binding), but instead of an element property between brackets, you precede the name of the attribute with the prefix `attr`, followed by a dot.
Then, you set the attribute value with an expression that resolves to a string.

<docs-code language="html">

&lt;p [attr.attribute-you-are-targeting]="expression"&gt;&lt;/p&gt;

</docs-code>

HELPFUL: When the expression resolves to `null` or `undefined`, Angular removes the attribute altogether.

## Binding ARIA attributes

One of the primary use cases for attribute binding is to set ARIA attributes.

To bind to an ARIA attribute, type the following:

<docs-code header="src/app/app.component.html" path="adev/src/content/examples/attribute-binding/src/app/app.component.html" visibleRegion="attrib-binding-aria"/>

## Binding to `colspan`

Another common use case for attribute binding is with the `colspan` attribute in tables.  Binding to the `colspan` attribute helps you to keep your tables programmatically dynamic.  Depending on the amount of data that your application populates a table with, the number of columns that a row spans could change.

To use attribute binding with the `<td>` attribute `colspan`

1. Specify the `colspan` attribute by using the following syntax: `[attr.colspan]`.
1. Set `[attr.colspan]` equal to an expression.

In the following example, you bind the `colspan` attribute to the expression `1 + 1`.

<docs-code header="src/app/app.component.html" path="adev/src/content/examples/attribute-binding/src/app/app.component.html" visibleRegion="colspan"/>

This binding causes the `<tr>` to span two columns.

HELPFUL: Sometimes there are differences between the name of property and an attribute.

`colspan` is an attribute of `<td>`, while `colSpan`  with a capital "S" is a property.
When using attribute binding, use `colspan` with a lowercase "s".

For more information on how to bind to the `colSpan` property, see the [`colspan` and `colSpan`](guide/templates/property-binding#colspan-and-colspan) section of [Property Binding](guide/templates/property-binding).

## What’s next

<docs-pill-row>
  <docs-pill href="guide/templates/class-binding" title="Class & Style Binding"/>
</docs-pill-row>
