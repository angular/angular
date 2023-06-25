# First Angular app lesson 3 - Create the application’s HousingLocation component

This tutorial lesson demonstrates how to add the `HousingLocation` component to your Angular app.

**Time required:** expect to spend about 10 minutes to complete this lesson.

## Before you start

This lesson starts with the code from the previous lesson, so you can:

*   Use the code that you created in Lesson 2 in your integrated development environment (IDE).
*   Start with the code example from the previous lesson. Choose the <live-example name="first-app-lesson-02"></live-example> from Lesson 1 where you can:
    *   Use the *live example* in StackBlitz, where the StackBlitz interface is your IDE.
    *   Use the *download example* and open it in your IDE.

If you haven't reviewed the introduction, visit the [Introduction to Angular tutorial](tutorial/first-app) to make sure you have everything you need to complete this lesson.

If you have any trouble during this lesson, you can review the completed code for this lesson, in the <live-example></live-example> for this lesson.

## After you finish
* Your app has a new component: `HousingLocationComponent` and it displays a message confirming that the component was added to your application.

## Lesson steps

Perform these steps on the app code in your IDE.

### Step 1 - Create the `HousingLocationComponent`

In this step, you create a new component for your app.

In the **Terminal** pane of your IDE:

1. In your project directory, navigate to the `first-app` directory.

1. Run this command to create a new `HousingLocationComponent`

    <code-example format="shell" language="shell">
    ng generate component HousingLocation --standalone --inline-template --skip-tests
    </code-example>

1. Run this command to build and serve your app.

    <code-example format="shell" language="shell">

    ng serve

    </code-example>

1.  Open a browser and navigate to `http://localhost:4200` to find the application.
1.  Confirm that the app builds without error.

    *Note: It should render the same as it did in the previous lesson because even though you added a new component, you haven't included it in any of the app's templates, yet.*
1.  Leave `ng serve` running as you complete the next steps.

### Step 2 - Add the new component to your app's layout

In this step, you add the new component, `HousingLocationComponent` to your app's `HomeComponent`, so that it displays in your app's layout.

In the **Edit** pane of your IDE:

1.  Open `home.component.ts` in the editor.
1.  In `home.component.ts`, import `HousingLocationComponent` by adding this line to the file level imports.

    <code-example header="Import HousingLocationComponent in src/app/home/home.component.ts" path="first-app-lesson-03/src/app/home/home.component.ts" region="import-housingLocation"></code-example>

1.  Next update the `imports` property of the `@Component` metadata by adding `HousingLocationComponent` to the array.

    <code-example header="Add HousingLocationComponent to imports array in src/app/home/home.component.ts" path="first-app-lesson-03/src/app/home/home.component.ts" region="add-housingLocation-to-array"></code-example>

1.  Now the component is ready for use in the template for the `HomeComponent`. Update the `template` property of the `@Component` metadata to include a reference to the `<app-housing-location>` tag.

    <code-example header="Add housing location to the component template in src/app/home/home.component.ts" path="first-app-lesson-03/src/app/home/home.component.ts" region="add-housingLocation-to-template"></code-example>

### Step 3 - Add the styles for the component

In this step, you will copy over the pre-written styles for the `HousingLocationComponent` to your app so that the app renders properly.

1. Open `src/app/housing-location/housing-location.css`, and paste the styles below into the file:
        
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
