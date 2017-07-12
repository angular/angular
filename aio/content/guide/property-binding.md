
# Property binding `[property]`

Property binding lets you set the value of a target element.

## Prerequisites

You should already be familiar with:

* [Binding Syntax](guide/binding-syntax).

<hr/>

## One-way in

You can think of property binding as *one-way data binding* because it flows a value in one direction,
from a component's data property into a target element property.

You use property binding to _set_ values of target elements. You can't use property binding to read or pull values out of target elements. Similarly, you cannot use property binding to *call* a method on the target element.
If the element raises events, you can listen to them with an [event binding](guide/event-binding).

If you must read a target element property or call one of its methods,
see the API reference for
[ViewChild](api/core/ViewChild) and
[ContentChild](api/core/ContentChild).

## Examples

The most common property binding sets an element property to a component property value. An example is
binding the `src` property of an image element to a component's `itemImageUrl` property:

```html
<img [src]="itemImageUrl">
```
<!-- 
<code-example path="template-syntax/src/app/app.component.html" region="property-binding-1" title="src/app/app.component.html" linenums="false">
</code-example> -->

Another example is disabling a button when the component says that it `isUnchanged`:

<code-example path="template-syntax/src/app/app.component.html" region="property-binding-2" title="src/app/app.component.html" linenums="false">
</code-example>

Another is setting a property of a directive:

<code-example path="template-syntax/src/app/app.component.html" region="property-binding-3" title="src/app/app.component.html" linenums="false">
</code-example>

Yet another is setting the model property of a custom component&mdash;a great way
for parent and child components to communicate:

```html
<item-detail [item]="currentItem"></item-detail>
```

<!-- <code-example path="template-syntax/src/app/app.component.html" region="property-binding-4" title="src/app/app.component.html" linenums="false">
</code-example> -->

## Binding target

An element property between enclosing square brackets identifies the target property.
The target property in the following code is the image element's `src` property.

```html
<img [src]="itemImageUrl">
```

<!-- <code-example path="template-syntax/src/app/app.component.html" region="property-binding-1" title="src/app/app.component.html" linenums="false">
</code-example> -->

Some people prefer the `bind-` prefix alternative, known as the *canonical form*:

```html
<img bind-src="itemImageUrl">
```
<!-- 
<code-example path="template-syntax/src/app/app.component.html" region="property-binding-5" title="src/app/app.component.html" linenums="false">
</code-example> -->

The target name is always the name of a property, even when it appears to be the name of an attribute. 
So in this case, `src` is the name of the image element property.

Element properties may be the more common targets,
but Angular looks first to see if the name is a property of a known directive,
as it is in the following example:

<code-example path="template-syntax/src/app/app.component.html" region="property-binding-3" title="src/app/app.component.html" linenums="false">
</code-example>

Technically, Angular is matching the name to a directive [input](guide/input-output),
one of the property names listed in the directive's `inputs` array or a property decorated with `@Input()`.
Such inputs map to the directive's own properties.

If the name fails to match a property of a known directive or element, Angular reports an “unknown directive” error.

## Avoid side effects

Evaluation of a template expression should have no visible side effects.
The expression language itself, or the way you write template expressions, 
helps to a certain extent;
you can't assign a value to anything in a property binding expression nor use the increment and decrement operators.

For example, you could have an expression that invoked a property or method that had 
side effects. The expression could call something like `getFoo()` where only you 
know what `getFoo()` does. If `getFoo()` changes something 
and you happen to be binding to that something, 
Angular may or may not display the changed value. Angular may detect the change and throw a warning error.
As a best practice, stick to data properties and to methods that return values and avoid side effects.

## Return the proper type

The template expression should evaluate to the type of value 
that the target property expects.
Return a string if the target property expects a string, a number if it 
expects a number, an object if it expects an object, and so on.

In the following example, the `item` property of the `ItemDetail` component expects an `Item` object, which is exactly what you're sending in the property binding:

```html
<item-detail [item]="currentItem"></item-detail>
```
<!-- 
<code-example path="template-syntax/src/app/app.component.html" region="property-binding-4" title="src/app/app.component.html" linenums="false">
</code-example> -->

## Remember the brackets

The brackets tell Angular to evaluate the template expression.
If you omit the brackets, Angular treats the string as a constant
and *initializes the target property* with that string instead of
evaluating the string:

```html
<!-- ERROR: ItemDetailComponent.item expects an
     Item object, not the string "currentItem" -->
  <item-detail item="currentItem"></item-detail>
```

<!-- <code-example path="template-syntax/src/app/app.component.html" region="property-binding-6" title="src/app/app.component.html" linenums="false">
</code-example> -->

## One-time string initialization

You *should* omit the brackets when all of the following are true:

* The target property accepts a string value.
* The string is a fixed value that you can bake into the template.
* This initial value never changes.

You routinely initialize attributes this way in standard HTML, and it works
just as well for directive and component property initialization.
The following example initializes the `prefix` property of the `ItemDetailComponent` to a fixed string,
not a template expression. Angular sets it and forgets about it.

```html
<item-detail prefix="Your current item is" [item]="currentItem"></item-detail>
```
<!-- <code-example path="template-syntax/src/app/app.component.html" region="property-binding-7" title="src/app/app.component.html" linenums="false">
</code-example> -->

The `[item]` binding, on the other hand, remains a live binding to the component's `currentItem` property.

## Property binding vs. interpolation

You often have a choice between interpolation and property binding.
The following binding pairs do the same thing:

```html
<p><img src="{{itemImageUrl}}"> is the <i>interpolated</i> image.</p>
<p><img [src]="itemImageUrl"> is the <i>property bound</i> image.</p>

<p><span>"{{title}}" is the <i>interpolated</i> title.</span></p>
<p>"<span [innerHTML]="title"></span>" is the <i>property bound</i> title.</p>
```


<!-- <code-example path="template-syntax/src/app/app.component.html" region="property-binding-vs-interpolation" title="src/app/app.component.html" linenums="false">
</code-example> -->

Interpolation is a convenient alternative to property binding in many cases. When rendering data values as strings, there is no technical reason to prefer one form to the other, though readability tends to favor interpolation. However, when setting an element property to a non-string data value, you must use _property binding_.

## Content security

Imagine the following malicious content.

<code-example path="template-syntax/src/app/app.component.ts" region="evil-title" title="src/app/app.component.ts" linenums="false">
</code-example>

Fortunately, Angular data binding is on alert for dangerous HTML.
It [*sanitizes*](guide/security#sanitization-and-security-contexts) the values before displaying them.
It **will not** allow HTML with script tags to leak into the browser, neither with interpolation
nor property binding.

<code-example path="template-syntax/src/app/app.component.html" region="property-binding-vs-interpolation-sanitization" title="src/app/app.component.html" linenums="false">
</code-example>

Interpolation handles the script tags differently than property binding but both approaches render the
content harmlessly. The following is the output of the `evilTitle` examples.


<figure>
  <img src='generated/images/guide/template-syntax/evil-title.png' alt="evil title made safe">
</figure>


<hr />

## More information

You may also like:

* [Two-way Binding](guide/two-way-binding).
* [Event Binding](guide/event-binding).
* [Attribute, Class, and Style Bindings](guide/attribute-class-style-bindings).



