# Create the application’s HousingLocation component

This tutorial lesson demonstrates how to add the `HousingLocation` component to your Angular app.

<docs-video src="https://www.youtube.com/embed/R0nRX8jD2D0?si=U4ONEbPvtptdUHTt&amp;start=440"/>

## What you'll learn

* Your app has a new component: `HousingLocation` and it displays a message confirming that the component was added to your application.

<docs-workflow>

<docs-step title="Create the `HousingLocation`">
In this step, you create a new component for your app.

In the **Terminal** pane of your IDE:

1. In your project directory, navigate to the `first-app` directory.

1. Run this command to create a new `HousingLocation`

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
In this step, you add the new component, `HousingLocation` to your app's `Home`, so that it displays in your app's layout.

In the **Edit** pane of your IDE:

1. Open `home.ts` in the editor.
1. In `home.ts`, import `HousingLocation` by adding this line to the file level imports.

    <docs-code header="Import HousingLocation in src/app/home/home.ts" path="adev/src/content/tutorials/first-app/steps/04-interfaces/src/app/home/home.ts" visibleLines="[2]"/>

1. Next update the `imports` property of the `@Component` metadata by adding `HousingLocation` to the array.

    <docs-code header="Add HousingLocation to imports array in src/app/home/home.ts" path="adev/src/content/tutorials/first-app/steps/04-interfaces/src/app/home/home.ts" visibleLines="[6]"/>

1. Now the component is ready for use in the template for the `Home`. Update the `template` property of the `@Component` metadata to include a reference to the `<app-housing-location>` tag.

    <docs-code header="Add housing location to the component template in src/app/home/home.ts" path="adev/src/content/tutorials/first-app/steps/04-interfaces/src/app/home/home.ts" visibleLines="[7,17]"/>

</docs-step>

<docs-step title="Add the styles for the component">
In this step, you will copy over the pre-written styles for the `HousingLocation` to your app so that the app renders properly.

1. Open `src/app/housing-location/housing-location.css`, and paste the styles below into the file:

    NOTE: In the browser, these can go in `src/app/housing-location/housing-location.ts` in the `styles` array.

    <docs-code header="Add CSS styles to housing location to the component in src/app/housing-location/housing-location.css" path="adev/src/content/tutorials/first-app/steps/04-interfaces/src/app/housing-location/housing-location.css"/>

1. Save your code, return to the browser and confirm that the app builds without error. You should find the message "housing-location works!" rendered to the screen.Correct any errors before you continue to the next step.

    <img alt="browser frame of homes-app displaying logo, filter text input box and search button and the message 'housing-location works!" src="assets/images/tutorials/first-app/homes-app-lesson-03-step-2.png">

</docs-step>

</docs-workflow>

SUMMARY: In this lesson, you created a new component for your app and added it to the app's layout.
