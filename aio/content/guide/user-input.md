# User input

<div class="callout is-critical">

<header>Marked for archiving</header>

To ensure that you have the best experience possible, this topic is marked for archiving until it clearly conveys the most accurate information possible.

In the meantime, this topic might be helpful:
[Event binding](guide/event-binding).

If you think this content should not be archived, please file a [GitHub issue](https://github.com/angular/angular/issues/new?template=3-docs-bug.md).

</div>

User actions such as clicking a link, pushing a button, and entering text raise DOM events.
This page explains how to bind those events to component event handlers using the Angular event binding syntax.

Run the <live-example></live-example>.

## Binding to user input events

You can use [Angular event bindings](guide/event-binding) to respond to any [DOM event](https://developer.mozilla.org/docs/Web/Events).
Many DOM events are triggered by user input.
Binding to these events provides a way to get input from the user.

To bind to a DOM event, surround the DOM event name in parentheses and assign a quoted [template statement](guide/template-statements) to it.

The following example shows an event binding that implements a click handler:

<!-- vale Angular.Google_WordListWarnings = NO -->

<code-example header="src/app/click-me.component.ts" path="user-input/src/app/click-me.component.ts" region="click-me-button"></code-example>

<!-- vale Angular.Google_WordListWarnings = YES -->

<a id="click"></a>

The `(click)` to the left of the equals sign identifies the button's click event as the **target of the binding**.
The text in quotes to the right of the equals sign is the **template statement**. The statement responds to the click event by calling the component's `onClickMe` method.

When writing a binding, be aware of a template statement's **execution context**.
The identifiers in a template statement belong to a specific context object, usually the Angular component controlling the template.
The preceding example shows a single line of HTML, but that HTML belongs to a larger component:

<code-example header="src/app/click-me.component.ts" path="user-input/src/app/click-me.component.ts" region="click-me-component"></code-example>

When the user clicks the button, Angular calls the `onClickMe` method from `ClickMeComponent`.

## Get user input from the &dollar;event object

DOM events carry a payload of information that may be useful to the component.
This section shows how to bind to the `keyup` event of an input box to get the user's input after each keystroke.

The following code listens to the `keyup` event and passes the entire event payload \(`$event`\) to the component event handler.

<code-example header="src/app/keyup.components.ts (template v.1)" path="user-input/src/app/keyup.components.ts" region="key-up-component-1-template"></code-example>

When a user presses and releases a key, the `keyup` event occurs. Angular then provides a corresponding DOM event object in the `$event` variable which this code passes as a parameter to the component's `onKey()` method.

<code-example header="src/app/keyup.components.ts (class v.1)" path="user-input/src/app/keyup.components.ts" region="key-up-component-1-class-no-type"></code-example>

The properties of an `$event` object vary depending on the type of DOM event.
For example, a mouse event includes different information than an input box editing event.

All [standard DOM event objects](https://developer.mozilla.org/docs/Web/API/Event) have a `target` property, a reference to the element that raised the event.
In this case, `target` refers to the [`<input>` element](https://developer.mozilla.org/docs/Web/API/HTMLInputElement) and `event.target.value` returns the current contents of that element.

After each call, the `onKey()` method appends the contents of the input box value to the list in the component's `values` property, followed by a separator character \(`|`\).
The [interpolation](guide/interpolation) displays the accumulating input box changes from the `values` property.

<!-- vale Angular.Angular_Spelling = NO -->

Suppose the user enters the letters "abc" and then backspaces to remove them one by one.
Here's what the UI displays:

<!-- vale Angular.Angular_Spelling = YES -->

<code-example>

a &verbar; ab &verbar; abc &verbar; ab &verbar; a &verbar; &verbar;

</code-example>

<div class="lightbox">

<img alt="key up 1" src="generated/images/guide/user-input/keyup1-anim.gif">

</div>

<div class="alert is-helpful">

You could also accumulate the individual keys themselves by substituting `event.key` for `event.target.value` in which case the same user input would produce:

<code-example>

a &verbar; b &verbar; c &verbar; backspace &verbar; backspace &verbar; backspace &verbar;

</code-example>

</div>

<a id="keyup1"></a>

### Type the `$event`

The preceding example casts the `$event` as an `any` type.
That simplifies the code at a cost.
There is no type information that could reveal properties of the event object and prevent silly mistakes.

The following example rewrites the method with types:

<code-example header="src/app/keyup.components.ts (class v.1 - typed )" path="user-input/src/app/keyup.components.ts" region="key-up-component-1-class"></code-example>

The `$event` is now a specific `KeyboardEvent`.
Not all elements have a `value` property so it casts `target` to an input element.
The `OnKey` method more clearly expresses what it expects from the template and how it interprets the event.

### Passing `$event` is a dubious practice

Typing the event object reveals a significant objection to passing the entire DOM event into the method. Namely, the component has too much awareness of the template details.
It can't extract information without knowing more than it should about the HTML implementation.
That breaks the separation of concerns between the template, *what the user sees*, and the component, *how the application processes user data*.

The next section shows how to use template reference variables to address this problem.

## Get user input from a template reference variable

There's another way to get the user data:
use Angular [**template reference variables**](guide/template-reference-variables).
These variables provide direct access to an element from within the template.
To declare a template reference variable, precede an identifier with a hash/pound character \(`#`\).

The following example uses a template reference variable to implement a keystroke loopback in a simple template.

<code-example header="src/app/loop-back.component.ts" path="user-input/src/app/loop-back.component.ts" region="loop-back-component"></code-example>

The template reference variable named `box`, declared on the `<input>` element, refers to the `<input>` element itself.
The code uses the `box` variable to get the input element's `value` and display it with interpolation between `<p>` tags.

The template is completely self-contained.
It doesn't bind to the component, and the component does nothing.

Type something in the input box, and watch the display update with each keystroke.

<div class="lightbox">

<img alt="loop back" src="generated/images/guide/user-input/keyup-loop-back-anim.gif">

</div>

<div class="callout is-helpful">

<header>This won't work at all unless you bind to an event.</header>

Angular updates the bindings and screen only if the app does something in response to asynchronous events, such as keystrokes.
This example code binds the `keyup` event to the number 0, the shortest template statement possible.
While the statement does nothing useful, it satisfies Angular's condition so that Angular updates the screen.

</div>

It's easier to get to the input box with the template reference variable than to go through the `$event` object.
Here's a rewrite of the previous `keyup` example that uses a template reference variable to get the user's input.

<code-example header="src/app/keyup.components.ts (v2)" path="user-input/src/app/keyup.components.ts" region="key-up-component-2"></code-example>

A nice aspect of this approach is that the component gets clean data values from the view.
It no longer requires knowledge of the `$event` and its structure.

<a id="key-event"></a>

## Key event filtering (with `key.enter`)

The `(keyup)` event handler hears *every keystroke*.
Sometimes only the *Enter* key matters, because it signals that the user has finished typing.
One way to reduce the noise would be to examine every `$event.keyCode` and take action only when the key is *Enter*.

There's an easier way:
bind to Angular's `keyup.enter` pseudo-event.
Then Angular calls the event handler only when the user presses *Enter*.

<code-example header="src/app/keyup.components.ts (v3)" path="user-input/src/app/keyup.components.ts" region="key-up-component-3"></code-example>

Here's how it works.

<div class="lightbox">

<img alt="key up 3" src="generated/images/guide/user-input/keyup3-anim.gif">

</div>

## On blur

In the previous example, the current state of the input box is lost if the user mouses away and clicks elsewhere without first pressing *Enter*.
The component's `value` property is updated only when the user presses *Enter*.

To fix this issue, listen to both the *Enter* key and the `blur` event.

<code-example header="src/app/keyup.components.ts (v4)" path="user-input/src/app/keyup.components.ts" region="key-up-component-4"></code-example>

## Put it all together

This page demonstrated several event binding techniques.

Now, put it all together in a micro-app that can display a list of heroes and add new heroes to the list.
The user can add a hero by typing the hero's name in the input box and clicking **Add**.

<div class="lightbox">

<img alt="Little Tour of Heroes" src="generated/images/guide/user-input/little-tour-anim.gif">

</div>

Below is the "Little Tour of Heroes" component.

<code-example header="src/app/little-tour.component.ts" path="user-input/src/app/little-tour.component.ts" region="little-tour"></code-example>

### Observations

| Observations                                | Details |
|:---                                         |:---     |
| Use template variables to refer to elements | The `newHero` template variable refers to the `<input>` element. You can reference `newHero` from any sibling or child of the `<input>` element.                                                     |
| Pass values, not elements                   | Instead of passing the `newHero` into the component's `addHero` method, get the input box value and pass *that* to `addHero`.                                                                        |
| Keep template statements simple             | The `(blur)` event is bound to two JavaScript statements. The first statement calls `addHero`. The second statement, `newHero.value=''`, clears the input box after a new hero is added to the list. |

## Source code

Following is all the code discussed in this page.

<code-tabs>
    <code-pane header="click-me.component.ts" path="user-input/src/app/click-me.component.ts"></code-pane>
    <code-pane header="keyup.components.ts" path="user-input/src/app/keyup.components.ts"></code-pane>
    <code-pane header="loop-back.component.ts" path="user-input/src/app/loop-back.component.ts"></code-pane>
    <code-pane header="little-tour.component.ts" path="user-input/src/app/little-tour.component.ts"></code-pane>
</code-tabs>

Angular also supports passive event listeners.
For example, you can use the following steps to make the scroll event passive.

1.  Create a file `zone-flags.ts` under `src` directory.
1.  Add the following line into this file.

    <code-example format="typescript" language="typescript">

    (window as any)['__zone_symbol__PASSIVE_EVENTS'] = ['scroll'];

    </code-example>

1.  In the `src/polyfills.ts` file, before importing zone.js, import the newly created `zone-flags`.

    <code-example format="typescript" language="typescript">

    import './zone-flags';
    import 'zone.js';  // Included with Angular CLI.

    </code-example>

After those steps, if you add event listeners for the `scroll` event, the listeners are going to be `passive`.

## Summary

You have mastered the basic primitives for responding to user input and gestures.

These techniques are useful for small-scale demonstrations, but they quickly become verbose and clumsy when handling large amounts of user input.
Two-way data binding is a more elegant and compact way to move values between data entry fields and model properties.
The [`Forms`](guide/forms-overview) page explains how to write two-way bindings with `NgModel`.

<!-- links -->

<!-- external links -->

<!-- end links -->

@reviewed 2022-02-28
