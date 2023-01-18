# First Angular app lesson 2 - Create home component

<div class="callout is-important">

<header>This topic is a work in progress</header>

This topic is a rough draft. Many sections are incomplete and some or all content might change before its final draft.

<!--
This topic is a first draft. It is complete, but it some or all content might change before its final draft.

This topic is a final draft. It is complete and ready for review.
-->

</div>

This tutorial lesson demonstrates how to create a new Angular component for your app.

**Time required:** expect to spend about 10 minutes to complete this lesson.

## Before you start

This lesson starts with the code from the previous lesson, so you can:

*   Use the code that you created in Lesson 1 in your interactive development environment (IDE).
*   Start with the code example from the previous lesson. Choose the <live-example name="first-app-lesson-01"></live-example> from Lesson 1 where you can:
    *   Use the *live example* in StackBlitz, where the StackBlitz interface is your IDE.
    *   Use the *download example* and open it in your IDE.

If you haven't reviewed the introduction, visit the [Introduction to Angular tutorial](tutorial/first-app) to make sure you have everything you need to complete this lesson.

If you have any trouble during this lesson, you can review the completed code for this lesson, in the <live-example></live-example> for this lesson.

## After you finish

* Your app has a new component: `HomeComponent`.

## Conceptual preview of Angular components

Angular apps are built around Angular components, which are Angular's building blocks.
Angular components contain the code, HTML layout, and CSS style information that provide the function and appearance of an element in the app.
Angular components can contain other components such that an app's functions and appearance can divided and partitioned into components.

In [Lesson 1](tutorial/first-app/first-app-lesson-01), you worked on the `AppComponent`, named `app-root`, whose function is to contain all the other components.
In this lesson, you create a `HomeComponent`, named `app-home`, to provide the home page of the app.
In later lessons, you create more components to provide more features to the app.

Components contain *Directives* that describe the component's properties.
When you create your `HomeComponent`, you use these `Directives`:

*   `selector`: to describe how Angular refers to the component.
*   `standalone`: to describe whether the component must be in an `ngModule`.
*   `imports`: to describe the component's dependencies in an array.
*   `template`: to describe the component's HTML layout template.
*   `styleUrls`: to list the URLs of the CSS files that the component users in an array.

Components have other `Directives`, but these are the ones used by `HomeComponent`.

## Lesson steps

Perform these steps on the app code in your IDE.

### Step 1 - Create the `HomeComponent`

In this step, you create a new component for your app.

In the **Terminal** pane of your IDE:

1.  In your project directory, navigate to the `first-app` directory.
1.  Run this command to create a new `HomeComponent`

    <code-example format="shell" language="shell">

    ng generate component Home --standalone --inline-template --skip-tests

    </code-example>

1.  Run this command to build and serve the your app.

    <code-example format="shell" language="shell">

    ng serve

    </code-example>

1.  The app should build without errors, and you should see it in a browser at `http://localhost:4200`.
1.  Confirm that the app builds without error.
    Note it should look just like it did in the previous lesson because even though you added a new component, you haven't included it in any of the app's templates, yet.
    Correct any errors before you continue to the next step.
1.  Leave `ng serve` running as you complete the next steps.

### Step 2 - Add the new component to your app's layout

In this step, you add the new component to your app's layout so that it appears on your app.

In the **Edit** pane of your IDE:

1.  In the `first-app` directory, from the `src/app` directory, open `app.component.ts` in the editor.
1.  In `app.component.ts`, add this line after the `import { Component } ...` line.

    <code-example header="Add to src/app/app.component.ts" path="first-app-lesson-02/src/app/app.component.ts" region="import-home"></code-example>

1.  In `app.component.ts`, in `@Component`, replace the `imports` and `template` directives with this code.

    <code-example header="Replace in src/app/app.component.ts" path="first-app-lesson-02/src/app/app.component.ts" region="app-directives"></code-example>

1.  Save your changes to  `app.component.ts`.
1.  If `ng serve` is running, the app should update.
    If `ng serve` is not running, start it again.
    *Hello world* in your app should change to *home works!* from the `HomeComponent`.
1.  Confirm that the app builds without error.
    Correct any errors before you continue to the next step.

### Step 3 - Add features to `HomeComponent`

In this step you add features to `HomeComponent`.

In the previous step, you added the default `HomeComponent` to your app's template so its default HTML appeared in the app.
In this step, you add a search filter and button that is used in a later lesson.
For now, that's all that `HomeComponent` has.
Note that, this step just adds the search elements to the layout without any function, yet.

In the **Terminal** pane of your IDE:

1.  In the `first-app` directory, from the `src/app/home` directory, open `home.component.ts` in the editor.
1.  In `app.component.ts`, in `@Component`, replace the `imports`  with this code.

    <code-example header="Replace in src/app/home/home.component.ts" path="first-app-lesson-02/src/app/home/home.component.ts" region="home-template"></code-example>

1.  In the `src/app/home` directory, open `home.component.css` in the editor and replace its contents with these.
    Note, `home.component.css` should be empty.

    <code-example header="Replace in src/app/home/home.component.css" path="first-app-lesson-02/src/app/home/home.component.css"></code-example>

1.  Confirm that the app builds without error.
    You should see filter query box and button in your app and they should be styled.
    Correct any errors before you continue to the next step.

## Lesson review

In this lesson, you created a new component for your app and gave it a filter edit control and button.

If you are having any trouble with this lesson, you can review the completed code for it in the <live-example></live-example>.

## Next steps

* **Link to Lesson 3**

## More information

For more information about the topics covered in this lesson, visit:

*  [`ng generate component`](cli/generate#component-command)
*  [`Component` reference](api/core/Component)
*  [Angular components overview](guide/component-overview)
