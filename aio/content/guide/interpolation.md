
# Interpolation and Template Expressions

Interpolation allows you to weave calculated strings into the text 
between HTML element tags and within attribute assignments. Template 
expressions are what you use to calculate those strings.

## Prerequisites

You should already be familiar with:

* HTML basics
* JavaScript basics
* Angular [Architecture](guide/architecture)

<hr/>

The <live-example></live-example> demonstrates all of the syntax and code
snippets described in this page.

## Interpolation `{{...}}`

Interpolation refers to the double curly braces, `{{` and `}}`. In the following 
snippet, `{{ currentCustomer }}` is an example of interpolation.

```html
<h1>Current customer: {{ currentCustomer }}</h1>
```

The text between the braces is often the name of a component 
property. Angular replaces that name with the
string value of the corresponding component property. 

```html
<h3>
  {{title}}
  <img src="{{itemImageUrl}}" style="height:30px">
</h3>
```

In the example above, Angular evaluates the `title` and `itemImageUrl` properties
and fills in the blanks, first displaying some title text and then an image.

More generally, the text between the braces is a **template expression** 
that Angular first **evaluates** and then **converts to a string**. 
The following interpolation illustrates the point by adding two numbers:

```html
<!-- "The sum of 1 + 1 is 2" -->
<p>The sum of 1 + 1 is {{1 + 1}}</p>
```
<!-- <code-example path="template-syntax/src/app/app.component.html" region="sum-1" title="src/app/app.component.html" linenums="false">
</code-example> -->

The expression can invoke methods of the host component such as `getVal()` in 
the following example:

```html
<!-- "The sum of 1 + 1 is not 4" -->
<p>The sum of 1 + 1 is not {{1 + 1 + getVal()}}</p>
```

<!-- <code-example path="template-syntax/src/app/app.component.html" region="sum-2" title="src/app/app.component.html" linenums="false">
</code-example> -->

Angular evaluates all expressions in double curly braces,
converts the expression results to strings, and links them with neighboring literal strings. Finally,
it assigns this composite interpolated result to an **element or directive property**.

You appear to be inserting the result between element tags and assigning it to attributes.
However, interpolation is a special syntax that Angular converts into a
property binding.


## Template expressions

A template **expression** produces a value and appears within the double 
curly braces, `{{ }}`.
Angular executes the expression and assigns it to a property of a binding target;
the target could be an HTML element, a component, or a directive.

The interpolation braces in `{{1 + 1}}` surround the template expression `1 + 1`.
In the property binding,
<!-- link to guide/property-binding guide -->
a template expression appears in quotes to the right of the&nbsp;`=` symbol as in `[property]="expression"`.

In terms of syntax, template expressions are similar to JavaScript.
Many JavaScript expressions are legal template expressions, with a few exceptions.

You can't use JavaScript expressions that have or promote side effects,
including:

* Assignments (`=`, `+=`, `-=`, ...)
* The `new` operator
* Chaining expressions with <code>;</code> or <code>,</code>
* The increment and decrement operators `++` and `--`

Other notable differences from JavaScript syntax include:

* No support for the bitwise operators `|` and `&`
* New template expression operators, such as `|`, `?.` and `!`
<!-- link to: guide/template-syntax#expression-operators -->

### Expression context

The *expression context* is typically the _component_ instance.
In the following snippets, the `title` within double curly braces and the
`isUnchanged` in quotes refer to properties of the `AppComponent`.

```html
{{title}}
<span [hidden]="isUnchanged">changed</span>
<div><img [src]="itemImageUrl"></div>
```

An expression may also refer to properties of the _template's_ context
such as a template input variable, 
<!-- link to built-in-directives#template-input-variables -->
`let customer`, or a template reference variable, `#customerInput`.
<!-- link to guide/template-ref-variables -->

```html
<div *ngFor="let customer of customers">{{customer.name}}</div>
<input #customerInput> {{customerInput.value}}
```
<!-- Above snippet needs example
<code-example path="template-syntax/src/app/app.component.html" region="context-var" title="src/app/app.component.html" linenums="false">
</code-example> -->

The context for terms in an expression is a blend of the _template variables_,
the directive's _context_ object (if it has one), and the component's _members_.
If you reference a name that belongs to more than one of these namespaces,
the template variable name takes precedence, followed by a name in the directive's _context_,
and, lastly, the component's member names.

The previous example presents such a name collision. The component has a `customer`
property and the `*ngFor` defines a `customer` template variable.
The `customer` in `{{customer.name}}`
refers to the template input variable, not the component's property.

Template expressions cannot refer to anything in
the global namespace. They can't refer to `window` or `document`. They
can't call `console.log` or `Math.max`. They are restricted to referencing
members of the expression context.


### Expression guidelines

When using template expressions follow these guidelines:

* [No visible side effects](guide/interpolation#no-visible-side-effects)
* [Quick execution](guide/interpolation#quick-execution)
* [Simplicity](guide/interpolation#simplicity)
* [Idempotence](guide/interpolation#idempotence)


#### No visible side effects

A template expression should not change any application state other than the value of the
target property.

This rule is essential to Angular's "unidirectional data flow" policy.
You should never worry that reading a component value might change some other displayed value.
The view should be stable throughout a single rendering pass.

### Quick execution

Angular executes template expressions after every change detection cycle.
Change detection cycles are triggered by many asynchronous activities such as
promise resolutions, HTTP results, timer events, keypresses and mouse moves.

Expressions should finish quickly or the user experience may drag, especially on slower devices.
Consider caching values when their computation is expensive.

### Simplicity

Although it's possible to write complex template expressions, it's a better 
practice to avoid them.

A property name or method call should be the norm.
An occasional Boolean negation, `!`, is OK.
Otherwise, confine application and business logic to the component,
where it is easier to develop and test.

### Idempotence

An [idempotent](https://en.wikipedia.org/wiki/Idempotence) expression is ideal because
it is free of side effects and improves Angular's change detection performance.

In Angular terms, an idempotent expression always returns *exactly the same thing* until
one of its dependent values changes.

Dependent values should not change during a single turn of the event loop.
If an idempotent expression returns a string or a number, it returns the same string or number when called twice in a row. If the expression returns an object, including an `array`, it returns the same object *reference* when called twice in a row.


