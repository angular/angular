# Angular services

This tutorial lesson demonstrates how to create an Angular service and use dependency injection to include it in your app.

<docs-video src="https://www.youtube.com/embed/-jRxG84AzCI?si=rieGfJawp9xJ00Sz"/>

## What you'll learn

Your app has a service to serve the data to your app.
At the end of this lesson, the service reads data from local, static data.
In a later lesson, you'll update the service to get data from a web service.

## Conceptual preview of services

This tutorial introduces Angular services and dependency injection.

### Angular services

*Angular services* provide a way for you to separate Angular app data and functions that can be used by multiple components in your app.
To be used by multiple components, a service must be made *injectable*.
Services that are injectable and used by a component become dependencies of that component.
The component depends on those services and can't function without them.

### Dependency injection

*Dependency injection* is the mechanism that manages the dependencies of an app's components and the services that other components can use.

<docs-workflow>

<docs-step title="Create a new service for your app">
This step creates an injectable service for your app.

In the **Terminal** pane of your IDE:

1. In your project directory, navigate to the `first-app` directory.
1. In the `first-app` directory, run this command to create the new service.

    <docs-code language="shell">
    ng generate service housing --skip-tests
    </docs-code>

1. Run `ng serve` to build the app and serve it to `http://localhost:4200`.
1. Confirm that the app builds without error.
    Correct any errors before you continue to the next step.
</docs-step>

<docs-step title="Add static data to the new service">
This step adds some sample data to your new service.
In a later lesson, you'll replace the static data with a web interface to get data as you might in a real app.
For now, your app's new service uses the data that has, so far, been created locally in `HomeComponent`.

In the **Edit** pane of your IDE:

1. In `src/app/home/home.component.ts`, from `HomeComponent`, copy the `housingLocationList` property and its array value, as well as the   `baseUrl` property.
1. In `src/app/housing.service.ts`:
    1. Inside the `HousingService` class, paste the properties that you copied from `HomeComponent` in the previous step.
    1. Inside the `HousingService` class, paste these functions after the data you just copied.
        These functions allow dependencies to access the service's data.

        <docs-code header="Service functions in src/app/housing.service.ts" path="adev/src/content/tutorials/first-app/steps/10-routing/src/app/housing.service.ts" visibleLines="[112,118]"/>

        You will need these functions in a future lesson. For now, it is enough to understand that these functions return either a specific `HousingLocation` by id or the entire list.

    1. Add a file level import for the `HousingLocation`.

        <docs-code header="Import HousingLocation type in  src/app/housing.service.ts" path="adev/src/content/tutorials/first-app/steps/10-routing/src/app/housing.service.ts" visibleLines="[2]"/>

1. Confirm that the app builds without error.
    Correct any errors before you continue to the next step.
</docs-step>

<docs-step title="Inject the new service into `HomeComponent`">
This step injects the new service into your app's `HomeComponent` so that it can read the app's data from a service.
In a later lesson, you'll replace the static data with a live data source to get data as you might in a real app.

In the **Edit** pane of your IDE, in `src/app/home/home.component.ts`:

1. At the top of `src/app/home/home.component.ts`, add the `inject` to the items imported from `@angular/core`. This will import the `inject` function into the `HomeComponent` class.

    <docs-code header="Update to src/app/home/home.component.ts" path="adev/src/content/tutorials/first-app/steps/10-routing/src/app/home/home.component.ts" visibleLines="[1]"/>

1. Add a new file level import for the `HousingService`:

    <docs-code header="Add import to src/app/home/home.component.ts" path="adev/src/content/tutorials/first-app/steps/10-routing/src/app/home/home.component.ts" visibleLines="[5]"/>

1. From `HomeComponent`, delete the `housingLocationList` array entries and assign `housingLocationList` the value of empty array (`[]`). In a few steps you will update the code to pull the data from the `HousingService`.

1. In `HomeComponent`, add the following code to inject the new service and initialize the data for the app. The `constructor` is the first function that runs when this component is created. The code in the `constructor` will assign the `housingLocationList` the value returned from the call to `getAllHousingLocations`.

    <docs-code header="Initialize data from service in src/app/home/home.component.ts" path="adev/src/content/tutorials/first-app/steps/10-routing/src/app/home/home.component.ts" visibleLines="[25,32]"/>

1. Save the changes to `src/app/home/home.component.ts` and confirm your app builds without error.
    Correct any errors before you continue to the next step.
</docs-step>

</docs-workflow>

SUMMARY: In this lesson, you added an Angular service to your app and injected it into the `HomeComponent` class.
This compartmentalizes how your app gets its data.
For now, the new service gets its data from a static array of data.
In a later lesson, you'll refactor the service to get its data from an API endpoint.

For more information about the topics covered in this lesson, visit:

<docs-pill-row>
  <docs-pill href="guide/di/creating-injectable-service" title="Creating an injectable service"/>
  <docs-pill href="guide/di" title="Dependency injection in Angular"/>
  <docs-pill href="cli/generate/service" title="ng generate service"/>
  <docs-pill href="cli/generate" title="ng generate"/>
</docs-pill-row>
