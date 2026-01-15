# Field state management

Signal Forms' field state allows you to react to user interactions by providing reactive signals for validation status (such as `valid`, `invalid`, `errors`), interaction tracking (such as `touched`, `dirty`), and availability (such as `disabled`, `hidden`).

## Understanding field state

When you create a form with the `form()` function, it returns a **field tree** - an object structure that mirrors your form model. Each field in the tree is accessible via dot notation (like `form.email`).

### Accessing field state

When you call any field in the field tree as a function (like `form.email()`), it returns a `FieldState` object containing reactive signals that track the field's validation, interaction, and availability state. For example, the `invalid()` signal tells you whether the field has validation errors:

```angular-ts
import { Component, signal } from '@angular/core'
import { form, FormField, required, email } from '@angular/forms/signals'

@Component({
  selector: 'app-registration',
  imports: [FormField],
  template: `
    <input type="email" [formField]="registrationForm.email" />

    @if (registrationForm.email().invalid()) {
      <p class="error">Email has validation errors:</p>
      <ul>
        @for (error of registrationForm.email().errors(); track error) {
          <li>{{ error.message }}</li>
        }
      </ul>
    }
  `
})
export class Registration {
  registrationModel = signal({
    email: '',
    password: ''
  })

  registrationForm = form(this.registrationModel, (schemaPath) => {
    required(schemaPath.email, { message: 'Email is required' })
    email(schemaPath.email, { message: 'Enter a valid email address' })
  })
}
```

In this example, the template checks `registrationForm.email().invalid()` to determine whether to display an error message.

### Field state signals

The most commonly used signal is `value()`, a `WritableSignal` that provides access to the field's current value:

```ts
const emailValue = registrationForm.email().value();
console.log(emailValue); // Current email string
```

Beyond `value()`, field state includes signals for validation, interaction tracking, and availability control:

| Category                                | Signal       | Description                                                                       |
| --------------------------------------- | ------------ | --------------------------------------------------------------------------------- |
| **[Validation](#validation-state)**     | `valid()`    | Field passes all validation rules and has no pending validators                   |
|                                         | `invalid()`  | Field has validation errors                                                       |
|                                         | `errors()`   | Array of validation error objects                                                 |
|                                         | `pending()`  | Async validation in progress                                                      |
| **[Interaction](#interaction-state)**   | `touched()`  | User has focused and blurred the field (if interactive)                           |
|                                         | `dirty()`    | User has modified the field (if interactive), even if value matches initial state |
| **[Availability](#availability-state)** | `disabled()` | Field is disabled and doesn't affect parent form state                            |
|                                         | `hidden()`   | Indicates field should be hidden; visibility in template is controlled with `@if` |
|                                         | `readonly()` | Field is readonly and doesn't affect parent form state                            |

These signals enable you to build responsive form user experiences that react to user behavior. The sections below explore each category in detail.

## Validation state

Validation state signals tell you whether a field is valid and what errors it contains.

NOTE: This guide focuses on **using** validation state in your templates and logic (such as reading `valid()`, `invalid()`, `errors()` to display feedback). For information on **defining** validation rules and creating custom validators, see the [Validation guide](guide/forms/signals/validation).

### Checking validity

Use `valid()` and `invalid()` to check validation status:

```angular-ts
@Component({
  template: `
    <input type="email" [formField]="loginForm.email" />

    @if (loginForm.email().invalid()) {
      <p class="error">Email is invalid</p>
    } @if (loginForm.email().valid()) {
      <p class="success">Email looks good</p>
    }
  `
})
export class Login {
  loginModel = signal({ email: '', password: '' })
  loginForm = form(this.loginModel)
}
```

| Signal      | Returns `true` when                                             |
| ----------- | --------------------------------------------------------------- |
| `valid()`   | Field passes all validation rules and has no pending validators |
| `invalid()` | Field has validation errors                                     |

When checking validity in code, use `invalid()` instead of `!valid()` if you want to distinguish between "has errors" and "validation pending." The reason for this is that both `valid()` and `invalid()` can be `false` simultaneously when async validation is pending because the field isn't valid yet since validation not complete and is also isn't invalid since no errors have been found yet.

### Reading validation errors

Access the array of validation errors with `errors()`. Each error object contains:

| Property    | Description                                                     |
| ----------- | --------------------------------------------------------------- |
| `kind`      | The validation rule that failed (such as "required" or "email") |
| `message`   | Optional human-readable error message                           |
| `fieldTree` | Reference to the `FieldTree` where the error occurred           |

NOTE: The `message` property is optional. Validators can provide custom error messages, but if not specified, you may need to map error `kind` values to your own messages.

Here's an example of how to display errors in your template:

```angular-ts
@Component({
  template: `
    <input type="email" [formField]="loginForm.email" />

    @if (loginForm.email().errors().length > 0) {
      <div class="errors">
        @for (error of loginForm.email().errors(); track error) {
          <p>{{ error.message }}</p>
        }
      </div>
    }
  `
})
```

This approach loops through all errors for a field, displaying each error message to the user.

### Pending validation

The `pending()` signal indicates async validation is in progress:

```angular-ts
@Component({
  template: `
    <input type="email" [formField]="signupForm.email" />

    @if (signupForm.email().pending()) {
      <p>Checking if email is available...</p>
    }

    @if (signupForm.email().invalid() && !signupForm.email().pending()) {
      <p>Email is already taken</p>
    }
  `
})
```

This signal enables you to show loading states while async validation executes.

## Interaction state

Interaction state tracks whether users have interacted with fields, enabling patterns like "show errors only after the user has touched a field."

### Touched state

The `touched()` signal tracks whether a user has focused and then blurred a field. It becomes `true` when a user focuses and then blurs a field through user interaction (not programmatically). Hidden, disabled, and readonly fields are non-interactive and don't become touched from user interactions.

### Dirty state

Forms often need to detect whether data has actually changed - for example, to warn users about unsaved changes or to enable a save button only when necessary. The `dirty()` signal tracks whether the user has modified the field.

The `dirty()` signal becomes `true` when the user modifies an interactive field's value, and remains `true` even if the value is changed back to match the initial value:

```angular-ts
@Component({
  template: `
    <form>
      <input [formField]="profileForm.name" />
      <input [formField]="profileForm.bio" />

      @if (profileForm().dirty()) {
        <p class="warning">You have unsaved changes</p>
      }
    </form>
  `
})
export class Profile {
  profileModel = signal({ name: 'Alice', bio: 'Developer' })
  profileForm = form(this.profileModel)
}
```

Use `dirty()` for "unsaved changes" warnings or to enable save buttons only when data has changed.

### Touched vs dirty

These signals track different user interactions:

| Signal      | When it becomes true                                                                                                            |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `touched()` | User has focused and blurred an interactive field (even if they didn't change anything)                                         |
| `dirty()`   | User has modified an interactive field (even if they never blurred it, and even if the current value matches the initial value) |

A field can be in different combinations:

| State                  | Scenario                                                  |
| ---------------------- | --------------------------------------------------------- |
| Touched but not dirty  | User focused and blurred the field but made no changes    |
| Both touched and dirty | User focused the field, changed the value, and blurred it |

NOTE: Hidden, disabled, and readonly fields are non-interactive - they don't become touched or dirty from user interactions.

## Availability state

Availability state signals control whether fields are interactive, editable, or visible. Disabled, hidden, and readonly fields are non-interactive. They don't affect whether their parent form is valid, touched, or dirty.

### Disabled fields

The `disabled()` signal indicates whether a field accepts user input. Disabled fields appear in the UI but users cannot interact with them.

```angular-ts
import { Component, signal } from '@angular/core'
import { form, FormField, disabled } from '@angular/forms/signals'

@Component({
  selector: 'app-order',
  imports: [FormField],
  template: `
    <!-- TIP: The `[formField]` directive automatically binds the `disabled` attribute based on the field's `disabled()` state, so you don't need to manually add `[disabled]="field().disabled()"` -->
    <input [formField]="orderForm.couponCode" />

    @if (orderForm.couponCode().disabled()) {
      <p class="info">Coupon code is only available for orders over $50</p>
    }
  `
})
export class Order {
  orderModel = signal({
    total: 25,
    couponCode: ''
  })

  orderForm = form(this.orderModel, schemaPath => {
    disabled(schemaPath.couponCode, ({valueOf}) => valueOf(schemaPath.total) < 50)
  })
}
```

In this example, we use `valueOf(schemaPath.total)` to check the value of the `total` field to determine whether `couponCode` should be disabled.

NOTE: The schema callback parameter (`schemaPath` in these examples) is a `SchemaPathTree` object that provides paths to all fields in your form. You can name this parameter anything you like.

When defining rules like `disabled()`, `hidden()`, or `readonly()`, the logic callback receives a `FieldContext` object that is typically destructured (such as `({valueOf})`). Two methods commonly used in validation rules are:

- `valueOf(schemaPath.otherField)` - Read the value of another field in the form
- `value()` - A signal containing the value of the field the rule is applied to

Disabled fields don't contribute to the parent form's validation state. Even if a disabled field would be invalid, the parent form can still be valid. The `disabled()` state affects interactivity and validation, but does not change the field's value.

### Hidden fields

The `hidden()` signal indicates whether a field is conditionally hidden. Use `hidden()` with `@if` to show or hide fields based on conditions:

```angular-ts
import { Component, signal } from '@angular/core'
import { form, FormField, hidden } from '@angular/forms/signals'

@Component({
  selector: 'app-profile',
  imports: [FormField],
  template: `
    <label>
      <input type="checkbox" [formField]="profileForm.isPublic" />
      Make profile public
    </label>

    @if (!profileForm.publicUrl().hidden()) {
      <label>
        Public URL
        <input [formField]="profileForm.publicUrl" />
      </label>
    }
  `
})
export class Profile {
  profileModel = signal({
    isPublic: false,
    publicUrl: ''
  })

  profileForm = form(this.profileModel, schemaPath => {
    hidden(schemaPath.publicUrl, ({valueOf}) => !valueOf(schemaPath.isPublic))
  })
}
```

Hidden fields don't participate in validation. If a required field is hidden, it won't prevent form submission. The `hidden()` state affects availability and validation, but does not change the field's value.

### Readonly fields

The `readonly()` signal indicates whether a field is readonly. Readonly fields display their value but users cannot edit them:

```angular-ts
import { Component, signal } from '@angular/core'
import { form, FormField, readonly } from '@angular/forms/signals'

@Component({
  selector: 'app-account',
  imports: [FormField],
  template: `
    <label>
      Username (cannot be changed)
      <input [formField]="accountForm.username" />
    </label>

    <label>
      Email
      <input [formField]="accountForm.email" />
    </label>
  `
})
export class Account {
  accountModel = signal({
    username: 'johndoe',
    email: 'john@example.com'
  })

  accountForm = form(this.accountModel, schemaPath => {
    readonly(schemaPath.username)
  })
}
```

NOTE: The `[formField]` directive automatically binds the `readonly` attribute based on the field's `readonly()` state, so you don't need to manually add `[readonly]="field().readonly()"`.

Like disabled and hidden fields, readonly fields are non-interactive and don't affect parent form state. The `readonly()` state affects editability and validation, but does not change the field's value.

### When to use each

| State        | Use when                                                            | User can see it | User can interact | Contributes to validation |
| ------------ | ------------------------------------------------------------------- | --------------- | ----------------- | ------------------------- |
| `disabled()` | Field temporarily unavailable (such as based on other field values) | Yes             | No                | No                        |
| `hidden()`   | Field not relevant in current context                               | No (with @if)   | No                | No                        |
| `readonly()` | Value should be visible but not editable                            | Yes             | No                | No                        |

## Form-level state

The root form is also a field in the field tree. When you call it as a function, it also returns a `FieldState` object that aggregates the state of all child fields.

### Accessing form state

```angular-ts
@Component({
  template: `
    <form>
      <input [formField]="loginForm.email" />
      <input [formField]="loginForm.password" />

      <button [disabled]="!loginForm().valid()">Sign In</button>
    </form>
  `
})
export class Login {
  loginModel = signal({ email: '', password: '' })
  loginForm = form(this.loginModel)
}
```

In this example, the form is valid only when all child fields are valid. This allows you to enable/disable submit buttons based on overall form validity.

### Form-level signals

Because the root form is a field, it has the same signals (such as `valid()`, `invalid()`, `touched()`, `dirty()`, etc.).

| Signal      | Form-level behavior                                            |
| ----------- | -------------------------------------------------------------- |
| `valid()`   | All interactive fields are valid and no validators are pending |
| `invalid()` | At least one interactive field has validation errors           |
| `pending()` | At least one interactive field has pending async validation    |
| `touched()` | User has touched at least one interactive field                |
| `dirty()`   | User has modified at least one interactive field               |

### When to use form-level vs field-level

**Use form-level state for:**

- Submit button enabled/disabled state
- "Save" button state
- Overall form validity checks
- Unsaved changes warnings

**Use field-level state for:**

- Individual field error messages
- Field-specific styling
- Per-field validation feedback
- Conditional field availability

## State propagation

Field state propagates from child fields up through parent field groups to the root form.

### How child state affects parent forms

When a child field becomes invalid, its parent field group becomes invalid, and so does the root form. When a child becomes touched or dirty, the parent field group and root form reflect that change. This aggregation allows you to check validity at any level - field or entire form.

```ts
const userModel = signal({
  profile: {
    firstName: '',
    lastName: '',
  },
  address: {
    street: '',
    city: '',
  },
});

const userForm = form(userModel);

// If firstName is invalid, profile is invalid
userForm.profile.firstName().invalid() === true;
// → userForm.profile().invalid() === true
// → userForm().invalid() === true
```

### Hidden, disabled, and readonly fields

Hidden, disabled, and readonly fields are non-interactive and don't affect parent form state:

```ts
const orderModel = signal({
  customerName: '',
  requiresShipping: false,
  shippingAddress: '',
});

const orderForm = form(orderModel, (schemaPath) => {
  hidden(schemaPath.shippingAddress, ({valueOf}) => !valueOf(schemaPath.requiresShipping));
});
```

In this example, when `shippingAddress` is hidden, it doesn't affect form validity. As a result, even if `shippingAddress` is empty and required, the form can be valid.

This behavior prevents hidden, disabled, or readonly fields from blocking form submission or affecting validation, touched, and dirty state.

## Using state in templates

Field state signals integrate seamlessly with Angular templates, enabling reactive form user experiences without manual event handling.

### Conditional error display

Show errors only after a user has interacted with a field:

```angular-ts
import { Component, signal } from '@angular/core'
import { form, FormField, email } from '@angular/forms/signals'

@Component({
  selector: 'app-signup',
  imports: [FormField],
  template: `
    <label>
      Email
      <input type="email" [formField]="signupForm.email" />
    </label>

    @if (signupForm.email().touched() && signupForm.email().invalid()) {
      <p class="error">{{ signupForm.email().errors()[0].message }}</p>
    }
  `
})
export class Signup {
  signupModel = signal({ email: '', password: '' })

  signupForm = form(this.signupModel, schemaPath => {
    email(schemaPath.email)
  })
}
```

This pattern prevents showing errors before users have had a chance to interact with the field. Errors appear only after the user has focused and then left the field.

### Conditional field availability

Use the `hidden()` signal with `@if` to show or hide fields conditionally:

```angular-ts
import { Component, signal } from '@angular/core'
import { form, FormField, hidden } from '@angular/forms/signals'

@Component({
  selector: 'app-order',
  imports: [FormField],
  template: `
    <label>
      <input type="checkbox" [formField]="orderForm.requiresShipping" />
      Requires shipping
    </label>

    @if (!orderForm.shippingAddress().hidden()) {
      <label>
        Shipping Address
        <input [formField]="orderForm.shippingAddress" />
      </label>
    }
  `
})
export class Order {
  orderModel = signal({
    requiresShipping: false,
    shippingAddress: ''
  })

  orderForm = form(this.orderModel, schemaPath => {
    hidden(schemaPath.shippingAddress, ({valueOf}) => !valueOf(schemaPath.requiresShipping))
  })
}
```

Hidden fields don't participate in validation, allowing the form to be submitted even if the hidden field would otherwise be invalid.

## Using field state in component logic

Field state signals work with Angular's reactive primitives like `computed()` and `effect()` for advanced form logic.

### Validation checks before submission

Check form validity in component methods:

```ts
export class Registration {
  registrationModel = signal({
    username: '',
    email: '',
    password: '',
  });

  registrationForm = form(this.registrationModel);

  async onSubmit() {
    // Wait for any pending async validation
    if (this.registrationForm().pending()) {
      console.log('Waiting for validation...');
      return;
    }

    // Guard against invalid submissions
    if (this.registrationForm().invalid()) {
      console.error('Form is invalid');
      return;
    }

    const data = this.registrationModel();
    await this.api.register(data);
  }
}
```

This ensures only valid, fully-validated data reaches your API.

### Derived state with computed

Create computed signals based on field state to automatically update when the underlying field state changes:

```ts
export class Password {
  passwordModel = signal({password: '', confirmPassword: ''});
  passwordForm = form(this.passwordModel);

  // Compute password strength indicator
  passwordStrength = computed(() => {
    const password = this.passwordForm.password().value();
    if (password.length < 8) return 'weak';
    if (password.length < 12) return 'medium';
    return 'strong';
  });

  // Check if all required fields are filled
  allFieldsFilled = computed(() => {
    return (
      this.passwordForm.password().value().length > 0 &&
      this.passwordForm.confirmPassword().value().length > 0
    );
  });
}
```

### Programmatic state changes

While field state typically updates through user interactions (typing, focusing, blurring), you sometimes need to control it programmatically. Common scenarios include form submission and resetting forms.

#### Form submission

When a user submits a form, use the `submit()` function to handle validation and reveal errors:

```ts
import {Component, signal} from '@angular/core';
import {form, submit, required, email} from '@angular/forms/signals';

export class Registration {
  registrationModel = signal({username: '', email: '', password: ''});

  registrationForm = form(this.registrationModel, (schemaPath) => {
    required(schemaPath.username);
    email(schemaPath.email);
    required(schemaPath.password);
  });

  onSubmit() {
    submit(this.registrationForm, async () => {
      this.submitToServer();
    });
  }

  submitToServer() {
    // Send data to server
  }
}
```

The `submit()` function automatically marks all fields as touched (revealing validation errors) and only executes your callback if the form is valid.

#### Resetting forms after submission

After successfully submitting a form, you may want to return it to its initial state - clearing both user interaction history and field values. The `reset()` method clears the touched and dirty flags but doesn't change field values, so you need to update your model separately:

```ts
export class Contact {
  contactModel = signal({name: '', email: '', message: ''});
  contactForm = form(this.contactModel);

  async onSubmit() {
    if (!this.contactForm().valid()) return;

    await this.api.sendMessage(this.contactModel());

    // Clear interaction state (touched, dirty)
    this.contactForm().reset();

    // Clear values
    this.contactModel.set({name: '', email: '', message: ''});
  }
}
```

This two-step reset ensures the form is ready for new input without showing stale error messages or dirty state indicators.

### Marking all fields as touched

Fields and forms can be marked as touched using the `markAllAsTouched()` method.
This method sets the touched state on the field where it is called and on all of its descendants.

```ts
//  Mark the entire form and all nested fields as touched
this.registrationForm().markAllAsTouched()
```

### Marking all fields as dirty

Fields and forms can be marked as dirty using the `markAllAsDirty()` method.
This method sets the dirty state on the field where it is called and on all of its descendants.

```ts
//  Mark the entire form and all nested fields as dirty
this.registrationForm().markAllAsDirty()
```

## Styling based on validation state

You can apply custom styles to your form by binding CSS classes based on the validation state:

```angular-ts
import { Component, signal } from '@angular/core'
import { form, FormField, email } from '@angular/forms/signals'

@Component({
  template: `
    <input
      type="email"
      [formField]="form.email"
      [class.is-invalid]="form.email().touched() && form.email().invalid()"
      [class.is-valid]="form.email().touched() && form.email().valid()"
    />
  `,
  styles: `
    input.is-invalid {
      border: 2px solid red;
      background-color: white;
    }

    input.is-valid {
      border: 2px solid green;
    }
  `
})
export class StyleExample {
  model = signal({ email: '' })

  form = form(this.model, schemaPath => {
    email(schemaPath.email)
  })
}
```

Checking both `touched()` and validation state ensures styles only appear after the user has interacted with the field.

## Next steps

This guide covered validation and availability status handling, interaction tracking and field state propagation. Related guides explore other aspects of Signal Forms:

<!-- TODO: UNCOMMENT WHEN THE GUIDES ARE AVAILABLE -->
<docs-pill-row>
  <docs-pill href="guide/forms/signals/models" title="Form models" />
  <docs-pill href="guide/forms/signals/validation" title="Validation" />
  <docs-pill href="guide/forms/signals/custom-controls" title="Custom controls" />
  <!-- <docs-pill href="guide/forms/signals/arrays" title="Working with Arrays" /> -->
</docs-pill-row>
