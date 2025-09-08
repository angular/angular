# Reacting to signal changes with effect

Now that you've learned [querying child elements with signal queries](/tutorials/signals/9-query-child-elements-with-signal-queries), let's explore how to react to signal changes with effects. Effects are functions that run automatically when their dependencies change, making them perfect for side effects like logging, DOM manipulation, or API calls.

**Important: Effects should be the last API you reach for.** Always prefer `computed()` for derived values and `linkedSignal()` for values that can be both derived and manually set. If you find yourself copying data from one signal to another with an effect, it's a sign you should move your source-of-truth higher up and use `computed()` or `linkedSignal()` instead. Effects are best for syncing signal state to imperative, non-signal APIs.

In this activity, you'll learn how to use the `effect()` function appropriately for legitimate side effects that respond to signal changes.

<hr />

You have a theme manager app with signals already set up. Now you'll add effects to automatically react to signal changes.

<docs-workflow>

<docs-step title="Import effect function">
Add `effect` to your existing imports.

```ts
// Add effect to existing imports
import {Component, signal, computed, effect, ChangeDetectionStrategy} from '@angular/core';
```

The `effect` function creates a reactive side effect that runs automatically when any signals it reads change.
</docs-step>

<docs-step title="Create an effect for local storage">
Add an effect that automatically saves the theme to local storage when it changes.

```ts
constructor() {
  // Save theme to localStorage whenever it changes
  effect(() => {
    localStorage.setItem('theme', this.theme());
    console.log('Theme saved to localStorage:', this.theme());
  });
}
```

This effect runs whenever the theme signal changes, automatically persisting the user's preference.
</docs-step>

<docs-step title="Create an effect for logging user activity">
Add an effect that logs when the user logs in or out.

```ts
constructor() {
  // ... previous effect

  // Log user activity changes
  effect(() => {
    const status = this.isLoggedIn() ? 'logged in' : 'logged out';
    const user = this.username();
    console.log(`User ${user} is ${status}`);
  });
}
```

This effect demonstrates how effects can read multiple signals and react to changes in any of them.
</docs-step>

<docs-step title="Create an effect with cleanup">
Add an effect that sets up a timer and cleans up when the component is destroyed.

```ts
constructor() {
  // ... previous effects

  // Timer effect with cleanup
  effect((onCleanup) => {
    const interval = setInterval(() => {
      console.log('Timer tick - Current theme:', this.theme());
    }, 5000);

    // Clean up the interval when the effect is destroyed
    onCleanup(() => {
      clearInterval(interval);
      console.log('Timer cleaned up');
    });
  });
}
```

This effect demonstrates how to clean up resources when effects are destroyed or re-run.
</docs-step>

<docs-step title="Test the effects">
Open the browser console and interact with the app:

- **Toggle Theme** - See localStorage saves and timer logs
- **Login/Logout** - See user activity logging
- **Watch Timer** - See periodic theme logging every 5 seconds

The effects run automatically whenever their tracked signals change!
</docs-step>

</docs-workflow>

Excellent! You've now learned how to use effects with signals. Key concepts to remember:

- **Effects are reactive**: They automatically run when any signal they read changes
- **Side effects only**: Perfect for logging, DOM manipulation, API calls, and syncing to imperative APIs
- **Cleanup**: Use the `onCleanup` callback to clean up resources like timers or subscriptions
- **Automatic tracking**: Effects automatically track which signals they read and re-run when those signals change

**Remember: Use effects sparingly!** The examples in this lesson (localStorage sync, logging, timers) are appropriate uses. Avoid effects for:
- Deriving values from other signals - use `computed()` instead
- Creating writable derived state - use `linkedSignal()` instead  
- Copying data between signals - restructure to use a shared source of truth

Effects are powerful but should be your last resort when `computed()` and `linkedSignal()` can't solve your use case.
