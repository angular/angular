# Adding a form to your Angular app

This tutorial lesson demonstrates how to add a form that collects user data to an Angular app.
This lesson starts with a functional Angular app and shows how to add a form to it.

The data that the form collects is sent only to the app's service, which writes it to the browser's console.
Using a REST API to send and receive the form's data is not covered in this lesson.

<docs-video src="https://www.youtube.com/embed/kWbk-dOJaNQ?si=FYMXGdUiT-qh321h"/>

IMPORTANT: We recommend using your local environment for this step of the tutorial.

## What you'll learn

- Your app has a form into which users can enter data that is sent to your app's service.
- The service writes the data from the form to the browser's console log.

<docs-workflow>

<docs-step title="Add a method to send form data">
This step adds a method to your app's service that receives the form data to send to the data's destination.
In this example, the method writes the data from the form to the browser's console log.

In the **Edit** pane of your IDE:

1. In `src/app/housing.service.ts`, inside the `HousingService` class, paste this method at the bottom of the class definition.

    <docs-code header="Submit method in src/app/housing.service.ts" path="adev/src/content/tutorials/first-app/steps/13-search/src/app/housing.service.ts" visibleLines="[120,124]"/>

1. Confirm that the app builds without error.
   Correct any errors before you continue to the next step.
   </docs-step>

<docs-step title="Add the form functions to the details page">
This step adds the code to the details page that handles the form's interactions.

In the **Edit** pane of your IDE, in `src/app/details/details.component.ts`:

1. After the `import` statements at the top of the file, add the following code to import the Angular form classes.

    <docs-code header="Forms imports in src/app/details/details.component.ts" path="adev/src/content/tutorials/first-app/steps/13-search/src/app/details/details.component.ts" visibleLines="[6]"/>

1. In the `DetailsComponent` decorator metadata, update the `imports` property with the following code:

    <docs-code header="imports directive in src/app/details/details.component.ts" path="adev/src/content/tutorials/first-app/steps/13-search/src/app/details/details.component.ts" visibleLines="[9]"/>

1. In the `DetailsComponent` class, before the `constructor()` method, add the following code to create the form object.

   <docs-code header="template directive in src/app/details/details.component.ts" path="adev/src/content/tutorials/first-app/steps/13-search/src/app/details/details.component.ts" visibleLines="[52,56]"/>

   In Angular, `FormGroup` and `FormControl` are types that enable you to build forms. The `FormControl` type can provide a default value and shape the form data. In this example `firstName` is a `string` and the default value is empty string.

1. In the `DetailsComponent` class, after the `constructor()` method, add the following code to handle the **Apply now** click.

   <docs-code header="template directive in src/app/details/details.component.ts" path="adev/src/content/tutorials/first-app/steps/13-search/src/app/details/details.component.ts" visibleLines="[62,68]"/>

   This button does not exist yet - you will add it in the next step. In the above code, the `FormControl`s may return `null`. This code uses the nullish coalescing operator to default to empty string if the value is `null`.

1. Confirm that the app builds without error.
   Correct any errors before you continue to the next step.
   </docs-step>

<docs-step title="Add the form's markup to the details page">
This step adds the markup to the details page that displays the form.

In the **Edit** pane of your IDE, in `src/app/details/details.component.ts`:

1. In the `DetailsComponent` decorator metadata, update the `template` HTML to match the following code to add the form's markup.

   <docs-code header="template directive in src/app/details/details.component.ts" path="adev/src/content/tutorials/first-app/steps/13-search/src/app/details/details.component.ts" visibleLines="[11,46]"/>

   The template now includes an event handler `(submit)="submitApplication()"`. Angular uses parentheses syntax around the event name to define events in the template code. The code on the right hand side of the equals sign is the code that should be executed when this event is triggered. You can bind to browser events and custom events.

1. Confirm that the app builds without error.
Correct any errors before you continue to the next step.

<img alt="details page with a form for applying to live at this location" src="assets/images/tutorials/first-app/homes-app-lesson-12-step-3.png">

</docs-step>

<docs-step title="Test your app's new form">
This step tests the new form to see that when the form data is submitted to the app, the form data appears in the console log.

1. In the **Terminal** pane of your IDE, run `ng serve`, if it isn't already running.
1. In your browser, open your app at `http://localhost:4200`.
1. Right click on the app in the browser and from the context menu, choose **Inspect**.
1. In the developer tools window, choose the **Console** tab.
   Make sure that the developer tools window is visible for the next steps
1. In your app:
   1. Select a housing location and click **Learn more**, to see details about the house.
   1. In the house's details page, scroll to the bottom to find the new form.
   1. Enter data into the form's fields - any data is fine.
   1. Choose **Apply now** to submit the data.
1. In the developer tools window, review the log output to find your form data.
   </docs-step>

</docs-workflow>

SUMMARY: In this lesson, you updated your app to add a form using Angular's forms feature, and connect the data captured in the form to a component using an event handler.

For more information about the topics covered in this lesson, visit:

<docs-pill-row>
  <docs-pill href="guide/forms" title="Angular Forms"/>
  <docs-pill href="guide/templates/event-listeners" title="Event Handling"/>
</docs-pill-row>
