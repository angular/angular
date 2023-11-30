# SVG as templates

You can use SVG files as templates in your Angular applications.
When you use an SVG as the template, you are able to use directives and bindings just like with HTML templates.
Use these features to dynamically generate interactive graphics.

## SVG syntax example

The following example shows the syntax for using an SVG as a template.

<docs-code header="src/app/svg.component.ts" path="adev/src/content/examples/template-syntax/src/app/svg.component.ts"/>

To see property and event binding in action, add the following code to your `svg.component.svg` file:

<docs-code header="src/app/svg.component.svg" path="adev/src/content/examples/template-syntax/src/app/svg.component.svg"/>

The example given uses a `click()` event binding and the property binding syntax \(`[attr.fill]="fillColor"`\).
