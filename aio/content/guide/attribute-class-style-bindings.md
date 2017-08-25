# Attribute, class, and style bindings

The template syntax provides specialized one-way bindings for scenarios less well suited to property binding.

## Prerequisites

You should already be familiar with:

* [Binding Syntax](guide/binding-syntax).
* [Property Binding](guide/property-binding).

<hr/>

## Attribute binding

You can set the value of an attribute directly with an **attribute binding**. This is the only exception to the rule that a binding sets a target property and the only binding that creates and sets an attribute.

Usually, setting an element property with a [property binding](guide/property-binding)
is preferable to setting the attribute with a string. However, sometimes 
there is no element property to bind, so attribute binding is the solution.

Consider the [ARIA](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA),
[SVG](https://developer.mozilla.org/en-US/docs/Web/SVG), and
table span attributes. They are purely attributes, don't correspond to element properties, and don't set element properties. In these cases, there are no property targets to bind to.

For example, if you wrote something like this:

<code-example language="html">
  &lt;tr&gt;&lt;td colspan="{{1 + 1}}"&gt;Three-Four&lt;/td&gt;&lt;/tr&gt;
</code-example>

You'd get this error:

<code-example format="nocode">
  Template parse errors:
  Can't bind to 'colspan' since it isn't a known native property
</code-example>

As the message says, the `<td>` element does not have a `colspan` property.
It has the "colspan" *attribute*, and
interpolation and property binding can set only *properties*, not attributes.

Attribute bindings allow you to create and bind to such attributes.

Attribute binding syntax resembles property binding, but
instead of an element property between brackets, start with the prefix **`attr`**,
followed by a dot (`.`), and the name of the attribute.
You then set the attribute value, using an expression that resolves to a string.

Bind `[attr.colspan]` to a calculated value:

<code-example path="template-syntax/src/app/app.component.html" region="attrib-binding-colspan" title="src/app/app.component.html" linenums="false">
</code-example>

Here's how the table renders:

<table border="1px">
  <tr><td colspan="2">One-Two</td></tr>
  <tr><td>Five</td><td>Six</td></tr>
 </table>

One of the primary use cases for attribute binding
is to set ARIA attributes, as in this example:

<code-example path="template-syntax/src/app/app.component.html" region="attrib-binding-aria" title="src/app/app.component.html" linenums="false">
</code-example>

<hr/>

## Class binding

You can add and remove CSS class names from an element's `class` attribute with
a **class binding**.

Here's how to set the attribute without binding in plain HTML:

```html
<!-- standard class attribute setting -->
<div class="item clearance special">Item clearance special</div>
```
<!-- <code-example path="template-syntax/src/app/app.component.html" region="class-binding-1" title="src/app/app.component.html" linenums="false">
</code-example> -->

Class binding syntax resembles property binding, but instead of an element property between brackets, start with the prefix `class`,
optionally followed by a dot (`.`) and the name of a CSS class: `[class.class-name]`.


<!-- The following examples show how to add and remove the application's "special" class
with class bindings.  -->
You can replace that with a binding to a string of the desired class names; this is an all-or-nothing, replacement binding.
 ```html
<!-- reset/override all class names with a binding -->
<div class="item clearance special"
     [class]="itemClearance">Item clearance</div>
``` 

 <!-- <code-example path="template-syntax/src/app/app.component.html" region="class-binding-2" title="src/app/app.component.html" linenums="false">
</code-example>  -->

Finally, you can bind to a specific class name.
Angular adds the class when the template expression evaluates to truthy.
It removes the class when the expression is falsy.

<code-example path="template-syntax/src/app/app.component.html" region="class-binding-3" title="src/app/app.component.html" linenums="false">
</code-example>

While this is a fine way to toggle a single class name,
consider the [NgClass directive](guide/built-in-directives#ngclass) when 
managing multiple class names at the same time.


<hr/>

## Style binding

You can set inline styles with a **style binding**.

Style binding syntax resembles property binding.
Instead of an element property between brackets, start with the prefix `style`,
followed by a dot (`.`) and the name of a CSS style property: `[style.style-property]`.

<code-example path="template-syntax/src/app/app.component.html" region="style-binding-1" title="src/app/app.component.html" linenums="false">
</code-example>

Some style binding styles have a unit extension.
The following example conditionally sets the font size in  “em” and “%” units .

<code-example path="template-syntax/src/app/app.component.html" region="style-binding-2" title="src/app/app.component.html" linenums="false">
</code-example>

While this is a fine way to set a single style, consider 
the [NgStyle directive](guide/built-in-directives#ngstyle) when setting several inline styles at the same time.

Note that a _style property_ name can be written in either
[dash-case](guide/glossary#dash-case), as shown above, or
[camelCase](guide/glossary#camelcase), such as `fontSize`.

<hr/>

## More information

You may also like:

* [Two-way Binding](guide/two-way-binding).
* [Event Binding](guide/event-binding).
* [Built-in Directives](guide/built-in-directives).

