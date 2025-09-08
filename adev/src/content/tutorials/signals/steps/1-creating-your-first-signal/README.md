# Creating and updating your first signal

Welcome to the Angular signals tutorial! [Signals](/essentials/signals) are Angular's reactive primitive that provide a way to manage state and automatically update your UI when that state changes.

In this activity, you'll learn how to:

- Create your first signal using the `signal()` function
- Display its value in a template
- Update the signal value using `set()` and `update()` methods

Let's build an interactive user status system with signals!

<hr />

<docs-workflow>

<docs-step title="Import the signal function">
Import the `signal` function from `@angular/core` at the top of your component file.

```ts
import {Component, signal, ChangeDetectionStrategy} from '@angular/core';
```

</docs-step>

<docs-step title="Create a signal in your component">
Add a `userStatus` signal to your component class that is initialized with a value of `'offline'`.

```ts
@Component({
  /* Config omitted */
})
export class App {
  userStatus = signal<'online' | 'offline'>('offline');
}
```

</docs-step>

<docs-step title="Display the signal value in the template">
Update the status indicator to display the current user status by:
1. Binding the signal to the class attribute with `[class]="userStatus()"`
2. Displaying the status text by replacing `???` with `{{ userStatus() }}`

```html
<!-- Update from: -->
<div class="status-indicator offline">
  <span class="status-dot"></span>
  Status: ???
</div>

<!-- To: -->
<div class="status-indicator" [class]="userStatus()">
  <span class="status-dot"></span>
  Status: {{ userStatus() }}
</div>
```

Notice how we call the signal `userStatus()` with parentheses to read its value.
</docs-step>

<docs-step title="Add methods to update the signal">
Add methods to your component that change the user status using the `set()` method.

```ts
goOnline() {
  this.userStatus.set('online');
}

goOffline() {
  this.userStatus.set('offline');
}
```

The `set()` method replaces the signal's value entirely with a new value.

</docs-step>

<docs-step title="Wire up the control buttons">
The buttons are already in the template. Now connect them to your methods by adding:
1. Click handlers with `(click)`
2. Disabled states with `[disabled]` when already in that status

```html
<!-- Add bindings to the existing buttons: -->
<button (click)="goOnline()" [disabled]="userStatus() === 'online'">
  Go Online
</button>
<button (click)="goOffline()" [disabled]="userStatus() === 'offline'">
  Go Offline
</button>
```

</docs-step>

<docs-step title="Add a toggle method using update()">
Add a `toggleStatus()` method that switches between online and offline using the `update()` method.

```ts
toggleStatus() {
  this.userStatus.update(current => current === 'online' ? 'offline' : 'online');
}
```

The `update()` method takes a function that receives the current value and returns the new value. This is useful when you need to modify the existing value based on its current state.

</docs-step>

<docs-step title="Add the toggle button handler">
The toggle button is already in the template. Connect it to your `toggleStatus()` method:

```html
<button (click)="toggleStatus()" class="toggle-btn">
  Toggle Status
</button>
```

</docs-step>

</docs-workflow>

Congratulations! You've created your first signal and learned how to update it using both `set()` and `update()` methods. The `signal()` function creates a reactive value that Angular tracks, and when you update it, your UI automatically reflects the changes.

Next, you'll learn [how to derive state from signals using computed](/tutorials/signals/2-deriving-state-with-computed-signals)!

<docs-callout helpful title="About ChangeDetectionStrategy.OnPush">

You might notice `ChangeDetectionStrategy.OnPush` in the component decorator throughout this tutorial. This is a performance optimization for Angular components that use signals. For now, you can safely ignore it—just know it helps your app run faster when using signals! You can learn more in the [change detection strategies API docs](/api/core/ChangeDetectionStrategy).

</docs-callout>
