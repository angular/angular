# Template Reference Variables `#var`

## Prerequisites

You should already be familiar with:
* The concept of variables.
* Angular templates.
* [Binding Syntax](guide/binding-syntax).
* [Property Binding](guide/property-binding).

<hr/>

A **template reference variable** is often a reference to a DOM element within a template.
It can also reference an Angular component, directive, or a
<a href="https://developer.mozilla.org/en-US/docs/Web/Web_Components" title="MDN: Web Components">web component</a>.

Use the hash symbol, `#`, to declare a reference variable.
The `#phone` declares a `phone` variable on an `<input>` element in this example:

<code-example path="template-syntax/src/app/app.component.html" region="ref-var" title="src/app/app.component.html" linenums="false">
</code-example>

You can refer to a template reference variable _anywhere_ in the template.
The `phone` variable declared on this `<input>` is
consumed in a `<button>` on the other side of the template.

<code-example path="template-syntax/src/app/app.component.html" region="ref-phone" title="src/app/app.component.html" linenums="false">
</code-example>

## How a reference variable gets its value

In most cases, Angular sets the reference variable's value to the element on which it was declared.
In the previous example, `phone` refers to the phone number `<input>`.
The phone button click handler passes the input value to the component's `callPhone()` method.
However, a directive such as `NgForm` can change that behavior and set the value to itself.

The following is a simplified version of the form example in the [Forms](guide/forms) guide.

<!-- <code-example path="template-syntax/src/app/hero-form.component.html" title="src/app/hero-form.component.html" linenums="false">
</code-example> -->


```html
<form (ngSubmit)="onSubmit(customerForm)" #customerForm="ngForm">
  <div class="form-group">
    <label for="name">Name
      <input class="form-control" name="name" required [(ngModel)]="customer.name">
    </label>
  </div>
  <button type="submit" [disabled]="!customerForm.form.valid">Submit</button>
</form>
<div [hidden]="!customerForm.form.valid">
  {{submitMessage}}
</div>

```

A template reference variable, `customerForm`, appears three times in this example, separated
by a large amount of HTML. What is the value of `customerForm`?

If Angular hadn't taken it over when you imported the `FormsModule`,
it would be the [HTMLFormElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement).
The `customerForm` is actually a reference to an Angular [NgForm](api/forms/NgForm "API: NgForm")
directive with the ability to track the value and validity of every control in the form.

The native `<form>` element doesn't have a `form` property.
But the `NgForm` directive does, which explains how you can disable the submit button
if the `heroForm.form.valid` is invalid and pass the entire form control tree
to the parent component's `onSubmit()` method.

## Template reference variable notes

A template _reference_ variable; for example, `#phone`, is not the same as a template _input_ variable, that is, `let phone`,
such as you might see in an [`*ngFor`](guide/built-in-directives#ngfor).
Read about the difference in the [Structural Directives](guide/structural-directives#template-input-variable) guide.

Since the scope of a reference variable is the entire template, only
define a variable name once within the template. If you define it more than 
once, the runtime value will be unpredictable.

You can use the `ref-` prefix as an alternative to `#`.
This example declares the `fax` variable as `ref-fax` instead of `#fax`.

<code-example path="template-syntax/src/app/app.component.html" region="ref-fax" title="src/app/app.component.html" linenums="false">
</code-example>

<hr />

## More information

You may also like:

* [Attribute Directives](guide/attribute-directives) for writing custom attribute directives.
* [Structural Directives](guide/attribute-directives) for writing custom structural directives.
