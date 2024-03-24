# Event binding

Event binding lets you listen for and respond to user actions such as keystrokes, mouse movements, clicks, and touches.

## Binding to events

HELPFUL: For information on binding to properties, see [Property binding](guide/templates/property-binding).

To bind to an event you use the Angular event binding syntax.
This syntax consists of a target event name within parentheses to the left of an equal sign, and a quoted template statement to the right.

Create the following example; the target event name is `click` and the template statement is `onSave()`.

<docs-code language="html" header="Event binding syntax">
<button (click)="onSave()">Save</button>
</docs-code>

The event binding listens for the button's click events and calls the component's `onSave()` method whenever a click occurs.

<img src='assets/images/guide/template-syntax/syntax-diagram.svg' alt="Syntax diagram">

### Determining an event target

To determine an event target, Angular checks if the name of the target event matches an event property of a known directive.

Create the following example: (Angular checks to see if `myClick` is an event on the custom `ClickDirective`)

<docs-code path="adev/src/content/examples/event-binding/src/app/app.component.html" visibleRegion="custom-directive" header="src/app/app.component.html"/>

If the target event name, `myClick` fails to match an output property of `ClickDirective`, Angular will instead bind to the `myClick` event on the underlying DOM element.

## Binding to keyboard events

You can bind to keyboard events using Angular's binding syntax. You can specify the key or code that you would like to bind to keyboard events. They `key` and `code` fields are a native part of the browser keyboard event object. By default, event binding assumes you want to use the `key` field on the keyboard event. You can also use the `code` field.

Combinations of keys can be separated by a `.` (period). For example, `keydown.enter` will allow you to bind events to the `enter` key. You can also use modifier keys, such as `shift`, `alt`, `control`, and the `command` keys from Mac. The following example shows how to bind a keyboard event to `keydown.shift.t`.

   ```html
   <input (keydown.shift.t)="onKeydown($event)" />
   ```

Depending on the operating system, some key combinations might create special characters instead of the key combination that you expect. MacOS, for example, creates special characters when you use the option and shift keys together. If you bind to `keydown.shift.alt.t`, on macOS, that combination produces a `ˇ` character instead of a `t`, which doesn't match the binding and won't trigger your event handler. To bind to `keydown.shift.alt.t` on macOS, use the `code` keyboard event field to get the correct behavior, such as `keydown.code.shiftleft.altleft.keyt` shown in this example.

   ```html
   <input (keydown.code.shiftleft.altleft.keyt)="onKeydown($event)" />
   ```

The `code` field is more specific than the `key` field. The `key` field always reports `shift`, whereas the `code` field will specify `leftshift` or `rightshift`. When using the `code` field, you might need to add separate bindings to catch all the behaviors you want. Using the `code` field avoids the need to handle OS specific behaviors such as the `shift + option` behavior on macOS.

For more information, visit the full reference for [key](https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_key_values) and [code](https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_code_values) to help build out your event strings.

## Binding to passive events

Angular also supports [passive event](https://developer.chrome.com/en/docs/lighthouse/best-practices/uses-passive-event-listeners/) listeners.

This is an advanced technique that is not necessary for most applications. You may find this useful if you need to optimize handling of frequently occurring events that are causing performance problems.

For example, use the following steps to make a scroll event passive.

1. Create a file `zone-flags.ts` under `src` directory.
2. Add the following line into this file.

   ```typescript
   (window as any)['__zone_symbol__PASSIVE_EVENTS'] = ['scroll'];
   ```

3. In the `src/polyfills.ts` file, before importing zone.js, import the newly created `zone-flags`.

   ```typescript
   import './zone-flags';
   import 'zone.js';  // Included with Angular CLI.
   ```

After those steps, if you add event listeners for the `scroll` event, the listeners will be `passive`.

## What's next

<docs-pill-row>
  <docs-pill href="guide/templates/event-binding" title="How event binding works"/>
  <docs-pill href="guide/templates/property-binding" title="Property binding"/>
  <docs-pill href="guide/templates/interpolation" title="Text interpolation"/>
  <docs-pill href="guide/templates/two-way-binding" title="Two-way binding"/>
</docs-pill-row>
