# Lesson 3: Create the application’s HousingLocation component

This tutorial lesson demonstrates how to add the `HousingLocation` component to your Angular app.

**Estimated time**: ~10 minutes

**Starting code:** <live-example name="first-app-lesson-02"></live-example>

**Completed code:** <live-example name="first-app-lesson-03"></live-example>

## What you'll learn
* Your app has a new component: `HousingLocationComponent` and it displays a message confirming that the component was added to your application.

## Step 1 - Create the `HousingLocationComponent`

In this step, you create a new component for your app.

In the **Terminal** pane of your IDE:

1. In your project directory, navigate to the `first-app` directory.

1. Run this command to create a new `HousingLocationComponent`

    <code-example format="shell" language="shell">
    ng generate component housingLocation --inline-template --skip-tests
    </code-example>

1. Run this command to build and serve your app.

    <code-example format="shell" language="shell">

    ng serve

    </code-example>

1.  Open a browser and navigate to `http://localhost:4200` to find the application.
1.  Confirm that the app builds without error.
    <div class="callout is-helpful">
      It should render the same as it did in the previous lesson because even though you added a new component, you haven't included it in any of the app's templates, yet.
    </div>
1.  Leave `ng serve` running as you complete the next steps.

## Step 2 - Add the new component to your app's layout

In this step, you add the new component, `HousingLocationComponent` to your app's `HomeComponent`, so that it displays in your app's layout.

In the **Edit** pane of your IDE:

1.  Open `home.component.ts` in the editor.
1.  In `home.component.ts`, import `HousingLocationComponent` by adding this line to the file level imports.

    <code-example header="Import HousingLocationComponent in src/app/home/home.component.ts" path="first-app-lesson-03/src/app/home/home.component.ts" region="import-housingLocation"></code-example>

1.  Next update the `imports` property of the `@Component` metadata by adding `HousingLocationComponent` to the array.

    <code-example header="Add HousingLocationComponent to imports array in src/app/home/home.component.ts" path="first-app-lesson-03/src/app/home/home.component.ts" region="add-housingLocation-to-array"></code-example>

1.  Now the component is ready for use in the template for the `HomeComponent`. Update the `template` property of the `@Component` metadata to include a reference to the `<app-housing-location>` tag.

    <code-example header="Add housing location to the component template in src/app/home/home.component.ts" path="first-app-lesson-03/src/app/home/home.component.ts" region="add-housingLocation-to-template"></code-example>

## Step 3 - Add the styles for the component

In this step, you will copy over the pre-written styles for the `HousingLocationComponent` to your app so that the app renders properly.

1. Open `src/app/housing-location/housing-location.component.css`, and paste the styles below into the file:

    <code-example header="Add CSS styles to housing location to the component in src/app/housing-location/housing-location.component.css" path="first-app-lesson-03/src/app/housing-location/housing-location.component.css"></code-example>

1.  Save your code, return to the browser and confirm that the app builds without error. You should find the message "housing-location works!" rendered to the screen.Correct any errors before you continue to the next step.

    <section class="lightbox">
    <img alt="browser frame of homes-app displaying logo, filter text input box and search button and the message 'housing-location works!" src="generated/images/guide/faa/homes-app-lesson-03-step-2.png">
    </section>


## Lesson review

In this lesson, you created a new component for your app and added it to the app's layout.

If you are having any trouble with this lesson, you can review the completed code for it in the <live-example></live-example>.

## Next steps

* [First Angular app lesson 4 -  Add a housing location interface to the application](tutorial/first-app/first-app-lesson-04)

@reviewed 2023-10-24
