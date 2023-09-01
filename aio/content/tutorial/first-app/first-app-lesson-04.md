# First Angular app lesson 4 - Creating an interface

This tutorial lesson demonstrates how to create an interface and include it in a component of your app.

**Estimated time**: ~10 minutes

**Starting code:** <live-example name="first-app-lesson-03"></live-example>

**Completed code:** <live-example name="first-app-lesson-04"></live-example>

## What you'll learn

*  Your app has a new interface that it can use as a data type.
*  Your app has an instance of the new interface with sample data.

## Conceptual preview of interfaces

[Interfaces](https://www.typescriptlang.org/docs/handbook/interfaces.html) are custom data types for your app.

Angular uses TypeScript to take advantage of working in a strongly typed programming environment.
Strong type checking reduces the likelihood of one element in your app sending incorrectly formatted data to another.
Such type-mismatch errors are caught by the TypeScript compiler and many such errors can also be caught in your IDE.

In this lesson, you'll create an interface to define properties that represent data about a single housing location.

## Step 1 - Create a new Angular interface

This step creates a new interface in your app.

In the **Terminal** pane of your IDE:

1.  In your project directory, navigate to the `first-app` directory.
1.  In the `first-app` directory, run this command to create the new interface.

    <code-example format="shell" language="shell">

    ng generate interface housinglocation

    </code-example>

1.  Run `ng serve` to build the app and serve it to `http://localhost:4200`.
1.  In a browser, open `http://localhost:4200` to see your app.
1.  Confirm that the app builds without error.
    Correct any errors before you continue to the next step.

## Step 2 - Add properties to the new interface

This step adds the properties to the interface that your app needs to represent a housing location.

1.  In the **Terminal** pane of your IDE, start the `ng serve` command, if it isn't already running, to build the app and serve it to `http://localhost:4200`.
1.  In the **Edit** pane of your IDE, open the `src/app/housinglocation.ts` file.
1.  In `housinglocation.ts`, replace the default content with the following code to make your new interface to match this example.

    <code-example header="Update src/app/housinglocation.ts to match this code" path="first-app-lesson-04/src/app/housinglocation.ts"></code-example>

1.  Save your changes and confirm the app does not display any errors. Correct any errors before you continue to the next step.

At this point, you've defined an interface that represents data about a housing location including an id, name, and location information.

## Step 3 - Create a test house for your app

You have an interface, but you aren't using it yet.

In this step, you create an instance of the interface and assign some sample data to it.
You won't see this sample data appear in your app yet.
There are a few more lessons to complete before that happens.

1.  In the **Terminal** pane of your IDE, run the `ng serve` command, if it isn't already running, to build the app and serve your app to `http://localhost:4200`.
1.  In the **Edit** pane of your IDE, open `src/app/home/home.component.ts`.
1.  In `src/app/home/home.component.ts`, add this import statement after the existing `import` statements so that `HomeComponent` can use the new interface.

    <code-example header="Import HomeComponent in src/app/home/home.component.ts" path="first-app-lesson-04/src/app/home/home.component.ts" region="housing-location-import"></code-example>

1.  In `src/app/home/home.component.ts`, replace the empty `export class HomeComponent {}` definition with this code to create a single instance of the new interface in the component.

    <code-example header="Add sample data to src/app/home/home.component.ts" path="first-app-lesson-04/src/app/home/home.component.ts" region="only-house"></code-example>

1.  Confirm that your `home.component.ts` file matches like this example.

    <code-example header="src/app/home/home.component.ts" path="first-app-lesson-04/src/app/home/home.component.ts"></code-example>

    By adding the `housingLocation` property of type `HousingLocation` to the `HomeComponent` class, we're able to confirm that the data matches the description of the interface. If the data didn't satisfy the description of the interface, the IDE has enough information to give us helpful errors.

1.  Save your changes and confirm the app does not have any errors. Open the browser and confirm that your application still displays the message "housing-location works!"

    <section class="lightbox">
    <img alt="browser frame of homes-app displaying logo, filter text input box and search button and the message 'housing-location works!'" src="generated/images/guide/faa/homes-app-lesson-03-step-2.png">
    </section>

1.  Correct any errors before you continue to the next step.

## Lesson review

In this lesson, you created an interface that created a new data type for your app.
This new data type makes it possible for you to specify where `HousingLocation` data is required.
This new data type also makes your IDE and the TypeScript compiler ensure that `HousingLocation` data is used where it's required.

If you are having any trouble with this lesson, you can review the completed code for it in the <live-example></live-example>.

## Next steps

* [Lesson 5 - Add an input parameter to the component](tutorial/first-app/first-app-lesson-05)


## More information

For more information about the topics covered in this lesson, visit:

<!-- vale Angular.Google_WordListSuggestions = NO -->

*  [ng generate interface](cli/generate#interface-command)
*  [ng generate](cli/generate)
