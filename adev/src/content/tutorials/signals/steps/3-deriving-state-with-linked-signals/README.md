# Deriving state with linked signals

In the [previous lesson](/tutorials/signals/2-deriving-state-with-computed-signals), you created a computed signal for `notificationsEnabled` that automatically followed your user status. But what if users want to manually disable notifications even when they're online? That's where linked signals come in.

Linked signals are writable signals that maintain a reactive connection to their source signals. They're perfect for creating state that normally follows a computation but can be overridden when needed.

In this activity, you'll learn how `linkedSignal()` differs from `computed()` by converting your notifications example.

<hr />

Let's enhance our user status system by converting the read-only computed `notificationsEnabled` to a writable linked signal.

<docs-workflow>

<docs-step title="Import linkedSignal function">
Add `linkedSignal` to your existing imports.

```ts
// Add linkedSignal to existing imports  
import {Component, signal, computed, linkedSignal} from '@angular/core';
```

</docs-step>

<docs-step title="Convert computed to linkedSignal with the same expression">
Replace the computed `notificationsEnabled` with a linkedSignal using the exact same expression:

```ts
// Previously (from lesson 2):
// notificationsEnabled = computed(() => this.userStatus() === 'online');

// Now with linkedSignal - same expression, but writable:
notificationsEnabled = linkedSignal(() => this.userStatus() === 'online');
```

The expression is identical, but linkedSignal creates a writable signal. It will still automatically update when `userStatus` changes, but you can also set it manually.
</docs-step>

<docs-step title="Add a method to manually toggle notifications">
Add a method to demonstrate that linked signals can be written to directly:

```ts
toggleNotifications() {
  // This works with linkedSignal but would error with computed!
  this.notificationsEnabled.set(!this.notificationsEnabled());
}
```

This is the key difference: computed signals are read-only, but linked signals can be updated manually while still maintaining their reactive connection.
</docs-step>

<docs-step title="Update the template to show manual control">
Update your template to add a toggle button for notifications:

```html
<div class="status-info">
  <div class="notifications">
    <strong>Notifications:</strong> 
    @if (notificationsEnabled()) {
      Enabled
    } @else {
      Disabled
    }
    <button (click)="toggleNotifications()" class="override-btn">
      @if (notificationsEnabled()) {
        Disable
      } @else {
        Enable
      }
    </button>
  </div>
  <!-- existing message and working-hours divs remain -->
</div>
```

</docs-step>

<docs-step title="Observe the reactive behavior">
Now test the behavior:

1. Change the user status - notice how `notificationsEnabled` updates automatically
2. Manually toggle notifications - it overrides the computed value
3. Change status again - the linked signal re-syncs with its computation

This demonstrates that linked signals maintain their reactive connection even after being manually set!
</docs-step>

</docs-workflow>

Excellent! You've learned the key differences between computed and linked signals:

- **Computed signals**: Read-only, always derived from other signals
- **Linked signals**: Writable, can be both derived AND manually updated
- **Use computed when**: The value should always be calculated
- **Use linkedSignal when**: You need a default computation that can be overridden

In the next lesson, you'll learn [how to manage async data with signals](/tutorials/signals/4-managing-async-data-with-signals)!