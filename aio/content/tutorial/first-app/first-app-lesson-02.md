# Lesson 2: Create Home component
This tutorial lesson demonstrates how to create a new [component](/guide/component-overview) for your Angular app.

**Estimated time**: ~10 minutes

**Starting code:** <live-example name="first-app-lesson-01"></live-example>

**Completed code:** <live-example name="first-app-lesson-02"></live-example>

## What you'll learn

Your app has a new component: `HomeComponent`.

## Conceptual preview of Angular components

Angular apps are built around components, which are Angular's building blocks.
Components contain the code, HTML layout, and CSS style information that provide the function and appearance of an element in the app.
In Angular, components can contain other components. An app's functions and appearance can be divided and partitioned into components.

In Angular, components have metadata that define its properties.
When you create your `HomeComponent`, you use these properties:

*   `selector`: to describe how Angular refers to the component in templates.
*   `standalone`: to describe whether the component requires a `NgModule`.
*   `imports`: to describe the component's dependencies.
*   `template`: to describe the component's HTML markup and layout.
*   `styleUrls`: to list the URLs of the CSS files that the component uses in an array.

[Learn more about Components.](/api/core/Component)

## Step 1 - Create the `HomeComponent`

In this step, you create a new component for your app.

In the **Terminal** pane of your IDE:

1.  In your project directory, navigate to the `first-app` directory.
1.  Run this command to create a new `HomeComponent`

    <code-example format="shell" language="shell">

    ng generate component home --inline-template --skip-tests

    </code-example>

1.  Run this command to build and serve your app.

    <code-example format="shell" language="shell">

    ng serve

    </code-example>

1.  Open a browser and navigate to `http://localhost:4200` to find the application.
1.  Confirm that the app builds without error.

    <div class="callout is-helpful">
      It should render the same as it did in the previous lesson because even though you added a new component, you haven't included it in any of the app's templates, yet.
    </div>
1.  Leave `ng serve` running as you complete the next steps.

## Step 2 - Add the new component to your app's layout

In this step, you add the new component, `HomeComponent` to your app's root component, `AppComponent`, so that it displays in your app's layout.

In the **Edit** pane of your IDE:

1.  Open `app.component.ts` in the editor.
1.  In `app.component.ts`, import `HomeComponent` by adding this line to the file level imports.

    <code-example header="Import HomeComponent in src/app/app.component.ts" path="first-app-lesson-02/src/app/app.component.ts" region="import-home"></code-example>

1.  In `app.component.ts`, in `@Component`, update the `imports` array property and add `HomeComponent`.

    <code-example header="Replace in src/app/app.component.ts" path="first-app-lesson-02/src/app/app.component.ts" region="app-metadata-imports"></code-example>
1.  In `app.component.ts`, in `@Component`, update the `template` property to include the following HTML code.

    <code-example header="Replace in src/app/app.component.ts" path="first-app-lesson-02/src/app/app.component.ts" region="app-metadata-template"></code-example>
1.  Save your changes to  `app.component.ts`.
1.  If `ng serve` is running, the app should update.
    If `ng serve` is not running, start it again.
    *Hello world* in your app should change to *home works!* from the `HomeComponent`.
1.  Check the running app in the browser and confirm that the app has been updated.

<section class="lightbox">
<img alt="browser frame of page displaying the text 'home works!'" src="generated/images/guide/faa/homes-app-lesson-02-step-2.png">
</section>

## Step 3 - Add features to `HomeComponent`

In this step you add features to `HomeComponent`.

In the previous step, you added the default `HomeComponent` to your app's template so its default HTML appeared in the app.
In this step, you add a search filter and button that is used in a later lesson.
For now, that's all that `HomeComponent` has.
Note that, this step just adds the search elements to the layout without any functionality, yet.

In the **Edit** pane of your IDE:

1.  In the `first-app` directory, open `home.component.ts` in the editor.
1.  In `home.component.ts`, in `@Component`, update the `template` property with this code.

    <code-example header="Replace in src/app/home/home.component.ts" path="first-app-lesson-02/src/app/home/home.component.ts" region="home-template"></code-example>

1.  Next, open `home.component.css` in the editor and update the content with these styles.

    <code-example header="Replace in src/app/home/home.component.css" path="first-app-lesson-02/src/app/home/home.component.css"></code-example>

1.  Confirm that the app builds without error.
    You should find the filter query box and button in your app and they should be styled.
    Correct any errors before you continue to the next step.

<section class="lightbox">
<img alt="browser frame of homes-app displaying logo, filter text input box and search button" src="generated/images/guide/faa/homes-app-lesson-02-step-3.png">
</section>

## Lesson review

In this lesson, you created a new component for your app and gave it a filter edit control and button.

If you are having any trouble with this lesson, you can review the completed code for it in the <live-example></live-example>.

## Next steps

* [First Angular app lesson 3 - Create the application’s HousingLocation component](tutorial/first-app/first-app-lesson-03)

## More information

For more information about the topics covered in this lesson, visit:

*  [`ng generate component`](cli/generate#component-command)
*  [`Component` reference](api/core/Component)
*  [Angular components overview](guide/component-overview)

@reviewed 2023-10-24
