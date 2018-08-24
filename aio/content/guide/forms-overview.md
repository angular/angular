# Forms in Angular

Handling user input with forms is the cornerstone of many common applications. You use forms to log in to a page, updating a profile, entering sensitive information, and many other data-entry tasks. 

Angular provides two different approaches to handling user input through forms: Reactive and template-driven. Each set of forms promote a distinct way of processing forms and offers different advantages. The sections below provide a comparison of the two approaches and when each one is applicable. There are many different factors that influence your decision on which approach works best for your situation. Whether you’re using reactive or template driven forms, these concepts are key to understanding the mechanisms underneath each solution.

In general:

* **Reactive forms** are more robust: they are more scalable, reusable, and testable. If forms are a key part of your application, use reactive forms.
* **Template-driven forms** are useful for adding a simple form to an app, such as a single email list signup form. They are easy to add to an app, but they do not scale as well as reactive forms. If you have very simple form with only static data, use template-driven forms.

## A common foundation

Both reactive and template-driven forms share underlying building blocks, the `FormControl`, `FormGroup` and the `ControlValueAccessor` interface. A `FormControl` instance tracks the value and validation status of an individual form control element. A `FormGroup` instance tracks the same values and statuses for a collection of form controls. How these control instances are created and managed with reactive and template-driven forms will be discussed later in this guide.

## Control value accessors

Control value accessors define a bridge between Angular forms and native DOM elements. The `ControlValueAccessor` interface defines methods for interacting with native elements including: reading from and writing values to them, providing callback functions to listen for value changes, when they are touched, and or enabled or disabled. A [default control value accessor](api/forms/DefaultValueAccessor) is attached to every input element when using either forms modules in Angular. 

## Forms data flows

When building forms in Angular, its important to be able understand how the the framework handles data flows from user input to the form and changes from code. Reactive and template-driven follow two different strategies when handling these scenarios. Using a simple component with a single input field, we can illustrate how changes are handled.

Here is a component with an input field for a single control using reactive forms.

```typescript
@Component({
  template: `Name: <input type="text" [formControl]="name"/> `
})
export class ReactiveNameComponent {
  name = new FormControl();
}
```

Let’s look at how the data flows for an input with reactive forms.

**Diagram of Input Event flow For Reactive Forms**

When text is entered into the input field, the control is immediately updated to the new value, which then emits a new value through an observable. The source of truth, the form model, is explicitly defined with the form control in the component class. This model is created independently of the UI and is used to provide the value and validation status for the control instance. Reactive forms use directives to link existing form control instances to form elements in the view. This is important because you have full control over the form model without ever rendering the UI. The source of truth is always correct, because it is synchronously updated at the time changes are made.

Now let’s look at the same data flows with template-driven forms.

```typescript
@Component({
  template: `Name: <input type="text" [(ngModel)]="name"/>`
})
export class TemplateNameComponent {
  name = ‘’;
}
```

**Diagram of Input Event flow For Reactive Forms**

Template-driven forms are less explicit in that the source of truth for is the directives in the template. Directives are necessary to bind the model to the component class. You no longer have direct control of the form model. Template-driven forms use directives such as NgModel and NgModelGroup to create the form control or group instances and manage their lifecycle within the change detection cycle. This abstraction promotes simplicity over structure. Because template-driven forms are dependent on the UI, the change detection process must complete its cycle where it checks for values changes, queues a task for the value to be updated, and performs a tick before the source of truth is correct. The process happens asynchronously to prevent errors from occuring with values changing during the change detection cycle and introduces unpredictability for querying the source of truth.

## Custom validation and testing

Validation is an integral part of managing any set of forms. Whether you’re checking for required fields or querying an external API for an existing username, Angular provides a set of built-in validators as well as the ability to create custom validators. With reactive forms, creating custom validators are achieved functions that receives control to validate and returns a result immediately. Because template-driven forms are tied to directives, custom validator directives must be created to wrap a validator function in order to use it in a template.

For more on form validation, visit the [Form Validation](guide/form-validation) guide.

Testing also plays a large part in complex applications and an easier testing strategy is always welcomed.  Reactive forms provide an easy testing strategy to due to synchronous access to the form and data models, where controls and data can be queried and manipulated easily through the control without rendering a view. Template-driven forms are asynchronous, which complicates complex testing scenarios. It involves more detailed knowledge of the change detection process and how directives run on each cycle to ensure elements can be queried at the correct time. In order to access the underlying controls with template-driven forms, you must use `ViewChild` to access the `NgForm` and wait for the appropiate lifecycle hooks to finish before extracting any values, testing its validity or changing its value.

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
