# Template syntax

In Angular, a *template* is a chunk of HTML.
Use special syntax within a template to build on many of Angular's features.


## Prerequisites

Before learning template syntax, you should be familiar with the following:

* [Angular concepts](guide/architecture)
* JavaScript
* HTML
* CSS


<!-- Do we still need the following section? It seems more relevant to those coming from AngularJS, which is now 7 versions ago. -->
<!-- You may be familiar with the component/template duality from your experience with model-view-controller (MVC) or model-view-viewmodel (MVVM).
In Angular, the component plays the part of the controller/viewmodel, and the template represents the view. -->

<hr />

Each Angular template in your application is a section of HTML to include as a part of the page that the browser displays.
An Angular HTML template renders a view, or user interface, in the browser, just like regular HTML, but with a lot more functionality.

When you generate an Angular application with the Angular CLI, the `app.component.html` file is the default template containing placeholder HTML.

The template syntax guides show you how to control the UX/UI by coordinating data between the class and the template.

<div class="is-helpful alert">

Most of the Template Syntax guides have dedicated working example applications that demonstrate the individual topic of each guide.
To see all of them working together in one application, see the comprehensive <live-example title="Template Syntax Live Code"></live-example>.

</div>


## Empower your HTML

Extend the HTML vocabulary of your applications With special Angular syntax in your templates.
For example, Angular helps you get and set DOM (Document Object Model) values dynamically with features such as built-in template functions, variables, event listening, and data binding.

Almost all HTML syntax is valid template syntax.
However, because an Angular template is part of an overall webpage, and not the entire page, you don't need to include elements such as `<html>`, `<body>`, or `<base>`, and can focus exclusively on the part of the page you are developing.


<div class="alert is-important">

To eliminate the risk of script injection attacks, Angular does not support the `<script>` element in templates.
Angular ignores the `<script>` tag and outputs a warning to the browser console.
For more information, see the [Security](guide/security) page.

</div>


## More on template syntax

You might also be interested in the following:

* [Interpolation](guide/interpolation)&mdash;learn how to use interpolation and expressions in HTML.
* [Template statements](guide/template-statements)&mdash;respond to events in your templates.
* [Binding syntax](guide/binding-syntax)&mdash;use binding to coordinate values in your application.
* [Property binding](guide/property-binding)&mdash;set properties of target elements or directive `@Input()` decorators.
* [Attribute, class, and style bindings](guide/attribute-binding)&mdash;set the value of attributes, classes, and styles.
* [Event binding](guide/event-binding)&mdash;listen for events and your HTML.
* [Two-way binding](guide/two-way-binding)&mdash;share data between a class and its template.
* [Built-in directives](guide/built-in-directives)&mdash;listen to and modify the behavior and layout of HTML.
* [Template reference variables](guide/template-reference-variables)&mdash;use special variables to reference a DOM element within a template.
* [Inputs and Outputs](guide/inputs-outputs)&mdash;share data between the parent context and child directives or components
* [Template expression operators](guide/template-expression-operators)&mdash;learn about the pipe operator, `|`, and protect against `null` or `undefined` values in your HTML.
* [SVG in templates](guide/svg-in-templates)&mdash;dynamically generate interactive graphics.
