# Displaying values with interpolation

## Prerequisites

* [Basics of components](guide/architecture-components)
* [Basics of templates](guide/glossary#template)
* [Binding syntax](guide/binding-syntax)

Interpolation refers to embedding expressions into marked up text. By default, interpolation uses the double curly braces {{ and }} as delimiters.

To illustrate how interpolation works, consider an Angular component that contains a currentCustomer variable:

src/app/app.component.ts
content_copy
currentCustomer = 'Maria';
Use interpolation to display the value of this variable in the corresponding component template:

src/app/app.component.html
content_copy
<h3>Current customer: {{ currentCustomer }}</h3>
Angular replaces currentCustomer with the string value of the corresponding component property. In this case, the value is Maria.

In the following example, Angular evaluates the title and itemImageUrl properties to display some title text and an image.

src/app/app.component.html
content_copy
<p>{{title}}</p>
<div><img alt="item" src="{{itemImageUrl}}"></div>

## What's Next

* [Property binding](guide/property-binding)
* [Event binding](guide/event-binding)

@reviewed 2022-04-14
