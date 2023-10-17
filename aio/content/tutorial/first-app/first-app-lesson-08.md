# Lesson 8: Use *ngFor to list objects in component
This tutorial lesson demonstrates how to use `ngFor` directive in Angular templates in order to display dynamically repeated data in a template.

**Estimated time**: ~10 minutes

**Starting code:** <live-example name="first-app-lesson-07"></live-example>

**Completed code:** <live-example name="first-app-lesson-08"></live-example>

## What you'll learn
* You will have added a data set to the app
* Your app will display a list of elements from the new data set using `ngFor`

## Conceptual preview of ngFor
In Angular, `ngFor` is a specific type of [directive](guide/built-in-directives) used to dynamically repeat data in a template. In plain JavaScript you would use a for loop - ngFor provides similar functionality for Angular templates.

You can utilize `ngFor` to iterate over arrays and even asynchronous values. In this lesson, you'll add a new array of data to iterate over.

For a more in depth explanation, please refer to the [Built-in directives](guide/built-in-directives#ngFor) guide.

## Step 1 - Add housing data to the `HomeComponent`

In the `HomeComponent` there is only a single housing location. In this step, you will add an array of `HousingLocation` entries.

1.  In `src/app/home/home.component.ts`, remove the `housingLocation` property from the `HomeComponent` class.
1.  Update the `HomeComponent` class to have a property called `housingLocationList`. Update your code to match the following code:
    <code-example header="Add housingLocationList property" path="first-app-lesson-08/src/app/home/home.component.ts" region="housing-list-entries"></code-example>

    <div class="callout is-important">
      Do not remove the `@Component` decorator, you will update that code in an upcoming step.
    </div>

## Step 2 - Update the `HomeComponent` template to use `ngFor`
Now the app has a dataset that you can use to display the entries in the browser using the `ngFor` directive. 

1.  Update the `<app-housing-location>` tag in the template code to this:
    <code-example header="Add ngFor to HomeComponent template" path="first-app-lesson-08/src/app/home/home.component.ts" region="add-ngFor"></code-example>

    Note, in the code `[housingLocation] = "housingLocation"` the `housingLocation` value now refers to the variable used in the `ngFor` directive. Before this change, it referred to the property on the `HomeComponent` class.

1.  Save all changes.

1.  Refresh the browser and confirm that the app now renders a grid of housing locations.

    <section class="lightbox">
    <img alt="browser frame of homes-app displaying logo, filter text input box, search button and a grid of housing location cards" src="generated/images/guide/faa/homes-app-lesson-08-step-2.png">
    </section>

## Lesson review
In this lesson, you used the `ngFor` directive to repeat data dynamically in Angular templates. You also added a new array of data to be used in the Angular app. The application now dynamically renders a list of housing locations in the browser. 

The app is taking shape, great job.

If you are having any trouble with this lesson, you can review the completed code for it in the <live-example></live-example>.

## Next steps

* [Lesson 9 - Add a service to the application](tutorial/first-app/first-app-lesson-09)

## For more information about the topics covered in this lesson, visit:
* [Structural Directives](/guide/structural-directives)
* [ngFor guide](/guide/built-in-directives#ngFor)
* [ngFor](/api/common/NgFor)

@reviewed 2023-07-11