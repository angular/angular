# Use *ngFor to list objects in component

This tutorial lesson demonstrates how to use `ngFor` directive in Angular templates in order to display dynamically repeated data in a template.

<docs-video src="https://www.youtube.com/embed/eM3zi_n7lNs?si=MIl5NcRxvcLjYt5f&amp;start=477"/>

## What you'll learn

* You will have added a data set to the app
* Your app will display a list of elements from the new data set using `ngFor`

## Conceptual preview of ngFor

In Angular, `ngFor` is a specific type of [directive](guide/directives) used to dynamically repeat data in a template. In plain JavaScript you would use a for loop - ngFor provides similar functionality for Angular templates.

You can utilize `ngFor` to iterate over arrays and even asynchronous values. In this lesson, you'll add a new array of data to iterate over.

For a more in depth explanation, please refer to the [Built-in directives](guide/directives#ngFor) guide.

<docs-workflow>

<docs-step title="Add housing data to the `Home`">

In the `Home` there is only a single housing location. In this step, you will add an array of `HousingLocation` entries.

1. In `src/app/home/home.ts`, remove the `housingLocation` property from the `Home` class.
1. Update the `Home` class to have a property called `housingLocationList`. Update your code to match the following code:
    <docs-code header="Add housingLocationList property" path="adev/src/content/tutorials/first-app/steps/09-services/src/app/home/home.ts" visibleLines="26-131"/>

    IMPORTANT: Do not remove the `@Component` decorator, you will update that code in an upcoming step.

</docs-step>

<docs-step title="Update the `Home` template to use `ngFor`">
Now the app has a dataset that you can use to display the entries in the browser using the `ngFor` directive.

1. Update the `<app-housing-location>` tag in the template code to this:
    <docs-code header="Add ngFor to Home template" path="adev/src/content/tutorials/first-app/steps/09-services/src/app/home/home.ts" visibleLines="[17,22]"/>

    Note, in the code `[housingLocation] = "housingLocation"` the `housingLocation` value now refers to the variable used in the `ngFor` directive. Before this change, it referred to the property on the `Home` class.

    IMPORTANT: Don't forget to import the `NgFor` directive in your `Home` class.

1. Save all changes.

1. Refresh the browser and confirm that the app now renders a grid of housing locations.

    <section class="lightbox">
    <img alt="browser frame of homes-app displaying logo, filter text input box, search button and a grid of housing location cards" src="assets/images/tutorials/first-app/homes-app-lesson-08-step-2.png">
    </section>

</docs-step>

</docs-workflow>

SUMMARY: In this lesson, you used the `ngFor` directive to repeat data dynamically in Angular templates. You also added a new array of data to be used in the Angular app. The application now dynamically renders a list of housing locations in the browser.

The app is taking shape, great job.

For more information about the topics covered in this lesson, visit:

<docs-pill-row>
  <docs-pill href="guide/directives/structural-directives" title="Structural Directives"/>
  <docs-pill href="guide/directives#ngFor" title="ngFor guide"/>
  <docs-pill href="api/common/NgFor" title="ngFor"/>
</docs-pill-row>
