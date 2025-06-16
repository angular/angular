# Use @for to list objects in component

This tutorial lesson demonstrates how to use `@for` block in Angular templates in order to display dynamically repeated data in a template.

<docs-video src="https://www.youtube.com/embed/eM3zi_n7lNs?si=MIl5NcRxvcLjYt5f&amp;start=477"/>

NOTE: This video reflects an older syntax, but the main concepts remain valid.

## What you'll learn

* You will have added a data set to the app
* Your app will display a list of elements from the new data set using `@for`

## Conceptual preview of `@for`

In Angular, `@for` is a specific type of [control flow block](/guide/templates/control-flow) used to dynamically repeat data in a template. In plain JavaScript you would use a for loop - `@for` provides similar functionality for Angular templates.

You can utilize `@for` to iterate over arrays and even asynchronous values. In this lesson, you'll add a new array of data to iterate over.

For a more in depth explanation, please refer to the [control flow](guide/templates/control-flow#repeat-content-with-the-for-block) guide.

<docs-workflow>

<docs-step title="Add housing data to the `Home`">

In the `Home` there is only a single housing location. In this step, you will add an array of `HousingLocation` entries.

1. In `src/app/home/home.ts`, remove the `housingLocation` property from the `Home` class.
1. Update the `Home` class to have a property called `housingLocationList`. Update your code to match the following code:
    <docs-code header="Add housingLocationList property" path="adev/src/content/tutorials/first-app/steps/09-services/src/app/home/home.ts" visibleLines="26-131"/>

    IMPORTANT: Do not remove the `@Component` decorator, you will update that code in an upcoming step.

</docs-step>

<docs-step title="Update the `Home` template to use `@for`">
Now the app has a dataset that you can use to display the entries in the browser using the `@for` block.

1. Update the `<app-housing-location>` tag in the template code to this:
    <docs-code header="Add @for to Home template" path="adev/src/content/tutorials/first-app/steps/09-services/src/app/home/home.ts" visibleLines="[14,20]"/>

    Note, in the code `[housingLocation] = "housingLocation"` the `housingLocation` value now refers to the variable used in the `@for` block. Before this change, it referred to the property on the `Home` class.

1. Save all changes.

1. Refresh the browser and confirm that the app now renders a grid of housing locations.

    <section class="lightbox">
    <img alt="browser frame of homes-app displaying logo, filter text input box, search button and a grid of housing location cards" src="assets/images/tutorials/first-app/homes-app-lesson-08-step-2.png">
    </section>

</docs-step>

</docs-workflow>

SUMMARY: In this lesson, you used the `@for` block to repeat data dynamically in Angular templates. You also added a new array of data to be used in the Angular app. The application now dynamically renders a list of housing locations in the browser.

The app is taking shape, great job.

For more information about the topics covered in this lesson, visit:

<docs-pill-row>
  <docs-pill href="guide/templates/control-flow" title="Control flow blocks"/>
  <docs-pill href="guide/templates/control-flow#repeat-content-with-the-for-block" title="@for guide"/>
  <docs-pill href="/api/core/@for" title="@for"/>
</docs-pill-row>
