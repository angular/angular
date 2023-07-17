# SVG as templates

You can use SVG files as templates in your Angular applications.
When you use an SVG as the template, you are able to use directives and bindings just like with HTML templates.
Use these features to dynamically generate interactive graphics.

<div class="alert is-helpful">

See the <live-example name="template-syntax"></live-example> for a working example containing the code snippets in this guide.

</div>

## SVG syntax example

The following example shows the syntax for using an SVG as a template.

<code-example header="src/app/svg.component.ts" path="template-syntax/src/app/svg.component.ts"></code-example>

To see property and event binding in action, add the following code to your `svg.component.svg` file:

<code-example header="src/app/svg.component.svg" path="template-syntax/src/app/svg.component.svg"></code-example>

The example given uses a `click()` event binding and the property binding syntax \(`[attr.fill]="fillColor"`\).

<!-- links -->

<!-- external links -->

<!-- end links -->

@reviewed 2022-02-28
