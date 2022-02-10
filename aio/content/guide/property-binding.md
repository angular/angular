# Property binding

Property binding in Angular helps you set values for properties of HTML elements or directives.  Use property binding to do things such as toggle button functionality, set paths programmatically, and share values between components.

<div class="alert is-helpful">

See the <live-example></live-example> for a working example containing the code snippets in this guide.

</div>

## Prerequisites

To get the most out of property binding, you should be familiar with the following:

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

To bind to an element's property, enclose it in square brackets, '[]', which identifies the property as a target property.

A target property is the DOM property to which you want to assign a value.

1. To assign a value to a target property for the image element's 'src' property, type the following code:

<code-example path="property-binding/src/app/app.component.html" region="property-binding" header="src/app/app.component.html"></code-example>

In most cases, the target name is the name of a property, even when it appears to be the name of an attribute.

In this example, 'src' is the name of the '<img>' element property.

The brackets, '[]', cause Angular to evaluate the right-hand side of the assignment as a dynamic expression.

Without the brackets, Angular treats the right-hand side as a string literal and sets the property to that static value.

2. To assign a string to a property, type the following code:

<code-example path="property-binding/src/app/app.component.html" region="no-evaluation" header="src/app.component.html"></code-example>

Omitting the brackets renders the string 'parentItem', not the value of 'parentItem'.

## Setting an element property to a component property value

To bind the ‘src’ property of an '<img>' element to a component's property, place the target, ‘src', in square brackets followed by an equal sign and then the property.

1. Using the property 'itemImageUrl', type the following code:

<code-example path="property-binding/src/app/app.component.html" region="property-binding" header="src/app/app.component.html"></code-example>

2. Declare the 'itemImageUrl' property in the class, in this case 'AppComponent'.

<code-example path="property-binding/src/app/app.component.ts" region="item-image" header="src/app/app.component.ts"></code-example>

{@a colspan}

#### 'colspan' and 'colSpan'

A common point of confusion is between the attribute, 'colspan', and the property, 'colSpan'.  Notice that these two names differ by only a single letter.

1. To use property binding using colSpan, type the following:

<code-example path="attribute-binding/src/app/app.component.html" region="colSpan" header="src/app/app.component.html"></code-example>

2. To disable a button when the component says that it 'isUnchanged', type the following:

<code-example path="property-binding/src/app/app.component.html" region="disabled-button" header="src/app/app.component.html"></code-example>

3. To set a property of a directive, type the following:

<code-example path="property-binding/src/app/app.component.html" region="class-binding" header="src/app/app.component.html"></code-example>

4. To set the model property of a custom component for parent and child components to communicated, type the following:

<code-example path="property-binding/src/app/app.component.html" region="model-property-binding" header="src/app/app.component.html"></code-example>


## Toggling button functionality

1. To disable a button's functionality depending on a Boolean value, bind the DOM 'disabled' property to a property in the class that is 'true' or 'false'.

<code-example path="property-binding/src/app/app.component.html" region="disabled-button" header="src/app/app.component.html"></code-example>

Because the value of the property 'isUnchanged' is 'true' in the 'AppComponent', Angular disables the button.

<code-example path="property-binding/src/app/app.component.ts" region="boolean" header="src/app/app.component.ts"></code-example>


## Setting a directive property

To set a property of a directive, place the directive within square brackets , such as '[ngClass]', followed by an equal sign and the property.

1. To set the property, ‘classes’, type the following:

<code-example path="property-binding/src/app/app.component.html" region="class-binding" header="src/app/app.component.html"></code-example>

To use the property, you must declare it in the class, which in this example is 'AppComponent'.

2. To set the value of 'classes' as 'special', type the following:

<code-example path="property-binding/src/app/app.component.ts" region="directive-property" header="src/app/app.component.ts"></code-example>

Angular applies the class 'special' to the '<p>' element so that you can use 'special' to apply CSS styles.

## Bind values between components

To set the model property of a custom component, place the target, here 'childItem', between square brackets '[]' followed by an equal sign and the property.

1. To set the property, 'parentItem', type the following:

<code-example path="property-binding/src/app/app.component.html" region="model-property-binding" header="src/app/app.component.html"></code-example>

To use the target and the property, you must declare them in their respective classes.

2. To declare the target of 'childItem' in its component class, in this case 'ItemDetailComponent', type the following:

<code-example path="property-binding/src/app/item-detail/item-detail.component.ts" region="input-type" header="src/app/item-detail/item-detail.component.ts"></code-example>

The code contains an '@Input()' decorator with the 'childItem' property so data can flow into it.

Next, the code declares the property of 'parentItem' in its component class, in this case 'AppComponent'. In this example the type of 'childItem' is 'string', so 'parentItem' needs to be a string.

3. Type the code below.  The 'parentItem' has the string value of 'lamp'.

<code-example path="property-binding/src/app/app.component.ts" region="parent-data-type" header="src/app/app.component.ts"></code-example>

With this configuration, the view of '<app-item-detail>' uses the value of 'lamp' for 'childItem'.

## What's next

* [Property binding best practices](guide/property-binding-best-practices)

@reviewed 2022-02-10
