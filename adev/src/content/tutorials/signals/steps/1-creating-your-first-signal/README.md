# Creating your first signal

Welcome to the Angular signals tutorial! [Signals](/essentials/signals) are Angular's reactive primitive that provide a way to manage state and automatically update your UI when that state changes.

In this activity, you'll learn how to create your first signal using the `signal()` function and display its value in a template.

<hr />

Let's start by creating a user profile status signal.

<docs-workflow>

<docs-step title="Import signal function">
Import the `signal` function from `@angular/core` at the top of your component file.

```ts
import {Component, signal} from '@angular/core';
```

</docs-step>

<docs-step title="Create a signal in your component">
Add a `userStatus` signal to your component class that is initialized with a value of `'offline'` and has types for the common statuses (i.e., online, offline, and away).

```ts
export class App {
  userStatus = signal<'online' | 'offline' | 'away'>('offline');
}
```

</docs-step>

<docs-step title="Display the signal value in the template">
Update the template to display the current user status by calling the signal `userStatus()` with parentheses.

```html
<div class="user-profile">
  <h1>User Dashboard</h1>
  <div class="status-indicator {{ userStatus() }}">
    <span class="status-dot"></span>
    Status: {{ userStatus() }}
  </div>
</div>
```

</docs-step>

</docs-workflow>

Congratulations! You've created your first signal. The `signal()` function creates a reactive value that Angular can track and update. Let's see how [updating a signal works](/tutorials/signals/2-updating-signal-values) in the next lesson.
