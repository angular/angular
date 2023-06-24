# Lesson 6 - Add a property binding to a component’s template

This tutorial lesson demonstrates how to add property binding to a template and use it to pass dynamic data to components.

**Time required:** expect to spend about 5 minutes to complete this lesson.

## Before you start

This lesson starts with the code from the previous lesson, so you can:

*   Use the code that you created in Lesson 5 in your integrated development environment (IDE).
*   Start with the code example from the previous lesson. Choose the <live-example name="first-app-lesson-05"></live-example> from Lesson 5 where you can:
    *   Use the *live example* in StackBlitz, where the StackBlitz interface is your IDE.
    *   Use the *download example* and open it in your IDE.

If you haven't reviewed the introduction, visit the [Introduction to Angular tutorial](tutorial/first-app) to make sure you have everything you need to complete this lesson.

If you have any trouble during this lesson, you can review the completed code for this lesson, in the <live-example></live-example> for this lesson.

## After you finish

*  Your app has data bindings in the `HomeComponent` template.
*  Your app sends data from the `HomeComponent` to the `HousingLocationComponent`.

## Conceptual preview of Inputs
In lesson 5, you added `@Input` decorators to properties in the `HousingLocationComponent` allow the component to receive data. In this lesson, you'll continue the process of sharing data from the parent component to the child component by binding data to those properties in the template. There are several forms of data binding in Angular, in this lesson you'll use property binding.

Property binding enables you to connect a variable to an `Input` in an Angular template. The data is then dynamically bound to the `Input`.

For a more in depth explanation, please refer to the [Property binding](guide/property-binding) guide.

## Lesson steps

Perform these steps on the app code in your IDE.

### Step 1 - Update <app-housing-location> tag in the `HomeComponent` template
This step adds property binding to the `<app-housing-location>` tag.

In the code editor:
1.  Navigate to `src/app/home/home.component.ts`
1.  In the template property of the `@Component` decorator, update the code to match the code below:
    <code-example header="Add housingLocation property binding" path="first-app-lesson-06/src/app/home/home.component.ts" region="add-property-binding"></code-example>

    When adding a property binding to a component tag, we use the `[attribute] = "value"` syntax to notify Angular that the assigned value should be treated as a property from the component class and not a string value. 

    The value on the right handside is the name of the property from the `HomeComponent`.

### Step 2 - Confirm the code still works
1.  Save your changes and confirm the app does not have any errors.
1.  Correct any errors before you continue to the next step.

## Lesson review

In this lesson, you added a new property binding and passed in a reference to a class property. Now, the `HousingLocationComponent` has access to data that it can use to customize the component's display.

If you are having any trouble with this lesson, you can review the completed code for it in the <live-example></live-example>.

## Next steps

* [Lesson 7 - Add an interpolation to a component’s template](tutorial/first-app/first-app-lesson-07)

## For more information about the topics covered in this lesson, visit:
* [Property binding](guide/property-binding)
