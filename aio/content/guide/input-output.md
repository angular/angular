
# `@Input` and `@Output` properties

`@Input` and `@Output` let parent and child components share data with one 
another. A child component such as a ________ is embedded 
within a parent component using the child selector.



<!-- KW--Would you ever use Output without Input? Yes. If the nested component is such that its only use is to send data back, you wouldn't need an Input. The API, application programming interface, of the child component. How the child tells the universe how it will communicate. How it will understand data passed to it by way of the inputs and how it will respond via outputs. Put this in first part - before input section.-->

<!-- KW--emphasis on selector -->
```html
<parent-component>
  <child-component></child-component>
</parent-component>

```
<!-- KW--Need real example here. -->



## `@Input`

Use the `@Input` decorator in a child component to let Angular know 
that a property in that component can receive its value from its parent component. 
It helps to remember that the data flow is from the perspective of the 
child component. So an input is allowing data to be input _into_ the 
child component from the parent component.


<figure>
  <img src='generated/images/guide/input-output/input.gif' alt="Input diagram">
</figure>

### `@Input()` in the child component

Use the `@Input()` decorator in a child component as follows:

```ts
import { Input } from '@angular/core'; // First, import Input.

@Component({
  // ... not included for brevity
})

export class ChildComponent {
  @Input() name: string; // decorate the property with @Input()
}

```

Be sure to import `Input` and then, inside the class, decorate 
the property, in this case `name` with the `@Input` decorator. 

### In the parent component

The next step is to bind the property in the parent component's template.

INSERT EXAMPLE HERE

In the parent component, use property binding by surrounding the binding target in square brackets. The target in the square brackets is the property you decorate in the child component.
Set the binding source, the part to the right of the equal sign, to the data that the parent component wants to pass to the nested component. 

<!-- KW--pare down words^^ -->

SHOW TARGET AND SOURCE DIAGRAM

To use a child component's property like this in a parent component, you must 
decorate the property with `@Input` in the child component.


Lifecycle hooks. 

From Deborah's course:
"`OnChanges` only watches for changes to `@Input()` properties." Doesn't watch changes to any other properties, 
only on input properties.

"You can use @Input() to decorate any property type in the child class."

## `@Output`


Be sure to explain this
https://blogs.msmvps.com/deborahk/passing-data-to-and-raising-an-event-from-a-nested-component/


example of something that makes sense with something changing in the child that 
notifies the parent. (output)

so if parent notifies child, use onchanges, (input)

Use the `@Output()` decorator in the child component to allow data to flow from 
the child _out_ to the parent. 
<figure>
  <img src='generated/images/guide/input-output/output.gif' alt="Output diagram">
</figure>

Just like with `@Input()`, you can use `@Output()`
on any property of the child component. 

"Usually you bind to the value of property, and when it changes, the child component 
is notified via the `onChanges` lifecycle hook."

A child component has to raise 
an event to let its parent component know about a change. 

To do this, `@Output()` works hand in hand with `EventEmitter`.
First, be sure to import 
`Output` and `EventEmitter` in the child component:

```js
import { Input, Output, EventEmitter } from '@angular/core';

```

### `EventEmitter`

`EventEmitter` is a class in `@angular/core` that you can use 
to emit custom events.
<!-- KW--Is this always in the context of nested components? EventEmitter, no. Output, yes. -->

To use `EventEmitter` with `@Output`, add them to the child 
component class like this:

```ts
...
export class ChildComponent {
  @Output() update: EventEmitter<string> = new EventEmitter<string>();
}
```

Explain syntax. Can use any data type. 

The data type specifies what data type that is passed with the event, 
often referred to as its payload.


Then, setup an event in the same component class:

```ts
export class ChildComponent {
  @Output() update: EventEmitter<string> = new EventEmitter<string>();

  onSubmit() {
    this.notify.emit()
  }
}

```


Event binding 

This one needs demo just for inputs and outputs.










## ****From existing documentation
Template expressions and statements
 appear on the *right side of the binding declaration*.
A member in that position is a data binding **source**.

This section concentrates on binding to **targets**, which are directive
properties on the *left side of the binding declaration*.
These directive properties must be declared as **inputs** or **outputs**.

<div class="alert is-important">

Remember: All **components** are **directives**.

</div>

<div class="l-sub-section">

Note the important distinction between a data binding **target** and a data binding **source**.

The *target* of a binding is to the *left* of the `=`.
The *source* is on the *right* of the `=`.

The *target* of a binding is the property or event inside the binding punctuation: `[]`, `()` or `[()]`.
The *source* is either inside quotes (`" "`) or within an interpolation (`{{}}`).

Every member of a **source** directive is automatically available for binding.
You don't have to do anything special to access a directive member in a template expression or statement.

You have *limited* access to members of a **target** directive.
You can only bind to properties that are explicitly identified as *inputs* and *outputs*.

</div>

In the following snippet, `iconUrl` and `onSave` are data-bound members of the `AppComponent`
and are referenced within quoted syntax to the _right_ of the equals&nbsp;(`=`).

<code-example path="template-syntax/src/app/app.component.html" region="io-1" title="src/app/app.component.html" linenums="false">
</code-example>

They are *neither inputs nor outputs* of the component. They are **sources** for their bindings.
The targets are the native `<img>` and `<button>` elements.

Now look at a another snippet in which the `HeroDetailComponent`
is the **target** of a binding on the _left_ of the equals&nbsp;(`=`).

<!-- KW--This needs an illustration. I get lost in the words and have to read them slowly.
Simple arrows would help. -->
<code-example path="template-syntax/src/app/app.component.html" region="io-2" title="src/app/app.component.html" linenums="false">
</code-example>

Both `HeroDetailComponent.hero` and `HeroDetailComponent.deleteRequest` are on the **left side** of binding declarations.
`HeroDetailComponent.hero` is inside brackets; it is the target of a property binding.
`HeroDetailComponent.deleteRequest` is inside parentheses; it is the target of an event binding.

### Declaring `@Input` and `@Output` properties

You must explicitly mark target properties as inputs or outputs.

In the `HeroDetailComponent`, you mark such properties as input or output properties using decorators.

<code-example path="template-syntax/src/app/hero-detail.component.ts" region="input-output-1" title="src/app/hero-detail.component.ts" linenums="false">
</code-example>

Alternatively, you can identify members in the `inputs` and `outputs` arrays
of the directive metadata, as in this example:

<code-example path="template-syntax/src/app/hero-detail.component.ts" region="input-output-2" title="src/app/hero-detail.component.ts" linenums="false">
</code-example>

Though you can specify an input/output property either with a decorator or in a metadata array, there is no need to do both. 

While declaring inputs and outputs in the `@Directive` and `@Component` 
metadata is possible, it is a better practice to use the `@Input` and `@Output` 
class decorators instead. See the [Decorate input and output properties](guide/styleguide#decorate-input-and-output-properties) section of the 
[Style Guide](guide/styleguide) for details.


### `@Input` vs. `@Output`
<!-- KW--Is there a way to elaborate just a little on the difference? -->
*Input* properties usually receive data values.
*Output* properties expose event producers, such as `EventEmitter` objects.

The terms _input_ and _output_ reflect the perspective of the target directive.

<figure>
  <img src="generated/images/guide/template-syntax/input-output.png" alt="Inputs and outputs">
</figure>

`HeroDetailComponent.hero` is an **input** property from the perspective of `HeroDetailComponent`
because data flows *into* that property from a template binding expression.

`HeroDetailComponent.deleteRequest` is an **output** property from the perspective of `HeroDetailComponent`
because events stream *out* of that property and toward the handler in a template binding statement.

### Aliasing input/output properties

Sometimes the public name of an input/output property should be different from the internal name. While it is preferable to avoid this situation, Angular does 
offer a solution.

Sometimes you may find a need to alias input or output properties when using 
[attribute directives](guide/attribute-directives).
For example, when you apply a directive with a `myClick` selector to a `<div>` tag,
you'd expect to bind to an event property that is also called `myClick`.

<code-example path="template-syntax/src/app/app.component.html" region="myClick" title="src/app/app.component.html" linenums="false">
</code-example>

However, the directive name isn't often the best choice for the 
name of a property within the directive class.
The directive name rarely describes what the property does.
The `myClick` directive name is not a good name for a property that emits click messages.

Fortunately, you can have a public name for the property that meets conventional expectations,
while using a different name internally.
In the example immediately above, you are actually binding *through the* `myClick` *alias* to
the directive's own `clicks` property.

You can specify the alias for the property name by passing it into the input/output decorator like this:
<!-- KW--A diagram might be helpful here. -->
<code-example path="template-syntax/src/app/click.directive.ts" region="output-myClick" title="src/app/click.directive.ts" linenums="false">
</code-example>

You can also alias property names in the `inputs` and `outputs` arrays.
You write a colon-delimited (`:`) string with
the directive property name on the *left* and the public alias on the *right*:

<code-example path="template-syntax/src/app/click.directive.ts" region="output-myClick2" title="src/app/click.directive.ts" linenums="false">
</code-example>

<hr/>
