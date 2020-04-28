# Template statements

A template **statement** responds to an **event** raised by a binding target
such as an element, component, or directive.

<div class="alert is-helpful">

See the <live-example name="template-syntax">Template syntax</live-example> for
the syntax and code snippets in this guide.

</div>

The following template statement appears in quotes to the right of the `=`&nbsp;symbol as in `(event)="statement"`.

<code-example path="template-syntax/src/app/app.component.html" region="context-component-statement" header="src/app/app.component.html"></code-example>

A template statement *has a side effect*.
That's the whole point of an event.
It's how you update application state from user action.

Responding to events is the other side of Angular's "unidirectional data flow".
You're free to change anything, anywhere, during this turn of the event loop.

Like template expressions, template *statements* use a language that looks like JavaScript.
The template statement parser differs from the template expression parser and
specifically supports both basic assignment (`=`) and chaining expressions with <code>;</code>.

However, certain JavaScript and template expression syntax is not allowed:

* <code>new</code>
* increment and decrement operators, `++` and `--`
* operator assignment, such as `+=` and `-=`
* the bitwise operators, such as `|` and `&`
* the [pipe operator](guide/template-expression-operators#pipe)

## Statement context

As with expressions, statements can refer only to what's in the statement context
such as an event handling method of the component instance.

The *statement context* is typically the component instance.
The *deleteHero* in `(click)="deleteHero()"` is a method of the data-bound component.

<code-example path="template-syntax/src/app/app.component.html" region="context-component-statement" header="src/app/app.component.html"></code-example>

The statement context may also refer to properties of the template's own context.
In the following examples, the template `$event` object,
a [template input variable](guide/built-in-directives#template-input-variable) (`let hero`),
and a [template reference variable](guide/template-reference-variables) (`#heroForm`)
are passed to an event handling method of the component.

<code-example path="template-syntax/src/app/app.component.html" region="context-var-statement" header="src/app/app.component.html"></code-example>

Template context names take precedence over component context names.
In `deleteHero(hero)` above, the `hero` is the template input variable,
not the component's `hero` property.

## Statement guidelines

Template statements cannot refer to anything in the global namespace. They
can't refer to `window` or `document`.
They can't call `console.log` or `Math.max`.

As with expressions, avoid writing complex template statements.
A method call or simple property assignment should be the norm.
