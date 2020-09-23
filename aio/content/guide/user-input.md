# Handling events

Most applications involve user interactions: clicking links, pushing buttons,
entering text, and so on. These actions raise DOM events.

This topic describes how to bind those events to component event handlers using
Angular's event binding syntax.

<div class="alert is-helpful">

To explore a sample app featuring the contents of this tutorial, see the <live-example></live-example>.

</div>

## Binding to events

You can use [Angular event bindings](guide/event-binding) to respond to any [DOM event](https://developer.mozilla.org/en-US/docs/Web/Events).
Many DOM events occur after a user engages with some part of your application.
Binding to these events provides a way to get input from the user.

To bind to a DOM event, surround the DOM event name in parentheses and assign a quoted [template statement](guide/template-statements) to it.
For example, the following code shows an event binding that implements a click handler.

<code-example path="user-input/src/app/click-me.component.ts" region="click-me-button" header="src/app/click-me.component.ts"></code-example>

{@a click}

An event binding consists of two parts:

* On the left of the equals sign is the _target_ of the binding, which is enclosed in parentheses.
In this example, the target is the button's click event.

* On the right of the equals sign is the _template statement_.
This statement is what responds to the event.
In this example, the response calls the component's `onClickMe` method.

The identifiers in a template statement belong to a specific context, called the _execution context_.
Often, this context is the Angular component controlling the template.
For example, the preceding example belongs to a larger component.

<code-example path="user-input/src/app/click-me.component.ts" region="click-me-component" header="src/app/click-me.component.ts"></code-example>

When the user clicks the button, Angular calls the `onClickMe` method from `ClickMeComponent`.

<div class="alert is-important">

When writing a binding, be aware of a template statement's execution context.

</div>

{@a binding-to-user-input-events}
## Passing events

Many DOM events contain information that the component might need.
You can pass that information to the component by passing the event to the component event handler.

## Passing the `$event` object

One way to handle events is to pass the event object, `$event` to a component handler.

<code-example path="user-input/src/app/keyup.components.ts" region="key-up-component-1-template" header="src/app/keyup.components.ts (template v.1)"></code-example>

In this example, when a user presses and releases a key, the `keyup` event occurs.
Angular passes a corresponding DOM event object in the `$event` variable.
Angular then passes that variable as a parameter to the component's `onKey()` method.

<code-example path="user-input/src/app/keyup.components.ts" region="key-up-component-1-class" header="src/app/keyup.components.ts (class v.1 - typed )"></code-example>

The properties of an `$event` object vary depending on the type of DOM event.
For example, a mouse event includes different information than an input box editing event.

All [standard DOM event objects](https://developer.mozilla.org/en-US/docs/Web/API/Event) have a `target` property.
This property references the element that raised the event.
In this example, `target` refers to the [`<input>` element](https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement).
The `event.target.value` property returns the current contents of that element.

After each call, the `onKey()` method appends the contents of the input box value to the list in the component's `values` property, followed by a separator character, `|`.
The [interpolation](guide/interpolation) displays the accumulating input box changes from the `values` property.

For example, if a user enters the letters `a`, `b`, and `c`, and then backspaces to remove them one by one, the user interface displays the following:

<div class="lightbox">
  <img src='generated/images/guide/user-input/keyup1-anim.gif' alt="key up 1">
</div>

{@a keyup1}

## Using a template reference variable

You can also handle events by using Angular [**template reference variables**](guide/template-reference-variables).
These variables provide direct access to an element from within the template.
To declare a template reference variable, precede an identifier with a hash character, such as `#box`.

The following example uses a template reference variable to implement a keystroke loopback in a simple template.

<code-example path="user-input/src/app/loop-back.component.ts" region="loop-back-component" header="src/app/loop-back.component.ts"></code-example>

The template reference variable named `box`, declared on the `<input>` element, refers to the `<input>` element itself.
The code uses the `box` variable to get the input element's `value` and display that value with interpolation between `<p>` tags.

<div class="alert is-helpful">

When you use template reference variables, you still must bind to an event.
Angular updates bindings only if the application responds to asynchronous events, such as keystrokes.

</div>

The template is completely self contained. It doesn't bind to the component and the component does nothing.
However, when a user types in the box, the user interface still updates as expected:

<div class="lightbox">
  <img src='generated/images/guide/user-input/keyup-loop-back-anim.gif' alt="loop back">
</div>

This example binds the `keyup` event to the number `0`.
While the statement does nothing useful, it satisfies Angular's requirement so that Angular updates the screen.

Often, it is easier to get to the input box with the template reference variable than to go through the `$event` object.
The following code refactors the previous `keyup` example that uses a template reference variable to get the user's input.

<code-example path="user-input/src/app/keyup.components.ts" region="key-up-component-2" header="src/app/keyup.components.ts (v2)"></code-example>

One advantage of this approach is that the component gets clean data values from the view.
The component no longer requires knowledge of the `$event` and its structure.
{@a key-event}

## Filtering events

Sometimes, you want your application to respond only if an event contains specific data.
For example, the `(keyup)` event handler responds to *every keystroke*.
You might want to modify this behavior so the handler only responds when the user presses a specific key.
A common use case is responding to the _Enter_ key, because it signals that the user finished typing.

You can filter keystroke events by binding to Angular's `keyup.enter` pseudo-event.
Then Angular calls the event handler only when the user presses _Enter_.

<code-example path="user-input/src/app/keyup.components.ts" region="key-up-component-3" header="src/app/keyup.components.ts (v3)"></code-example>

The following is an example of how a user might engage with this application.

<div class="lightbox">
  <img src='generated/images/guide/user-input/keyup3-anim.gif' alt="key up 3">
</div>


## Binding to multiple events

Another common situation is when you want to bind multiple events to the same element.
For instance, you might have an input box and want your application to listen to two events:

* The `keyup` event, specifically [filtered](#filtering-events) for when the user presses the `Enter` key.
* The `blur` event, to detect when the user clicks somewhere else on the screen.

The following code demonstrates how to bind these two events to an `input` box.

<code-example path="user-input/src/app/keyup.components.ts" region="key-up-component-4" header="src/app/keyup.components.ts (v4)"></code-example>

## Next steps

You might find the following topics useful:

* [Interpolation and template expressions](guide/interpolation)
* [Event binding](guide/event-binding)

