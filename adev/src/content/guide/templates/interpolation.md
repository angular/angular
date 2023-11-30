# Displaying values with interpolation

Interpolation refers to embedding expressions into marked up text. By default, interpolation uses the double curly braces `{{` and `}}` as delimiters.

To illustrate how interpolation works, consider an Angular component that contains a `currentCustomer` variable:

<docs-code path="adev/src/content/examples/interpolation/src/app/app.component.ts" visibleLines="13"/>

Use interpolation to display the value of this variable in the corresponding component template:

<docs-code path="adev/src/content/examples/interpolation/src/app/app.component.html" visibleRegion="interpolation-example1"/>

Angular replaces `currentCustomer` with the string value of the corresponding component property. In this case, the value is `Maria`.

In the following example, Angular evaluates the `title` and `itemImageUrl` properties to display some title text and an image.

<docs-code path="adev/src/content/examples/interpolation/src/app/app.component.html" visibleRegion="component-property"/>

## What's Next

<docs-pill-row>
  <docs-pill href="guide/templates/property-binding" title="Property binding"/>
  <docs-pill href="guide/templates/event-binding" title="Event binding"/>
</docs-pill-row>
