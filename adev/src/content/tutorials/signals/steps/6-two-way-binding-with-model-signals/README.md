# Two-way binding with model signals

Now that you've learned [passing data to components with input signals](/tutorials/signals/5-component-communication-with-signals), let's explore Angular's `model()` API for two-way binding. Model signals are perfect for UI components like checkboxes, sliders, or custom form controls where the component needs to both receive a value AND update it.

In this activity, you'll create a custom checkbox component that manages its own state while keeping the parent synchronized.

<hr />

<docs-workflow>

<docs-step title="Set up the custom checkbox with model signal">
Create a model signal in the `custom-checkbox` component that can both receive and update the parent's value.

```ts
// Add imports for model signals
import {Component, model, input} from '@angular/core';

// Model signal for two-way binding
checked = model.required<boolean>();

// Optional input for label
label = input<string>('');
```

Unlike `input()` signals which are read-only, `model()` signals can be both read and written to.
</docs-step>

<docs-step title="Create the checkbox template">
Build the checkbox template that responds to clicks and updates its own model.

```html
<label class="custom-checkbox">
  <input
    type="checkbox"
    [checked]="checked()"
    (change)="toggle()">
  <span class="checkmark"></span>
  {{ label() }}
</label>
```

The component reads from its model signal and has a method to update it.
</docs-step>

<docs-step title="Add the toggle method">
Implement the toggle method that updates the model signal when the checkbox is clicked.

```ts
toggle() {
  // This updates BOTH the component's state AND the parent's model!
  this.checked.set(!this.checked());
}
```

When the child component calls `this.checked.set()`, it automatically propagates the change back to the parent. This is the key difference from `input()` signals.
</docs-step>

<docs-step title="Set up two-way binding in the parent">
First, uncomment the model signal properties and methods in `app.ts`:

```ts
// Parent signal models
agreedToTerms = model(false);
enableNotifications = model(true);

// Methods to test two-way binding
toggleTermsFromParent() {
  this.agreedToTerms.set(!this.agreedToTerms());
}

resetAll() {
  this.agreedToTerms.set(false);
  this.enableNotifications.set(false);
}
```

Then update the template:

Part 1. **Uncomment the checkboxes and add two-way binding:**

- Replace `___ADD_TWO_WAY_BINDING___` with `[(checked)]="agreedToTerms"` for the first checkbox
- Replace `___ADD_TWO_WAY_BINDING___` with `[(checked)]="enableNotifications"` for the second

Part 2. **Replace the `???` placeholders with @if blocks:**

```html
@if (agreedToTerms()) {
  Yes
} @else {
  No
}
```

Part 3. **Add click handlers to the buttons:**

```html
<button (click)="toggleTermsFromParent()">Toggle Terms from Parent</button>
<button (click)="resetAll()">Reset All</button>
```

The `[(checked)]` syntax creates two-way binding - data flows down to the component AND changes flow back up to the parent by emitting an event that references the signal itself and does _not_ call the signal getter directly.
</docs-step>

<docs-step title="Test the two-way binding">
Interact with your app to see two-way binding in action:

1. **Click checkboxes** - Component updates its own state and notifies parent
2. **Click "Toggle Terms from Parent"** - Parent updates propagate down to component
3. **Click "Reset All"** - Parent resets both models and components update automatically

Both the parent and child can update the shared state, and both stay in sync automatically!
</docs-step>

</docs-workflow>

Perfect! You've learned how model signals enable two-way binding:

- **Model signals** - Use `model()` and `model.required()` for values that can be both read and written
- **Two-way binding** - Use `[(property)]` syntax to bind parent signals to child models
- **Perfect for UI components** - Checkboxes, form controls, and widgets that need to manage their own state
- **Automatic synchronization** - Parent and child stay in sync without manual event handling

**When to use `model()` vs `input()`:**

- Use `input()` for data that only flows down (display data, configuration)
- Use `model()` for UI components that need to update their own value (form controls, toggles)

In the next lesson, you'll learn about [using signals with services](/tutorials/signals/7-using-signals-with-services)!
