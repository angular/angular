# Add routes to the application

This tutorial lesson demonstrates how to add routes to your app.

<docs-video src="https://www.youtube.com/embed/r5DEBMuStPw?si=H6Bx6nLJoMLaMxkx" />

IMPORTANT: We recommend using your local environment to learn routing.

## What you'll learn

At the end of this lesson your application will have support for routing.

## Conceptual preview of routing

This tutorial introduces routing in Angular. Routing is the ability to navigate from one component in the application to another. In [Single Page Applications (SPA)](guide/routing), only parts of the page are updated to represent the requested view for the user.

The [Angular Router](guide/routing) enables users to declare routes and specify which component should be displayed on the screen if that route is requested by the application.

In this lesson, you will enable routing in your application to navigate to the details page.

<docs-workflow>

<docs-step title="Create a default details component ">
1. From the terminal, enter the following command to create the `DetailsComponent`:

    <docs-code language="shell">
    ng generate component details
    </docs-code>

    This component will represent the details page that provides more information on a given housing location.
</docs-step>

<docs-step title="Add routing to the application">
1.  In the `src/app` directory, create a file called `routes.ts`. This file is where we will define the routes in the application.

1. In `main.ts`, make the following updates to enable routing in the application:
    1. Import the routes file and the `provideRouter` function:

        <docs-code header="Import routing details in src/main.ts" path="adev/src/content/tutorials/first-app/steps/11-details-page/src/main.ts" visibleLines="[7,8]"/>

    1. Update the call to `bootstrapApplication` to include the routing configuration:

        <docs-code header="Add router configuration in src/main.ts" path="adev/src/content/tutorials/first-app/steps/11-details-page/src/main.ts" visibleLines="[10,17]"/>

1. In `src/app/app.component.ts`, update the component to use routing:
    1. Add a file level import for `RoutingModule`:

        <docs-code header="Import RouterModule in src/app/app.component.ts" path="adev/src/content/tutorials/first-app/steps/11-details-page/src/app/app.component.ts" visibleLines="[3]"/>

    1. Add `RouterModule` to the `@Component` metadata imports

        <docs-code header="Import RouterModule in src/app/app.component.ts" path="adev/src/content/tutorials/first-app/steps/11-details-page/src/app/app.component.ts" visibleLines="[6]"/>

    1. In the `template` property, replace the `<app-home></app-home>` tag with the `<router-outlet>` directive and add a link back to the home page. Your code should match this code:

        <docs-code header="Add router-outlet in src/app/app.component.ts" path="adev/src/content/tutorials/first-app/steps/11-details-page/src/app/app.component.ts" visibleLines="[7,18]"/>

</docs-step>

<docs-step title="Add route to new component">
In the previous step you removed the reference to the `<app-home>` component in the template. In this step, you will add a new route to that component.

1. In `routes.ts`, perform the following updates to create a route.
    1. Add a file level imports for the `HomeComponent`, `DetailsComponent` and the `Routes` type that you'll use in the route definitions.

        <docs-code header="Import components and Routes" path="adev/src/content/tutorials/first-app/steps/11-details-page/src/app/routes.ts" visibleLines="[1,3]"/>

    1. Define a variable called `routeConfig` of type `Routes` and define two  routes for the app:
        <docs-code header="Add routes to the app" path="adev/src/content/tutorials/first-app/steps/11-details-page/src/app/routes.ts" visibleLines="[5,18]"/>

        The entries in the `routeConfig` array represent the routes in the application. The first entry navigates to the `HomeComponent` whenever the url matches `''`. The second entry uses some special formatting that will be revisited in a future lesson.

1. Save all changes and confirm that the application works in the browser. The application should still display the list of housing locations.
</docs-step>

</docs-workflow>

SUMMARY: In this lesson, you enabled routing in your app as well as defined new routes. Now your app can support navigation between views. In the next lesson, you will learn to navigate to the "details" page for a given housing location.

You are making great progress with your app, well done.

For more information about the topics covered in this lesson, visit:

<docs-pill-row>
  <docs-pill href="guide/routing" title="Routing in Angular Overview"/>
  <docs-pill href="guide/routing/common-router-tasks" title="Common Routing Tasks"/>
</docs-pill-row>
