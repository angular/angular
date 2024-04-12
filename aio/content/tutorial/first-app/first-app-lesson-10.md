# Lesson 10: Add routes to the application
This tutorial lesson demonstrates how to add routes to your app.

**Estimated time**: ~15 minutes

**Starting code:** <live-example name="first-app-lesson-09"></live-example>

**Completed code:** <live-example name="first-app-lesson-10"></live-example>

## What you'll learn
At the end of this lesson your application will have support for routing.

## Conceptual preview of routing

<!-- markdownLint-disable MD001 -->
This tutorial introduces routing in Angular. Routing is the ability to navigate from one component in the application to another. In [Single Page Applications (SPA)](/guide/router-tutorial#using-angular-routes-in-a-single-page-application), only parts of the page are updated to represent the requested view for the user.

The [Angular Router](/guide/router-tutorial) enables users to declare routes and specify which component should be displayed on the screen if that route is requested by the application.

In this lesson, you will enable routing in your application to navigate to the details page.

## Step 1 - Create a default details component

1. From the terminal, enter the following command to create the `DetailsComponent`:

    <code-example format="shell" language="shell">

    ng generate component details --inline-template --skip-tests

    </code-example>

    This component will represent the details page that provides more information on a given housing location.

## Step 2 - Add routing to the application
1.  In the `src/app` directory, create a file called `routes.ts`. This file is where we will define the routes in the application.

1.  In `main.ts`, make the following updates to enable routing in the application:
    1.  Import the routes file and the `provideRouter` function:

        <code-example header="Import routing details in src/main.ts" path="first-app-lesson-10/src/main.ts" region="add-router-imports"></code-example>

    1. Update the call to `bootstrapApplication` to include the routing configuration:

        <code-example header="Add router configuration in src/main.ts" path="first-app-lesson-10/src/main.ts" region="add-router-config"></code-example>

1.  In `src/app/app.component.ts`, update the component to use routing:
    1.  Add a file level import for `RoutingModule`:

        <code-example header="Import RouterModule in src/app/app.component.ts" path="first-app-lesson-10/src/app/app.component.ts" region="import-router-module"></code-example>

    1.  Add `RouterModule` to the `@Component` metadata imports

        <code-example header="Import RouterModule in src/app/app.component.ts" path="first-app-lesson-10/src/app/app.component.ts" region="import-router-module-deco"></code-example>

    1. In the `template` property, replace the `<app-home></app-home>` tag with the `<router-outlet>` directive and add a link back to the home page. Your code should match this code:

        <code-example header="Add router-outlet in src/app/app.component.ts" path="first-app-lesson-10/src/app/app.component.ts" region="add-router-outlet"></code-example>

## Step 3 - Add route to new component
In the previous step you removed the reference to the `<app-home>` component in the template. In this step, you will add a new route to that component.

1.  In `routes.ts`, perform the following updates to create a route.
    1.  Add a file level imports for the `HomeComponent`, `DetailsComponent` and the `Routes` type that you'll use in the route definitions.

        <code-example header="Import components and Routes" path="first-app-lesson-10/src/app/routes.ts" region="import-routes-components"></code-example>

    1.  Define a variable called `routeConfig` of type `Routes` and define two  routes for the app:

        <code-example header="Add routes to the app" path="first-app-lesson-10/src/app/routes.ts" region="define-app-routes"></code-example>

        The entries in the `routeConfig` array represent the routes in the application. The first entry navigates to the `HomeComponent` whenever the url matches `''`. The second entry uses some special formatting that will be revisited in a future lesson.

1.  Save all changes and confirm that the application works in the browser. The application should still display the list of housing locations.

## Lesson review

In this lesson, you enabled routing in your app as well as defined new routes. Now your app can support navigation between views. In the next lesson, you will learn to navigate to the "details" page for a given housing location.

You are making great progress with your app, well done.

If you are having any trouble with this lesson, you can review the completed code for it in the <live-example></live-example>.

## Next steps

*  [Lesson 11 - Integrate details page into application](tutorial/first-app/first-app-lesson-11)

## More information

For more information about the topics covered in this lesson, visit:

<!-- vale Angular.Google_WordListSuggestions = NO -->

*  [Routing in Angular Overview](guide/routing-overview)
*  [Common Routing Tasks](guide/router)

@reviewed 2023-10-24
