# Reactive Forms

_Reactive forms_ provide a model-driven approach to handling form inputs whose values change over time. This guide will show you how to create and update a simple form control, progress to using multiple controls in a group, validate form values, and cover advanced topics.



{@a toc}

Try the <live-example title="Reactive Forms (final) in Stackblitz">Reactive Forms live-example</live-example>.

{@a intro}


## Introduction to Reactive Forms

Reactive forms use a more explicit and immutable approach to managing the state of a form at a given point in time. Each change to the form state returns a new state, which maintains the integrity of the model between changes. Reactive forms are built around observable streams, where form inputs and values are provided as streams of input values, also while giving you synchronous access to the data. This approach allows your templates to take advantage of these streams of form state changes, rather than to be bound to them.

It also allows for easier testing since you have an assurance that your data is consistent and predictable when requested. Consumers outside your templates have access to the same streams, where they can manipulate and transform that data safely.

Reactive forms differ from template-driven forms in distinct ways. See the [Appendix](#appendix) for detailed comparisons between the two paradigms.

## Getting Started

### Step 1 - Register the `ReactiveFormsModule`

In order to use reactive forms, import the `ReactiveFormsModule` from the `@angular/forms` package and add it to your NgModule's `imports` array.

<code-example path="reactive-forms/src/app/app.module.ts" region="imports" title="src/app/app.module.ts (excerpt)">

</code-example>

### Step 2 - Import and create a new form control 

Generate a component for the control. This is where you will register a single form control.

<code-example language="sh" class="code-shell">

  ng generate component NameEditor

</code-example>

The `FormControl` is the most basic building block when using reactive forms. Import the `FormControl` symbol into your component and create an instance of a new form control as a class property. To start, you will use the `name` property to store the form control. 

<code-example path="reactive-forms/src/app/name-editor/name-editor.component.ts" region="create-control" title="src/app/name-editor/name-editor.component.ts">

</code-example>

The constructor of the `FormControl` can be used to set its initial value, which in this case is set to an empty string. By creating these controls in your component class, you get immediate access to listen, update, and validate the state of the form input. 

### Step 3 - Register the control in the template

You’ve created the control in the component class, so now you must associate it with a form control element in the template. Update the template with the form control using the `formControl` binding provided the `FormControlDirective` included in the `ReactiveFormsModule`.

<code-example path="reactive-forms/src/app/name-editor/name-editor.component.html" region="control-binding" linenums="false" title="src/app/name-editor/name-editor.component.html">

</code-example>

<div class="alert is-helpful">

*Note*: See a more detailed list of classes and directives provided by the `ReactiveFormsModule`, see the [Reactive Forms API](#reactive-forms-api) section.

</div>

Using the template binding syntax, the form control is now registered to the `name` input element in the template. The form control and DOM element communicate with each other, where the view reflects changes in the model, and the model reflects changes in the view.

### Display the component

Update the `AppComponent` template with the `NameEditor` component containing the form you just created. 

<code-example path="reactive-forms/src/app/app.component.1.html" region="app-name-editor" linenums="false" title="src/app/app.component.html (name editor)">

</code-example>

<figure>
  <img src="generated/images/guide/reactive-forms/name-editor-1.png" alt="Name Editor">
</figure>

## Managing Control Values

{@a display-value}

### Display the control’s value

Reactive forms give you access to the form state and value at a point in time. Every `FormControl` provides its current value as an Observable through the `valueChanges` property. You can subscribe immediately, retrieve, or listen to changes in the form’s value in the template using the `AsyncPipe` or in the component class using the `subscribe()` method. The `value` property also gives you a snapshot of the current value. Display the current value using interpolation in the template with the following example.

<code-example path="reactive-forms/src/app/name-editor/name-editor.component.html" region="display-value" linenums="false" title="src/app/name-editor/name-editor.component.html (control value)">

</code-example>

The displayed value changes as you update the form control element.

Reactive forms also provide access to more information about a given control through properties and methods provided with each instance. These properties and methods of the underlying [AbstractControl](api/forms/AbstractControl) are used to control form state and determine when to display messages when handling validation. That will be [discussed later](#simple-form-validation) in the guide.

Read about other `FormControl` properties and methods in the
[Reactive Forms API](#reactive-forms-api) section.

### Replace the form control value

Reactive forms have methods to control the values programmatically as well as declaratively, which gives you the flexibility to update the control’s value without user interaction. The `FormControl` provides a `setValue()` method that updates the value of the form control and validates the structure of the value provided against the control’s structure. For example, when retrieving form data from a backend API or service, you would use the `setValue()` method to update the control to its new value, replacing the old value entirely. 

Add the method to the component class to update the control value manually.

<code-example path="reactive-forms/src/app/name-editor/name-editor.component.ts" region="update-value" title="src/app/name-editor/name-editor.component.ts (update value)">

</code-example>

Update the template with a button to simulate a name update.

<code-example path="reactive-forms/src/app/name-editor/name-editor.component.html" region="update-value" linenums="false" title="src/app/name-editor/name-editor.component.html (update value)">

</code-example>

<figure>
  <img src="generated/images/guide/reactive-forms/name-editor-2.png" alt="Name Editor Update">
</figure>

Because the form model is the source of truth for the control, when you click the button the value is also changed from within the component class.

<div class="alert is-helpful">

*Note*: In this example, you are only using a single control, but when using the `setValue()` method, with a `FormGroup` or `FormArray` your value needs to match the structure of your group or array.

</div>

## Grouping form controls

Just as a `FormControl` gives you control over a single input field, a `FormGroup` tracks the form state of a group of `FormControl`s. Each control in `FormGroup` is tracked by name when creating the `FormGroup`. To demonstrate, create a new component for editing a profile.

Generate a `ProfileEditor` component and import the `FormGroup` and `FormControl` symbols from the `@angular/forms` package.

<code-example language="sh" class="code-shell">

  ng generate component ProfileEditor

</code-example>

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.1.ts" region="imports" title="src/app/profile-editor/profile-editor.component.ts (imports)">

</code-example>

### Create a `FormGroup`

In the component class, create a property named `profileForm` and create a new instance of the `FormGroup`. To initialize the `FormGroup`, provide the constructor with an object of controls with their respective names. For the profile form, add two `FormControl` instances with the name `firstName` and `lastName`.

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.1.ts" region="formgroup" title="src/app/profile-editor/profile-editor.component.ts (form group)">

</code-example>

The individual form controls are now collected within a group. The `FormGroup` provides its model value as an object reduced from the values of each control in the group. The same properties such as `value`, `untouched` and methods including `setValue()` are available from the `FormGroup` instance.

### Associate the `FormGroup` model and view

The `FormGroup` also tracks the status and changes of each of its controls, so if one of the control’s status or value changes, the parent control will also emit a new status or value change. The model for the group is maintained from its members. Now that the model is defined, update the template to reflect it in the view.

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.1.html" region="formgroup" linenums="false" title="src/app/profile-editor/profile-editor.component.html (template form group)">

</code-example>

From the template, there are a couple of things to notice. Just as the `FormGroup` contains a group of controls, the _profileForm_ `FormGroup` is bound to the `form` element with the `FormGroup` directive, creating a communication layer between the model to the form containing the inputs. The `formControlName` input provided by the `FormControlName` directive binds each individual input to its form control defined in the `FormGroup`. The form controls communicate with their respective elements, and communicate changes to the `FormGroup`, which provides a source of truth for the model value.

### Save form data

The `ProfileEditor` component currently takes input from the user, but in a real scenario you want to capture the form value for further processing outside the component. The `FormGroup` directive listens for the `submit` event emitted by the `form` element and emits an `ngSubmit` event you can bind to a callback function. Add the `ngSubmit` event listener to the `form` tag with the `onSubmit()` callback method.

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.html" region="ng-submit" linenums="false" title="src/app/profile-editor/profile-editor.component.html (submit event)">

</code-example>

Next, add the `onSubmit()` method in the `ProfileEditor` component class to capture the current value of the `profileForm`. To keep the form encapsulated, to provide the form value outside the component, you would use an `EventEmitter`. For the following example code, you're using `console.warn` to log to the browser console.

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.ts" region="on-submit" title="src/app/profile-editor/profile-editor.component.ts (submit method)">

</code-example>

The `submit` event is emitted by the `form` tag using the native DOM event. You trigger the event by clicking a button with `submit` type. This allows the user to use the enter key to trigger submission after filling out the form. Add a `button` to the bottom of the form to trigger the form submission. 

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.html" region="submit-button" linenums="false" title="src/app/profile-editor/profile-editor.component.html (submit button)">

</code-example>

<div class="alert is-helpful">

*Note* The button in the snippet above also has a `disabled` binding attached to it to disable the button when the `profileForm` is invalid. You aren't performing any validation yet, so the button will always be enabled. Simple form validation is [covered later in the guide](#simple-form-validation).

</div>

### Display the component

Update the `AppComponent` template, adding the `ProileEditor` component containing the form.

<code-example path="reactive-forms/src/app/app.component.1.html" region="app-profile-editor" linenums="false" title="src/app/app.component.html (profile editor)">

</code-example>

<figure>
  <img src="generated/images/guide/reactive-forms/profile-editor-1.png" alt="Profile Editor">
</figure>

## Nesting Form Groups

### Create a Nested Group

When building complex forms, managing the different areas of information is easier in smaller sections and some groups of information naturally fall into the same group. An address is a good example of information that can be grouped together. `FormGroup`s are composed of `FormControl`s, but also take `FormGroups` as a control in the model. This makes composing complex form models easier to maintain and logically group together. Update the `ProfileEditor` component to create a `FormGroup` named `address` with a few controls for capturing the address information.

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.1.ts" region="nested-formgroup" linenums="false" title="src/app/profile-editor/profile-editor.component.ts (nested form group)">

</code-example>

In addition to the `firstName` and `lastName` controls, you have grouped the `street`, `city`, `state` and `zip` controls into an `address` group. Even though the `address` `FormGroup` is a child of the overall `profileForm` `FormGroup`, the same rules still apply with value and status changes. Changes in status and value from the nested form group will propagate up to the parent form group, maintaining consistency with the overall model.

### Group the Nested form in the template

Following the same practice as before, after updating the model in the component class, you update the template with the `FormGroup`s and their input elements. Add the `address` form group below the `firstName` and `lastName` fields in the `ProfileEditor` template.

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.1.html" region="formgroupname" linenums="false" title="src/app/profile-editor/profile-editor.component.html (template nested form group)">

</code-example>

<div class="alert is-helpful">

*Note*: Display the value for the `FormGroup` in the component template using the `value` property and the `JsonPipe`.

</div>

## Partial Model Updates

### Patch the model value

With a single control, you used the `setValue()` method to set the new value for an individual control. The `setValue()` method is more strict about adhering to the structure of the `FormControl` or `FormGroup` and replaces the entire value for the control. The `patchValue()` method is more forgiving, and only replaces the properties defined in the object against the form model because you’re only providing partial updates. The strict checks in `setValue()` help catch errors in the nesting of complex forms, while `patchValue()` will fail silently in those cases.

In the `ProfileEditorComponent`, add a method named `updateProfile` with the following example below to update the first name and street address for the user.

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.1.ts" region="patch-value" title="src/app/profile-editor/profile-editor.component.ts (patch value)">

</code-example>

<figure>
  <img src="generated/images/guide/reactive-forms/profile-editor-2.png" alt="Profile Editor Update">
</figure>

Simulate an update by adding a button to the template to update the user profile on demand.

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.1.html" region="patch-value" linenums="false" title="src/app/profile-editor/profile-editor.component.html (update value)">

</code-example>

When the button is clicked, the `profileForm` model is updated with just the `firstName` and `street` being modified. You’ll notice that the `street` is provided in an object inside the `address` property. This is necessary, since the `patchValue` value applies the update against the model structure. `PatchValue()` only updates properties that the form model defines.

## Use the FormBuilder

Creating multiple form control instances manually can become very repetitive when dealing with multiple forms. The `FormBuilder` service provides convenience methods to handle generating controls. Underneath the `FormBuilder`, it is creating and returning the instances in the same manner, but with much less work. Refactor the `ProfileEditor` component to use the `FormBuilder` instead of creating each `FormControl` and `FormGroup` by hand.

### Import the `FormBuilder` symbol

To use the `FormBuilder` service, import its symbol from the `@angular/forms` package.

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.2.ts" region="form-builder-imports" title="src/app/profile-editor/profile-editor.component.ts (import)">

</code-example>

### Inject the `FormBuilder` service

The FormBuilder is an injectable service that is provided with the `ReactiveFormsModule`. You inject this dependency by adding to the component constructor.

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.2.ts" region="inject-form-builder" title="src/app/profile-editor/profile-editor.component.ts (constructor)">

</code-example>

### Use the `FormBuilder` methods

The `FormBuilder` service has three methods: `control()`, `group()`, and `array()`. These methods are factory methods for generating form controls in your component class including a `FormControl`, `FormGroup` and `FormArray` respectively. Replace the creation of the `profileForm` by using the `group` method to create the controls.

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.2.ts" region="form-builder" title="src/app/profile-editor/profile-editor.component.ts (form builder)">

</code-example>

In the example above, you use the `group()` method with the same names to define the properties in the model. Here, the value for each control name is an array containing the initial value as the first item.

<div class="alert is-helpful">

*Note*: You can define the control with just the initial value, but if your controls need sync or async validation, you can easily add sync and async validators as the second and third items in the array.

</div>

Now compare the two paths to achieve the same result.

<code-tabs>

  <code-pane path="reactive-forms/src/app/profile-editor/profile-editor.component.1.ts" region="formgroup-compare" title="src/app/profile-editor/profile-editor.component.ts (instances)">
  
  </code-pane>

  <code-pane path="reactive-forms/src/app/profile-editor/profile-editor.component.2.ts" region="formgroup-compare" title="src/app/profile-editor/profile-editor.component.ts (form builder)">

  </code-pane>

</code-tabs>

## Simple Form Validation

Form validation is necessary when receiving user input through forms. This guide will cover using a single validator for a form control. Form validation is covered more extensively in the [Form Validation](guide/form-validation) guide.

### Add a validator function

Reactive forms include a set of validator functions out of the box for common use cases. These functions are provided the control to validate against and return an error object or null based on the validation check. To show a simple validation, import the `Validators` symbol from the `@angular/forms` package.

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.ts" region="validator-imports" title="src/app/profile-editor/profile-editor.component.ts (import)">

</code-example>

### Make a field required

The most common validation is making a field required. In the `ProfileEditor` component, add the `Validators.required` static method as the second item in the array for the `firstName` control.

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.ts" region="required-validator" title="src/app/profile-editor/profile-editor.component.ts (required validator)">

</code-example>

There are a set of built-in HTML5 attributes including `required`, `minlength`, `maxlength`, and more that can be used for native validation. Although _optional_, you can take advantage of these as additional attributes on your form input elements. Add the `required` attribute to the `firstName` input element.

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.html" region="required-attribute" linenums="false" title="src/app/profile-editor/profile-editor.component.html (required attribute)">

</code-example>

<div class="alert is-important">

*Note*: These HTML5 validation attributes should be used _in combination with_ the built-in validators provided by reactive forms. These will prevent errors that the expression has changed after the template has been checked.

</div>

### Display form status

Now that you’ve added a required field to the form control, its initial status is invalid and the status of the parent `FormGroup` becomes invalid. Display the current status of the `profileForm`.

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.html" region="display-status" linenums="false" title="src/app/profile-editor/profile-editor.component.html (display status)">

</code-example>

<figure>
  <img src="generated/images/guide/reactive-forms/profile-editor-3.png" alt="Profile Editor Validation">
</figure>

The submit button is also disabled because the `profileForm` is invalid due to the required `firstName` form control. Once you fill out the `firstName` input, the form becomes valid and the submit button is enabled.

For more on form validation, visit the [Form Validation](guide/form-validation) guide.

## Advanced usage with Form Arrays

A `FormArray` is an alternative to a `FormGroup` that allows you to manage any number of unnamed controls. As with `FormGroup`s, you can dynamically insert and remove controls from a `FormArray`, and its value and validation status is calculated from its child controls. However, you don't need to define a slot for each control by name, so this is a great option if you don't know the number of child values in advance. Add an array of aliases to the `ProfileEditor` form component.

### Import the `FormArray`

Import the `FormArray` symbol from `@angular/forms` to use for type information. The `FormBuilder` service is ready to create a `FormArray` instance.

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.2.ts" region="form-array-imports" title="src/app/profile-editor/profile-editor.component.ts (import)">

</code-example>

### Define a `FormArray`

You can initialize a `FormArray` with any number of controls, from zero to many, by defining them in an array. Add an `aliases` property to the `FormGroup` for the `profileForm` to define the `FormArray`. Use the `FormBuilder.array()` method to define the array and the `FormBuilder.control()` method to populate the array with an initial control.

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.ts" region="aliases" title="src/app/profile-editor/profile-editor.component.ts (aliases form array)">

</code-example>

### Access the `FormArray` control

Since a `FormArray` represents an undefined number of controls in array, accessing the control through a getter provides convenience and reusability. Define a getter class property to retrieve the aliases `FormArray` control from the parent `FormGroup`.

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.ts" region="aliases-getter" title="src/app/profile-editor/profile-editor.component.ts (aliases getter)">

</code-example>

<div class="alert is-helpful">

*Note*: Since the returned control is of type `AbstractControl`, you provide an explicit type to access the `FormArray` specific syntax for the methods.

</div>

Also define a method to dynamically insert an alias control into the aliases `FormArray`. The `FormArray.push()` method inserts the control as a new item in the array. In the template, you will iterate over the array of controls to display them.

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.ts" region="add-alias" title="src/app/profile-editor/profile-editor.component.ts (add alias)">

</code-example>

### Display the form array in the template

Now that your model defines the aliases `FormArray`, add it to the template for user input. Similar to the `formGroupName` input provided by the `FormGroupNameDirective`, a `formArrayName` binds communication from the `FormArray` to the template with the `FormArrayNameDirective`. Add the template HTML below after the closing `formGroupName` `<div>` element.

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.html" region="formarrayname" linenums="false" title="src/app/profile-editor/profile-editor.component.html (aliases form array template)">

</code-example>

The `*ngFor` directive is used to iterate over the `FormControl`s provided by the aliases `FormArray`. Since `FormArray` elements are unnamed, you assign the index to the `i` variable and pass it to each control to bind the to the `formControlName` input. This allows you to track each individual control when calculating the status and value of the root control.

<figure>
  <img src="generated/images/guide/reactive-forms/profile-editor-4.png" alt="Profile Editor Aliases">
</figure>

#### Add an Alias

Once you refresh the form, you see one `Alias` field. Click the `Add Alias` button and another field appears. You can also validate the array of aliases reported by the form model displayed by the `Form Value` at the bottom of the template. 

<div class="alert is-helpful">

*Note*: Instead of a `FormControl` for each alias, you could compose another `FormGroup` with additional fields but the process of defining a control for each item is the same.

</div>

You can download the complete source for all steps in this guide
from the <live-example title="Reactive Forms Demo in Stackblitz">Reactive Forms</live-example> live example.

{@a appendix}

## Appendix

{@a reactive-forms-api}

### Reactive Forms API

Listed below are the base classes and services used to track form controls.

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

      [`AbstractControl`](api/forms/AbstractControl "API Reference: FormControl") is the abstract base class for the three concrete form control classes;
`FormControl`, `FormGroup`, and `FormArray`.
It provides their common behaviors and properties.

    </td>

  </tr>

  <tr>

    <td style="vertical-align: top">
      <code>FormControl</code>
    </td>

    <td>

      [`FormControl`](api/forms/FormControl "API Reference: FormControl")
tracks the value and validity status of an individual form control.
It corresponds to an HTML form control such as an `<input>` or `<select>`.

    </td>

  </tr>

  <tr>

    <td style="vertical-align: top">
      <code>FormGroup</code>
    </td>

    <td>

      [`FormGroup`](api/forms/FormGroup "API Reference: FormGroup")
tracks the value and validity state of a group of `AbstractControl` instances.
The group's properties include its child controls.
The top-level form in your component is a `FormGroup`.

    </td>

  </tr>

  <tr>

    <td style="vertical-align: top">
      <code>FormArray</code>
    </td>

    <td>

      [`FormArray`](api/forms/FormArray "API Reference: FormArray")
tracks the value and validity state of a numerically indexed array of `AbstractControl` instances.

    </td>

  </tr>

  <tr>

    <td style="vertical-align: top">
      <code>FormBuilder</code>
    </td>

    <td>

      [`FormBuilder`](api/forms/FormBuilder "API Reference: FormBuilder") An injectable service that provides factory methods for creating control instances.

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

      [`FormControlDirective`](api/forms/FormControlDirective "API Reference: FormControlDirective") syncs a standalone `FormControl` instance to a form control element.

    </td>

  </tr>

  <tr>

    <td style="vertical-align: top">
      <code>FormControlName</code>
    </td>

    <td>

      [`FormControlName`](api/forms/FormControlName "API Reference: FormControlName") syncs a `FormControl` in an existing `FormGroup` to a form control element by name.

    </td>

  </tr>

  <tr>

    <td style="vertical-align: top">
      <code>FormGroupDirective</code>
    </td>

    <td>

      [`FormGroupDirective`](api/forms/FormGroupDirective "API Reference: FormGroupDirective") binds an existing `FormGroup` to a DOM element.

    </td>

  </tr>

  <tr>

    <td style="vertical-align: top">
      <code>FormGroupName</code>
    </td>

    <td>

      [`FormGroupName`](api/forms/FormGroupName "API Reference: FormGroupName") syncs a nested `FormGroup` to a DOM element.

    </td>

  </tr>

  <tr>

    <td style="vertical-align: top">
      <code>FormArrayName</code>
    </td>

    <td>

      [`FormArrayName`](api/forms/FormArrayName "API Reference: FormArrayName") syncs a nested `FormArray` to a DOM element.

    </td>

  </tr>

</table>

### Template-driven forms compared

_Template-driven_ forms, introduced in the [Template guide](guide/forms), take a completely different approach.

You place HTML form controls (such as `<input>` and `<select>`) in the component template and
bind them to _data model_ properties in the component, using directives
like `ngModel`.

You don't create Angular form control objects. Angular directives
create them for you, using the information in your data bindings.
You don't push and pull data values. Angular handles that for you with `ngModel`.
Angular updates the mutable _data model_ with user changes as they happen.

While this means less code in the component class,
[template-driven forms are asynchronous](guide/reactive-forms#async-vs-sync "Async vs sync")
which may complicate development in more advanced scenarios.


{@a async-vs-sync}


### Async vs. sync

Reactive forms are synchronous while template-driven forms are asynchronous.

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

