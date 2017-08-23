
# `@Input()` and `@Output()` properties


`@Input()` and `@Output()` let parent and child components share data with one 
another. 

## Prerequisites

* [Interpolation](guide/interpolation).
* [Template Statements](guide/template-statements).
* [Binding syntax](guide/binding-syntax).
* [Property Binding](guide/property-binding).

This page uses a CLI generated project for the example. For information 
on how use the CLI to setup a project, see [Quickstart](guide/quickstart).

<hr />

This page covers `@Input()` and `@Output()` because developers often use them 
together in apps. However, you can use them separately. If the nested 
component is such that its only use is to send data back, you wouldn't 
need an `@Input()`, only an `@Output()`. `@Input` and `@Output` act as 
the API, or application programming interface, of the child 
component. That is, they allow the child to 
communicate with the parent. Consider `@Input()` and `@Output()` like ports 
or doorways&mdash;`@Input()` is the doorway into the component allowing data 
to flow in while `@Output()` is the doorway out of the component, allowing the 
child component to send data out.

An example of this child/parent relationship is as follows:

<!-- KW--emphasis on selector -->
```html
<parent-component>
  <child-component></child-component>
</parent-component>

```
A child component such as `<child-component>` above, is embedded 
within a `<parent-component>` using the child selector. If data 
needs to flow into or out of the `<child-component>`, the `<child-component>` 
needs `@Input()` and `@Output()` respectively to open the doorways of 
communication between the parent and child.


## `@Input()`

Use the `@Input()` decorator in a child component to let Angular know 
that a property in that component can receive its value from its parent component. 
It helps to remember that the data flow is from the perspective of the 
child component. So an input is allowing data to be input _into_ the 
child component from the parent component.


<figure>
  <img src='generated/images/guide/input-output/input.gif' alt="Input diagram">
</figure>

### `@Input()` in the child component

To use the `@Input()` decorator in a child component, import 
`Input` and then decorate the property with `@Input()`:

```ts
import { Input } from '@angular/core'; // First, import Input.

@Component({
  // ... not included for brevity
})

export class ChildComponent {
  @Input() nameFromParent: string; // decorate the property with @Input()
}

```

In this case, `@Input()` decorates the property `nameFromParent`, which has 
a type of `string`, however, `@Input` properties can have any type, such as 
`number`, `string`, `boolean`, or `object`. The value for `nameFromParent` will come from the parent component.

### In the parent component

The next step is to bind the property in the parent component's template. 
In this example, the parent component template is `app.component.html`. 

```html
  <app-child [nameFromParent]="parentName"></app-child>

```
First, use the child's selector, `<app-child>`, as a directive within the 
parent component template. Then, use [property binding](guide/property-binding) 
to bind the property in the child to the property of the parent.

In this example, the property in the child, or the target, is `nameFromChild` 
in square brackets. The property of the parent, or the source, 
is `parentName` in quotation marks.

The following diagram shows this structure:

<figure>
  <img src='generated/images/guide/input-output/property-binding.gif' alt="Property binding">
</figure>


The target in the square brackets is the property you decorate 
with `@Input` in the child component. The binding source, the part 
to the right of the equal sign, is the data that the parent 
component passes to the nested component. 

To use a child component's property in a binding in a parent component, you must 
decorate the property with `@Input` in the child component.

### `OnChanges` and `@Input`

To watch for changes on an input property, use `OnChanges`, one of Angular's [lifecycle hooks](guide/lifecycle-hooks). Said another way, 
if a parent notifies a child, use `OnChanges`. `OnChanges` 
is specifically designed to work with `@Input`. In fact, 
it will only watch for changes to a property that has the 
`@Input` decorator.

## `@Output()`

Use the `@Output()` decorator in the child component to allow data to flow from 
the child _out_ to the parent. 

<figure>
  <img src='generated/images/guide/input-output/output.gif' alt="Output diagram">
</figure>

Just like with `@Input()`, you can use `@Output()`
on any property of the child component but its type must be 
an event. 

### Using `@Output()`

`@Output()` marks a property in a child component as a doorway 
through which data can travel from the child to the parent. 
The child component then has to raise an event so the 
parent knows something has changed.

To do this, `@Output()` works hand in hand with `EventEmitter`. 
`EventEmitter` is a class in `@angular/core` that you can 
use to emit custom events. First, be sure to import `Output` and `EventEmitter` 
in the child component:

```js
import { Output, EventEmitter } from '@angular/core';

```

Next, decorate a property with `@Output()` in the child component class. 
The following output is called `dataForParent` and its type is 
`EventEmitter`, that is, it's an event.  

```ts
    @Output() dataForParent: EventEmitter<string> = new EventEmitter<string>();
```
The different parts of the above declaration are as follows:

* `@Output()`&mdash;a decorator function marking the property as a way for data to go from the child to the parent.
* `dataForParent`&mdash;the name of the property.
* `EventEmitter<string>`&mdash;the property's type.
* `new EventEmitter<string>()`&mdash;tells Angular to create a new event and that the data it emits is of type string. The type could be any type, such as `number`, `boolean`, and so on.

For more information on `EventEmitter`, see the [EventEmitter API documentation](api/core/EventEmitter).


Then, set up an event in the same component class:

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





Be sure to explain this
https://blogs.msmvps.com/deborahk/passing-data-to-and-raising-an-event-from-a-nested-component/










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
