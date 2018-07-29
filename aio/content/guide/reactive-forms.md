# Reactive forms

_Reactive forms_ provide a model-driven approach to handling form inputs whose values change over time. This guide shows you how to create and update a simple form control, progress to using multiple controls in a group, validate form values, and implement more advanced forms.



{@a toc}

Try the <live-example title="Reactive Forms in Stackblitz">Reactive Forms live-example</live-example>.

{@a intro}

## Introduction to reactive forms

Reactive forms use an explicit and immutable approach to managing the state of a form at a given point in time. Each change to the form state returns a new state, which maintains the integrity of the model between changes. Reactive forms are built around observable streams, where form inputs and values are provided as streams of input values, also while giving you synchronous access to the data. This approach allows your templates to take advantage of these streams of form state changes, rather than to be dependent to them.

Reactive forms also allow for easier testing because you have an assurance that your data is consistent and predictable when requested. Consumers outside your templates have access to the same streams, where they can manipulate that data safely.

Reactive forms differ from template-driven forms in distinct ways. Reactive forms provide more predictability with synchronous access to the data model, immutability with observable operators, and change tracking through observable streams. If you prefer direct access to modify data in your template, template-driven forms are less explicit because they rely on directives embedded in the template, along with mutable data to track changes asynchronously. See the [Appendix](#appendix) for detailed comparisons between the two paradigms.

## Getting started

This section describes the key steps to add a single form control. The example allows a user to enter their name into an input field, captures that input value, and displays the current value of the form control element.

### Step 1 - Register the `ReactiveFormsModule`

To use reactive forms, import `ReactiveFormsModule` from the `@angular/forms` package and add it to your NgModule's `imports` array.

<code-example path="reactive-forms/src/app/app.module.ts" region="imports" title="src/app/app.module.ts (excerpt)">

</code-example>

### Step 2 - Import and create a new form control 

Generate a component for the control.

<code-example language="sh" class="code-shell">

  ng generate component NameEditor

</code-example>

The `FormControl` is the most basic building block when using reactive forms. To register a single form control, import the `FormControl` class into your component and create a new instance of `FormControl` to save as a class property.

<code-example path="reactive-forms/src/app/name-editor/name-editor.component.ts" region="create-control" title="src/app/name-editor/name-editor.component.ts">

</code-example>

The constructor of the `FormControl` can be used to set its initial value, which in this case is set to an empty string. By creating these controls in your component class, you get immediate access to listen, update, and validate the state of the form input. 

### Step 3 - Register the control in the template

After you create the control in the component class, you must associate it with a form control element in the template. Update the template with the form control using the `formControl` binding provided by the `FormControlDirective` included in the `ReactiveFormsModule`.

<code-example path="reactive-forms/src/app/name-editor/name-editor.component.html" region="control-binding" linenums="false" title="src/app/name-editor/name-editor.component.html">

</code-example>

<div class="alert is-helpful">

*Note*: For a more detailed list of classes and directives provided by the `ReactiveFormsModule`, see the [Reactive Forms API](#reactive-forms-api) section.

</div>

Using the template binding syntax, the form control is now registered to the `name` input element in the template. The form control and DOM element communicate with each other: the view reflects changes in the model, and the model reflects changes in the view.

#### Display the component

The `FormControl` assigned to `name` is displayed once the component is added to a template. 

<code-example path="reactive-forms/src/app/app.component.1.html" region="app-name-editor" linenums="false" title="src/app/app.component.html (name editor)">

</code-example>

<figure>
  <img src="generated/images/guide/reactive-forms/name-editor-1.png" alt="Name Editor">
</figure>

## Managing control values

Reactive forms give you access to the form control state and value at a point in time. You can manipulate 
the current state and value through the component class or the component template. The following examples display the value of a `FormControl` and change it.

{@a display-value}

### Display the control’s value

Every `FormControl` provides its current value as an observable through the `valueChanges` property. You can listen to changes in the form’s value in the template using the `AsyncPipe` or in the component class using the `subscribe()` method. The `value` property also gives you a snapshot of the current value. 

Display the current value using interpolation in the template as shown in the following example.

<code-example path="reactive-forms/src/app/name-editor/name-editor.component.html" region="display-value" linenums="false" title="src/app/name-editor/name-editor.component.html (control value)">

</code-example>

The displayed value changes as you update the form control element.

Reactive forms also provide access to more information about a given control through properties and methods provided with each instance. These properties and methods of the underlying [AbstractControl](api/forms/AbstractControl) are used to control form state and determine when to display messages when handling validation. For more information, see [Simple Form Validation](#simple-form-validation) later in this guide.

Read about other `FormControl` properties and methods in the [Reactive Forms API](#reactive-forms-api) section.

### Replace the form control value

Reactive forms have methods to change a control's value programmatically, which gives you the flexibility to update the control’s value without user interaction. The `FormControl` provides a `setValue()` method which updates the value of the form control and validates the structure of the value provided against the control’s structure. For example, when retrieving form data from a backend API or service, use the `setValue()` method to update the control to its new value, replacing the old value entirely. 

The following example adds a method to the component class to update the value of the control to _Nancy_ using the `setValue()` method.

<code-example path="reactive-forms/src/app/name-editor/name-editor.component.ts" region="update-value" title="src/app/name-editor/name-editor.component.ts (update value)">

</code-example>

Update the template with a button to simulate a name update. Any value entered in the form control element before clicking the `Update Name` button will be reflected as its current value. 

<code-example path="reactive-forms/src/app/name-editor/name-editor.component.html" region="update-value" linenums="false" title="src/app/name-editor/name-editor.component.html (update value)">

</code-example>

Because the form model is the source of truth for the control, when you click the button the value of the input is also changed within the component class, overriding its current value.

<figure>
  <img src="generated/images/guide/reactive-forms/name-editor-2.png" alt="Name Editor Update">
</figure>

<div class="alert is-helpful">

*Note*: In this example, you are only using a single control, but when using the `setValue()` method with a `FormGroup` or `FormArray` the value needs to match the structure of the group or array.

</div>

## Grouping form controls

Just as a `FormControl` instance gives you control over a single input field, a `FormGroup` tracks the form state of a group of `FormControl` instances (for example, a form). Each control in `FormGroup` is tracked by name when creating the `FormGroup`. The following example shows how to manage multiple `FormControl` instances in a single group.

Generate a `ProfileEditor` component and import the `FormGroup` and `FormControl` classes from the `@angular/forms` package.

<code-example language="sh" class="code-shell">

  ng generate component ProfileEditor

</code-example>

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.1.ts" region="imports" title="src/app/profile-editor/profile-editor.component.ts (imports)">

</code-example>

### Step 1 - Create a `FormGroup`

Create a property in the component class named `profileForm` and set the property to a new instance of a `FormGroup`. To initialize the `FormGroup`, provide the constructor with an object of controls with their respective names. 

For the profile form, add two `FormControl` instances with the names `firstName` and `lastName`.

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.1.ts" region="formgroup" title="src/app/profile-editor/profile-editor.component.ts (form group)">

</code-example>

The individual form controls are now collected within a group. The `FormGroup` provides its model value as an object reduced from the values of each control in the group. A `FormGroup` instance has the same properties (such as `value`, `untouched`) and methods (such as `setValue()`) as a `FormControl` instance.

### Step 2 - Associate the `FormGroup` model and view

The `FormGroup` also tracks the status and changes of each of its controls, so if one of the control’s status or value changes, the parent control also emits a new status or value change. The model for the group is maintained from its members. After you define the model, you must  update the template to reflect the model in the view.

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.1.html" region="formgroup" linenums="false" title="src/app/profile-editor/profile-editor.component.html (template form group)">

</code-example>

Note that just as the `FormGroup` contains a group of controls, the _profileForm_ `FormGroup` is bound to the `form` element with the `FormGroup` directive, creating a communication layer between the model and the form containing the inputs. The `formControlName` input provided by the `FormControlName` directive binds each individual input to the form control defined in the `FormGroup`. The form controls communicate with their respective elements. The also communicate changes to the `FormGroup`, which provides the source of truth for the model value.

### Save form data

The `ProfileEditor` component takes input from the user, but in a real scenario you want to capture the form value for further processing outside the component. The `FormGroup` directive listens for the `submit` event emitted by the `form` element and emits an `ngSubmit` event that you can bind to a callback function. 

Add an `ngSubmit` event listener to the `form` tag with the `onSubmit()` callback method.

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.html" region="ng-submit" linenums="false" title="src/app/profile-editor/profile-editor.component.html (submit event)">

</code-example>

The `onSubmit()` method in the `ProfileEditor` component captures the current value of the `profileForm`. To keep the form encapsulated, to provide the form value outside the component, use an `EventEmitter`. The following example uses `console.warn` to log to the browser console.

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.ts" region="on-submit" title="src/app/profile-editor/profile-editor.component.ts (submit method)">

</code-example>

The `submit` event is emitted by the `form` tag using the native DOM event. You trigger the event by clicking a button with `submit` type. This allows the user to use the enter key to trigger submission after filling out the form. 

Add a `button` to the bottom of the form to trigger the form submission.

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.html" region="submit-button" linenums="false" title="src/app/profile-editor/profile-editor.component.html (submit button)">

</code-example>

<div class="alert is-helpful">

*Note:* The button in the snippet above also has a `disabled` binding attached to it to disable the button when the `profileForm` is invalid. You aren't performing any validation yet, so the button is always enabled. Simple form validation is covered later in the [Form Validation](#simple-form-validation) section.

</div>

#### Display the component

The `ProileEditor` component that contains the form is displayed when added to a component template.

<code-example path="reactive-forms/src/app/app.component.1.html" region="app-profile-editor" linenums="false" title="src/app/app.component.html (profile editor)">

</code-example>

The `ProfileEditor` allows you to manage the `FormControl` instances for the `firstName` and `lastName` controls within the `FormGroup`.

<figure>
  <img src="generated/images/guide/reactive-forms/profile-editor-1.png" alt="Profile Editor">
</figure>

## Nesting form groups

When building complex forms, managing the different areas of information is easier in smaller sections, and some groups of information naturally fall into the same group. Using a nested `FormGroup` allows you to break large forms groups into smaller, more manageable ones.

### Step 1 - Create a nested group

An address is a good example of information that can be grouped together. A `FormGroup` can accept both `FormControl` and `FormGroup` instances as children. This makes composing complex form models easier to maintain and logically group together. To create a nested group in the `profileForm`, add a nested `address` `FormGroup`.

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.1.ts" region="nested-formgroup" linenums="false" title="src/app/profile-editor/profile-editor.component.ts (nested form group)">

</code-example>

In this example, the `address group` combines the current `firstName` and `lastName` controls with the new `street`, `city`, `state` and `zip` controls. Even though the `address` `FormGroup` is a child of the overall `profileForm` `FormGroup`, the same rules still apply with value and status changes. Changes in status and value from the nested form group will propagate up to the parent form group, maintaining consistency with the overall model.

### Step 2 - Group the nested form in the template

After you update the model in the component class, update the template to connect the `FormGroup` instance and its input elements.

Add the `address` form group containing the `firstName` and `lastName` fields to the `ProfileEditor` template.

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.1.html" region="formgroupname" linenums="false" title="src/app/profile-editor/profile-editor.component.html (template nested form group)">

</code-example>

The `ProfileEditor` form is displayed as one group, but the model is broken down further to represent the logical grouping areas.

<figure>
  <img src="generated/images/guide/reactive-forms/profile-editor-2.png" alt="Profile Editor Update">
</figure>

<div class="alert is-helpful">

*Note*: Display the value for the `FormGroup` in the component template using the `value` property and the `JsonPipe`.

</div>

## Partial model updates

When updating the value for a `FormGroup` that contains multiple controls, you may only want to update parts of the model instead of replacing its entire value. This section covers how to update specific parts of an `AbstractControl` model.

### Patch the model value

With a single control, you used the `setValue()` method to set the new value for an individual control. The `setValue()` method is more strict about adhering to the structure of the `FormGroup` and replaces the entire value for the control. The `patchValue()` method is more forgiving; it only replaces properties defined in the object that have changed in the form model, because you’re only providing partial updates. The strict checks in `setValue()` help catch errors in the nesting of complex forms, while `patchValue()` will fail silently in those cases.

In the `ProfileEditorComponent`, the `updateProfile` method with the following example below to update the first name and street address for the user.

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.1.ts" region="patch-value" title="src/app/profile-editor/profile-editor.component.ts (patch value)">

</code-example>

Simulate an update by adding a button to the template to update the user profile on demand.

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.1.html" region="patch-value" linenums="false" title="src/app/profile-editor/profile-editor.component.html (update value)">

</code-example>

When the button is clicked, the `profileForm` model is updated with just the `firstName` and `street` being modified. Notice that the `street` is provided in an object inside the `address` property. This is necessary because the `patchValue()` method applies the update against the model structure. `PatchValue()` only updates properties that the form model defines.

## Generating form controls with `FormBuilder`

Creating multiple form control instances manually can become very repetitive when dealing with multiple forms. The `FormBuilder` service provides convenience methods to handle generating controls. Underneath, the `FormBuilder` is creating and returning the instances in the same manner, but with much less work. The following section refactors the `ProfileEditor` component to use the `FormBuilder` instead of creating each `FormControl` and `FormGroup` by hand.

### Step 1 - Import the `FormBuilder` class

To use the `FormBuilder` service, import its class from the `@angular/forms` package.

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.2.ts" region="form-builder-imports" title="src/app/profile-editor/profile-editor.component.ts (import)">

</code-example>

### Step 2 - Inject the `FormBuilder` service

The FormBuilder is an injectable service that is provided with the `ReactiveFormsModule`. Inject this dependency by adding it to the component constructor.

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.2.ts" region="inject-form-builder" title="src/app/profile-editor/profile-editor.component.ts (constructor)">

</code-example>

### Step 3 - Generate form controls

The `FormBuilder` service has three methods: `control()`, `group()`, and `array()`. These methods are factory methods for generating form controls in your component class including a `FormControl`, `FormGroup`, and `FormArray` respectively. 

Replace the creation of the `profileForm` by using the `group` method to create the controls.

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.2.ts" region="form-builder" title="src/app/profile-editor/profile-editor.component.ts (form builder)">

</code-example>

In the example above, you use the `group()` method with the same names to define the properties in the model. Here, the value for each control name is an array containing the initial value as the first item.

<div class="alert is-helpful">

*Note*: You can define the control with just the initial value, but if your controls need sync or async validation, add sync and async validators as the second and third items in the array.

</div>

Compare the two paths to achieve the same result.

<code-tabs>

  <code-pane path="reactive-forms/src/app/profile-editor/profile-editor.component.1.ts" region="formgroup-compare" title="src/app/profile-editor/profile-editor.component.ts (instances)">
  
  </code-pane>

  <code-pane path="reactive-forms/src/app/profile-editor/profile-editor.component.2.ts" region="formgroup-compare" title="src/app/profile-editor/profile-editor.component.ts (form builder)">

  </code-pane>

</code-tabs>

## Simple form validation

Form validation is necessary when receiving user input through forms. This section covers adding a single validator to a form control and displaying the overall form status. Form validation is covered more extensively in the [Form Validation](guide/form-validation) guide.

### Step 1 - Import a validator function

Reactive forms include a set of validator functions out of the box for common use cases. These functions receive a control to validate against and return an error object or null based on the validation check.

Import the `Validators` class from the `@angular/forms` package.

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.ts" region="validator-imports" title="src/app/profile-editor/profile-editor.component.ts (import)">

</code-example>

### Step 2 - Make a field required

The most common validation is making a field required. This section describes how to add a required validation to the `firstName` control.

In the `ProfileEditor` component, add the `Validators.required` static method as the second item in the array for the `firstName` control.

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.ts" region="required-validator" title="src/app/profile-editor/profile-editor.component.ts (required validator)">

</code-example>

HTML5 has a set of built-in attributes that can be used for native validation, including `required`, `minlength`, `maxlength`, and more. Although _optional_, you can take advantage of these as additional attributes on your form input elements. Add the `required` attribute to the `firstName` input element.

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.html" region="required-attribute" linenums="false" title="src/app/profile-editor/profile-editor.component.html (required attribute)">

</code-example>

<div class="alert is-important">

*Note:* These HTML5 validation attributes should be used _in combination with_ the built-in validators provided by Angular's reactive forms. Using these two validation practices in combination prevents errors about the expression being changed after the template has been checked.

</div>

### Display form status

Now that you’ve added a required field to the form control, its initial status is invalid. This invalid status propagates to the parent `FormGroup`, making its status invalid. You have access to the current status of the `FormGroup` through the `status` property on the instance.

Display the current status of the `profileForm` using interpolation.

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.html" region="display-status" linenums="false" title="src/app/profile-editor/profile-editor.component.html (display status)">

</code-example>

<figure>
  <img src="generated/images/guide/reactive-forms/profile-editor-3.png" alt="Profile Editor Validation">
</figure>

The submit button is disabled because the `profileForm` is invalid due to the required `firstName` form control. After you fill out the `firstName` input, the form becomes valid and the submit button is enabled.

For more on form validation, visit the [Form Validation](guide/form-validation) guide.

## Dynamic controls using form arrays

A `FormArray` is an alternative to a `FormGroup` for managing  any number of unnamed controls. As with `FormGroup` instances, you can dynamically insert and remove controls from a `FormArray`, and the `FormArray` instance's value and validation status is calculated from its child controls. However, you don't need to define a key for each control by name, so this is a great option if you don't know the number of child values in advance. The following example shows you how to manage an array of _aliases_ in the `ProfileEditor`.

### Step 1 - Import the `FormArray`

Import the `FormArray` class from `@angular/forms` to use for type information. The `FormBuilder` service is ready to create a `FormArray` instance.

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.2.ts" region="form-array-imports" title="src/app/profile-editor/profile-editor.component.ts (import)">

</code-example>

### Step 2 - Define a `FormArray`

You can initialize a `FormArray` with any number of controls, from zero to many, by defining them in an array. Add an `aliases` property to the `FormGroup` for the `profileForm` to define the `FormArray`.

Use the `FormBuilder.array()` method to define the array, and the `FormBuilder.control()` method to populate the array with an initial control.

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.ts" region="aliases" title="src/app/profile-editor/profile-editor.component.ts (aliases form array)">

</code-example>

The _aliases_ control in the `FormGroup` is now populated with a single control until more are added dynamically.

### Step 3 - Access the `FormArray` control

Because a `FormArray` represents an undefined number of controls in array, accessing the control through a getter provides convenience and reusability. Use the _getter_ syntax to create an _aliases_ class property to retrieve the alias's `FormArray` control from the parent `FormGroup`.

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.ts" region="aliases-getter" title="src/app/profile-editor/profile-editor.component.ts (aliases getter)">

</code-example>

The getter provides easy access to the aliases `FormArray` instead of repeating the `profileForm.get()` method to get the instance.

<div class="alert is-helpful">

*Note*: Because the returned control is of type `AbstractControl`, you provide an explicit type to access the `FormArray` specific syntax for the methods.

</div>

Define a method to dynamically insert an alias control into the alias's `FormArray`. The `FormArray.push()` method inserts the control as a new item in the array.

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.ts" region="add-alias" title="src/app/profile-editor/profile-editor.component.ts (add alias)">

</code-example>

In the template, the controls are iterated over to display each control as a separate input field.

### Step 4 - Display the form array in the template

After you define the aliases `FormArray` in your model, you must add it to the template for user input. Similar to the `formGroupName` input provided by the `FormGroupNameDirective`, a `formArrayName` binds communication from the `FormArray` to the template with the `FormArrayNameDirective`. 

Add the template HTML below after the closing `formGroupName` `<div>` element.

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.html" region="formarrayname" linenums="false" title="src/app/profile-editor/profile-editor.component.html (aliases form array template)">

</code-example>

The `*ngFor` directive iterates over each `FormControl` provided by the aliases `FormArray`. Because `FormArray` elements are unnamed, you assign the _index_ to the `i` variable and pass it to each control to bind it to the `formControlName` input. 

<figure>
  <img src="generated/images/guide/reactive-forms/profile-editor-4.png" alt="Profile Editor Aliases">
</figure>

Each time a new `alias` is added, the `FormArray` is provided its control based on the index. This allows you to track each individual control when calculating the status and value of the root control.

#### Add an Alias

Initially, the form only contains one `Alias` field. Click the `Add Alias` button, and another field appears. You can also validate the array of aliases reported by the form model displayed by the `Form Value` at the bottom of the template.

<div class="alert is-helpful">

*Note*: Instead of a `FormControl` for each alias, you could compose another `FormGroup` with additional fields. The process of defining a control for each item is the same.

</div>

{@a appendix}

## Appendix

{@a reactive-forms-api}

### Reactive forms API

Listed below are the base classes and services used to create and manage form controls.

#### Classes

<table>

  <tr>

    <th>
      Class
    </th>

    <th>
      Description
    </th>

  </tr>

  <tr>

    <td style="vertical-align: top">
      <code>AbstractControl</code>
    </td>

    <td>

      The abstract base class for the three concrete form control classes; `FormControl`, `FormGroup`, and `FormArray`. It provides their common behaviors and properties.

    </td>

  </tr>

  <tr>

    <td style="vertical-align: top">
      <code>FormControl</code>
    </td>

    <td>

      Manages the value and validity status of an individual form control. It corresponds to an HTML form control such as an `<input>` or `<select>`.

    </td>

  </tr>

  <tr>

    <td style="vertical-align: top">
      <code>FormGroup</code>
    </td>

    <td>

      Manages the value and validity state of a group of `AbstractControl` instances. The group's properties include its child controls. The top-level form in your component is a `FormGroup`.

    </td>

  </tr>

  <tr>

    <td style="vertical-align: top">
      <code>FormArray</code>
    </td>

    <td>

    Manages the value and validity state of a numerically indexed array of `AbstractControl` instances.

    </td>

  </tr>

  <tr>

    <td style="vertical-align: top">
      <code>FormBuilder</code>
    </td>

    <td>

      An injectable service that provides factory methods for creating control instances.

    </td>

  </tr>  

</table>

When importing the `ReactiveFormsModule`, you also gain access to directives to use in your templates for binding the data model to the forms declaratively.

#### Directives

<table>

  <tr>

    <th>
      Directive
    </th>

    <th>
      Description
    </th>

  </tr>

  <tr>

    <td style="vertical-align: top">
      <code>FormControlDirective</code>
    </td>

    <td>

      Syncs a standalone `FormControl` instance to a form control element.

    </td>

  </tr>

  <tr>

    <td style="vertical-align: top">
      <code>FormControlName</code>
    </td>

    <td>

      Syncs a `FormControl` in an existing `FormGroup` to a form control element by name.

    </td>

  </tr>

  <tr>

    <td style="vertical-align: top">
      <code>FormGroupDirective</code>
    </td>

    <td>

      Syncs an existing `FormGroup` to a DOM element.

    </td>

  </tr>

  <tr>

    <td style="vertical-align: top">
      <code>FormGroupName</code>
    </td>

    <td>

      Syncs a nested `FormGroup` to a DOM element.

    </td>

  </tr>

  <tr>

    <td style="vertical-align: top">
      <code>FormArrayName</code>
    </td>

    <td>

      Syncs a nested `FormArray` to a DOM element.

    </td>

  </tr>

</table>

### Comparison to template-driven forms

_Template-driven_ forms, introduced in the [Template-driven forms guide](guide/forms), take a completely different approach.

* You place HTML form controls (such as `<input>` and `<select>`) in the component template and bind them to _data model_ properties in the component, using directives such as `ngModel`.

* You don't create Angular form control objects. Angular directives create them for you, using the information in your data bindings.

* You don't push and pull data values. Angular handles that for you with `ngModel`. Angular updates the mutable _data model_ with user changes as they happen.

While this means less code in the component class,
[template-driven forms are asynchronous](guide/reactive-forms#async-vs-sync "Async vs sync")
which may complicate development in more advanced scenarios.


{@a async-vs-sync}


### Async vs. sync

Reactive forms are synchronous, and template-driven forms are asynchronous.

In reactive forms, you create the entire form control tree in code.
You can immediately update a value or drill down through the descendants of the parent form
because all controls are always available.

Template-driven forms delegate creation of their form controls to directives.
To avoid "_changed after checked_" errors,
these directives take more than one cycle to build the entire control tree.
That means you must wait a tick before manipulating any of the controls
from within the component class.

For example, if you inject the form control with a `@ViewChild(NgForm)` query and examine it in the
[`ngAfterViewInit` lifecycle hook](guide/lifecycle-hooks#afterview "Lifecycle hooks guide: AfterView"),
you'll discover that it has no children.
You must wait a tick, using `setTimeout`, before you can
extract a value from a control, test its validity, or set it to a new value.

The asynchrony of template-driven forms also complicates unit testing.
You must wrap your test block in `async()` or `fakeAsync()` to
avoid looking for values in the form that aren't there yet.
With reactive forms, everything is available when you expect it to be.

