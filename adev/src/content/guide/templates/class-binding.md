# Class and style binding

Use class and style bindings to add and remove CSS class names from an element's `class` attribute and to set styles dynamically.

## Binding to a single CSS `class`

To create a single class binding, type the following:

`[class.sale]="onSale"`

Angular adds the class when the bound expression, `onSale` is truthy, and it removes the class when the expression is falsy&mdash;with the exception of `undefined`.

## Binding to multiple CSS classes

To bind to multiple classes, type the following:

`[class]="classExpression"`

The expression can be one of:

* A space-delimited string of class names.
* An object with class names as the keys and truthy or falsy expressions as the values.
* An array of class names.

With the object format, Angular adds a class only if its associated value is truthy.

IMPORTANT: With any object-like expression&mdash;such as `object`, `Array`, `Map`, or `Set` &mdash;the identity of the object must change for Angular to update the class list.
Updating the property without changing object identity has no effect.

If there are multiple bindings to the same class name, Angular uses styling precedence to determine which binding to use.

The following table summarizes class binding syntax.

| Binding Type         | Syntax                      | Input Type                                                                  | Example Input Values |
|:---                  |:---                         |:---                                                                         |:---                  |
| Single class binding | `[class.sale]="onSale"`     | <code>boolean &verbar; undefined &verbar; null</code>                       | `true`, `false`                      |
| Multi-class binding  | `[class]="classExpression"` | `string`                                                                    | `"my-class-1 my-class-2 my-class-3"` |
| Multi-class binding  | `[class]="classExpression"` | <code>Record&lt;string, boolean &verbar; undefined &verbar; null&gt;</code> | `{foo: true, bar: false}`            |
| Multi-class binding  | `[class]="classExpression"` | <code>Array&lt;string&gt;</code>                                            | `['foo', 'bar']`                     |

## Binding to a single style

To create a single style binding, use the prefix `style` followed by a dot and the name of the CSS style.

For example, to set the `width` style, type the following:  `[style.width]="width"`

Angular sets the property to the value of the bound expression, which is usually a string. Optionally, you can add a unit extension like `em` or `%`, which requires a number type.

1. To write a style in dash-case, type the following:

    <docs-code language="html">&lt;nav [style.background-color]="expression"&gt;&lt;/nav&gt;</docs-code>

2. To write a style in camelCase, type the following:

    <docs-code language="html">&lt;nav [style.backgroundColor]="expression"&gt;&lt;/nav&gt;</docs-code>

## Binding to multiple styles

To toggle multiple styles, bind to the `[style]` attribute&mdash;for example, `[style]="styleExpression"`.  The `styleExpression` can be one of:

* A string list of styles such as `"width: 100px; height: 100px; background-color: cornflowerblue;"`.
* An object with style names as the keys and style values as the values, such as `{width: '100px', height: '100px', backgroundColor: 'cornflowerblue'}`.

Note that binding an array to `[style]` is not supported.

IMPORTANT: When binding `[style]` to an object expression, the identity of the object must change for Angular to update the class list.
Updating the property without changing object identity has no effect.

### Single and multiple-style binding example

<docs-code path="adev/src/content/examples/attribute-binding/src/app/single-and-multiple-style-binding.component.ts" header="nav-bar.component.ts"/>

If there are multiple bindings to the same style attribute, Angular uses styling precedence to determine which binding to use.

The following table summarizes style binding syntax.

| Binding Type                    | Syntax                      | Input Type                                                                 | Example Input Values |
|:---                             |:---                         |:---                                                                        |:---                  |
| Single style binding            | `[style.width]="width"`     | <code>string &verbar; undefined &verbar; null</code>                       | `"100px"`                           |
| Single style binding with units | `[style.width.px]="width"`  | <code>number &verbar; undefined &verbar; null</code>                       | `100`                               |
| Multi-style binding             | `[style]="styleExpression"` | `string`                                                                   | `"width: 100px; height: 100px"`     |
| Multi-style binding             | `[style]="styleExpression"` | <code>Record&lt;string, string &verbar; undefined &verbar; null&gt;</code> | `{width: '100px', height: '100px'}` |

## Styling precedence

A single HTML element can have its CSS class list and style values bound to multiple sources (for example, host bindings from multiple directives).

## What’s next

<docs-pill-row>
  <docs-pill href="/guide/components/styling" title="Component Styling"/>
  <docs-pill href="/guide/animations" title="Introduction to Angular animations"/>
</docs-pill-row>
