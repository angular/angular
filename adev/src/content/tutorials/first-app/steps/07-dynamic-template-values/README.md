# Add an interpolation to a component’s template

This tutorial lesson demonstrates how to add interpolation to Angular templates in order to display dynamic data in a template.

<docs-video src="https://www.youtube.com/embed/eM3zi_n7lNs?si=IFAly3Ss8dwqFx8N&amp;start=338"/>

## What you'll learn

- Your app will display interpolated values in the `HousingLocation` template.
- Your app will render a housing location data to the browser.

## Conceptual preview of interpolation

In this step you will display values (properties and `Input` values) in a template using interpolation.

Using the `{{ expression }}` in Angular templates, you can render values from properties, `Inputs` and valid JavaScript expressions.

For a more in depth explanation, please refer to the [Displaying values with interpolation](guide/templates/binding#render-dynamic-text-with-text-interpolation) guide.

<docs-workflow>

<docs-step title="Update `HousingLocation` template to include interpolated values">
This step adds new HTML structure and interpolated values in the `HousingLocation` template.

In the code editor:

1.  Navigate to `src/app/housing-location/housing-location.ts`
1.  In the template property of the `@Component` decorator, replace the existing HTML markup with the following code:

<docs-code header="Update HousingLocation template" path="adev/src/content/tutorials/first-app/steps/08-ngFor/src/app/housing-location/housing-location.ts" visibleLines="[6,17]"/>

  In this updated template code you have used property binding to bind the `housingLocation.photo` to the `src` attribute. The `alt` attribute uses interpolation to give more context to the alt text of the image.

  You use interpolation to include the values for `name`, `city` and `state` of the `housingLocation` property.

</docs-step>

<docs-step title="Confirm the changes render in the browser">
1.  Save all changes.
1.  Open the browser and confirm that the app renders the photo, city and state sample data.
    <img alt="browser frame of homes-app displaying logo, filter text input box, search button and the same housing location UI card" src="assets/images/tutorials/first-app/homes-app-lesson-07-step-2.png">
</docs-step>

</docs-workflow>

SUMMARY: In this lesson, you added a new HTML structure and used Angular template syntax to render values in the `HousingLocation` template.

Now, you have two important skills:

- passing data to components
- Interpolating values into a template

With these skills, your app can now share data and display dynamic values in the browser. Great work so far.

For more information about the topics covered in this lesson, visit:

<docs-pill-row>
  <docs-pill href="guide/templates" title="Template syntax"/>
  <docs-pill href="guide/templates/binding#render-dynamic-text-with-text-interpolation" title="Displaying values with interpolation"/>
</docs-pill-row>
