# Template reference variables (`#var`)

A **template reference variable** is often a reference to a DOM element within a template.
It can also refer to a directive (which contains a component), an element, [TemplateRef](api/core/TemplateRef), or a <a href="https://developer.mozilla.org/en-US/docs/Web/Web_Components" title="MDN: Web Components">web component</a>.

<div class="alert is-helpful">

See the <live-example></live-example> for a working example containing the code snippets in this guide.

</div>

Use the hash symbol (#) to declare a reference variable.
The following reference variable, `#phone`, declares a `phone` variable on an `<input>` element.

<code-example path="template-reference-variables/src/app/app.component.html" region="ref-var" header="src/app/app.component.html"></code-example>

You can refer to a template reference variable anywhere in the component's template.
Here, a `<button>` further down the template refers to the `phone` variable.

<code-example path="template-reference-variables/src/app/app.component.html" region="ref-phone" header="src/app/app.component.html"></code-example>

Angular assigns each template reference variable a value based on where you declare the variable:

* If you declare the variable on a component, the variable refers to the component instance.
* If you declare the variable on a standard HTML tag, the variable refers to the element.
* If you declare the variable on an `<ng-template>` element, the variable refers to a `TemplateRef` instance, which represents the template.
* If the variable specifies a name on the right-hand side, such as `#var="ngModel"`, the variable refers to the directive or component on the element with a matching `exportAs` name.

<h3 class="no-toc">How a reference variable gets its value</h3>

In most cases, Angular sets the reference variable's value to the element on which it is declared.
In the previous example, `phone` refers to the phone number `<input>`.
The button's click handler passes the `<input>` value to the component's `callPhone()` method.

The `NgForm` directive can change that behavior and set the value to something else. In the following example, the template reference variable, `itemForm`, appears three times separated
by HTML.

<code-example path="template-reference-variables/src/app/app.component.html" region="ngForm" header="src/app/hero-form.component.html"></code-example>

The reference value of itemForm, without the ngForm attribute value, would be
the [HTMLFormElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement).
There is, however, a difference between a Component and a Directive in that a `Component`
will be referenced without specifying the attribute value, and a `Directive` will not
change the implicit reference (that is, the element).



However, with `NgForm`, `itemForm` is a reference to the [NgForm](api/forms/NgForm "API: NgForm")
directive with the ability to track the value and validity of every control in the form.

The native `<form>` element doesn't have a `form` property, but the `NgForm` directive does, which allows disabling the submit button
if the `itemForm.form.valid` is invalid and passing the entire form control tree
to the parent component's `onSubmit()` method.

<h3 class="no-toc">Template reference variable considerations</h3>

A template _reference_ variable (`#phone`) is not the same as a template _input_ variable (`let phone`) such as in an [`*ngFor`](guide/built-in-directives#template-input-variable).
See [_Structural directives_](guide/structural-directives#template-input-variable) for more information.

The scope of a reference variable is the entire template. So, don't define the same variable name more than once in the same template as the runtime value will be unpredictable.

### Alternative syntax

You can use the `ref-` prefix alternative to `#`.
This example declares the `fax` variable as `ref-fax` instead of `#fax`.


<code-example path="template-reference-variables/src/app/app.component.html" region="ref-fax" header="src/app/app.component.html"></code-example>

