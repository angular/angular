# Add an input parameter to the component

This tutorial lesson demonstrates how to create a component `input` and use it to pass data to a component for customization.

<docs-video src="https://www.youtube.com/embed/eM3zi_n7lNs?si=WvRGFSkW_7_zDIFD&amp;start=241"/>

## What you'll learn
Your app's `HousingLocation` template has a `HousingLocation` property to receive input.

## Conceptual preview of Inputs

[Inputs](api/core/input) allow components to share data. The direction of the data sharing is from parent component to child component.

In this lesson, you'll define an `input` property in the `HousingLocation` component which will enable you to customize the data displayed in the component.

Learn more in the [Accepting data with input properties](guide/components/inputs) and [Custom events with outputs](guide/components/outputs) guides.

<docs-workflow>

<docs-step title="Import the input() function">
This step imports the `input()` function into the class.

In the code editor:

1. Navigate to `src/app/housing-location/housing-location.ts`
1. Update the file imports to include `input` and `HousingLocation`:

    <docs-code header="Import HousingLocation and Input in src/app/housing-location/housing-location.ts" path="adev/src/content/tutorials/first-app/steps/06-property-binding/src/app/housing-location/housing-location.ts" visibleLines="[1,3]"/>

</docs-step>

<docs-step title="Add the Input property">
1.  In the same file, add a property called `housingLocation` and initialize it using `input.required()` with the type `HousingLocationInfo`. To set the type, use a generic parameter, by writing     <code>&lt;HousingLocationInfo&gt;</code> immediately after <code>.required</code>:

    <docs-code header="Import HousingLocation and Input in src/app/housing-location/housing-location.ts" path="adev/src/content/tutorials/first-app/steps/06-property-binding/src/app/housing-location/housing-location.ts" visibleLines="[13,15]"/>

    You have to add `.required` after `input` to indicate that the parent component must provide a value. In our example application, we know this value will always be passed in — this is by design. The `.required()` call ensures that the TypeScript compiler enforces this and treats the property as non-nullable when this component is used in a template.

1. Save your changes and confirm the app does not have any errors.

1. Correct any errors before you continue to the next step.
</docs-step>

</docs-workflow>

SUMMARY: In this lesson, you created a new `input` property. You also used the `.required` method to ensure the signal value is always defined.

<docs-pill-row>
  <docs-pill href="guide/components/inputs" title="Accepting data with input properties"/>
  <docs-pill href="guide/components/outputs" title="Custom events with outputs"/>
</docs-pill-row>
