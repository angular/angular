# Class and style binding

Use class and style bindings to add and remove CSS class names from an element's `class` attribute and to set styles dynamically.

## Prerequisites

* Property binding

## Binding to a single CSS `class`

To create a single class binding, type the following:

[class.sale]="onSale"

Angular adds the class when the bound expression, `onSale` is truthy, and it removes the class when the expression is falsy&mdash;with the exception of `undefined`.  See [styling delegation](guide/style-precedence#styling-delegation) for more information.

## Binding to multiple CSS classes

To bind to multiple classes, type the following:

[class]="classExpression"

The expression can be one of:

* A space-delimited string of class names.
* An object with class names as the keys and truthy or falsy expressions as the values.
* An array of class names.

With the object format, Angular adds a class only if its associated value is truthy.

<div class="alert is-important">

With any object-like expression&mdash;such as `object`, `Array`, `Map`, or `Set`&mdash;the identity of the object must change for Angular to update the class list.
Updating the property without changing object identity has no effect.

</div>

If there are multiple bindings to the same class name, Angular uses [styling precedence](guide/style-precedence) to determine which binding to use.

The following table summarizes class binding syntax.

<style>
  td, th {vertical-align: top}
</style>

<table width="100%">
  <col width="15%">
  </col>
  <col width="20%">
  </col>
  <col width="35%">
  </col>
  <col width="30%">
  </col>
  <tr>
    <th>
      Binding Type
    </th>
    <th>
      Syntax
    </th>
    <th>
      Input Type
    </th>
    <th>
      Example Input Values
    </th>
  </tr>
  <tr>
    <td>Single class binding</td>
    <td><code>[class.sale]="onSale"</code></td>
    <td><code>boolean | undefined | null</code></td>
    <td><code>true</code>, <code>false</code></td>
  </tr>
  <tr>
    <td rowspan=3>Multi-class binding</td>
    <td rowspan=3><code>[class]="classExpression"</code></td>
    <td><code>string</code></td>
    <td><code>"my-class-1 my-class-2 my-class-3"</code></td>
  </tr>
  <tr>
    <td><code>Record&lt;string, boolean | undefined | null&gt;</code></td>
    <td><code>{foo: true, bar: false}</code></td>
  </tr>
  <tr>
    <td><code>Array</code><<code>string</code>></td>
    <td><code>['foo', 'bar']</code></td>
  </tr>
</table>

## Binding to a single style

To create a single style binding, use the prefix `style` followed by a dot and the name of the CSS style.

For example, set the ‘width’ style, type the following:  `[style.width]="width"`

Angular sets the property to the value of the bound expression, which is usually a string.  Optionally, you can add a unit extension like `em` or `%`, which requires a number type.

<div class="alert is-helpful">

To write a style in dash-case, type the following:

<code-example language="html">
    &lt;nav [style.background-color]="expression"&gt;&lt;/nav&gt;

To write a style in camelCase, type the following:

  &lt;nav [style.backgroundColor]="expression"&gt;&lt;/nav&gt;
</code-example>

</div>

## Binding to multiple styles

To toggle multiple styles, bind to the `[style]` attribute&mdash;for example, `[style]="styleExpression"`.  The `styleExpression` can be one of:

* A string list of styles such as `"width: 100px; height: 100px; background-color: cornflowerblue;"`.
* An object with style names as the keys and style values as the values, such as `{width: '100px', height: '100px', backgroundColor: 'cornflowerblue'}`.

Note that binding an array to `[style]` is not supported.

<div class="alert is-important">

When binding `[style]` to an object expression, the identity of the object must change for Angular to update the class list.
Updating the property without changing object identity has no effect.

</div>

### Single and multiple-style binding example

<code-example path="attribute-binding/src/app/single-and-multiple-style-binding.component.ts" header="nav-bar.component.ts">
</code-example>

If there are multiple bindings to the same style attribute, Angular uses [styling precedence](guide/style-precedence) to determine which binding to use.

The following table summarizes style binding syntax.

<style>
  td, th {vertical-align: top}
</style>

<table width="100%">
  <col width="15%">
  </col>
  <col width="20%">
  </col>
  <col width="35%">
  </col>
  <col width="30%">
  </col>
  <tr>
    <th>
      Binding Type
    </th>
    <th>
      Syntax
    </th>
    <th>
      Input Type
    </th>
    <th>
      Example Input Values
    </th>
  </tr>
  <tr>
    <td>Single style binding</td>
    <td><code>[style.width]="width"</code></td>
    <td><code>string | undefined | null</code></td>
    <td><code>"100px"</code></td>
  </tr>
  <tr>
  <tr>
    <td>Single style binding with units</td>
    <td><code>[style.width.px]="width"</code></td>
    <td><code>number | undefined | null</code></td>
    <td><code>100</code></td>
  </tr>
    <tr>
    <td rowspan=2>Multi-style binding</td>
    <td rowspan=2><code>[style]="styleExpression"</code></td>
    <td><code>string</code></td>
    <td><code>"width: 100px; height: 100px"</code></td>
  </tr>
  <tr>
    <td><code>Record&lt;string, string | undefined | null&gt;</code></td>
    <td><code>{width: '100px', height: '100px'}</code></td>
  </tr>
</table>

<div class="alert is-helpful">

</div>

{@a styling-precedence}
## Styling precedence

A single HTML element can have its CSS class list and style values bound to multiple sources (for example, host bindings from multiple directives).

TBD - insert link to Understanding binding, Binding to style attributes section

## What’s next

Component styles(https://angular.io/guide/component-styles)
Introduction to Angular animations(https://angular.io/guide/animations)

@reviewed 2022-03-24
