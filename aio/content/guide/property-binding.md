# Property binding

Property binding in Angular helps you set values for properties of HTML elements or directives. Use property binding to do things such as toggle button features, set paths programmatically, and share values between components.

<div class="alert is-helpful">

See the <live-example></live-example> for a working example containing the code snippets in this guide.

</div>

## Prerequisites

* [Basics of components](guide/architecture-components)
* [Basics of templates](guide/glossary#template)
* [Binding syntax](guide/binding-syntax)

## Understanding the flow of data

Property binding moves a value in one direction, from a component's property into a target element property.

<div class="alert is-helpful">

For more information on listening for events, see [Event binding](guide/event-binding).

</div>

To read a target element property or call one of its methods, see the API reference for [ViewChild](api/core/ViewChild) and [ContentChild](api/core/ContentChild).

## Binding to a property

To bind to an element's property, enclose it in square brackets, `[]`, which identifies the property as a target property.

A target property is the DOM property to which you want to assign a value.

To assign a value to a target property for the image element's `src` property, type the following code:

<code-example path="property-binding/src/app/app.component.html" region="property-binding" header="src/app/app.component.html"></code-example>

In most cases, the target name is the name of a property, even when it appears to be the name of an attribute.

In this example, `src` is the name of the `<img>` element property.

<!-- vale Angular.Google_WordListSuggestions = NO -->

The brackets, `[]`, cause Angular to evaluate the right-hand side of the assignment as a dynamic expression.

<!-- vale Angular.Google_WordListSuggestions = NO -->

Without the brackets, Angular treats the right-hand side as a string literal and sets the property to that static value.

To assign a string to a property, type the following code:

<code-example path="property-binding/src/app/app.component.html" region="no-evaluation" header="src/app.component.html"></code-example>

Omitting the brackets renders the string `parentItem`, not the value of `parentItem`.

## Setting an element property to a component property value

To bind the `src` property of an `<img>` element to a component's property, place `src` in square brackets followed by an equal sign and then the property.

Using the property `itemImageUrl`, type the following code:

<code-example path="property-binding/src/app/app.component.html" region="property-binding" header="src/app/app.component.html"></code-example>

Declare the `itemImageUrl` property in the class, in this case `AppComponent`.

<code-example path="property-binding/src/app/app.component.ts" region="item-image" header="src/app/app.component.ts"></code-example>

{@a colspan}

#### `colspan` and `colSpan`

A common point of confusion is between the attribute, `colspan`, and the property, `colSpan`.  Notice that these two names differ by only a single letter.

To use property binding using `colSpan`, type the following:

<code-example path="attribute-binding/src/app/app.component.html" region="colSpan" header="src/app/app.component.html"></code-example>

To disable a button while the component's `isUnchanged` property is `true`, type the following:

<code-example path="property-binding/src/app/app.component.html" region="disabled-button" header="src/app/app.component.html"></code-example>

To set a property of a directive, type the following:

<code-example path="property-binding/src/app/app.component.html" region="class-binding" header="src/app/app.component.html"></code-example>

To set the model property of a custom component for parent and child components to communicate with each other, type the following:

<code-example path="property-binding/src/app/app.component.html" region="model-property-binding" header="src/app/app.component.html"></code-example>

## Toggling button features

<!-- vale Angular.Google_WordListSuggestions = NO -->

To use a Boolean value to disable a button's features, bind the `disabled` DOM attribute to a Boolean property in the class.

<!-- vale Angular.Google_WordListSuggestions = YES -->

<code-example path="property-binding/src/app/app.component.html" region="disabled-button" header="src/app/app.component.html"></code-example>

Because the value of the property `isUnchanged` is `true` in the `AppComponent`, Angular disables the button.

<code-example path="property-binding/src/app/app.component.ts" region="boolean" header="src/app/app.component.ts"></code-example>

## What's next

* [Property binding best practices](guide/property-binding-best-practices)
* [Event binding](guide/event-binding)
* [Text Interpolation](guide/interpolation)
* [Class & Style Binding](guide/class-binding)
* [Attribute Binding](guide/attribute-binding)

@reviewed 2022-04-14
