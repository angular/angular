# User input

<div class="callout is-critical">
<header>Marked for archiving</header>

To ensure that you have the best experience possible, this topic is marked for archiving until we determine
that it clearly conveys the most accurate information possible.

In the meantime, this topic might be helpful: [Event binding](guide/event-binding).

If you think this content should not be archived, please file a [GitHub issue](https://github.com/angular/angular/issues/new?template=3-docs-bug.md).

</div>

User actions such as clicking a link, pushing a button, and entering
text raise DOM events.
This page explains how to bind those events to component event handlers using the Angular
event binding syntax.

Run the <live-example></live-example>.


## Binding to user input events

You can use [Angular event bindings](guide/event-binding)
to respond to any [DOM event](https://developer.mozilla.org/en-US/docs/Web/Events).
Many DOM events are triggered by user input. Binding to these events provides a way to
get input from the user.

To bind to a DOM event, surround the DOM event name in parentheses and assign a quoted
[template statement](guide/template-statements) to it.

The following example shows an event binding that implements a click handler:

<code-example path="user-input/src/app/click-me.component.ts" region="click-me-button" header="src/app/click-me.component.ts"></code-example>

{@a click}

The `(click)` to the left of the equals sign identifies the button's click event as the **target of the binding**.
The text in quotes to the right of the equals sign
is the **template statement**, which responds
to the click event by calling the component's `onClickMe` method.

When writing a binding, be aware of a template statement's **execution context**.
The identifiers in a template statement belong to a specific context object,
usually the Angular component controlling the template.
The example above shows a single line of HTML, but that HTML belongs to a larger component:


<code-example path="user-input/src/app/click-me.component.ts" region="click-me-component" header="src/app/click-me.component.ts"></code-example>



When the user clicks the button, Angular calls the `onClickMe` method from `ClickMeComponent`.



## Get user input from the $event object
DOM events carry a payload of information that may be useful to the component.
This section shows how to bind to the `keyup` event of an input box to get the user's input after each keystroke.

The following code listens to the `keyup` event and passes the entire event payload (`$event`) to the component event handler.

<code-example path="user-input/src/app/keyup.components.ts" region="key-up-component-1-template" header="src/app/keyup.components.ts (template v.1)"></code-example>



When a user presses and releases a key, the `keyup` event occurs, and Angular provides a corresponding
DOM event object in the `$event` variable which this code passes as a parameter to the component's `onKey()` method.

<code-example path="user-input/src/app/keyup.components.ts" region="key-up-component-1-class-no-type" header="src/app/keyup.components.ts (class v.1)"></code-example>



The properties of an `$event` object vary depending on the type of DOM event. For example,
a mouse event includes different information than an input box editing event.

All [standard DOM event objects](https://developer.mozilla.org/en-US/docs/Web/API/Event)
have a `target` property, a reference to the element that raised the event.
In this case, `target` refers to the [`<input>` element](https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement) and
`event.target.value` returns the current contents of that element.

After each call, the `onKey()` method appends the contents of the input box value to the list
in the component's `values` property, followed by a separator character (|).
The [interpolation](guide/interpolation)
displays the accumulating input box changes from the `values` property.

Suppose the user enters the letters "abc", and then backspaces to remove them one by one.
Here's what the UI displays:

<code-example>
  a | ab | abc | ab | a | |
</code-example>



<div class="lightbox">
  <img src='generated/images/guide/user-input/keyup1-anim.gif' alt="key up 1">
</div>



<div class="alert is-helpful">



Alternatively, you could accumulate the individual keys themselves by substituting `event.key`
for `event.target.value` in which case the same user input would produce:

<code-example>
  a | b | c | backspace | backspace | backspace |

</code-example>



</div>



{@a keyup1}


### Type the _$event_

The example above casts the `$event` as an `any` type.
That simplifies the code at a cost.
There is no type information
that could reveal properties of the event object and prevent silly mistakes.

The following example rewrites the method with types:

<code-example path="user-input/src/app/keyup.components.ts" region="key-up-component-1-class" header="src/app/keyup.components.ts (class v.1 - typed )"></code-example>



The `$event` is now a specific `KeyboardEvent`.
Not all elements have a `value` property so it casts `target` to an input element.
The `OnKey` method more clearly expresses what it expects from the template and how it interprets the event.

### Passing _$event_ is a dubious practice
Typing the event object reveals a significant objection to passing the entire DOM event into the method:
the component has too much awareness of the template details.
It can't extract information without knowing more than it should about the HTML implementation.
That breaks the separation of concerns between the template (_what the user sees_)
and the component (_how the application processes user data_).

The next section shows how to use template reference variables to address this problem.



## Get user input from a template reference variable
There's another way to get the user data: use Angular
[**template reference variables**](guide/template-reference-variables).
These variables provide direct access to an element from within the template.
To declare a template reference variable, precede an identifier with a hash (or pound) character (#).

The following example uses a template reference variable
to implement a keystroke loopback in a simple template.

<code-example path="user-input/src/app/loop-back.component.ts" region="loop-back-component" header="src/app/loop-back.component.ts"></code-example>



The template reference variable named `box`, declared on the `<input>` element,
refers to the `<input>` element itself.
The code uses the `box` variable to get the input element's `value` and display it
with interpolation between `<p>` tags.

The template is completely self contained. It doesn't bind to the component,
and the component does nothing.

Type something in the input box, and watch the display update with each keystroke.


<div class="lightbox">
  <img src='generated/images/guide/user-input/keyup-loop-back-anim.gif' alt="loop back">
</div>



<div class="alert is-helpful">



**This won't work at all unless you bind to an event**.

Angular updates the bindings (and therefore the screen)
only if the app does something in response to asynchronous events, such as keystrokes.
This example code binds the `keyup` event
to the number 0, the shortest template statement possible.
While the statement does nothing useful,
it satisfies Angular's requirement so that Angular will update the screen.

</div>



It's easier to get to the input box with the template reference
variable than to go through the `$event` object. Here's a rewrite of the previous
`keyup` example that uses a template reference variable to get the user's input.

<code-example path="user-input/src/app/keyup.components.ts" region="key-up-component-2" header="src/app/keyup.components.ts (v2)"></code-example>



A nice aspect of this approach is that the component gets clean data values from the view.
It no longer requires knowledge of the `$event` and its structure.
{@a key-event}


## Key event filtering (with `key.enter`)
The `(keyup)` event handler hears *every keystroke*.
Sometimes only the _Enter_ key matters, because it signals that the user has finished typing.
One way to reduce the noise would be to examine every `$event.keyCode` and take action only when the key is _Enter_.

There's an easier way: bind to Angular's `keyup.enter` pseudo-event.
Then Angular calls the event handler only when the user presses _Enter_.

<code-example path="user-input/src/app/keyup.components.ts" region="key-up-component-3" header="src/app/keyup.components.ts (v3)"></code-example>



Here's how it works.

<div class="lightbox">
  <img src='generated/images/guide/user-input/keyup3-anim.gif' alt="key up 3">
</div>




## On blur

In the previous example, the current state of the input box
is lost if the user mouses away and clicks elsewhere on the page
without first pressing _Enter_.
The component's `value` property is updated only when the user presses _Enter_.

To fix this issue, listen to both the _Enter_ key and the _blur_ event.


<code-example path="user-input/src/app/keyup.components.ts" region="key-up-component-4" header="src/app/keyup.components.ts (v4)"></code-example>




## Put it all together

This page demonstrated several event binding techniques.

Now, put it all together in a micro-app
that can display a list of heroes and add new heroes to the list.
The user can add a hero by typing the hero's name in the input box and
clicking **Add**.


<div class="lightbox">
  <img src='generated/images/guide/user-input/little-tour-anim.gif' alt="Little Tour of Heroes">
</div>



Below is the "Little Tour of Heroes"  component.


<code-example path="user-input/src/app/little-tour.component.ts" region="little-tour" header="src/app/little-tour.component.ts"></code-example>



### Observations

* **Use template variables to refer to elements** &mdash;
The `newHero` template variable refers to the `<input>` element.
You can reference `newHero` from any sibling or child of the `<input>` element.

* **Pass values, not elements** &mdash;
Instead of passing the `newHero` into the component's `addHero` method,
get the input box value and pass *that* to `addHero`.

* **Keep template statements simple** &mdash;
The `(blur)` event is bound to two JavaScript statements.
The first statement calls `addHero`. The second statement, `newHero.value=''`,
clears the input box after a new hero is added to the list.



## Source code

Following is all the code discussed in this page.

<code-tabs>

  <code-pane header="click-me.component.ts" path="user-input/src/app/click-me.component.ts">

  </code-pane>

  <code-pane header="keyup.components.ts" path="user-input/src/app/keyup.components.ts">

  </code-pane>

  <code-pane header="loop-back.component.ts" path="user-input/src/app/loop-back.component.ts">

  </code-pane>

  <code-pane header="little-tour.component.ts" path="user-input/src/app/little-tour.component.ts">

  </code-pane>

</code-tabs>


Angular also supports passive event listeners. For example, you can use the following steps to make the scroll event passive.

1. Create a file `zone-flags.ts` under `src` directory.
2. Add the following line into this file.

```
(window as any)['__zone_symbol__PASSIVE_EVENTS'] = ['scroll'];
```

3. In the `src/polyfills.ts` file, before importing zone.js, import the newly created `zone-flags`.

```
import './zone-flags';
import 'zone.js';  // Included with Angular CLI.
```

After those steps, if you add event listeners for the `scroll` event, the listeners will be `passive`.

## Summary

You have mastered the basic primitives for responding to user input and gestures.

These techniques are useful for small-scale demonstrations, but they
quickly become verbose and clumsy when handling large amounts of user input.
Two-way data binding is a more elegant and compact way to move
values between data entry fields and model properties.
The [`Forms`](guide/forms-overview) page explains how to write
two-way bindings with `NgModel`.
