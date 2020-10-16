# SVG in templates

It is possible to use SVG as valid templates in Angular. All of the template syntax below is
applicable to both SVG and HTML. Learn more in the SVG [1.1](https://www.w3.org/TR/SVG11/) and
[2.0](https://www.w3.org/TR/SVG2/) specifications.

<div class="alert is-helpful">

See the <live-example name="template-syntax"></live-example> for a working example containing the code snippets in this guide.

</div>

Why would you use SVG as template, instead of simply adding it as image to your application?

When you use an SVG as the template, you are able to use directives and bindings just like with HTML
templates. This means that you will be able to dynamically generate interactive graphics.

Refer to the sample code snippet below for a syntax example:

<code-example path="template-syntax/src/app/svg.component.ts" header="src/app/svg.component.ts"></code-example>

Add the following code to your `svg.component.svg` file:

<code-example path="template-syntax/src/app/svg.component.svg" header="src/app/svg.component.svg"></code-example>

Here you can see the use of a `click()` event binding and the property binding syntax
(`[attr.fill]="fillColor"`).
