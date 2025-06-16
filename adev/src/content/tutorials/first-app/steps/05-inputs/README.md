# Add an input parameter to the component

This tutorial lesson demonstrates how to create a component `input` and use it to pass data to a component for customization.

<docs-video src="https://www.youtube.com/embed/eM3zi_n7lNs?si=WvRGFSkW_7_zDIFD&amp;start=241"/>

NOTE: This video reflects an older syntax, but the main concepts remain valid.

## What you'll learn

Your app's `HousingLocation` template has a `HousingLocation` property to receive input.

## Conceptual preview of Inputs

[Inputs](api/core/input) allow components to specify data that can be passed to it from a parent component.

In this lesson, you'll define an `input` property in the `HousingLocation` component that enables you to customize the data displayed in the component.

Learn more in the [Accepting data with input properties](guide/components/inputs) and [Custom events with outputs](guide/components/outputs) guides.

<docs-workflow>

<docs-step title="Import the input() function">
In the code editor, import the `input` helper method from `@angular/core` and the `HousingLocation` component.

<docs-code header="Import HousingLocation and Input in housing-location.ts" path="adev/src/content/tutorials/first-app/steps/05-inputs/src/app/housing-location/housing-location.ts" visibleLines="[1]"/>

</docs-step>

<docs-step title="Add the Input property">
Add a required property called `housingLocation` and initialize it using `input.required()` with the type `HousingLocationInfo`.

  <docs-code header="Declare the input property in housing-location.ts" path="adev/src/content/tutorials/first-app/steps/05-inputs/src/app/housing-location/housing-location.ts" visibleLines="[10]"/>

You have to invoked the  `required` method on `input` to indicate that the parent component must provide a value. In our example application, we know this value will always be passed in — this is by design. The `.required()` call ensures that the TypeScript compiler enforces this and treats the property as non-nullable when this component is used in a template.

</docs-step>

</docs-workflow>

SUMMARY: In this lesson, you created a new `input` property. You also used the `.required` method to ensure the signal value is always defined.

<docs-pill-row>
  <docs-pill href="guide/components/inputs" title="Accepting data with input properties"/>
  <docs-pill href="guide/components/outputs" title="Custom events with outputs"/>
</docs-pill-row>
