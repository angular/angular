# Add the search feature to your app

This tutorial lesson demonstrates how to add a search functionality to your Angular app.

The app will enable users to search through the data provided by your app and display only the results that match the entered term.

<docs-video src="https://www.youtube.com/embed/5K10oYJ5Y-E?si=TiuNKx_teR9baO7k&amp;start=457"/>

IMPORTANT: We recommend using your local environment for this step of the tutorial.

## What you'll learn

- Your app will use data from a form to search for matching housing locations
- Your app will display only the matching housing locations

<docs-workflow>

<docs-step title="Update the home component properties">
In this step, you'll update the `HomeComponent` class to store data in a new array property that you will use for filtering.

1. In `src/app/home/home.component.ts`, add new property to the class called `filteredLocationList`.

   <docs-code header="Add the filtered results property" path="adev/src/content/tutorials/first-app/steps/14-http/src/app/home/home.component.ts" visibleLines="[29]"/>

   The `filteredLocationList` hold the values that match the search criteria entered by the user.

1. The `filteredLocationList` should contain the total set of housing locations values by default when the page loads. Update the `constructor` for the `HomeComponent` to set the value.

<docs-code header="Set the value of filteredLocationList" path="adev/src/content/tutorials/first-app/steps/14-http/src/app/home/home.component.ts" visibleLines="[30,33]"/>

</docs-step>

<docs-step title="Update the home component template">
The `HomeComponent` already contains an input field that you will use to capture input from the user. That string text will be used to filter the results.

1. Update the `HomeComponent` template to include a template variable in the `input` element called `#filter`.

   <docs-code header="Add a template variable to HomeComponent's template" language="html">
       <input type="text" placeholder="Filter by city" #filter>
   </docs-code>

   This example uses a [template reference variable](guide/templates) to get access to the `input` element as its value.

1. Next, update the component template to attach an event handler to the "Search" button.

   <docs-code header="Bind the click event" language="html">
       <button class="primary" type="button" (click)="filterResults(filter.value)">Search</button>
   </docs-code>

   By binding to the `click` event on the `button` element, you are able to call the `filterResults` function. The argument to the function is the `value` property of the `filter` template variable. Specifically, the `.value` property from the `input` HTML element.

1. The last template update is to the `ngFor` directive. Update the `ngFor` value to iterate over values from the `filteredLocationList` array.

<docs-code header="Update the ngFor directive value" language="html">
    <app-housing-location *ngFor="let housingLocation of filteredLocationList" [housingLocation]="housingLocation"></app-housing-location>
</docs-code>

</docs-step>

<docs-step title="Implement the event handler function">
The template has been updated to bind the `filterResults` function to the `click` event. Next, your task is to implement the `filterResults` function in the `HomeComponent` class.

1. Update the `HomeComponent` class to include the implementation of the `filterResults` function.

   <docs-code header="Add the filterResults function implementation" path="adev/src/content/tutorials/first-app/steps/14-http/src/app/home/home.component.ts" visibleLines="[34,43]"/>

   This function uses the `String` `filter` function to compare the value of the `text` parameter against the `housingLocation.city` property. You can update this function to match against any property or multiple properties for a fun exercise.

1. Save your code.

1. Refresh the browser and confirm that you can search the housing location data by city when you click the "Search" button after entering text.

<img alt="filtered search results based on user input" src="assets/images/tutorials/first-app/homes-app-lesson-13-step-3.png">
</docs-step>

</docs-workflow>

SUMMARY: In this lesson, you updated your app to use template variables to interact with template values, and add search functionality using event binding and array functions.

For more information about the topics covered in this lesson, visit:

<docs-pill-row>
  <docs-pill href="guide/templates" title="Template Variables"/>
  <docs-pill href="guide/templates/event-listeners" title="Event Handling"/>
</docs-pill-row>
