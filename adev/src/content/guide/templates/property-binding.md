# Property binding

Property binding in Angular helps you set values for properties of HTML elements or directives. Use property binding to do things such as toggle button features, set paths programmatically, and share values between components.

## Understanding the flow of data

Property binding moves a value in one direction, from a component's property into a target element property.

To read a target element property or call one of its methods, see the API reference for [ViewChild](api/core/ViewChild) and [ContentChild](api/core/ContentChild).

## Binding to a property

HELPFUL: For information on listening for events, see [Event binding](guide/templates/event-binding).

To bind to an element's property, enclose it in square brackets, `[]`, which identifies the property as a target property.

A target property is the DOM property to which you want to assign a value.

To assign a string to a component's property (such as the `childItem` of the `ItemDetailComponent`), you use the same bracket assignment notation:

<docs-code path="adev/src/content/examples/property-binding/src/app/app.component.html" visibleRegion="property-binding" header="src/app/app.component.html"/>

In most cases, the target name is the name of a property, even when it appears to be the name of an attribute.

In this example, `src` is the name of the `<img>` element property.

<!-- vale Angular.Google_WordListSuggestions = NO -->

The brackets, `[]`, cause Angular to evaluate the right-hand side of the assignment as a dynamic expression.

<!-- vale Angular.Google_WordListSuggestions = NO -->

Without the brackets, Angular treats the right-hand side as a string literal and sets the property to that static value.

To assign a string to a property, type the following code:

<docs-code path="adev/src/content/examples/property-binding/src/app/app.component.html" visibleRegion="no-evaluation" header="src/app.component.html"/>

Omitting the brackets renders the string `parentItem`, not the value of `parentItem`.

## Setting an element property to a component property value

To bind the `src` property of an `<img>` element to a component's property, place `src` in square brackets followed by an equal sign and then the property.

Using the property `itemImageUrl`, type the following code:

<docs-code path="adev/src/content/examples/property-binding/src/app/app.component.html" visibleRegion="property-binding" header="src/app/app.component.html"/>

Declare the `itemImageUrl` property in the class, in this case `AppComponent`.

<docs-code path="adev/src/content/examples/property-binding/src/app/app.component.ts" visibleRegion="item-image" header="src/app/app.component.ts"/>

### `colspan` and `colSpan`

A common point of confusion is between the attribute, `colspan`, and the property, `colSpan`.  Notice that these two names differ by only a single letter.

To use property binding using `colSpan`, type the following:

<docs-code path="adev/src/content/examples/attribute-binding/src/app/app.component.html" visibleRegion="colSpan" header="src/app/app.component.html"/>

To disable a button while the component's `isUnchanged` property is `true`, type the following:

<docs-code path="adev/src/content/examples/property-binding/src/app/app.component.html" visibleRegion="disabled-button" header="src/app/app.component.html"/>

To set a property of a directive, type the following:

<docs-code path="adev/src/content/examples/property-binding/src/app/app.component.html" visibleRegion="class-binding" header="src/app/app.component.html"/>

To set the model property of a custom component for parent and child components to communicate with each other, type the following:

<docs-code path="adev/src/content/examples/property-binding/src/app/app.component.html" visibleRegion="model-property-binding" header="src/app/app.component.html"/>

## Toggling button features

<!-- vale Angular.Google_WordListSuggestions = NO -->

To use a Boolean value to disable a button's features, bind the `disabled` DOM attribute to a Boolean property in the class.

<!-- vale Angular.Google_WordListSuggestions = YES -->

<docs-code path="adev/src/content/examples/property-binding/src/app/app.component.html" visibleRegion="disabled-button" header="src/app/app.component.html"/>

Because the value of the property `isUnchanged` is `true` in the `AppComponent`, Angular disables the button.

<docs-code path="adev/src/content/examples/property-binding/src/app/app.component.ts" visibleRegion="boolean" header="src/app/app.component.ts"/>

## What's next

<docs-pill-row>
  <docs-pill href="guide/templates/property-binding-best-practices" title="Property binding best practices"/>
  <docs-pill href="guide/templates/event-binding" title="Event binding"/>
  <docs-pill href="guide/templates/interpolation" title="Text Interpolation"/>
  <docs-pill href="guide/templates/class-binding" title="Class & Style Binding"/>
  <docs-pill href="guide/templates/attribute-binding" title="Attribute Binding"/>
</docs-pill-row>
