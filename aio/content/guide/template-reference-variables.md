# Understanding template variables

Template variables help you use data from one part of a template in another part of the template.
Use template variables to perform tasks such as respond to user input or finely tune your application's forms.

A template variable can refer to the following:

* a DOM element within a template
* a directive or component
* a [TemplateRef](api/core/TemplateRef) from an [ng-template](api/core/ng-template)
* a <a href="https://developer.mozilla.org/en-US/docs/Web/Web_Components" title="MDN: Web Components">web component</a>

<div class="alert is-helpful">

See the <live-example></live-example> for a working example containing the code snippets in this guide.

</div>

## Prerequisites

* [Understanding templates](guide/template-overview)

## Syntax

In the template, you use the hash symbol, `#`, to declare a template variable.
The following template variable, `#phone`, declares a `phone` variable with the `<input>` element as its value.

<code-example path="template-reference-variables/src/app/app.component.html" region="ref-var" header="src/app/app.component.html"></code-example>

Refer to a template variable anywhere in the component's template.
Here, a `<button>` further down the template refers to the `phone` variable.

<code-example path="template-reference-variables/src/app/app.component.html" region="ref-phone" header="src/app/app.component.html"></code-example>

## How Angular assigns values to template variables

Angular assigns a template variable a value based on where you declare the variable:

* If you declare the variable on a component, the variable refers to the component instance.
* If you declare the variable on a standard HTML tag, the variable refers to the element.
* If you declare the variable on an `<ng-template>` element, the variable refers to a `TemplateRef` instance which represents the template.
  For more information on `<ng-template>`, see [How Angular uses the asterisk, `*`, syntax](guide/structural-directives#asterisk) in [Structural directives](guide/structural-directives).

## Variable specifying a name

* If the variable specifies a name on the right-hand side, such as `#var="ngModel"`, the variable refers to the directive or component on the element with a matching `exportAs` name.
<!-- What does the second half of this mean?^^ Can we explain this more fully? Could I see a working example? -kw -->

### Using `NgForm` with template variables

In most cases, Angular sets the template variable's value to the element on which it occurs.
In the previous example, `phone` refers to the phone number `<input>`.
The button's click handler passes the `<input>` value to the component's `callPhone()` method.

The `NgForm` directive demonstrates getting a reference to a different value by referencing a directive's `exportAs` name.
In the following example, the template variable, `itemForm`, appears three times separated by HTML.

<code-example path="template-reference-variables/src/app/app.component.html" region="ngForm" header="src/app/hero-form.component.html"></code-example>

Without the `ngForm` attribute value, the reference value of `itemForm` would be
the [HTMLFormElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement), `<form>`.
If an element is an Angular Component, a reference with no attribute value will automatically reference the component instance. Otherwise, a reference with no value will reference the DOM element, even if the element has one or more directives applied to it.
<!-- What is the train of thought from talking about a form element to the difference between a component and a directive? Why is the component directive conversation relevant here?  -kw I agree -alex -->

## Template variable scope

Just like variables in JavaScript or TypeScript code, template variables are scoped to the template that declares them.

Similarly, [Structural directives](guide/built-in-directives) such as `*ngIf` and `*ngFor`, or `<ng-template>` declarations create a new nested template scope, much like JavaScript's control flow statements like `if` and `for` create new lexical scopes. You cannot access template variables within one of these structural directives from outside of its boundaries.

<div class="alert is-helpful">

Define a variable only once in the template so the runtime value remains predictable.

</div>

### Accessing in a nested template

An inner template can access template variables that the outer template defines.

In the following example, changing the text in the `<input>` changes the value in the `<span>` because Angular immediately updates changes through the template variable, `ref1`.

<code-example path="template-reference-variables/src/app/app.component.html" region="template-ref-vars-scope1" header="src/app/app.component.html"></code-example>

In this case, the `*ngIf` on `<span>` creates a new template scope, which includes the `ref1` variable from its parent scope.

However, accessing a template variable from a child scope in the parent template doesn't work:

```html
  <input *ngIf="true" #ref2 type="text" [(ngModel)]="secondExample" />
  <span>Value: {{ ref2?.value }}</span> <!-- doesn't work -->
```

Here, `ref2` is declared in the child scope created by `*ngIf`, and is not accessible from the parent template.

{@a template-input-variable}
{@a template-input-variables}
## Template input variable

A _template input variable_ is a variable with a value that is set when an instance of that template is created. See: [Writing structural directives](https://angular.io/guide/structural-directives)

Template input variables can be seen in action in the long-form usage of `NgFor`:

```html
<ul>
  <ng-template ngFor let-hero [ngForOf]="heroes">
    <li>{{hero.name}}
  </ng-template>
</ul>
```

The `NgFor` directive will instantiate this <ng-template> once for each hero in the `heroes` array, and will set the `hero` variable for each instance accordingly.

When an `<ng-template>` is instantiated, multiple named values can be passed which can be bound to different template input variables. The right-hand side of the `let-` declaration of an input variable can specify which value should be used for that variable.

`NgFor` for example also provides access to the `index` of each hero in the array:

```html
<ul>
  <ng-template ngFor let-hero let-i="index" [ngForOf]="heroes">
    <li>Hero number {{i}}: {{hero.name}}
  </ng-template>
</ul>
```

## What’s next

[Writing structural directives](https://angular.io/guide/structural-directives)

@reviewed 2022-05-12
