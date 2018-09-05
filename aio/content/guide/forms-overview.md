# Forms in Angular

Handling user input with forms is the cornerstone of many common applications. You use forms to log in, to update a profile, to enter sensitive information, and to perform many other data-entry tasks. 

Angular provides two different approaches to handling user input through forms: reactive and template-driven. Each set of forms promote a distinct way of processing forms and offers different advantages. The sections below provide a comparison of the two approaches and when each one is applicable. There are many different factors that influence your decision on which approach works best for your situation. Whether you’re using reactive or template-driven forms, these concepts are key to understanding the mechanisms underneath each solution.

In general:

* **Reactive forms** are more robust: they are more scalable, reusable, and testable. If forms are a key part of your application, or you're already using reactive patterns for building your application, use reactive forms.
* **Template-driven forms** are useful for adding a simple form to an app, such as a single email list signup form. They are easy to add to an app, but they do not scale as well as reactive forms. If you have very basic form requirements and logic that can be managed solely in the template, use template-driven forms.

## A common foundation

Both reactive and template-driven forms share underlying building blocks, the `FormControl`, `FormGroup` and `FormArray`. A `FormControl` instance tracks the value and validation status of an individual form control element, a `FormGroup` instance tracks the same values and statuses for a collection, and a `FormArray` instance tracks the same values and statues for an array of form controls. How these control instances are created and managed with reactive and template-driven forms will be discussed later in this guide.

## Control value accessors

Control value accessors define a bridge between Angular forms and native DOM elements. The `ControlValueAccessor` interface defines methods for interacting with native elements including: reading from and writing values to them, disabling or enabling their elements, and providing callback functions for when the control's value changes in the UI or becomes touched. A built-in accessor is attached to every form field when using either forms module in Angular, unless a custom value accessor has been activated on that field. 

## Data flow in forms

When building forms in Angular, it's important to understand how the the framework handles data flowing from the user or from programmatic changes. Reactive and template-driven follow two different strategies when handling these scenarios. Using a simple component with a single input field, we can illustrate how changes are handled.

### Data flow in reactive forms

Here is a component with an input field for a single control using reactive forms.

```typescript
@Component({
  template: `Name: <input type="text" [formControl]="name"> `
})
export class ReactiveNameComponent {
  name = new FormControl('');
}
```

Let’s look at how the data flows for an input with reactive forms.

**Diagram of Input Event Flow For Reactive Forms**

### Data flow in template-driven forms

In reactive forms, the source of truth is the form model (in this case, the `FormControl` instance), which is explicitly defined in the component class. This model is created independently of the UI and can be used to provide an initial value for the control. The reactive form directive (in this case, `FormControlDirective`) then links the existing form control instance to a specific form element in the view using a value accessor.

When text is entered into the input field, the field's value accessor immediately relays the new value to the FormControl instance, which then emits the value through the valueChanges observable.

With reactive forms, you have full control over the form model without ever rendering the UI. The source of truth is always up-to-date, because it is synchronously updated at the time changes are made.

Now let’s look at the same data flows with template-driven forms.

```typescript
@Component({
  template: `Name: <input type="text" [(ngModel)]="name">`
})
export class TemplateNameComponent {
  name = '';
}
```

**Diagram of Input Event Flow For Reactive Forms**

In template-driven forms, the source of truth is the template, so developers create their desired form through the placement of template-driven directives such as `NgModel` and `NgModelGroup`. The directives then create the `FormControl` or `FormGroup` instances that make up the form model, link them with form elements through a value accessor, and manage them within the constraints of the template's change detection cycle.

This abstraction promotes simplicity over structure. It is less explicit, but you no longer have direct control over the form model. It is simple to add directives, but because these directives are dependent on the UI, they must work around the change detection cycle. Programmatic value changes are registered during change detection (as they occur through an `Input` to a directive), so it's not possible to update the value and validity immediately because it may affect elements that have already been checked in that view, for example, the parent form. For this reason, value changes are delayed until the next tick, which allows change detection to complete and a new change detection process to be triggered with the updated value. In other words, the process happens asynchronously and introduces unpredictability for querying the source of truth.

## Custom validation and testing

Validation is an integral part of managing any set of forms. Whether you’re checking for required fields or querying an external API for an existing username, Angular provides a set of built-in validators as well as the ability to create custom validators. With reactive forms, custom validators are functions that receive a control to validate. Because template-driven forms are tied to directives, custom validator directives must be created to wrap a validator function in order to use it in a template.

For more on form validation, visit the [Form Validation](guide/form-validation) guide.

Testing also plays a large part in complex applications and an easier testing strategy is always welcomed.  Reactive forms provide an easy testing strategy to due to synchronous access to the form and data models, where controls and data can be queried and manipulated easily through the control without rendering a view. Template-driven forms are asynchronous, which complicates complex testing scenarios. It involves more detailed knowledge of the change detection process and how directives run on each cycle to ensure elements can be queried at the correct time, you must wait for the appropiate lifecycle hooks to finish before extracting any values, testing its validity or changing its value.

## Mutability

How changes are tracked plays a role in the efficiency of your application. Reactive forms keep the data model pure by providing it as an immutable data structure. Each time the a change is triggered on the data model, a new data model is returned rather than updating the data model directly. This is more efficient, giving you the ability track unique changes to the data model. It also follows reactive patterns that integrate with observable operators to map and transform data. Template-driven forms rely on mutability with two-way data binding to update the data model in the component as changes are made in the template.

## Scalability

If forms are a central part of your application, scalability is very important. Being able to reuse form models across components and data access is critical. Reactive forms makes creating large scale forms easier by providing access to low-level APIs and synchronous access to the data model. Because template-driven forms focus on simplicity and simple scenarios with static content and little validation, they are not as reusable and abstract away the low-level APIs and access to the data model is handled asynchronously.

## Key differences

The table below summarizes the key differences in reactive and template driven forms.

<style>
  td, th {vertical-align: top}
</style>

<table>

  <tr>

    <th>
      
    </th>  

    <th>
      Reactive
    </th>

    <th width="40%">
      Template-Driven
    </th>

  </tr>

  <tr>

    <td>
      Setup
    </td>

    <td>
      More Explicit
    </td>

    <td>
      Less Explicit
    </td>

  </tr>

  <tr>

    <td>
      Source of truth
    </td>

    <td>
      The form model
    </td>

    <td>
      The directives in the template
    </td>

  </tr>

  <tr>

    <td>
      Form Model creation
    </td>

    <td>
      Class
    </td>

    <td>
      Form Directives
    </td>

  </tr>

  <tr>

    <td>
      Predictability
    </td>

    <td>
      Synchronous
    </td>

    <td>
      Asynchronous
    </td>

  </tr>

  <tr>

    <td>
      Consistency
    </td>

    <td>
      Immutable
    </td>

    <td>
      Mutable
    </td>

  </tr>

  <tr>

    <td>
      Data model
    </td>

    <td>
      Structured
    </td>

    <td>
      Unstructured
    </td>

  </tr>

  <tr>

    <td>
      Custom Validators
    </td>

    <td>
      Functions
    </td>

    <td>
      Directives
    </td>

  </tr>

  <tr>

    <td>
      Scalability
    </td>

    <td>
      Low-level API access
    </td>

    <td>
      Abstraction on top of APIs
    </td>

  </tr>
  
</table>

## Next Steps

After you understand the two approaches to handling form inputs, you can learn more about common examples and practices using reactive forms or template-driven forms. The following guides are the next steps in the learning process for each approach.


* [Reactive Forms](guide/reactive-forms)
* [Form Validation](guide/form-validation#reactive-form-validation)
* [Dynamic forms](guide/dynamic-form)


* [Template-driven Forms](guide/forms)
* [Form Validation](guide/form-validation#template-driven-validation)
