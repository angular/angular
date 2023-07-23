# Lesson 13: Add the search feature to your app

This tutorial lesson demonstrates how to add a search functionality to your Angular app.

The app will enable users to search through the data provided by your app and display only the results that match the entered term.

**Estimated time**: ~15 minutes

**Starting code:** <live-example name="first-app-lesson-12"></live-example>

**Completed code:** <live-example name="first-app-lesson-13"></live-example>

## What you'll learn

*  Your app will use data from a form to search for matching housing locations
*  Your app will display only the matching housing locations

## Step 1 - Update the home component properties
In this step, you'll update the `HomeComponent` class to store data in a new array property that you will use for filtering.

1.  In `src/app/home/home.component.ts`, add new property to the class called `filteredLocationList`.

    <code-example header="Add the filtered results property" path="first-app-lesson-13/src/app/home/home.component.ts" region="add-filtered-location-list"></code-example>

    The `filteredLocationList` hold the values that match the search criteria entered by the user.

1.  The `filteredLocationList` should contain the total set of housing locations values by default when the page loads. Update the `constructor` for the `HomeComponent` to set the value.

    <code-example header="Set the value of filteredLocationList" path="first-app-lesson-13/src/app/home/home.component.ts" region="update-constructor"></code-example>

## Step 2 - Update the home component template
The `HomeComponent` already contains an input field that you will use to capture input from the user. That string text will be used to filter the results.

1.  Update the `HomeComponent` template to include a template variable in the `input` element called `#filter`.

    <code-example header="Add a template variable to HomeComponent's template"  format="html" language="html">
        &lt;input type="text" placeholder="Filter by city" #filter&gt;
    </code-example>

    This example uses a [template reference variable](/guide/template-reference-variables) to get access to the `input` element as its value.

1.  Next, update the component template to attach an event handler to the "Search" button.

    <code-example header="Bind the click event" format="html" language="html">
        &lt;button class="primary" type="button" (click)="filterResults(filter.value)"&gt;Search&lt;/button&gt;
    </code-example>

    By binding to the `click` event on the `button` element, you are able to call the `filterResults` function. The argument to the function is the `value` property of the `filter` template variable. Specifically, the `.value` property from the `input` HTML element.

1.  The last template update is to the `ngFor` directive. Update the `ngFor` value to iterate over values from the `filteredLocationList` array.

    <code-example header="Update the ngFor directive value" format="html" language="html">
        &lt;app-housing-location *ngFor="let housingLocation of filteredLocationList" [housingLocation]="housingLocation"&gt;&lt;/app-housing-location&gt;
    </code-example>

## Step 3 - Implement the event handler function

The template has been updated to bind the `filterResults` function to the `click` event. Next, your task is to implement the `filterResults` function in the `HomeComponent` class.

1.  Update the `HomeComponent` class to include the implementation of the `filterResults` function.
    
    <code-example header="Add the filterResults function implementation" path="first-app-lesson-13/src/app/home/home.component.ts" region="add-filter-results-fn"></code-example>

    This function uses the `String` `filter` function to compare the value of the `text` parameter against the `housingLocation.city` property. You can update this function to match against any property or multiple properties for a fun exercise.

1. Save your code.

1. Refresh the browser and confirm that you can search the housing location data by city when you click the "Search" button after entering text.

<section class="lightbox">
<img alt="filtered search results based on user input" src="generated/images/guide/faa/homes-app-lesson-13-step-3.png">
</section>

## Lesson review

In this lesson, you updated your app to:
*  use template variables to interact with template values
*  add search functionality using event binding and array functions

If you are having any trouble with this lesson, you can review the completed code for it in the <live-example></live-example>.

## Next steps

*  [Lesson 14 - Add HTTP communication to your app](tutorial/first-app/first-app-lesson-14)

## More information

For more information about the topics covered in this lesson, visit:

*  [Template Variables](/guide/template-reference-variables)
*  [Event Handling](/guide/event-binding)

@reviewed 2023-07-11
