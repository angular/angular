# Managing async data with signals using the Resources API

Now that you've learned [how to derive state with linked signals](/tutorials/signals/3-deriving-state-with-linked-signals), let's explore how to handle asynchronous data with the Resource API. The Resource API provides a powerful way to manage async operations using signals, with built-in loading states, error handling, and request management.

In this activity, you'll learn how to use the `resource()` function to load data asynchronously and how to handle different states of async operations by building a user profile loader that demonstrates the Resource API in action.

<hr />

<docs-workflow>

<docs-step title="Import resource function and API">
Add `resource` to your existing imports and import the fake API function.

```ts
// Add resource to existing imports
import {Component, signal, computed, resource, ChangeDetectionStrategy} from '@angular/core';
// Import mock API function
import {loadUser} from './user-api';
```

</docs-step>

<docs-step title="Create a resource for user data">
Add a property in the component class that creates a resource to load user data based on a user ID signal.

```ts
userId = signal(1);

userResource = resource({
  params: () => ({ id: this.userId() }),
  loader: (params) => loadUser(params.params.id)
});
```

</docs-step>

<docs-step title="Add methods to interact with the resource">
Add methods to change the user ID and reload the resource.

```ts
loadUser(id: number) {
  this.userId.set(id);
}

reloadUser() {
  this.userResource.reload();
}
```

Changing the params signal automatically triggers a reload, or you can manually reload with `reload()`.
</docs-step>

<docs-step title="Create computed signals for resource states">
Add computed signals to access different states of the resource.

```ts
isLoading = computed(() => this.userResource.status() === 'loading');
hasError = computed(() => this.userResource.status() === 'error');
```

Resources provide a `status()` signal that can be 'loading', 'success', or 'error', a `value()` signal for the loaded data, and a `hasValue()` method that safely checks if data is available.
</docs-step>

<docs-step title="Wire up the buttons and display resource states">
The template structure is already provided. Now connect everything:

Part 1. **Add click handlers to the buttons:**

```html
<button (click)="loadUser(1)">Load User 1</button>
<button (click)="loadUser(2)">Load User 2</button>
<button (click)="loadUser(999)">Load Invalid User</button>
<button (click)="reloadUser()">Reload</button>
```

Part 2. **Replace the placeholder with resource state handling:**

```html
@if (isLoading()) {
  <p>Loading user...</p>
} @else if (hasError()) {
  <p class="error">Error: {{ userResource.error()?.message }}</p>
} @else if (userResource.hasValue()) {
  <div class="user-info">
    <h3>{{ userResource.value().name }}</h3>
    <p>{{ userResource.value().email }}</p>
  </div>
}
```

The resource provides different methods to check its state:

- `isLoading()` - true when fetching data
- `hasError()` - true when an error occurred
- `userResource.hasValue()` - true when data is available
- `userResource.value()` - access the loaded data
- `userResource.error()` - access error information

</docs-step>

</docs-workflow>

Excellent! You've now learned how to use the Resource API with signals. Key concepts to remember:

- **Resources are reactive**: They automatically reload when params change
- **Built-in state management**: Resources provide `status()`, `value()`, and `error()` signals
- **Automatic cleanup**: Resources handle request cancellation and cleanup automatically
- **Manual control**: You can manually reload or abort requests when needed

In the next lesson, you'll learn [how to pass data to components with input signals](/tutorials/signals/5-component-communication-with-signals)!
