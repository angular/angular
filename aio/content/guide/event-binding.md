
# Event binding `(event)`

Event binding allows you to listen for certain events such as
keystrokes, mouse movements, clicks, and touches.


## Prerequisites

You should already be familiar with:

* [Binding Syntax](guide/binding-syntax).
* [Property Binding](guide/property-binding).

<hr/>

Angular event binding syntax consists of a **target event** name
within parentheses on the left of an equal sign, and a quoted
[template statement](guide/template-statements) on the right.
The following event binding listens for the button's click events, calling
the component's `onSave()` method whenever a click occurs:


<figure>
  <img src='generated/images/guide/template-syntax/syntax-diagram.gif' alt="Syntax diagram">
</figure>

 <!-- <code-example path="template-syntax/src/app/app.component.html" region="event-binding-1" title="src/app/app.component.html" linenums="false">
</code-example>  -->

## Target event

As above, the target is the button's click event. 

<code-example path="template-syntax/src/app/app.component.html" region="event-binding-1" title="src/app/app.component.html" linenums="false">
</code-example>

Alternatively, you can use the `on-` prefix, known as the canonical form:

<code-example path="template-syntax/src/app/app.component.html" region="event-binding-2" title="src/app/app.component.html" linenums="false">
</code-example>

Element events may be the more common targets, but Angular looks first to see if the name matches an event property
of a known directive, as it does in the following example:

<code-example path="template-syntax/src/app/app.component.html" region="event-binding-3" title="src/app/app.component.html" linenums="false">
</code-example>

If the name fails to match an element event or an output property of a known directive,
Angular reports an “unknown directive” error.


## *$event* and event handling statements
<!-- KW--This section could use a diagram (in progress- question about receiver)-->
In an event binding, Angular sets up an event handler for the target event.

When the event is raised, the handler executes the template statement.
The template statement typically involves a receiver, which performs an action
in response to the event, such as storing a value from the HTML control
into a model.

The binding conveys information about the event, including data values, through
an **event object named `$event`**.

The target event determines the shape of the `$event` object.
If the target event is a native DOM element event, then `$event` is a
[DOM event object](https://developer.mozilla.org/en-US/docs/Web/Events),
with properties such as `target` and `target.value`.

Consider this example:

```html
<input [value]="currentItem.name"
       (input)="currentItem.name=$event.target.value" >
```

<!-- <code-example path="template-syntax/src/app/app.component.html" region="without-NgModel" title="src/app/app.component.html" linenums="false">
</code-example> -->

This code sets the input box `value` property by binding to the `name` property.
To listen for changes to the value, the code binds to the input box's `input` event.
When the user makes changes, the `input` event is raised, and the binding executes
the statement within a context that includes the DOM event object, `$event`.

To update the `name` property, the changed text is retrieved by following the path `$event.target.value`.

If the event belongs to a directive&mdash;recall that components 
are directives&mdash;`$event` has whatever shape the directive produces.

<!-- KW--Do we ever type `$event` in our code? (I don't think we do often, right?) Why is it important to this discussion? -->


## Custom events with `EventEmitter`

Directives typically raise custom events with an Angular [EventEmitter](api/core/EventEmitter).
The directive creates an `EventEmitter` and exposes it as a property.
The directive calls `EventEmitter.emit(payload)` to fire an event, passing in a message payload, which can be anything.
Parent directives listen for the event by binding to this property and accessing the payload through the `$event` object.

Consider an `ItemDetailComponent` that presents item information and responds to user actions.
Although the `ItemDetailComponent` has a delete button, it doesn't know how to delete the hero. It can only raise an event reporting the user's delete request.

Here are the pertinent excerpts from that `ItemDetailComponent`:
<!-- KW--This sample needs to be changed to item -->
<code-example path="template-syntax/src/app/hero-detail.component.ts" linenums="false" title="src/app/hero-detail.component.ts (template)" region="template-1">
</code-example>

<code-example path="template-syntax/src/app/hero-detail.component.ts" linenums="false" title="src/app/hero-detail.component.ts (deleteRequest)" region="deleteRequest">
</code-example>

The component defines a `deleteRequest` property that returns an `EventEmitter`.
When the user clicks *delete*, the component invokes the `delete()` method,
telling the `EventEmitter` to emit a `Item` object.

Now imagine a hosting parent component that binds to the `deleteRequest` event 
of the `ItemDetailComponent`.
<!-- KW--What is deleteHero($event)? -->
<code-example path="template-syntax/src/app/app.component.html" linenums="false" title="src/app/app.component.html (event-binding-to-component)" region="event-binding-to-component">
</code-example>

When the `deleteRequest` event fires, Angular calls the parent component's 
`deleteItem()` method, passing the *item-to-delete* (emitted by `ItemDetail`) 
in the `$event` variable.

## Template statements have side effects

Though [template expressions](guide/template-syntax#template-expressions) shouldn't have [side effects](guide/template-syntax#avoid-side-effects), template 
statements usually do. The `deleteItem()` method does have 
a side effect: it deletes a item.

Deleting the item updates the model, perhaps triggering other changes
including queries and saves to a remote server.
These changes percolate through the system and are ultimately displayed in this and other views.

<hr/>

## More information

You may also like:

* [Two-way Binding](guide/two-way-binding).
* [Attribute, Class, and Style Bindings](guide/attribute-class-style-bindings).
* [Built-in Directives](guide/built-in-directives).


