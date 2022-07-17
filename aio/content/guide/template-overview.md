# Understanding templates

In Angular, a template is a blueprint for a fragment of a user interface (UI).  Templates are written in HTML, and special syntax can be used within a template to build on many of Angular's features.

## Prerequisites

Before learning template syntax, you should be familiar with the following:

* [Angular concepts](guide/architecture)
* JavaScript
* HTML
* CSS

## Enhancing HTML

Angular extends the HTML syntax in your templates with additional functionality.  
For example, Angular’s data binding syntax helps to set Document Object Model (DOM) properties dynamically.

Almost all HTML syntax is valid template syntax.  However, because an Angular template is only a fragment of the UI, it does not include elements such as `<html>`, `<body>`, or `<base>`.

<div class="alert is-important">

To eliminate the risk of script injection attacks, Angular does not support the `<script>` element in templates.  Angular ignores the `<script>` tag and outputs a warning to the browser console.
For more information, see the [Security](guide/security) page.

</div>

## More on template syntax

You might also be interested in the following:

<div class="card-container">
    <a href="guide/interpolation" class="docs-card" title="Interpolation">
        <section>Interpolation</section>
        <p>Learn how to use interpolation and expressions in HTML.</p>
        <p class="card-footer">Interpolation</p>
    </a>
    <a href="guide/property-binding" class="docs-card" title="Property binding">
        <section>Property binding</section>
        <p>Set properties of target elements or directive @Input() decorators.</p>
        <p class="card-footer">Property binding</p>
    </a>
    <a href="guide/attribute-binding" class="docs-card" title="Attribute binding">
        <section>Attribute binding</section>
        <p>Set the value of attributes.</p>
        <p class="card-footer">Attribute binding</p>
    </a>
    <a href="guide/class-binding" class="docs-card" title="Class and style binding">
        <section>Class and style binding</section>
        <p>Set the value of class and style.</p>
        <p class="card-footer">Class and style binding</p>
    </a>
    <a href="guide/event-binding" class="docs-card" title="Event binding">
        <section>Event binding</section>
        <p>Listen for events and your HTML.</p>
        <p class="card-footer">Event binding</p>
    </a>
    <a href="guide/template-reference-variables" class="docs-card" title="Template reference variables">
        <section>Template reference variables</section>
        <p>Use special variables to reference a DOM element within a template.</p>
        <p class="card-footer">Template reference variables</p>
    </a>
    <a href="guide/built-in-directives" class="docs-card" title="Built-in directives">
        <section>Built-in directives</section>
        <p>Listen to and modify the behavior and layout of HTML.</p>
        <p class="card-footer">Built-in directives</p>
    </a>
    <a href="guide/inputs-outputs" class="docs-card" title="Inputs and Outputs">
        <section>Inputs and Outputs</section>
        <p>Share data between the parent context and child directives or components.</p>
        <p class="card-footer">Inputs and Outputs</p>
    </a>
</div>

@reviewed 2022-05-11
 