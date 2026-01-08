# Validation

Forms need validation to ensure users provide correct, complete data before submission. Without validation, you would need to handle data quality issues on the server, provide poor user experience with unclear error messages, and manually check every constraint.

Signal Forms provides a schema-based validation approach. Validation rules bind to fields using a schema function, run automatically when values change, and expose errors through field state signals. This enables reactive validation that updates as users interact with the form.

<docs-code-multifile preview hideCode path="adev/src/content/examples/signal-forms/src/login-validation-complete/app/app.ts">
  <docs-code header="app.ts" path="adev/src/content/examples/signal-forms/src/login-validation-complete/app/app.ts"/>
  <docs-code header="app.html" path="adev/src/content/examples/signal-forms/src/login-validation-complete/app/app.html"/>
  <docs-code header="app.css" path="adev/src/content/examples/signal-forms/src/login-validation-complete/app/app.css"/>
</docs-code-multifile>

## Validation basics

Validation in Signal Forms is defined through a schema function passed as the second argument to `form()`.

### The schema function

The schema function receives a `SchemaPathTree` object that lets you define your validation rules:

<docs-code
  header="app.ts"
  path="adev/src/content/examples/signal-forms/src/login-validation-complete/app/app.ts"
  visibleLines="[21,22,23,24,25,26,27]"
  highlight="[23,24,26]"
/>

The schema function runs once during form initialization. Validation rules bind to fields using the schema path parameter (such as `schemaPath.email`, `schemaPath.password`), and validation runs automatically whenever field values change.

NOTE: The schema callback parameter (`schemaPath` in these examples) is a `SchemaPathTree` object that provides paths to all fields in your form. You can name this parameter anything you like.

### How validation works

Validation in Signal Forms follows this pattern:

1. **Define validation rules in schema** - Bind validation rules to fields in the schema function
2. **Automatic execution** - Validation rules run when field values change
3. **Error propagation** - Validation errors are exposed through field state signals
4. **Reactive updates** - UI automatically updates when validation state changes

Validation runs on every value change for interactive fields. Hidden and disabled fields don't run validation - their validation rules are skipped until the field becomes interactive again.

### Validation timing

Validation rules execute in this order:

1. **Synchronous validation** - All synchronous validation rules run when value changes
2. **Asynchronous validation** - Asynchronous validation rules run only after all synchronous validation rules pass
3. **Field state updates** - The `valid()`, `invalid()`, `errors()`, and `pending()` signals update

Synchronous validation rules (like `required()`, `email()`) complete immediately. Asynchronous validation rules (like `validateHttp()`) may take time and set the `pending()` signal to `true` while executing.

All validation rules run on every change - validation doesn't short-circuit after the first error. If a field has both `required()` and `email()` validation rules, both run, and both can produce errors simultaneously.

## Built-in validation rules

Signal Forms provides validation rules for common validation scenarios. All built-in validation rules accept an options object for custom error messages and conditional logic.

### required()

The `required()` validation rule ensures a field has a value:

```angular-ts
import { Component, signal } from '@angular/core'
import { form, Field, required } from '@angular/forms/signals'

@Component({
  selector: 'app-registration',
  imports: [Field],
  template: `
    <form>
      <label>
        Username
        <input [field]="registrationForm.username" />
      </label>

      <label>
        Email
        <input type="email" [field]="registrationForm.email" />
      </label>

      <button type="submit">Register</button>
    </form>
  `
})
export class RegistrationComponent {
  registrationModel = signal({
    username: '',
    email: ''
  })

  registrationForm = form(this.registrationModel, (schemaPath) => {
    required(schemaPath.username, { message: 'Username is required' })
    required(schemaPath.email, { message: 'Email is required' })
  })
}
```

A field is considered "empty" when:

| Condition                | Example |
| ------------------------ | ------- |
| Value is `null`          | `null`, |
| Value is an empty string | `''`    |
| Value is an empty array  | `[]`    |

For conditional requirements, use the `when` option:

```ts
registrationForm = form(this.registrationModel, (schemaPath) => {
  required(schemaPath.promoCode, {
    message: 'Promo code is required for discounts',
    when: ({valueOf}) => valueOf(schemaPath.applyDiscount),
  });
});
```

The validation rule only runs when the `when` function returns `true`.

### email()

The `email()` validation rule checks for valid email format:

```angular-ts
import { Component, signal } from '@angular/core'
import { form, Field, email } from '@angular/forms/signals'

@Component({
  selector: 'app-contact',
  imports: [Field],
  template: `
    <form>
      <label>
        Your Email
        <input type="email" [field]="contactForm.email" />
      </label>
    </form>
  `
})
export class ContactComponent {
  contactModel = signal({ email: '' })

  contactForm = form(this.contactModel, (schemaPath) => {
    email(schemaPath.email, { message: 'Please enter a valid email address' })
  })
}
```

The `email()` validation rule uses a standard email format regex. It accepts addresses like `user@example.com` but rejects malformed addresses like `user@` or `@example.com`.

### min() and max()

The `min()` and `max()` validation rules work with numeric values:

```angular-ts
import { Component, signal } from '@angular/core'
import { form, Field, min, max } from '@angular/forms/signals'

@Component({
  selector: 'app-age-form',
  imports: [Field],
  template: `
    <form>
      <label>
        Age
        <input type="number" [field]="ageForm.age" />
      </label>

      <label>
        Rating (1-5)
        <input type="number" [field]="ageForm.rating" />
      </label>
    </form>
  `
})
export class AgeFormComponent {
  ageModel = signal({
    age: 0,
    rating: 0
  })

  ageForm = form(this.ageModel, (schemaPath) => {
    min(schemaPath.age, 18, { message: 'You must be at least 18 years old' })
    max(schemaPath.age, 120, { message: 'Please enter a valid age' })

    min(schemaPath.rating, 1, { message: 'Rating must be at least 1' })
    max(schemaPath.rating, 5, { message: 'Rating cannot exceed 5' })
  })
}
```

You can use computed values for dynamic constraints:

```ts
ageForm = form(this.ageModel, (schemaPath) => {
  min(schemaPath.participants, () => this.minimumRequired(), {
    message: 'Not enough participants',
  });
});
```

### minLength() and maxLength()

The `minLength()` and `maxLength()` validation rules work with strings and arrays:

```angular-ts
import { Component, signal } from '@angular/core'
import { form, Field, minLength, maxLength } from '@angular/forms/signals'

@Component({
  selector: 'app-password-form',
  imports: [Field],
  template: `
    <form>
      <label>
        Password
        <input type="password" [field]="passwordForm.password" />
      </label>

      <label>
        Bio
        <textarea [field]="passwordForm.bio"></textarea>
      </label>
    </form>
  `
})
export class PasswordFormComponent {
  passwordModel = signal({
    password: '',
    bio: ''
  })

  passwordForm = form(this.passwordModel, (schemaPath) => {
    minLength(schemaPath.password, 8, { message: 'Password must be at least 8 characters' })
    maxLength(schemaPath.password, 100, { message: 'Password is too long' })

    maxLength(schemaPath.bio, 500, { message: 'Bio cannot exceed 500 characters' })
  })
}
```

For strings, "length" means the number of characters. For arrays, "length" means the number of elements.

### pattern()

The `pattern()` validation rule validates against a regular expression:

```angular-ts
import { Component, signal } from '@angular/core'
import { form, Field, pattern } from '@angular/forms/signals'

@Component({
  selector: 'app-phone-form',
  imports: [Field],
  template: `
    <form>
      <label>
        Phone Number
        <input [field]="phoneForm.phone" placeholder="555-123-4567" />
      </label>

      <label>
        Postal Code
        <input [field]="phoneForm.postalCode" placeholder="12345" />
      </label>
    </form>
  `
})
export class PhoneFormComponent {
  phoneModel = signal({
    phone: '',
    postalCode: ''
  })

  phoneForm = form(this.phoneModel, (schemaPath) => {
    pattern(schemaPath.phone, /^\d{3}-\d{3}-\d{4}$/, {
      message: 'Phone must be in format: 555-123-4567'
    })

    pattern(schemaPath.postalCode, /^\d{5}$/, {
      message: 'Postal code must be 5 digits'
    })
  })
}
```

Common patterns:

| Pattern Type     | Regular Expression      | Example      |
| ---------------- | ----------------------- | ------------ |
| Phone            | `/^\d{3}-\d{3}-\d{4}$/` | 555-123-4567 |
| Postal code (US) | `/^\d{5}$/`             | 12345        |
| Alphanumeric     | `/^[a-zA-Z0-9]+$/`      | abc123       |
| URL-safe         | `/^[a-zA-Z0-9_-]+$/`    | my-url_123   |

## Validation of array items

Forms can include arrays of nested objects (for example, a list of order items). To apply validation rules to each item in an array, use `applyEach()` inside your schema function. `applyEach()` iterates the array path and supplies a path for each item where you can apply validators just like top-level fields.

```ts
import {Component, signal} from '@angular/core';
import {applyEach, Field, form, min, required, SchemaPathTree} from '@angular/forms/signals';

type Item = {name: string; quantity: number};

interface Order {
  title: string;
  description: string;
  items: Item[];
}

function ItemSchema(item: SchemaPathTree<Item>) {
  required(item.name, {message: 'Item name is required'});
  min(item.quantity, 1, {message: 'Quantity must be at least 1'});
}

@Component(/* ... */)
export class OrderComponent {
  orderModel = signal<Order>({
    title: '',
    description: '',
    items: [{name: '', quantity: 0}],
  });

  orderForm = form(this.orderModel, (schemaPath) => {
    required(schemaPath.title);
    required(schemaPath.description);

    applyEach(schemaPath.items, ItemSchema);
  });
}
```

## Validation errors

When validation rules fail, they produce error objects that describe what went wrong. Understanding error structure helps you provide clear feedback to users.

<!-- TODO: Uncomment when field state management guide is published

NOTE: This section covers the errors that validation rules produce. For displaying and using validation errors in your UI, see the [Field State Management guide](guide/forms/signals/field-state-management). -->

### Error structure

Each validation error object contains these properties:

| Property  | Description                                                              |
| --------- | ------------------------------------------------------------------------ |
| `kind`    | The validation rule that failed (e.g., "required", "email", "minLength") |
| `message` | Optional human-readable error message                                    |

Built-in validation rules automatically set the `kind` property. The `message` property is optional - you can provide custom messages through validation rule options.

### Custom error messages

All built-in validation rules accept a `message` option for custom error text:

```angular-ts
import { Component, signal } from '@angular/core'
import { form, Field, required, minLength } from '@angular/forms/signals'

@Component({
  selector: 'app-signup',
  imports: [Field],
  template: `
    <form>
      <label>
        Username
        <input [field]="signupForm.username" />
      </label>

      <label>
        Password
        <input type="password" [field]="signupForm.password" />
      </label>
    </form>
  `
})
export class SignupComponent {
  signupModel = signal({
    username: '',
    password: ''
  })

  signupForm = form(this.signupModel, (schemaPath) => {
    required(schemaPath.username, {
      message: 'Please choose a username'
    })

    required(schemaPath.password, {
      message: 'Password cannot be empty'
    })
    minLength(schemaPath.password, 12, {
      message: 'Password must be at least 12 characters for security'
    })
  })
}
```

Custom messages should be clear, specific, and tell users how to fix the problem. Instead of "Invalid input", use "Password must be at least 12 characters for security".

### Multiple errors per field

When a field has multiple validation rules, each validation rule runs independently and can produce an error:

```ts
signupForm = form(this.signupModel, (schemaPath) => {
  required(schemaPath.email, {message: 'Email is required'});
  email(schemaPath.email, {message: 'Enter a valid email address'});
  minLength(schemaPath.email, 5, {message: 'Email is too short'});
});
```

If the email field is empty, only the `required()` error appears. If the user types "a@b", both `email()` and `minLength()` errors appear. All validation rules run - validation doesn't stop after the first failure.

TIP: Use the `touched() && invalid()` pattern in your templates to prevent errors from appearing before users have interacted with a field. For comprehensive guidance on displaying validation errors, see the [Field State Management guide](guide/forms/signals/field-state-management#conditional-error-display).

## Custom validation rules

While built-in validation rules handle common cases, you'll often need custom validation logic for business rules, complex formats, or domain-specific constraints.

### Using validate()

The `validate()` function creates custom validation rules. It receives a validator function that accesses the field context and returns:

| Return Value          | Meaning          |
| --------------------- | ---------------- |
| Error object          | Value is invalid |
| `null` or `undefined` | Value is valid   |

```angular-ts
import { Component, signal } from '@angular/core'
import { form, Field, validate } from '@angular/forms/signals'

@Component({
  selector: 'app-url-form',
  imports: [Field],
  template: `
    <form>
      <label>
        Website URL
        <input [field]="urlForm.website" />
      </label>
    </form>
  `
})
export class UrlFormComponent {
  urlModel = signal({ website: '' })

  urlForm = form(this.urlModel, (schemaPath) => {
    validate(schemaPath.website, ({value}) => {
      if (!value().startsWith('https://')) {
        return {
          kind: 'https',
          message: 'URL must start with https://'
        }
      }

      return null
    })
  })
}
```

For submission errors that target specific fields, use the `fieldTree` property:

```ts
// In a submit function
return [
  {
    fieldTree: registrationForm.username, // Target specific field
    kind: 'server',
    message: 'Username already taken',
  },
];
```

The validator function receives a `FieldContext` object with:

| Property        | Type       | Description                                 |
| --------------- | ---------- | ------------------------------------------- |
| `value`         | Signal     | Signal containing the current field value   |
| `state`         | FieldState | The field state reference                   |
| `field`         | FieldTree  | The field tree reference                    |
| `valueOf()`     | Method     | Get the value of another field by path      |
| `stateOf()`     | Method     | Get the state of another field by path      |
| `fieldTreeOf()` | Method     | Get the field tree of another field by path |
| `pathKeys`      | Signal     | Path keys from root to current field        |

NOTE: Child fields also have a `key` signal, and array item fields have both `key` and `index` signals.

Return an error object with `kind` and `message` when validation fails. Return `null` or `undefined` when validation passes.

### Reusable validation rules

Create reusable validation rule functions by wrapping `validate()`:

```ts
function url(field: any, options?: {message?: string}) {
  validate(field, ({value}) => {
    try {
      new URL(value());
      return null;
    } catch {
      return {
        kind: 'url',
        message: options?.message || 'Enter a valid URL',
      };
    }
  });
}

function phoneNumber(field: any, options?: {message?: string}) {
  validate(field, ({value}) => {
    const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;

    if (!phoneRegex.test(value())) {
      return {
        kind: 'phoneNumber',
        message: options?.message || 'Phone must be in format: 555-123-4567',
      };
    }

    return null;
  });
}
```

You can use custom validation rules just like built-in validation rules:

```ts
urlForm = form(this.urlModel, (schemaPath) => {
  url(schemaPath.website, {message: 'Please enter a valid website URL'});
  phoneNumber(schemaPath.phone);
});
```

## Cross-field validation

Cross-field validation compares or relates multiple field values.

A common scenario for cross-field validation is password confirmation:

```angular-ts
import { Component, signal } from '@angular/core'
import { form, Field, required, minLength, validate } from '@angular/forms/signals'

@Component({
  selector: 'app-password-change',
  imports: [Field],
  template: `
    <form>
      <label>
        New Password
        <input type="password" [field]="passwordForm.password" />
      </label>

      <label>
        Confirm Password
        <input type="password" [field]="passwordForm.confirmPassword" />
      </label>

      <button type="submit">Change Password</button>
    </form>
  `
})
export class PasswordChangeComponent {
  passwordModel = signal({
    password: '',
    confirmPassword: ''
  })

  passwordForm = form(this.passwordModel, (schemaPath) => {
    required(schemaPath.password, { message: 'Password is required' })
    minLength(schemaPath.password, 8, { message: 'Password must be at least 8 characters' })

    required(schemaPath.confirmPassword, { message: 'Please confirm your password' })

    validate(schemaPath.confirmPassword, ({value, valueOf}) => {
      const confirmPassword = value()
      const password = valueOf(schemaPath.password)

      if (confirmPassword !== password) {
        return {
          kind: 'passwordMismatch',
          message: 'Passwords do not match'
        }
      }

      return null
    })
  })
}
```

The confirmation validation rule accesses the password field value using `valueOf(schemaPath.password)` and compares it to the confirmation value. This validation rule runs reactively - if either password changes, validation reruns automatically.

## Async validation

Async validation handles validation that requires external data sources, like checking username availability on a server or validating against an API.

### Using validateHttp()

The `validateHttp()` function performs HTTP-based validation:

```angular-ts
import { Component, signal, inject } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { form, Field, required, validateHttp } from '@angular/forms/signals'

@Component({
  selector: 'app-username-form',
  imports: [Field],
  template: `
    <form>
      <label>
        Username
        <input [field]="usernameForm.username" />

        @if (usernameForm.username().pending()) {
          <span class="checking">Checking availability...</span>
        }
      </label>
    </form>
  `
})
export class UsernameFormComponent {
  http = inject(HttpClient)

  usernameModel = signal({ username: '' })

  usernameForm = form(this.usernameModel, (schemaPath) => {
    required(schemaPath.username, { message: 'Username is required' })

    validateHttp(schemaPath.username, {
      request: ({value}) => `/api/check-username?username=${value()}`,
      onSuccess: (response: any) => {
        if (response.taken) {
          return {
            kind: 'usernameTaken',
            message: 'Username is already taken'
          }
        }
        return null
      },
      onError: (error) => ({
        kind: 'networkError',
        message: 'Could not verify username availability'
      })
    })
  })
}
```

The `validateHttp()` validation rule:

1. Calls the URL or request returned by the `request` function
2. Maps the successful response to a validation error or `null` using `onSuccess`
3. Handles request failures (network errors, HTTP errors) using `onError`
4. Sets `pending()` to `true` while the request is in progress
5. Only runs after all synchronous validation rules pass

### Pending state

While async validation runs, the field's `pending()` signal returns `true`. Use this to show loading indicators:

```angular-html
@if (form.username().pending()) {
  <span class="spinner">Checking...</span>
}
```

The `valid()` signal returns `false` while validation is pending, even if there are no errors yet. The `invalid()` signal only returns `true` if errors exist.

## Integration with schema validation libraries

Signal Forms have built-in support for libraries that conform to [Standard Schema](https://standardschema.dev/) like [Zod](https://zod.dev/) or [Valibot](https://valibot.dev/). The integration is provided via the `validateStandardSchema` function. This allows you to use existing schemas while maintaining Signal Forms' reactive validation benefits.

```ts
import {form, validateStandardSchema} from '@angular/forms/signals';
import * as z from 'zod';

// Define your schema
const userSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

// Use with Signal Forms
const userForm = form(signal({email: '', password: ''}), (schemaPath) => {
  validateStandardSchema(schemaPath, userSchema);
});
```

## Next steps

This guide covered creating and applying validation rules. Related guides explore other aspects of Signal Forms:

<!-- TODO: UNCOMMENT WHEN THE GUIDES ARE AVAILABLE -->
<docs-pill-row>
  <docs-pill href="guide/forms/signals/field-state-management" title="Field state management" />
  <docs-pill href="guide/forms/signals/models" title="Form models" />
  <docs-pill href="guide/forms/signals/custom-controls" title="Custom controls" />
  <!-- <docs-pill href="guide/forms/signals/arrays" title="Working with Arrays" /> -->
</docs-pill-row>
