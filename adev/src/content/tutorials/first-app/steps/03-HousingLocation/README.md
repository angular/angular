# Create the application’s HousingLocation component

This tutorial lesson demonstrates how to add the `HousingLocation` component to your Angular app.

<docs-video src="https://www.youtube.com/embed/R0nRX8jD2D0?si=U4ONEbPvtptdUHTt&amp;start=440"/>

## What you'll learn

* Your app has a new component: `HousingLocationComponent` and it displays a message confirming that the component was added to your application.

<docs-workflow>

<docs-step title="Create the `HousingLocationComponent`">
In this step, you create a new component for your app.

In the **Terminal** pane of your IDE:

1. In your project directory, navigate to the `first-app` directory.

1. Run this command to create a new `HousingLocationComponent`

    <docs-code language="shell">
    ng generate component housingLocation
    </docs-code>

1. Run this command to build and serve your app.

    <docs-code language="shell">
    ng serve
    </docs-code>

    NOTE: This step is only for your local environment!

1. Open a browser and navigate to `http://localhost:4200` to find the application.
1. Confirm that the app builds without error.

    HELPFUL: It should render the same as it did in the previous lesson because even though you added a new component, you haven't included it in any of the app's templates, yet.

1. Leave `ng serve` running as you complete the next steps.
</docs-step>

<docs-step title="Add the new component to your app's layout">
In this step, you add the new component, `HousingLocationComponent` to your app's `HomeComponent`, so that it displays in your app's layout.

In the **Edit** pane of your IDE:

1. Open `home.component.ts` in the editor.
1. In `home.component.ts`, import `HousingLocationComponent` by adding this line to the file level imports.

    <docs-code header="Import HousingLocationComponent in src/app/home/home.component.ts" path="adev/src/content/tutorials/first-app/steps/04-interfaces/src/app/home/home.component.ts" visibleLines="[3]"/>

1. Next update the `imports` property of the `@Component` metadata by adding `HousingLocationComponent` to the array.

    <docs-code header="Add HousingLocationComponent to imports array in src/app/home/home.component.ts" path="adev/src/content/tutorials/first-app/steps/04-interfaces/src/app/home/home.component.ts" visibleLines="[6]"/>

1. Now the component is ready for use in the template for the `HomeComponent`. Update the `template` property of the `@Component` metadata to include a reference to the `<app-housing-location>` tag.

    <docs-code header="Add housing location to the component template in src/app/home/home.component.ts" path="adev/src/content/tutorials/first-app/steps/04-interfaces/src/app/home/home.component.ts" visibleLines="[7,17]"/>

</docs-step>

<docs-step title="Add the styles for the component">
In this step, you will copy over the pre-written styles for the `HousingLocationComponent` to your app so that the app renders properly.

1. Open `src/app/housing-location/housing-location.component.css`, and paste the styles below into the file:

    NOTE: In the browser, these can go in `src/app/housing-location/housing-location.component.ts` in the `styles` array.

    <docs-code header="Add CSS styles to housing location to the component in src/app/housing-location/housing-location.component.css" path="adev/src/content/tutorials/first-app/steps/04-interfaces/src/app/housing-location/housing-location.component.css"/>

1. Save your code, return to the browser and confirm that the app builds without error. You should find the message "housing-location works!" rendered to the screen.Correct any errors before you continue to the next step.

    <img alt="browser frame of homes-app displaying logo, filter text input box and search button and the message 'housing-location works!" src="assets/images/tutorials/first-app/homes-app-lesson-03-step-2.png">

</docs-step>

</docs-workflow>

SUMMARY: In this lesson, you created a new component for your app and added it to the app's layout.
