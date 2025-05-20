# Add a property binding to a component’s template

This tutorial lesson demonstrates how to add property binding to a template and use it to pass dynamic data to components.

<docs-video src="https://www.youtube.com/embed/eM3zi_n7lNs?si=AsiczpWnMz5HhJqB&amp;start=599"/>

## What you'll learn

* Your app has data bindings in the `Home` template.
* Your app sends data from the `Home` to the `HousingLocation`.

## Conceptual preview of Inputs

In this lesson, you'll continue the process of sharing data from the parent component to the child component by binding data to those properties in the template using property binding.

Property binding enables you to connect a variable to an `Input` in an Angular template. The data is then dynamically bound to the `Input`.

For a more in depth explanation, please refer to the [Property binding](guide/templates/property-binding) guide.

<docs-workflow>

<docs-step title="Update the `Home` template">
This step adds property binding to the `<app-housing-location>` tag.

In the code editor:

1. Navigate to `src/app/home/home.ts`
1. In the template property of the `@Component` decorator, update the code to match the code below:
    <docs-code header="Add housingLocation property binding" path="adev/src/content/tutorials/first-app/steps/07-dynamic-template-values/src/app/home/home.ts" visibleLines="[17,19]"/>

    When adding a property binding to a component tag, we use the `[attribute] = "value"` syntax to notify Angular that the assigned value should be treated as a property from the component class and not a string value.

    The value on the right-hand side is the name of the property from the `Home`.
</docs-step>

<docs-step title="Confirm the code still works">
1.  Save your changes and confirm the app does not have any errors.
1.  Correct any errors before you continue to the next step.
</docs-step>

</docs-workflow>

SUMMARY: In this lesson, you added a new property binding and passed in a reference to a class property. Now, the `HousingLocation` has access to data that it can use to customize the component's display.

For more information about the topics covered in this lesson, visit:

<docs-pill-row>
  <docs-pill href="/guide/templates/property-binding" title="Property binding"/>
</docs-pill-row>
