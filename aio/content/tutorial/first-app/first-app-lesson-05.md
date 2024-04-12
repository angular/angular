# Lesson 5: Add an input parameter to the component

This tutorial lesson demonstrates how to create a component `@Input()` and use it to pass data to a component for customization.

**Estimated time**: ~10 minutes

**Starting code:** <live-example name="first-app-lesson-04"></live-example>

**Completed code:** <live-example name="first-app-lesson-05"></live-example>

## What you'll learn

Your app's `HousingLocationComponent` template has a `HousingLocation` property to receive input.

## Conceptual preview of Inputs
[Inputs](api/core/Input) allow components to share data. The direction of the data sharing is from parent component to child component.

In this lesson, you'll define `@Input()` properties in the `HousingLocationComponent` component which will enable you to customize the data displayed in the component.

Learn more in the [Sharing data between child and parent directives and components](guide/inputs-outputs) guide.

## Step 1 - Import the Input decorator
This step imports the `Input` decorator into the class.

In the code editor:
1.  Navigate to `src/app/housing-location/housing-location.component.ts`
1.  Update the file imports to include `Input` and `HousingLocation`:

    <code-example header="Import HousingLocationComponent and Input in src/app/housing-location/housing-location.component.ts" path="first-app-lesson-05/src/app/housing-location/housing-location.component.ts" region="add-imports"></code-example>

## Step 2 - Add the Input property
1.  In the same file, add a property called `housingLocation` of type `HousingLocation` to the `HousingLocationComponent` class. Add an `!` after the property name and prefix it with the `@Input()` decorator:

    <code-example header="Import HousingLocationComponent and Input in src/app/housing-location/housing-location.component.ts" path="first-app-lesson-05/src/app/housing-location/housing-location.component.ts" region="add-housing-location-property"></code-example>

    You have to add the `!` because the input is expecting the value to be passed. In this case, there is no default value. In our example application case we know that the value will be passed in - this is by design. The exclamation point is called the non-null assertion operator and it tells the TypeScript compiler that the value of this property won't be null or undefined.

1.  Save your changes and confirm the app does not have any errors.

1.  Correct any errors before you continue to the next step.

## Lesson review

In this lesson, you created a new property decorated with the `@Input()` decorator. You also used the non-null assertion operator to notify the compiler that the value of the new property won't be `null` or `undefined`.

If you are having any trouble with this lesson, you can review the completed code for it in the <live-example></live-example>.

## Next steps

* [Lesson 6 - Add a property binding to an component’s template](tutorial/first-app/first-app-lesson-06)

## For more information about the topics covered in this lesson, visit:
* [Sharing data between child and parent directives and components](guide/inputs-outputs)

@reviewed 2023-07-11