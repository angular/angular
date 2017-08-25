
# Template statements

A template **statement** responds to an **event** raised by a binding target
such as an element, component, or directive.

## Prerequisites

You should already be familiar with:

* HTML basics.
* JavaScript basics.
* Angular [Architecture](guide/architecture).

<hr/>

## Syntax

Template statements 
appear in quotes to the right of the `=`&nbsp;symbol as in `(event)="statement"`.

```html
<button (click)="deleteItem()">Delete item</button>
```
<!-- <code-example path="template-syntax/src/app/app.component.html" region="context-component-statement" title="src/app/app.component.html" linenums="false">
</code-example> -->

A template statement *has a side effect*.
It's how you update application state from user action.

Responding to events is the other side of Angular's "unidirectional data flow".
You're free to change anything, anywhere, during this turn of the event loop.

Like [template expressions](guide/interpolation#template-expressions), template *statements* use a syntax that looks like JavaScript.
The template statement parser differs from the template expression parser and
specifically supports both basic assignment, `=`, and chaining expressions
with <code>;</code> or <code>,</code>.

However, certain JavaScript syntax is not allowed:

* The <code>new</code> operator.
* Increment and decrement operators, `++` and `--`.
* Operator assignment, such as `+=` and `-=`.
* The bitwise operators `|` and `&`.
* The [template expression operators](guide/template-syntax#expression-operators).

## Statement context

As with expressions, statements can refer only to what's in the statement context
such as an event handling method of the component instance.

The *statement context* is typically the component instance.
The `deleteItem()` in `(click)="deleteItem()"` is a method of the data-bound component.

```html
<button (click)="deleteItem()">Delete item</button>
```
<!-- 
<code-example path="template-syntax/src/app/app.component.html" region="context-component-statement" title="src/app/app.component.html" linenums="false">
</code-example> -->


The statement context may also refer to properties of the template's own context.
In the following example,
the [template input variable](guide/template-syntax#template-input-variable), 
which is `item` in `let item`, is the template `$event` object and serves as 
the argument to an event handling method in the component called `deleteItem()`.

There is also a [template reference variable](guide/template-syntax#ref-vars), `#itemForm`, that is an argument for `onSubmit()`, another event handling method in the component.

```html
<button (click)="onSave($event)">Save</button>
<button *ngFor="let item of items" (click)="deleteItem(item)">{{item.name}}</button>
<form #itemForm (ngSubmit)="onSubmit(itemForm)"> ... </form>

```
<!-- 
<code-example path="template-syntax/src/app/app.component.html" region="context-var-statement" title="src/app/app.component.html" linenums="false">
</code-example> -->

Template context names take precedence over component context names.
In `deleteItem(item)` above, the `item` is the template input variable,
not the component's `item` property.

### Template statement scope

Template statements are scoped to their context, such as the template in 
which they reside or their component, so they cannot refer to anything in the global namespace. For example, they
can't refer to the `window` or `document` objects, or call `console.log` or `Math.max`.

## Statement guidelines

As with expressions, avoid writing complex template statements.
A method call or simple property assignment should be the norm.

Now that you have a feel for template expressions and statements,
you're ready to learn about the varieties of data binding syntax beyond interpolation.


<hr />

## More information

You may also like:

* [Binding Syntax](guide/binding-syntax).
* [Event Binding](guide/event-binding).
* [Template Reference Variables](guide/template-ref-variables).

