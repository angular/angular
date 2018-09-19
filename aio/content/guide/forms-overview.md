# Introduction to forms in Angular

Handling user input with forms is the cornerstone of many common applications. Applications use forms to log in, to update a profile, to enter sensitive information, and to perform many other data-entry tasks. 

Angular provides two different approaches to handling user input through forms: reactive and template-driven. Both capture user input events from the view, validate the user input, create a form model and data model to update, and provide a way to track changes. Each approach uses a distinct way of processing forms and offers different advantages. There are many different factors such as how data flows from the view to the data model and data model to the view, predictability of access to the form model, validation and testing, mutability, and scalability that influence your decision on which approach works best for your situation. The sections below provide a description of the common building blocks with each approach and a comparison of those key factors.

**In general:**

* **Reactive forms** are more robust: they are more scalable, reusable, and testable. If forms are a key part of your application, or you're already using reactive patterns for building your application, use reactive forms.
* **Template-driven forms** are useful for adding a simple form to an app, such as an email list signup form. They are easy to add to an app, but they do not scale as well as reactive forms. If you have very basic form requirements and logic that can be managed solely in the template, use template-driven forms.

## Key differences

The table below summarizes the key differences in reactive and template driven forms.

<style>
  table {width: 100%};
  td, th {vertical-align: top};
</style>

||Reactive|Template-driven|
|--- |--- |--- |
|Setup/Form Model|More explicit/Created in the component class.|Less explicit/Created by the directives.|
|Data model|Structured|Unstructured|
|Predictability|Synchronous|Asynchronous|
|Form validation|Functions|Directives|
|Mutability|Immutable|Mutable|
|Scalability|Low-level API access|Abstraction on top of APIs|

## A common foundation

Both reactive and template-driven forms share underlying building blocks. 

- A `FormControl` instance that tracks the value and validation status of an individual form control.
- A `FormGroup` instance that tracks the same values and statuses for a collection of form controls.
- A `FormArray` instance that tracks the same values and statues for an array of form controls.
- A `ControlValueAccessor` that creates a bridge between Angular `FormControl` instances and native DOM elements.

How these control instances are created and managed with reactive and template-driven forms is introduced in the [form model](#the-form-model) section below and detailed further in the [data flow section](#data-flow-in-forms) of this guide.

## The form model

In reactive forms, the source of truth is the form model (the `FormControl` instance)

<figure>
  <img src="generated/images/guide/forms-overview/key-diff-reactive-forms.png" alt="Reactive forms key differences">
</figure>

With reactive forms, the form model is explicitly defined in the component class. The reactive form directive (in this case, `FormControlDirective`) then links the existing form control instance to a specific form element in the view using a value accessor. Updates from the view-to-model and model-to-view are synchronous and not dependent on the UI rendered.

In template-driven forms, the source of truth is the template.

<figure>
  <img src="generated/images/guide/forms-overview/key-diff-td-forms.png" alt="Template-driven forms key differences">
</figure>

The abstraction of the form model promotes simplicity over structure. It is less explicit, but you no longer have direct control over the form model. Updates from the view-to-model and model-to-view must pass through directives (in this case, the `NgModel` directive), and be asynchronous to work around the change detection cycle. Value changes are delayed until the next tick, which allows change detection to complete and a new change detection process to be triggered with the updated value.

## Data flow in forms

When building forms in Angular, it's important to understand how the the framework handles data flowing from the user or from programmatic changes. Reactive and template-driven forms follow two different strategies when handling form input. The components below use an input field to manage the *favorite color* value and to show how changes are handled.

### Data flow in reactive forms

Here is a component with an input field for a single control implemented using reactive forms.

<code-example path="forms-overview/src/app/reactive/favorite-color/favorite-color.component.ts">
</code-example>

The diagrams below show how the data flows for an input with reactive forms.

<figure>
  <img src="generated/images/guide/forms-overview/dataflow-reactive-forms-vtm.png" alt="Reactive forms view to model data flow" width="100%">
</figure>

From the view-to-model:

1. The end user types a value into the input element.
1. The form input element emits an input event with the latest value.
1. The control value accessor on the form input element immediately relays the new value to the `FormControl` instance, which then emits the value through the `valueChanges` observable.

<figure>
  <img src="generated/images/guide/forms-overview/dataflow-reactive-forms-mtv.png" alt="Reactive forms model to view data flow" width="100%">
</figure>

From the model-to-view:

1. The `favoriteColorControl.setValue()` method is called, which updates the `FormControl` value and emits the latest value through the `valueChanges` observable.
1. The control value accessor on the form input element updates the element with the latest value.

### Data flow in template-driven forms

Here is the same component with an input field for a single control implemented using template-driven forms.

<code-example path="forms-overview/src/app/template/favorite-color/favorite-color.component.ts">
</code-example>

The diagrams below show how the data flows for an input with template-driven forms.

<figure>
  <img src="generated/images/guide/forms-overview/dataflow-td-forms-vtm.png" alt="Template-driven forms view to model data flow" width="100%">
</figure>

From the view-to-model:

1. The end user types "Blue" into the input element.
1. The input element emits an "input" event with the value "Blue".
1. The control value accessor attached to the input triggers the `setValue()` method on the `FormControl` instance, which emits that value through the `valueChanges` observable.
1. The control value accessor also calls the `NgModel.viewToModel()` method which emits an `ngModelChange` event.
1. Because the component template uses two-way data binding for the `favoriteColor`, the `favoriteColor` property in the component 
is updated to the value emitted  by the `ngModelChange` event ("Blue").

<figure>
  <img src="generated/images/guide/forms-overview/dataflow-td-forms-mtv.png" alt="Template-driven forms model to view data flow" width="100%">
</figure>

From the model-to-view:

1. The `favoriteColor` value is updated in the component.
1. Change detection calls the `ngOnChanges` method on the `NgModel` directive instance, updates the `NgModel` instance model value, and queues an async task to set the value for the internal `FormControl` instance.
1. On the next tick, the task to set the `FormControl` instance value is executed, when then emits the latest value through the `valueChanges` observable.
1. The control value accessor updates the form input element in the view with the latest `favoriteColor` value.

## Form validation

Validation is an integral part of managing any set of forms. Whether you’re checking for required fields or querying an external API for an existing username, Angular provides a set of built-in validators as well as the ability to create custom validators. With reactive forms, custom validators are functions that receive a control to validate. Because template-driven forms are tied to directives, custom validator directives wrap validation functions so that the template can use them.

For more on form validation, see the [Form Validation](guide/form-validation) guide.

## Testing 

Testing also plays a large part in complex applications and an easier testing strategy is always welcomed. One difference in testing reactive forms and template-driven forms is their reliance on rendering the UI in order to perform assertions based on form control and form field changes. The following examples demonstrate the process of testing forms with reactive and template-driven forms.

### Testing a reactive form

Reactive forms provide a relatively easy testing strategy to due to synchronous access to the form and data models, and being independent of the UI. In these set of tests, controls and data are queried and manipulated through the control without interacting with the change detection cycle. The following tests below use the favorite color components mentioned earlier to validate the view-to-model and model-to-view data flows for a reactive form.

The following test validates the view-to-model data flow:

<code-example path="forms-overview/src/app/reactive/favorite-color/favorite-color.component.spec.ts" region="view-to-model" title="Favorite color test (view-to-model)">
</code-example>

1. Query the view for the form input element, and create a custom input event for the test.
1. Set the new value for the input is set to *Red*, and dispatch the input event on the form input element.
1. Assert that the `favoriteColor` form control instance value matches in value from the input.

The following test validates the model-to-view data flow:

<code-example path="forms-overview/src/app/reactive/favorite-color/favorite-color.component.spec.ts" region="model-to-view" title="Favorite color test (model-to-view)">
</code-example>

1. Use the `favoriteColor` form control instance to set the new value.
1. Query the view for the form input element.
1. Assert that the new value set on the control matches the value in the input.

### Testing a template-driven form

Writing tests with template-driven forms is more involved and requires more detailed knowledge of the change detection process and how directives run on each cycle to ensure elements are queried, tested, or changed at the correct time. The following tests below use the favorite color components mentioned earlier to validate the view-to-model and model-to-view data flows for a template-driven form.

The following test validates the view-to-model data flow:

<code-example path="forms-overview/src/app/template/favorite-color/favorite-color.component.spec.ts" region="view-to-model" title="Favorite color test (view-to-model)">
</code-example>

1. Query the view for the form input element, and create a custom input event for the test.
1. Set the new value for the input is set to *Red*, and dispatch the input event on the form input element.
1. Run change detection through the test fixture.
1. Assert that the component `favoriteColor` property value matches the value from the input.

The following test validates the model-to-view data flow:

<code-example path="forms-overview/src/app/template/favorite-color/favorite-color.component.spec.ts" region="model-to-view" title="Favorite color test (model-to-view)">
</code-example>

1. Use the component instance to set the value of `favoriteColor` property.
1. Run change detection through the test fixture.
1. Use the `tick()` method to simulate passage of time within the `fakeAsync()` task.
1. Query the view for the form input element.
1. Assert that the input value matches the `favoriteColor` value property in the component instance.

## Mutability

How changes are tracked plays a role in the efficiency of your application.

- Reactive forms keep the data model pure by providing it as an immutable data structure. Each time a change is triggered on the data model, the form control instance returns a new data model rather than updating the data model directly. This gives you the ability track unique changes to the data model through the control's observable. This allows change detection to be more efficient because it only needs to update on unique changes. It also follows reactive patterns that integrate with observable operators to transform data.
- Template-driven forms rely on mutability with two-way data binding to update the data model in the component as changes are made in the template. Because there are no unique changes to track on the data model when using two-way data binding, change detection becomes less efficient at determining when updates are required.

The difference is demonstrated in the examples above using the **favorite color** input element. With reactive forms, the **form control instance** always returns a new value when the control's value is updated. With template-driven forms, the **favorite color property** is always modified to its new value.

## Scalability

If forms are a central part of your application, scalability is very important. Being able to reuse form models across components is critical. Reactive forms make creating large scale forms easier by providing access to low-level APIs and synchronous access to the form model. Because template-driven forms focus on simple scenarios, they are not as reusable, abstract away the low-level APIs and access to the form model is provided asynchronously. This surfaces in testing also, where testing reactive forms requires less setup and no dependance on the change detection cycle when updating and validating the form and data models during testing.

## Final Thoughts

Choosing a strategy begins with understanding the strengths and weaknesses of the options presented. Low-level API and form model access, predictability, mutability, straightforward validation and testing strategies, and scalability are all important consideration in choosing the infrastructure you use when building your forms in Angular. Template-driven forms come from a familiar place in AngularJS, but fall short given the criteria in the modern world of Angular apps. Reactive forms integrate with reactive patterns already present in other areas of the Angular architecture, and complement those requirements well.

## Next Steps

You can learn more with examples and best practices using reactive forms or template-driven forms. The following guides are the next steps in the learning process.

To learn more about reactive forms, see the following guides:

* [Reactive Forms](guide/reactive-forms)
* [Form Validation](guide/form-validation#reactive-form-validation)
* [Dynamic forms](guide/dynamic-form)

To learn more about tempate-driven forms, see the following guides:

* [Template-driven Forms](guide/forms)
* [Form Validation](guide/form-validation#template-driven-validation)
