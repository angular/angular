# First Angular app lesson 09 - Angular services

<div class="callout is-important">

<header>This topic is a work in progress</header>

This topic is a first draft. It is complete, but it some or all content might change before its final draft.

</div>

This tutorial lesson demonstrates how to create an Angular service and use dependency injection to include it in your app.

**Time required:** expect to spend about 20 minutes to complete this lesson.

## Before you start

This lesson starts with the code from the previous lesson, so you can:

*   Use the code that you created in Lesson 8 in your interactive development environment (IDE).
*   Start with the code example from the previous lesson. Choose the <live-example name="first-app-lesson-08"></live-example> from Lesson 8 where you can:
    *   Use the *live example* in StackBlitz, where the StackBlitz interface is your IDE.
    *   Use the *download example* and open it in your IDE.

If you haven't reviewed the introduction, visit the [Introduction to Angular tutorial](tutorial/first-app) to make sure you have everything you need to complete this lesson.

If you have any trouble during this lesson, you can review the completed code for this lesson, in the <live-example></live-example> for this lesson.

## After you finish

*  Your app has a service to serve the data to your app.
   At the end of this lesson, the service reads data from local, static data.
   In a later lesson, you update the service to get data from a web service.

## Conceptual preview of interfaces

This tutorial introduces Angular services and dependency injection.

<!-- markdownLint-disable MD001 -->

#### Angular services

*Angular services* provide a way for you to separate Angular app data and functions that can be used by multiple components in your app.
To be used by multiple components, a service must be made *injectable*.
Services that are injectable and used by a component become dependencies of that component.
The component depends on those services and can't function without them.

#### Dependency injection

*Dependency injection* is the Angular mechanism that manages the dependencies of an app's components and the services that other components can use.

## Lesson steps

Perform these steps on the app code in your IDE.

### Step 1 - Create a new service for your app

This step creates an injectable service for your app.

In the **Terminal** pane of your IDE:

1.  In your project directory, navigate to the `first-app` directory.
1.  In the `first-app` directory, run this command to create the new service.

    <code-example format="shell" language="shell">

    ng generate service housing --skip-tests

    </code-example>

1.  Run `ng serve` to build the app and serve it to `http://localhost:4200`.
1.  Confirm that the app builds without error.
    Correct any errors before you continue to the next step.

### Step 2 - Add static data to the new service

This step adds some sample data to your new service.
In a later lesson, you replace the static data with a web interface to get data as you might in a real app.
For now, your app's new service uses the data that has, so far, been created locally in `HomeComponent`.

In the **Edit** pane of your IDE:

1.  In `src/app/home/home.component.ts`, from `HomeComponent`, copy the `img_server` and `housingLocationList` variables.
1.  In `src/app/housing.servivce.ts`:
    1.  Inside the `HousingService` class, paste the variables that you copied from `HomeComponent` in the previous step.
    1.  Inside the `HousingService` class, paste these functions after the data you just copied.
        These functions allow dependencies to access the service's data.

        <code-example header="Service functions in src/app/housing.service.ts" path="first-app-lesson-09/src/app/housing.service.ts" region="service-functions"></code-example>

    1.  After the `import { Injectable }...` line at the top of the file, add this line to import the `HousingLocation` type.

        <code-example header="Import HousingLocation type in  src/app/housing.service.ts" path="first-app-lesson-09/src/app/housing.service.ts" region="import-housing-location"></code-example>

1.  Confirm that the app builds without error.
    Correct any errors before you continue to the next step.

### Step 3 - Inject the new service into `HomeComponent`

This step injects the new service into your app's `HomeComponent` so that it can read the app's data from a service.
In a later lesson, you replace the static data with a web interface to get data as you might in a real app.

In the **Edit** pane of your IDE, in `src/app/home/home.component.ts`:

1.  At the top of `src/app/home/home.component.ts`, replace the `import { Component...` line with this line to also import the `inject` function.

    <code-example header="Update to src/app/home/home.component.ts" path="first-app-lesson-09/src/app/home/home.component.ts" region="import-inject"></code-example>

1.  After the imports at the top of `src/app/home/home.component.ts`, add this line to import your new service.

    <code-example header="Add import to src/app/home/home.component.ts" path="first-app-lesson-09/src/app/home/home.component.ts" region="import-service"></code-example>

1.  From `HomeComponent`, delete the `img_server` and `housingLocationList` properties that you copied to the service in the previous step.

1.  In `HomeComponent`, add this code to inject the new service and initialize the data for the app.

    <code-example header="Initialize data from service in src/app/home/home.component.ts" path="first-app-lesson-09/src/app/home/home.component.ts" region="use-new-service"></code-example>

1.  Save the changes to `src/app/home/home.component.ts` and confirm your app builds without error.
    Correct any errors before you continue to the next step.

## Lesson review

In this lesson, you added an Angular service to your app and injected it into .
This compartmentalizes how your app gets its data.
For now, the new service gets its data from a static array of data.
In a later lesson, you refactor the service to get its data from a webservice.

If you are having any trouble with this lesson, you can review the completed code for it in the <live-example></live-example>.

## Next steps

*  **(TODO) Link to lesson 10**

## More information

For more information about the topics covered in this lesson, visit:

<!-- vale Angular.Google_WordListSuggestions = NO -->

*  [Creating an injectable service](guide/creating-injectable-service)
*  [Dependency injection in Angular](guide/dependency-injection-overview)
*  [ng generate service](cli/generate#service)
*  [ng generate](cli/generate)
