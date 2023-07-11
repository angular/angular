# Lesson 11 - Integrate details page into application

This tutorial lesson demonstrates how to connect the details page to your app.

**Estimated time**: ~15 minutes

**Starting code:** <live-example name="first-app-lesson-10"></live-example>

**Completed code:** <live-example name="first-app-lesson-11"></live-example>

## What you'll learn
At the end of this lesson your application will have support for routing to the details page.

## Conceptual preview of routing with route parameters
Each housing location has specific details that should be displayed when a user navigates to the details page for that item. To accomplish this goal, you will need to use route parameters.

Route parameters enable you to include dynamic information as a part of your route URL. To identify which housing location a user has clicked on you will use the `id` property of the `HousingLocation` type.

## Step 1 - Create a new service for your app
In lesson 10, you added a second route to `src/app/routes.ts` which includes a special segment that identifies the route parameter, `id`:

    <code-example format="javascript" language="javascript">
    'details/:id'
    </code-example>

In this case, `:id` is dynamic and will change based on how the route is requested by the code.

1.  In `src/app/housing-location/housing-location.component.ts`, add an anchor tag to the `section` element and include the `routerLink` directive:

    <code-example header="Add anchor with a routerLink directive to housing-location.component.ts" path="first-app-lesson-11/src/app/housing-location/housing-location.component.ts" region="add-router-link"></code-example>

    The `routerLink` directive enables Angular's router to create dynamic links in the application. The value assigned to the `routerLink` is an array with two entries: the static portion of the path and the dynamic data.

    For the `routerLink` to work in the template, add a file level import of `RouterLink` and `RouterOutlet` from '@angular/router', then update the component `imports` array to include both `RouterLink` and `RouterOutlet`.
1. At this point you can confirm that the routing is working in your app. In the browser, refresh the home page and click the "Learn More" button for a housing location.

    <section class="lightbox">
    <img alt="details page displaying the text 'details works!'" src="generated/images/guide/faa/homes-app-lesson-11-step-1.png">
    </section>

## Step 2 - Get route parameters
In this step, you will get the route parameter in the `DetailsComponent`. Currently, the app displays `details works!`. Next you'll update the code to display the `id` value passed using the route parameters.

1.  In `src/app/details/details.component.ts` update the template to import the functions, classes and services that you'll need to use in the `DetailsComponent`:

    <code-example header="Update file level imports" path="first-app-lesson-11/src/app/details/details.component.ts" region="import-resources-for-details"></code-example>

1. Update the `template` property of the `@Component` decorator to display the value `housingLocationId`:

    <code-example format="javascript" language="javascript">
      template: `&lt;p&gt;details works! {{ housingLocationId }}&lt;/p&gt;`,
    </code-example>

1.  Update the body of the `DetailsComponent` with the following code:

    <code-example format="javascript" language="javascript">
        export class DetailsComponent {
            route: ActivatedRoute = inject(ActivatedRoute);
            housingLocationId = -1;
            constructor() {
                this.housingLocationId = Number(this.route.snapshot.params['id']);
            }
        }
    </code-example>

    This code gives the `DetailsComponent` access to the `ActivatedRoute` router feature that enables you to have access to the data about the current route. In the `constructor`, the code converts the `id` parameter acquired from the route from a string to a number.

1.  Save all changes.

1.  In the browser, click on one of the housing location's "Learn More" links and confirm that the numeric value displayed on the page matches the `id` property for that location in the data.

## Step 3 - Customize the `DetailComponent`
Now that routing is working properly in the application this is a great time to update the template of the `DetailsComponent` to display the specific data represented by the housing location for the route parameter.

To access the data you will add a call to the `HousingService`.

1.  Update the template code to match the following code:

    <code-example header="Update the DetailsComponent template in src/app/details/details.component.ts" path="first-app-lesson-11/src/app/details/details.component.ts" region="update-details-template"></code-example>

    Notice that the `housingLocation` properties are being accessed with the optional chaining operator `?`. This ensures that if the `housingLocation` value is null or undefined the application doesn't crash.

1.  Update the body of the `DetailsComponent` class to match the following code:

    <code-example header="Update the DetailsComponent class in src/app/details/details.component.ts" path="first-app-lesson-11/src/app/details/details.component.ts" region="get-housing-details"></code-example>

    Now the component has the code to display the correct information based on the selected housing location. The `constructor` now includes a call to the `HousingService` to pass the route parameter as an argument to the `getHousingLocationById` service function.

1.  Copy the following styles into the `src/app/details/details.component.css` file:

    <code-example header="Add styles for the DetailsComponent" path="first-app-lesson-11/src/app/details/details.component.css" region="add-details-styles"></code-example>

1.  Save your changes.

1.  In the browser refresh the page and confirm that when you click on the "Learn More" link for a given housing location the details page displays the correct information based on the data for that selected item.

    <section class="lightbox">
    <img alt="Details page listing home info" src="generated/images/guide/faa/homes-app-lesson-11-step-3.png">
    </section>

## Step 4 - Add navigation to the `HomeComponent`
In a previous lesson you updated the `AppComponent` template to include a `routerLink`. Adding that code updated your app to enable navigation back to the `HomeComponent` whenever the logo is clicked.

1.  Confirm that your code matches the following:

    <code-example header="Add routerLink to AppComponent" path="first-app-lesson-11/src/app/app.component.ts" region="add-router-link-to-header"></code-example>

    Your code may already be up-to-date but confirm to be sure.

## Lesson Review
In this lesson you updated your app to:
* use route parameters to pass data to a route
* use the `routerLink` directive to use dynamic data to create a route
* use route parameter to retrieve data from the `HousingService` to display specific housing location information.

Really great work so far. 

If you are having any trouble with this lesson, you can review the completed code for it in the <live-example></live-example>.

## Next Steps
*  [Lesson 12 - Adding forms to your Angular application](tutorial/first-app/first-app-lesson-12)

## More information

For more information about the topics covered in this lesson, visit:

<!-- vale Angular.Google_WordListSuggestions = NO -->
*  [Route Parameters](guide/router#accessing-query-parameters-and-fragments)
*  [Routing in Angular Overview](guide/routing-overview)
*  [Common Routing Tasks](guide/router)
*  [Optional Chaining Operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining)

@reviewed 2023-07-15