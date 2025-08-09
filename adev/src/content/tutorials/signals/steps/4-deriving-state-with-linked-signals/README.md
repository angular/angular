# Deriving state with linked signals

Now that you've learned [how to derive state with computed signals](/tutorials/signals/3-deriving-state-with-computed-signals), let's explore linked signals. Linked signals are a special type of signal that can be both read and written, while automatically deriving their value from other signals. Unlike computed signals which are read-only, linked signals can be updated directly while maintaining their reactive connection to source signals.

In this activity, you'll learn how to use `linkedSignal()` to create signals that can be both derived and independently updated.

<hr />

Let's enhance our user status system by adding preferences that can be both computed from the user status and set independently.

<docs-workflow>

<docs-step title="Import linkedSignal function">
Add `linkedSignal` to your existing imports.

```ts
// Add linkedSignal to existing imports  
import {Component, signal, computed, linkedSignal} from '@angular/core';
```

</docs-step>

<docs-step title="Create a linked signal for notification preferences">
Add a linked signal that normally derives notification settings from the user status but can be overridden.

```ts
notificationsEnabled = linkedSignal(() => this.userStatus() === 'online');
```

This creates a signal that starts by computing notifications based on being online, but unlike a computed signal, it can be updated independently. Importantly, when `userStatus` changes, this linked signal will automatically re-evaluate its computation.
</docs-step>

<docs-step title="Update the template to show and control linked signals">
Update your template to display the linked signals and provide controls.

```html
<div class="user-profile">
  <h1>User Dashboard</h1>
  <div class="status-indicator {{ userStatus() }}">
    <!-- Code omitted... -->
  </div>

  <div class="status-info">
    <!-- Code omitted... -->
  </div>

  <div class="preferences">
    <h3>Preferences</h3>
    <div class="preference-item">
      <label>
        <input type="checkbox" [checked]="notificationsEnabled()" (change)="toggleNotifications()">
        Notifications: {{ notificationsEnabled() ? 'Enabled' : 'Disabled' }}
      </label>
    </div>
    <p class="info">💡 Notice: This preference automatically syncs with your status changes!</p>
  </div>

  <div class="status-controls">
    <!-- Code omitted... -->
  </div>
</div>
```

</docs-step>

<docs-step title="Observe automatic updates">
Now let's see how linked signals automatically update when their source changes. Try changing the user status and notice how the linked signals respond.

When you change `userStatus`, the `notificationsEnabled` automatically recalculates based on the new status!

</docs-step>

</docs-workflow>

Excellent! You've now learned about linked signals and how to use them. Remember that the key difference from computed signals is that you are able to write to them while also deriving state from other reactive state.

In the next lesson, you'll learn [how to manage async signals with the resources API](/tutorials/signals/5-managing-async-signals-with-resources-api)!
