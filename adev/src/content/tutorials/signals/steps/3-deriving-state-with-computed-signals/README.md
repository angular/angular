# Deriving state with computed signals

Now that you've learned [how to update signal values](/tutorials/signals/2-updating-signal-values), let's learn about computed signals. Computed signals are derived values that automatically update when their dependencies change. They're perfect for creating reactive calculations based on other signals.

In this activity, you'll learn how to use the `computed()` function to create derived state that updates automatically when the underlying signals change.

<hr />

Let's enhance our user status system by adding computed values that derive information from our user status signal.

<docs-workflow>

<docs-step title="Import computed function">
Add `computed` to your existing imports.

```ts
// Add computed to existing imports
import {Component, signal, computed} from '@angular/core';
```

</docs-step>

<docs-step title="Create a computed signal for availability status">
Add a computed signal that determines if the user is available for communication.

```ts
isAvailable = computed(() => this.userStatus() === 'online');
```

This computed signal will automatically recalculate whenever the `userStatus` signal changes. Notice how we call `this.userStatus()` inside the computed function to read the signal's value.
</docs-step>

<docs-step title="Create a computed signal for status color">
Add another computed signal that determines the appropriate color for the status indicator.

```ts
statusColor = computed(() => {
  switch (this.userStatus()) {
    case 'online': return '#4caf50';
    case 'away': return '#ff9800';
    case 'offline': return '#f44336';
    default: return '#9e9e9e';
  }
});
```

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

</docs-step>

<docs-step title="Display the computed values in the template">
Update your template to use the computed signals.

```html
<!-- Update the status indicator to use the computed color -->
<div class="status-indicator {{ userStatus() }}">
  <span class="status-dot" [style.background]="statusColor()"></span>
  Status: {{ userStatus() }}
</div>

<!-- Add new section to display computed values -->
<div class="status-info">
  <div class="availability">
    <strong>Available:</strong> {{ isAvailable() ? 'Yes' : 'No' }}
  </div>
  <div class="message">
    <strong>Message:</strong> {{ statusMessage() }}
  </div>
</div>

<!-- Existing status controls remain unchanged -->
```

</docs-step>

</docs-workflow>

Excellent! You've now learned how to create computed signals.

Here are some key points to remember:

- **Computed signals are reactive**: They automatically update when their dependencies change
- **They're read-only**: You can't directly set computed values, they're derived from other signals
- **They can contain complex logic**: Use them for calculations, transformations, and derived state
- **They provide a way to make performant computations based on dynamic state**: Angular only recalculates them when their dependencies actually change

In the next lesson, you'll learn about [a different way to derive state with linkedSignals](/tutorials/signals/4-deriving-state-with-linked-signals)!
