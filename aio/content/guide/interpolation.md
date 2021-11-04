# Text interpolation

Interpolation refers to embedding expressions into marked up text.
By default, interpolation uses the double curly braces `{{` and `}}`  as delimiters. Text interpolation lets you incorporate dynamic string values into your HTML templates. Use interpolation to dynamically change what appears in an application view, such as displaying a custom greeting that includes the user's name.

<div class="alert is-helpful">

See the <live-example></live-example> for all of the syntax and code snippets in this guide.

</div>

## Prerequisites

To get the most out of text interpolation, you should be familiar with the following:

Basics of components
Basics of templates
Template statements

## Displaying values with interpolation

1. To illustrate how interpolation works, create an Angular component that contains a `currentCustomer` variable:

<code-example path="interpolation/src/app/app.component.ts" region="customer" header="src/app/app.component.ts"></code-example>

2. Use interpolation to display the value of this variable in the corresponding component template:

<code-example path="interpolation/src/app/app.component.html" region="interpolation-example1" header="src/app/app.component.html"></code-example>

Angular replaces `currentCustomer` with the string value of the corresponding component property.
In this case, the value is `Maria`.

In the following example, Angular evaluates the `title` and `itemImageUrl` properties to display some title text and an image.

3. To display some title text and an image, type the following:

<code-example path="interpolation/src/app/app.component.html" region="component-property" header="src/app/app.component.html"></code-example>

## Template expressions

A template **expression** produces a value and appears within double curly braces, `{{ }}`.  Angular resolves the expression and assigns it to a property of a binding target.  The target could be an HTML element, a component, or a directive.

### Resolving expressions with interpolation

More generally, the text between the braces is a template expression that Angular first evaluates and then converts to a string.

1. To illustrate the point, type the following to add two numbers together:

<code-example path="interpolation/src/app/app.component.html" region="convert-string" header="src/app/app.component.html"></code-example>

2. Type the following expression to invoke methods of the host component such as `getVal()`:

<code-example path="interpolation/src/app/app.component.html" region="invoke-method" header="src/app/app.component.html"></code-example>

With interpolation, Angular performs the following tasks:

1. Evaluates all expressions in double curly braces.
1. Converts the expression results to strings.
1. Links the results to any adjacent literal strings.
1. Assigns the composite to an element or directive property.

<div class="alert is-helpful">

Configure the interpolation delimiter with the [interpolation](api/core/Component#interpolation) option in the `@Component()` metadata.

</div>

## What’s Next

TBD
Bindings
