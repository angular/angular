# Add an input parameter to the component

This tutorial lesson demonstrates how to create a component `@Input()` and use it to pass data to a component for customization.

<docs-video src="https://www.youtube.com/embed/eM3zi_n7lNs?si=WvRGFSkW_7_zDIFD&amp;start=241"/>

## What you'll learn

Your app's `HousingLocationComponent` template has a `HousingLocation` property to receive input.

## Conceptual preview of Inputs

[Inputs](api/core/Input) allow components to share data. The direction of the data sharing is from parent component to child component.

In this lesson, you'll define `@Input()` properties in the `HousingLocationComponent` component which will enable you to customize the data displayed in the component.

Learn more in the [Accepting data with input properties](guide/components/inputs) and [Custom events with outputs](guide/components/outputs) guides.

<docs-workflow>

<docs-step title="Import the Input decorator">
This step imports the `Input` decorator into the class.

In the code editor:

1. Navigate to `src/app/housing-location/housing-location.component.ts`
1. Update the file imports to include `Input` and `HousingLocation`:

    <docs-code header="Import HousingLocationComponent and Input in src/app/housing-location/housing-location.component.ts" path="adev/src/content/tutorials/first-app/steps/06-property-binding/src/app/housing-location/housing-location.component.ts" visibleLines="[1,3]"/>

</docs-step>

<docs-step title="Add the Input property">
1.  In the same file, add a property called `housingLocation` of type `HousingLocation` to the `HousingLocationComponent` class. Add an `!` after the property name and prefix it with the `@Input()` decorator:

    <docs-code header="Add housingLocation property to HousingLocationComponent in src/app/housing-location/housing-location.component.ts" path="adev/src/content/tutorials/first-app/steps/06-property-binding/src/app/housing-location/housing-location.component.ts" visibleLines="[12,14]"/>

    You have to add the `!` because the input is expecting the value to be passed. In this case, there is no default value. In our example application case we know that the value will be passed in - this is by design. The exclamation point is called the non-null assertion operator and it tells the TypeScript compiler that the value of this property won't be null or undefined.

1. Save your changes and confirm the app does not have any errors.

1. Correct any errors before you continue to the next step.
</docs-step>

</docs-workflow>

SUMMARY: In this lesson, you created a new property decorated with the `@Input()` decorator. You also used the non-null assertion operator to notify the compiler that the value of the new property won't be `null` or `undefined`.

<docs-pill-row>
  <docs-pill href="guide/components/inputs" title="Accepting data with input properties"/>
  <docs-pill href="guide/components/outputs" title="Custom events with outputs"/>
</docs-pill-row>
