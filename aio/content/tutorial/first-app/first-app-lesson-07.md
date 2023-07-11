# Lesson 7 - Add an interpolation to a component’s template

This tutorial lesson demonstrates how to add interpolation to Angular templates in order to display dynamic data in a template.

**Estimated time**: ~10 minutes

**Starting code:** <live-example name="first-app-lesson-06"></live-example>

**Completed code:** <live-example name="first-app-lesson-07"></live-example>

## What you'll learn

*  Your app will display interpolated values in the `HousingLocationComponent` template.
*  Your app will render a housing location data to the browser.

## Conceptual preview of interpolation
In this step you will display values (properties and `Input` values) in a template using interpolation.

Using the `{{ expression }}` in Angular templates, you can render values from properties, `Inputs` and valid JavaScript expressions.

For a more in depth explanation, please refer to the [Displaying values with interpolation](guide/interpolation) guide.

## Step 1 - Update `HousingLocationComponent` template to include interpolated values
This step adds new HTML structure and interpolated values in the `HousingLocationComponent` template.

In the code editor:
1.  Navigate to `src/app/housing-location/housing-location.component.ts`
1.  In the template property of the `@Component` decorator, replace the existing HTML markup with the following code:

    <code-example header="Update HousingLocationComponent template" path="first-app-lesson-07/src/app/housing-location/housing-location.component.ts" region="add-listing-details"></code-example>

    In this updated template code you have used property binding to bind the `housingLocation.photo` to the `src` attribute. The `alt` attribute uses interpolation to give more context to the alt text of the image.

    You use interpolation to include the values for `name`, `city` and `state` of the `housingLocation` property.

## Step 2 - Confirm the changes render in the browser
1.  Save all changes.
1.  Open the browser and confirm that the app renders the photo, city and state sample data.
    <section class="lightbox">
    <img alt="browser frame of homes-app displaying logo, filter text input box, search button and the same housing location UI card" src="generated/images/guide/faa/homes-app-lesson-07-step-2.png">
    </section>

## Lesson review
In this lesson, you added a new HTML structure and used Angular template syntax to render values in the `HousingLocation` template. Now, you have two important skills:
* passing data to components
* Interpolating values into a template

With these skills, your app can now share data and display dynamic values in the browser. Great work so far.

If you are having any trouble with this lesson, you can review the completed code for it in the <live-example></live-example>.

## Next steps

* [Lesson 8 - Use *ngFor to list objects in component](tutorial/first-app/first-app-lesson-08)

## For more information about the topics covered in this lesson, visit:
* [Displaying values with interpolation](/guide/interpolation)
* [Template syntax](guide/template-syntax)

@reviewed 2023-07-11