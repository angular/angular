# Updating signal values

Now that you've learned [how to create your first signal](/tutorials/signals/1-creating-your-first-signal), let's learn how to update its value. Signals provide two main methods for updating their values: `set()` for replacing the value entirely, and `update()` for modifying the current value.

In this activity, you'll learn how to make your user status interactive by adding buttons to change the status with signals.

<hr />

Let's make our user status interactive by adding buttons that can update the signal's value.

<docs-workflow>

<docs-step title="Add status methods using set()">
Add methods to your component that change the user status using the `set()` method.

```ts
goOnline() {
  this.userStatus.set('online');
}

goAway() {
  this.userStatus.set('away');
}

goOffline() {
  this.userStatus.set('offline');
}
```

</docs-step>

<docs-step title="Add buttons to the template">
Add control buttons to the template for changing the user's status.

```html
<div class="user-profile">
  <!-- Existing content omitted... -->

  <div class="status-controls">
    <button (click)="goOnline()" [disabled]="userStatus() === 'online'">
      Go Online
    </button>
    <button (click)="goAway()" [disabled]="userStatus() === 'away'">
      Set Away
    </button>
    <button (click)="goOffline()" [disabled]="userStatus() === 'offline'">
      Go Offline
    </button>
  </div>
</div>
```

</docs-step>

<docs-step title="Add a toggle method using update()">
Add a `toggleStatus()` method that cycles through the statuses using the `update()` method.

```ts
toggleStatus() {
  this.userStatus.update((current: 'online' | 'offline' | 'away') => {
    switch (current) {
      case 'offline': return 'online';
      case 'online': return 'away';
      case 'away': return 'offline';
      default: return 'offline';
    }
  });
}
```

The `update()` method takes a function that receives the current value and returns the new value. This is useful when you need to modify the existing value based on its current state.
</docs-step>

<docs-step title="Add the toggle button">
Add the toggle button to your existing status controls.

```html
<div class="status-controls">
  <!-- Existing buttons omitted... -->
  
  <button (click)="toggleStatus()" class="toggle-btn">
    Cycle Status
  </button>
</div>
```

</docs-step>

</docs-workflow>

Perfect! You now have an interactive user status system that uses both ways to update signals.

Next, you'll learn [how to derive signal state using computed](/tutorials/signals/3-deriving-state-with-computed-signals)!
