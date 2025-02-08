# Create Home component

This tutorial lesson demonstrates how to create a new [component](guide/components) for your Angular app.

<docs-video src="https://www.youtube.com/embed/R0nRX8jD2D0?si=OMVaw71EIa44yIOJ"/>

## What you'll learn

Your app has a new component: `HomeComponent`.

## Conceptual preview of Angular components

Angular apps are built around components, which are Angular's building blocks.
Components contain the code, HTML layout, and CSS style information that provide the function and appearance of an element in the app.
In Angular, components can contain other components. An app's functions and appearance can be divided and partitioned into components.

In Angular, components have metadata that define its properties.
When you create your `HomeComponent`, you use these properties:

* `selector`: to describe how Angular refers to the component in templates.
* `standalone`: to describe whether the component requires a `NgModule`.
* `imports`: to describe the component's dependencies.
* `template`: to describe the component's HTML markup and layout.
* `styleUrls`: to list the URLs of the CSS files that the component uses in an array.

<docs-pill-row>
  <docs-pill href="api/core/Component" title="Learn more about Components"/>
</docs-pill-row>

<docs-workflow>

<docs-step title="Create the `HomeComponent`">
In this step, you create a new component for your app.

In the **Terminal** pane of your IDE:

1. In your project directory, navigate to the `first-app` directory.
1. Run this command to create a new `HomeComponent`

    <docs-code language="shell">
    ng generate component home
    </docs-code>

1. Run this command to build and serve your app.

    Note: This step is only for your local environment!

    <docs-code language="shell">
    ng serve
    </docs-code>

1. Open a browser and navigate to `http://localhost:4200` to find the application.

1. Confirm that the app builds without error.

    HELPFUL: It should render the same as it did in the previous lesson because even though you added a new component, you haven't included it in any of the app's templates, yet.

1. Leave `ng serve` running as you complete the next steps.
</docs-step>

<docs-step title="Add the new component to your app's layout">
In this step, you add the new component, `HomeComponent` to your app's root component, `AppComponent`, so that it displays in your app's layout.

In the **Edit** pane of your IDE:

1. Open `app.component.ts` in the editor.
1. In `app.component.ts`, import `HomeComponent` by adding this line to the file level imports.

    <docs-code header="Import HomeComponent in src/app/app.component.ts" path="adev/src/content/tutorials/first-app/steps/03-HousingLocation/src/app/app.component.ts" visibleLines="[2]"/>

1. In `app.component.ts`, in `@Component`, update the `imports` array property and add `HomeComponent`.

    <docs-code header="Replace in src/app/app.component.ts" path="adev/src/content/tutorials/first-app/steps/03-HousingLocation/src/app/app.component.ts" visibleLines="[7]"/>

1. In `app.component.ts`, in `@Component`, update the `template` property to include the following HTML code.

    <docs-code header="Replace in src/app/app.component.ts" path="adev/src/content/tutorials/first-app/steps/03-HousingLocation/src/app/app.component.ts" visibleLines="[8,17]"/>

1. Save your changes to  `app.component.ts`.
1. If `ng serve` is running, the app should update.
    If `ng serve` is not running, start it again.
    *Hello world* in your app should change to *home works!* from the `HomeComponent`.
1. Check the running app in the browser and confirm that the app has been updated.

    <img alt="browser frame of page displaying the text 'home works!'" src="assets/images/tutorials/first-app/homes-app-lesson-02-step-2.png">

</docs-step>

<docs-step title="Add features to `HomeComponent`">

In this step you add features to `HomeComponent`.

In the previous step, you added the default `HomeComponent` to your app's template so its default HTML appeared in the app.
In this step, you add a search filter and button that is used in a later lesson.
For now, that's all that `HomeComponent` has.
Note that, this step just adds the search elements to the layout without any functionality, yet.

In the **Edit** pane of your IDE:

1. In the `first-app` directory, open `home.component.ts` in the editor.
1. In `home.component.ts`, in `@Component`, update the `template` property with this code.

    <docs-code header="Replace in src/app/home/home.component.ts" path="adev/src/content/tutorials/first-app/steps/03-HousingLocation/src/app/home/home.component.ts" visibleLines="[8,15]"/>

1. Next, open `home.component.css` in the editor and update the content with these styles.

    Note: In the browser, these can go in `src/app/home/home.component.ts` in the `styles` array.

    <docs-code header="Replace in src/app/home/home.component.css" path="adev/src/content/tutorials/first-app/steps/03-HousingLocation/src/app/home/home.component.css"/>

1. Confirm that the app builds without error.
    You should find the filter query box and button in your app and they should be styled.
    Correct any errors before you continue to the next step.

    <img alt="browser frame of homes-app displaying logo, filter text input box and search button" src="assets/images/tutorials/first-app/homes-app-lesson-02-step-3.png">
    </docs-step>

</docs-workflow>

Summary: In this lesson, you created a new component for your app and gave it a filter edit control and button.

For more information about the topics covered in this lesson, visit:

<docs-pill-row>
  <docs-pill href="cli/generate/component" title="`ng generate component`"/>
  <docs-pill href="api/core/Component" title="`Component` reference"/>
  <docs-pill href="guide/components" title="Angular components overview"/>
</docs-pill-row>
