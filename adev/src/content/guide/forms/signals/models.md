# Form models

Form models are the foundation of Signal Forms, serving as the single source of truth for your form data. This guide explores how to create form models, update them, and design them for maintainability.

NOTE: Form models are distinct from Angular's `model()` signal used for component two-way binding. A form model is a writable signal that stores form data, while `model()` creates inputs/outputs for parent/child component communication.

## What form models solve

Forms require managing data that changes over time. Without a clear structure, this data can become scattered across component properties, making it difficult to track changes, validate input, or submit data to a server.

Form models solve this by centralizing form data in a single writable signal. When the model updates, the form automatically reflects those changes. When users interact with the form, the model updates accordingly.

## Creating models

A form model is a writable signal created with Angular's `signal()` function. The signal holds an object that represents your form's data structure.

```angular-ts
import {Component, signal} from '@angular/core';
import {form, FormField} from '@angular/forms/signals';

@Component({
  selector: 'app-login',
  imports: [FormField],
  template: `
    <input type="email" [formField]="loginForm.email" />
    <input type="password" [formField]="loginForm.password" />
  `,
})
export class LoginComponent {
  loginModel = signal({
    email: '',
    password: '',
  });

  loginForm = form(this.loginModel);
}
```

The `form()` function accepts the model signal and creates a **field tree** - a special object structure that mirrors your model's shape. The field tree is both navigable (access child fields with dot notation like `loginForm.email`) and callable (call a field as a function to access its state).

The `[formField]` directive binds each input element to its corresponding field in the field tree, enabling automatic two-way synchronization between the UI and model.

### Using TypeScript types

While TypeScript infers types from object literals, defining explicit types improves code quality and provides better IntelliSense support.

```ts
interface LoginData {
  email: string;
  password: string;
}

export class LoginComponent {
  loginModel = signal<LoginData>({
    email: '',
    password: '',
  });

  loginForm = form(this.loginModel);
}
```

With explicit types, the field tree provides full type safety. Accessing `loginForm.email` is typed as `FieldTree<string>`, and attempting to access a non-existent property results in a compile-time error.

```ts
// TypeScript knows this is FieldTree<string>
const emailField = loginForm.email;

// TypeScript error: Property 'username' does not exist
const usernameField = loginForm.username;
```

### Initializing all fields

Form models should provide initial values for all fields you want to include in the field tree.

```ts {prefer}
// Good: All fields initialized
const userModel = signal({
  name: '',
  email: '',
  age: 0,
});
```

```ts {avoid}
// Avoid: Missing initial value
const userModel = signal({
  name: '',
  email: '',
  // age field is not defined - cannot access userForm.age
});
```

For optional fields, explicitly set them to `null` or an empty value:

```ts
interface UserData {
  name: string;
  email: string;
  phoneNumber: string | null;
}

const userModel = signal<UserData>({
  name: '',
  email: '',
  phoneNumber: null,
});
```

Fields set to `undefined` are excluded from the field tree. A model with `{value: undefined}` behaves identically to `{}` - accessing the field returns `undefined` rather than a `FieldTree`.

## Reading model values

You can access form values in two ways: directly from the model signal, or through individual fields. Each approach serves a different purpose.

### Reading from the model

Access the model signal when you need the complete form data, such as during form submission:

```ts
async onSubmit() {
  const formData = this.loginModel();
  console.log(formData.email, formData.password);

  // Send to server
  await this.authService.login(formData);
}
```

The model signal returns the entire data object, making it ideal for operations that work with the complete form state.

### Reading from field state

Each field in the field tree is a function. Calling a field returns a `FieldState` object containing reactive signals for the field's value, validation status, and interaction state.

Access field state when working with individual fields in templates or reactive computations:

```angular-ts
@Component({
  template: `
    <p>Current email: {{ loginForm.email().value() }}</p>
    <p>Password length: {{ passwordLength() }}</p>
  `,
})
export class LoginComponent {
  loginModel = signal({email: '', password: ''});
  loginForm = form(this.loginModel);

  passwordLength = computed(() => {
    return this.loginForm.password().value().length;
  });
}
```

Field state provides reactive signals for each field's value, making it suitable for displaying field-specific information or creating derived state.

TIP: Field state includes many more signals beyond `value()`, such as validation state (e.g., valid, invalid, errors), interaction tracking (e.g., touched, dirty), and visibility (e.g., hidden, disabled).

<!-- TODO: UNCOMMENT BELOW WHEN GUIDE IS AVAILABLE -->
<!-- See the [Field State Management guide](guide/forms/signals/field-state-management) for complete coverage. -->

## Updating form models programmatically

### Replacing form models with `set()`

Use `set()` on the form model to replace the entire value:

```ts
loadUserData() {
  this.userModel.set({
    name: 'Alice',
    email: 'alice@example.com',
    age: 30,
  });
}

resetForm() {
  this.userModel.set({
    name: '',
    email: '',
    age: 0,
  });
}
```

This approach works well when loading data from an API or resetting the entire form.

### Update a single field directly with `set()` or `update()`

Use `set()` on individual field values to directly update the field state:

```ts
clearEmail() {
  this.userForm.email().value.set('');
}

incrementAge() {
  this.userForm.age().value.update(currentAge => currentAge + 1);
}
```

These are also known as "field-level updates." They automatically propagate to the model signal and keep both in sync.

### Example: Loading data from an API

A common pattern involves fetching data and populating the model:

```ts
export class UserProfileComponent {
  userModel = signal({
    name: '',
    email: '',
    bio: '',
  });

  userForm = form(this.userModel);
  private userService = inject(UserService);

  ngOnInit() {
    this.loadUserProfile();
  }

  async loadUserProfile() {
    const userData = await this.userService.getUserProfile();
    this.userModel.set(userData);
  }
}
```

The form fields automatically update when the model changes, displaying the fetched data without additional code.

## Two-way data binding

The `[formField]` directive creates automatic two-way synchronization between the model, form state, and UI.

### How data flows

Changes flow bidirectionally:

**User input → Model:**

1. User types in an input element
2. The `[formField]` directive detects the change
3. Field state updates
4. Model signal updates

**Programmatic update → UI:**

1. Code updates the model with `set()` or `update()`
2. Model signal notifies subscribers
3. Field state updates
4. The `[formField]` directive updates the input element

This synchronization happens automatically. You don't write subscriptions or event handlers to keep the model and UI in sync.

### Example: Both directions

```angular-ts
@Component({
  template: `
    <input type="text" [formField]="userForm.name" />
    <button (click)="setName('Bob')">Set Name to Bob</button>
    <p>Current name: {{ userModel().name }}</p>
  `,
})
export class UserComponent {
  userModel = signal({name: ''});
  userForm = form(this.userModel);

  setName(name: string) {
    this.userForm.name().value.set(name);
    // Input automatically displays 'Bob'
  }
}
```

When the user types in the input, `userModel().name` updates. When the button is clicked, the input value changes to "Bob". No manual synchronization code is required.

## Model structure patterns

Form models can be flat objects or contain nested objects and arrays. The structure you choose affects how you access fields and organize validation.

### Flat vs nested models

Flat form models keep all fields at the top level:

```ts
// Flat structure
const userModel = signal({
  name: '',
  email: '',
  street: '',
  city: '',
  state: '',
  zip: '',
});
```

Nested models group related fields:

```ts
// Nested structure
const userModel = signal({
  name: '',
  email: '',
  address: {
    street: '',
    city: '',
    state: '',
    zip: '',
  },
});
```

**Use flat structures when:**

- Fields don't have clear conceptual groupings
- You want simpler field access (`userForm.city` vs `userForm.address.city`)
- Validation rules span multiple potential groups

**Use nested structures when:**

- Fields form a clear conceptual group (like an address)
- The grouped data matches your API structure
- You want to validate the group as a unit

### Working with nested objects

You can access nested fields by following the object path:

```ts
const userModel = signal({
  profile: {
    firstName: '',
    lastName: '',
  },
  settings: {
    theme: 'light',
    notifications: true,
  },
});

const userForm = form(userModel);

// Access nested fields
userForm.profile.firstName; // FieldTree<string>
userForm.settings.theme; // FieldTree<string>
```

In templates, you bind nested fields the same way as top-level fields:

```angular-ts
@Component({
  template: `
    <input [formField]="userForm.profile.firstName" />
    <input [formField]="userForm.profile.lastName" />

    <select [formField]="userForm.settings.theme">
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </select>
  `,
})
```

### Working with arrays

Models can include arrays for collections of items:

```ts
const orderModel = signal({
  customerName: '',
  items: [{product: '', quantity: 0, price: 0}],
});

const orderForm = form(orderModel);

// Access array items by index
orderForm.items[0].product; // FieldTree<string>
orderForm.items[0].quantity; // FieldTree<number>
```

Array items containing objects automatically receive tracking identities, which helps maintain field state even when items change position in the array. This ensures validation state and user interactions persist correctly when arrays are reordered.

<!-- TBD: For dynamic arrays and complex array operations, see the [Working with arrays guide](guide/forms/signals/arrays). -->

## Next steps

This guide covered creating models and updating values. Related guides explore other aspects of Signal Forms:

<!-- TODO: UNCOMMENT WHEN THE GUIDES ARE AVAILABLE -->
<docs-pill-row>
  <docs-pill href="guide/forms/signals/field-state-management" title="Field state management" />
  <docs-pill href="guide/forms/signals/validation" title="Validation" />
  <docs-pill href="guide/forms/signals/custom-controls" title="Custom controls" />
  <!-- <docs-pill href="guide/forms/signals/arrays" title="Working with Arrays" /> -->
</docs-pill-row>
