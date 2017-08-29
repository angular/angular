
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

To use a child component's property in a binding in a parent component&mdash;that is, what's 
in square brackets&mdash;you must 
decorate the property with `@Input` in the child component.

### `OnChanges` and `@Input`

To watch for changes on an input property, use 
`OnChanges`, one of Angular's [lifecycle hooks](guide/lifecycle-hooks). `OnChanges` 
is specifically designed to work with `@Input` when a parent notifies a child. In fact, 
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
parent knows something has changed. To raise an event, 
`@Output()` works hand in hand with `EventEmitter`, 
which is a class in `@angular/core` that you can 
use to emit custom events.

Any time you use `@Output()`, you need to edit four parts of your app:

* [The child component](guide/input-output#in-the-child-component).
* [The child's template]().
* [The parent component]().
* [The parent's template]().

The following example shows you how to set up an `@Output()` in a child 
component that pushes data you enter in an HTML text `<input>` to an array in the 
parent component. The HTML element `<input>` and the Angular decorator `@Input()` 
are different and have nothing with each other.

ADD GIF HERE


### In the child component

First, be sure to import `Output` and `EventEmitter` 
in the child component:

```js
import { Output, EventEmitter } from '@angular/core';

```

Next, still in the child, decorate a property with `@Output()` in the component class. 
The following example `@Output()` is called `dataForParent` and its type is 
`EventEmitter`, which means it's an event.

```ts
    @Output() newItemEvent: EventEmitter<string> = new EventEmitter<string>();
```
The different parts of the above declaration are as follows:

* `@Output()`&mdash;a decorator function marking the property as a way for data to go from the child to the parent.
* `newItemEvent`&mdash;the name of the `@Output()`.
* `EventEmitter<string>`&mdash;the `@Output()`'s type.
* `new EventEmitter<string>()`&mdash;tells Angular to create a new event and that the data it emits is of type string. The type could be any type, such as `number`, `boolean`, and so on. For more information on `EventEmitter`, see the [EventEmitter API documentation](api/core/EventEmitter).


Next, set up an event in the same component class:

```ts
export class ChildComponent {
  @Output() newItemEvent: EventEmitter<string> = new EventEmitter<string>(); //same as above

  addNewItem(value:string) {
    this.newItemEvent.emit(value);
}

```
The `addNewItem()` function uses the `@Output()` `newItemEvent` 
to raise an event in which it emits the value the user 
types into the `<input>`. In other words, when 
the user clicks the add button in the UI, the child lets the parent know 
about the event and gives that data to the parent.


### In the child's template

The child's template is straightforward:

```html
<input #newItem>
<button (click)="addNewItem(newItem.value)">Add</button>

```

It has two elements. The first is an HTML `<input>` with a 
[template reference variable](guide/template-ref-variables) , `#newItem`,
where the user types in an item name. Whatever the user types 
into the `<input>` gets stored in the `#newItem` variable.

The second element is a `<button>` 
with an [event binding](guide/event-binding). You know it's 
an event binding because the part to the left of the equal 
sign is in parentheses, `(click)`.

The `(click)` event is bound to the `addNewItem()` method which 
takes as its argument whatever the value of `#newItem` is. Remember 
that the `addNewItem()` method in the child component class.

These two steps have prepared the child component with an `@Output()` 
for sending data to the parent, and method for raising an event. 
The next step is to prepare the parent.

### In the parent component

In this example, the parent component is `AppComponent`, but you could use 
any component in which you could nest the child.

<!-- Should we include instructions on how to nest a component? -->

The `AppComponent` in this example features a list of `items` 
in an array and a method for adding more items to the array. 
The items in the `items` array are displayed in the 
parent's template with an `ngFor`. For more information on how 
to use `NgFor`, see the [`NgFor`](guide/built-in-directives#ngfor) section of [Built-in Directives](guide/built-in-directives).

```ts

export class AppComponent {

  items = ['item1', 'item2', 'item3', 'item4'];

  addItem(newItem: string) {
    this.items.push(newItem);
  }
}
```

The `addItem()` method takes an argument in the form of a string 
and then pushes, or adds, that string to the `items` array.


### In the parent's template

In the parent's template, it's time to bind, or tie, the parent's 
method to the child's method. Within the parent component's 
template, `app.component.html`, be sure to put the 
child selector, in this case `<app-child>`. This works because 
all components are directives. 

<!-- KW--Need to find place to link to info on directives. -->

```ts

  <app-child (newItemEvent)='addItem($event)'></app-child>

```

The event binding, `(newItemEvent)='addItem($event)'`, tells 
Angular to connect the method in the child, `newItemEvent()` to 
the method in parent, `addItem()` and that the event that `newItemEvent()` 
is notifying the parent about is to be the argument of `addItem()`. 
In other words, this is where the actual hand off of data takes place. 
The `$event` contains the data that the user types into the `<input>` 
in the child template UI.

### Diagrams of `@Output()` flow

The following diagrams may help you conceptualize the way outputs 
work. When the user clicks on the add button, 

<!-- <figure>
  <img src='generated/images/guide/input-output/output-flow.gif' alt="Input/Output diagram">
</figure> -->


## `@Input()` and `@Output()` together

You can use `@Input()` and `@Output()` on the same child component.
The following example is of an `@Input()` and an `@Output()` on the same 
child component and shows the different parts of each:

<figure>
  <img src='generated/images/guide/input-output/input-output-diagram.gif' alt="Input/Output diagram">
</figure>

To combine property and event bindings using the banana-in-a-box 
syntax, `[()]`, see [Two-way Binding](guide/two-way-binding).


## `@Input()` and `@Output()` declarations

Instead of using the `@Input()` and `@Output()` decorators 
to declare inputs and outputs, you can identify 
members in the `inputs` and `outputs` arrays
of the directive metadata, as in this example:

```ts

@Component({
  inputs: ['nameFromParent'],
  outputs: ['newItemEvent'],
})

```

<!-- 
<code-example path="template-syntax/src/app/hero-detail.component.ts" region="input-output-2" title="src/app/hero-detail.component.ts" linenums="false">
</code-example> -->

While declaring inputs and outputs in the `@Directive` and `@Component` 
metadata is possible, it is a better practice to use the `@Input` and `@Output` 
class decorators instead. See the [Decorate input and output properties](guide/styleguide#decorate-input-and-output-properties) section of the 
[Style Guide](guide/styleguide) for details.

## Aliasing inputs and outputs

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

You can specify the alias for the property name by passing it into the `@Input()`/`@Output()` decorator like this:
<!-- KW--A diagram might be helpful here. -->
<code-example path="template-syntax/src/app/click.directive.ts" region="output-myClick" title="src/app/click.directive.ts" linenums="false">
</code-example>

You can also alias property names in the `inputs` and `outputs` arrays.
You write a colon-delimited (`:`) string with
the directive property name on the *left* and the public alias on the *right*:

<code-example path="template-syntax/src/app/click.directive.ts" region="output-myClick2" title="src/app/click.directive.ts" linenums="false">
</code-example>













