# Integrate details page into application

This tutorial lesson demonstrates how to connect the details page to your app.

<docs-video src="https://www.youtube.com/embed/-jRxG84AzCI?si=CbqIpmRpwp5ZZDnu&amp;start=345"/>

IMPORTANT: We recommend using your local environment to learn routing.

## What you'll learn

At the end of this lesson your application will have support for routing to the details page.

## Conceptual preview of routing with route parameters

Each housing location has specific details that should be displayed when a user navigates to the details page for that item. To accomplish this goal, you will need to use route parameters.

Route parameters enable you to include dynamic information as a part of your route URL. To identify which housing location a user has clicked on you will use the `id` property of the `HousingLocation` type.

<docs-workflow>

<docs-step title="Using `routerLink` for dynamic navigation">
In lesson 10, you added a second route to `src/app/routes.ts` which includes a special segment that identifies the route parameter, `id`:

<docs-code language="javascript">
'details/:id'
</docs-code>

In this case, `:id` is dynamic and will change based on how the route is requested by the code.

1. In `src/app/housing-location/housing-location.ts`, add an anchor tag to the `section` element and include the `routerLink` directive:

    <docs-code header="Add anchor with a routerLink directive to housing-location.ts" path="adev/src/content/tutorials/first-app/steps/12-forms/src/app/housing-location/housing-location.ts" visibleLines="[20]"/>

    The `routerLink` directive enables Angular's router to create dynamic links in the application. The value assigned to the `routerLink` is an array with two entries: the static portion of the path and the dynamic data.

    For the `routerLink` to work in the template, add a file level import of `RouterLink` and `RouterOutlet` from '@angular/router', then update the component `imports` array to include both `RouterLink` and `RouterOutlet`.
1. At this point you can confirm that the routing is working in your app. In the browser, refresh the home page and click the "Learn More" button for a housing location.

    <img alt="details page displaying the text 'details works!'" src="assets/images/tutorials/first-app/homes-app-lesson-11-step-1.png">

</docs-step>

<docs-step title="Get route parameters">
In this step, you will get the route parameter in the `Details`. Currently, the app displays `details works!`. Next you'll update the code to display the `id` value passed using the route parameters.

1. In `src/app/details/details.ts` update the template to import the functions, classes and services that you'll need to use in the `Details`:

    <docs-code header="Update file level imports" path="adev/src/content/tutorials/first-app/steps/12-forms/src/app/details/details.ts" visibleLines="[1,5]"/>

1. Update the `template` property of the `@Component` decorator to display the value `housingLocationId`:

    <docs-code language="javascript">
      template: `<p>details works! {{ housingLocationId }}</p>`,
    </docs-code>

1. Update the body of the `Details` class with the following code:

    <docs-code language="javascript">
        export class Details {
            route: ActivatedRoute = inject(ActivatedRoute);
            housingLocationId = -1;
            constructor() {
                this.housingLocationId = Number(this.route.snapshot.params['id']);
            }
        }
    </docs-code>

    This code gives the `Details` access to the `ActivatedRoute` router feature that enables you to have access to the data about the current route. In the `constructor`, the code converts the `id` parameter acquired from the route from a string to a number.

1. Save all changes.

1. In the browser, click on one of the housing location's "Learn More" links and confirm that the numeric value displayed on the page matches the `id` property for that location in the data.
</docs-step>

<docs-step title="Customize the `Detail`">
Now that routing is working properly in the application this is a great time to update the template of the `Details` to display the specific data represented by the housing location for the route parameter.

To access the data you will add a call to the `HousingService`.

1. Update the template code to match the following code:

    <docs-code header="Update the Details template in src/app/details/details.ts" path="adev/src/content/tutorials/first-app/steps/12-forms/src/app/details/details.ts" visibleLines="[11,32]"/>

    Notice that the `housingLocation` properties are being accessed with the optional chaining operator `?`. This ensures that if the `housingLocation` value is null or undefined the application doesn't crash.

1. Update the body of the `Details` class to match the following code:

    <docs-code header="Update the Details class in src/app/details/details.ts" path="adev/src/content/tutorials/first-app/steps/12-forms/src/app/details/details.ts" visibleLines="[35,44]"/>

    Now the component has the code to display the correct information based on the selected housing location. The `constructor` now includes a call to the `HousingService` to pass the route parameter as an argument to the `getHousingLocationById` service function.

1. Copy the following styles into the `src/app/details/details.css` file:

    <docs-code header="Add styles for the Details" path="adev/src/content/tutorials/first-app/steps/12-forms/src/app/details/details.css" visibleLines="[1,71]"/>

1. Save your changes.

1. In the browser refresh the page and confirm that when you click on the "Learn More" link for a given housing location the details page displays the correct information based on the data for that selected item.

    <img alt="Details page listing home info" src="assets/images/tutorials/first-app/homes-app-lesson-11-step-3.png">

</docs-step>

<docs-step title="Add navigation to the `Home`">
In a previous lesson you updated the `App` template to include a `routerLink`. Adding that code updated your app to enable navigation back to the `Home` whenever the logo is clicked.

1. Confirm that your code matches the following:

    <docs-code header="Add routerLink to App" path="adev/src/content/tutorials/first-app/steps/12-forms/src/app/app.ts" visibleLines="[8,20]"/>

    Your code may already be up-to-date but confirm to be sure.
</docs-step>

</docs-workflow>

SUMMARY: In this lesson you added routing to show details pages.

You now know how to:

* use route parameters to pass data to a route
* use the `routerLink` directive to use dynamic data to create a route
* use route parameter to retrieve data from the `HousingService` to display specific housing location information.

Really great work so far.

For more information about the topics covered in this lesson, visit:

<docs-pill-row>
  <docs-pill href="guide/routing/common-router-tasks#accessing-query-parameters-and-fragments" title="Route Parameters"/>
  <docs-pill href="guide/routing" title="Routing in Angular Overview"/>
  <docs-pill href="guide/routing/common-router-tasks" title="Common Routing Tasks"/>
  <docs-pill href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/Optional_chaining" title="Optional Chaining Operator"/>
</docs-pill-row>
