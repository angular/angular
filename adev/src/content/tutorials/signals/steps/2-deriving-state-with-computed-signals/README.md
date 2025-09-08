# Deriving state with computed signals

Now that you've learned [how to create and update signals](/tutorials/signals/1-creating-and-updating-your-first-signal), let's learn about computed signals. Computed signals are derived values that automatically update when their dependencies change. They're perfect for creating reactive calculations based on other signals.

In this activity, you'll learn how to use the `computed()` function to create derived state that updates automatically when the underlying signals change.

Let's enhance our user status system by adding computed values that derive information from our user status signal. The starter code now includes three status options: `'online'`, `'away'`, and `'offline'`.

<hr />

<docs-workflow>

<docs-step title="Import computed function">
Add `computed` to your existing imports.

```ts
// Add computed to existing imports
import {Component, signal, computed, ChangeDetectionStrategy} from '@angular/core';
```

</docs-step>

<docs-step title="Create a computed signal for notifications">
Add a computed signal that determines if notifications should be enabled based on user status.

```ts
notificationsEnabled = computed(() => this.userStatus() === 'online');
```

This computed signal will automatically recalculate whenever the `userStatus` signal changes. Notice how we call `this.userStatus()` inside the computed function to read the signal's value.
</docs-step>

<docs-step title="Create a computed signal for a descriptive message">
Add a computed signal that creates a descriptive message based on the user status.

```ts
statusMessage = computed(() => {
  const status = this.userStatus();
  switch (status) {
    case 'online': return 'Available for meetings and messages';
    case 'away': return 'Temporarily away, will respond soon';
    case 'offline': return 'Not available, check back later';
    default: return 'Status unknown';
  }
});
```

This shows how computed signals can handle more complex logic with switch statements and string transformations.
</docs-step>

<docs-step title="Create a computed signal that calculates working hours availability">
Add a computed signal that calculates if the user is within their working hours.

```ts
isWithinWorkingHours = computed(() => {
  const now = new Date();
  const hour = now.getHours();
  const isWeekday = now.getDay() > 0 && now.getDay() < 6;
  return isWeekday && hour >= 9 && hour < 17 && this.userStatus() !== 'offline';
});
```

This demonstrates how computed signals can perform calculations and combine multiple data sources. The value updates automatically when the `userStatus` changes.
</docs-step>

<docs-step title="Display the computed values in the template">
The template already has placeholders showing "Loading...". Replace them with your computed signals:

1. For notifications, replace `Loading...` with an @if block:

```html
@if (notificationsEnabled()) {
  Enabled
} @else {
  Disabled
}
```

2. For the message, replace `Loading...` with:

```html
{{ statusMessage() }}
```

3. For working hours, replace `Loading...` with an @if block:

```html
@if (isWithinWorkingHours()) {
  Yes
} @else {
  No
}
```

Notice how computed signals are called just like regular signals - with parentheses!
</docs-step>

</docs-workflow>

Excellent! You've now learned how to create computed signals.

Here are some key points to remember:

- **Computed signals are reactive**: They automatically update when their dependencies change
- **They're read-only**: You can't directly set computed values, they're derived from other signals
- **They can contain complex logic**: Use them for calculations, transformations, and derived state
- **They provide a way to make performant computations based on dynamic state**: Angular only recalculates them when their dependencies actually change

In the next lesson, you'll learn about [a different way to derive state with linkedSignals](/tutorials/signals/3-deriving-state-with-linked-signals)!
