# Async operations

Some validation requires data from external sources like backend APIs or third-party services. Signal Forms provides two functions for asynchronous validation: `validateHttp()` for HTTP-based validation and `validateAsync()` for custom resource-based validation.

## When to use async validation

Use async validation when your validation logic requires external data. Some common examples include:

- **Uniqueness checks** - Verify usernames or emails don't already exist
- **Database lookups** - Check values against server-side data
- **External API validation** - Validate addresses, tax IDs, or other data with third-party services
- **Server-side business rules** - Apply validation rules that only the server can verify

Don't use async validation for checks you can perform synchronously on the client. Use synchronous validation rules like `pattern()`, `email()`, or `validate()` for format validation and static rules.

## How async validation works

Async validation runs only after all synchronous validation passes. While the validation executes, the field's `pending()` signal returns `true`. The validation can target errors to specific fields, and pending requests cancel automatically when field values change.

Here's an example checking username availability:

```angular-ts
import { Component, signal } from '@angular/core'
import { form, validateHttp, FormField } from '@angular/forms/signals'

@Component({
  selector: 'app-registration',
  imports: [FormField],
  template: `
    <form>
      <label>
        Username:
        <input [formField]="registrationForm.username" />
      </label>

      @if (registrationForm.username().pending()) {
        <span class="checking">Checking availability...</span>
      }
      @if (registrationForm.username().invalid()) {
        @for (error of registrationForm.username().errors(); track $index) {
          <span class="error">{{ error.message }}</span>
        }
      }
    </form>
  `
})
export class Registration {
  registrationModel = signal({ username: '' })

  registrationForm = form(this.registrationModel, (schemaPath) => {
    validateHttp(schemaPath.username, {
      request: ({value}) => {
        const username = value()
        return username ? `/api/users/check?username=${username}` : undefined
      },
      onSuccess: (response) => {
        return response.available ? null : {
          kind: 'usernameTaken',
          message: 'Username is already taken'
        }
      },
      onError: (error) => {
        console.error('Validation request failed:', error)
        return {
          kind: 'serverError',
          message: 'Could not verify username availability'
        }
      }
    })
  })
}
```

The validation flow works like this:

1. User types a value
2. Synchronous validation rules run first
3. If synchronous validation fails, async validation doesn't run
4. If synchronous validation passes, async validation starts and `pending()` becomes `true`
5. The request completes and `pending()` becomes `false`
6. Errors update based on the response

## HTTP validation with validateHttp()

The `validateHttp()` function provides the most common form of async validation. Use it when you need to validate against a REST API or any HTTP endpoint.

### Request function

The `request` function returns either a URL string or an `HttpResourceRequest` object. Return `undefined` to skip the validation:

```ts
import {Component, signal} from '@angular/core';
import {form, validateHttp, FormField} from '@angular/forms/signals';

@Component({
  selector: 'app-registration',
  imports: [FormField],
  template: `...`,
})
export class Registration {
  registrationModel = signal({username: ''});

  // Cache usernames that passed validation
  private validatedUsernames = new Set<string>();

  registrationForm = form(this.registrationModel, (schemaPath) => {
    validateHttp(schemaPath.username, {
      request: ({value}) => {
        const username = value();
        // Skip HTTP request if already validated
        if (this.validatedUsernames.has(username)) return undefined;

        return `/api/users/check?username=${username}`;
      },
      onSuccess: (response, {value}) => {
        if (response.available) {
          // Cache successful validations
          this.validatedUsernames.add(value());
          return null;
        }
        return {
          kind: 'usernameTaken',
          message: 'Username is already taken',
        };
      },
      onError: () => ({
        kind: 'serverError',
        message: 'Could not verify username',
      }),
    });
  });
}
```

For POST requests or custom headers, return an `HttpResourceRequest` object:

```ts
request: ({value}) => ({
  url: '/api/validate',
  method: 'POST',
  body: {username: value()},
}) // prettier-ignore
```

### Success and error handlers

The `onSuccess` function receives the HTTP response and returns validation errors or `undefined` for valid values:

```ts
onSuccess: (response) => {
  if (response.valid) return undefined;

  return {
    kind: 'invalid',
    message: response.message || 'Validation failed',
  };
} // prettier-ignore
```

Return multiple errors when needed:

```ts
onSuccess: (response) => {
  const errors = [];
  if (response.usernameTaken) {
    errors.push({
      kind: 'usernameTaken',
      message: 'Username taken',
    });
  }
  if (response.profanity) {
    errors.push({
      kind: 'profanity',
      message: 'Username contains inappropriate content',
    });
  }
  return errors.length > 0 ? errors : undefined;
} // prettier-ignore
```

The `onError` function handles request failures like network errors or HTTP errors:

```ts
onError: (error) => {
  console.error('Validation request failed:', error);
  return {
    kind: 'serverError',
    message: 'Could not verify. Please try again later.',
  };
} // prettier-ignore
```

### HTTP options

Customize the HTTP request with the `options` parameter:

```ts
import {HttpHeaders} from '@angular/common/http';

validateHttp(schemaPath.field, {
  request: ({value}) => `/api/validate?value=${value()}`,
  options: {
    headers: new HttpHeaders({
      Authorization: 'Bearer token',
    }),
    timeout: 5000,
  },
  onSuccess: (response) =>
    response.valid
      ? null
      : {
          kind: 'invalid',
          message: 'Invalid value',
        },
  onError: () => ({
    kind: 'requestFailed',
    message: 'Unable to reach server to validate.',
  }),
});
```

TIP: See the [httpResource API documentation](api/common/http/httpResource) for all available options.

## Custom async validation with validateAsync()

Most applications should use `validateHttp()` for async validation. It handles HTTP requests with minimal configuration and covers the majority of use cases.

`validateAsync()` is a lower-level API that exposes Angular's resource primitive directly. It offers complete control but requires more code and familiarity with Angular's resource API.

Consider `validateAsync()` only when `validateHttp()` can't meet your needs. Some examples include:

- **Non-HTTP validation** - WebSocket connections, IndexedDB lookups, or Web Worker computations
- **Custom caching strategies** - Application-specific caching beyond simple memoization
- **Complex retry logic** - Custom backoff strategies or conditional retries
- **Direct resource access** - When you need the full resource lifecycle

### Creating a custom validation rule

The `validateAsync()` function requires four properties: `params`, `factory`, `onSuccess`, and `onError`. The `params` function returns the parameters for your resource, while `factory` creates the resource:

```ts
import {Component, inject, signal, resource, Signal} from '@angular/core';
import {form, validateAsync, FormField} from '@angular/forms/signals';
import {UsernameValidator} from './username-validator';

@Component({
  selector: 'app-registration',
  imports: [FormField],
  template: `...`,
})
export class Registration {
  registrationModel = signal({username: ''});

  private usernameValidator = inject(UsernameValidator);
  private cache = new Map<string, {available: boolean}>();

  // Custom resource factory with caching
  createUsernameResource = (usernameSignal: Signal<string | undefined>) => {
    return resource({
      params: () => usernameSignal(),
      loader: async ({params: username}) => {
        if (!username) return undefined;

        // Check cache first
        const cached = this.cache.get(username);
        if (cached !== undefined) return cached;

        // Use injected service for validation
        const result = await this.usernameValidator.checkAvailability(username);

        // Cache result
        this.cache.set(username, result);
        return result;
      },
    });
  };

  registrationForm = form(this.registrationModel, (schemaPath) => {
    validateAsync(schemaPath.username, {
      params: ({value}) => {
        const username = value();
        return username.length >= 3 ? username : undefined;
      },
      factory: this.createUsernameResource,
      onSuccess: (result) => {
        return result?.available
          ? null
          : {
              kind: 'usernameTaken',
              message: 'Username taken',
            };
      },
      onError: (error) => {
        console.error('Validation failed:', error);
        return {
          kind: 'serverError',
          message: 'Could not verify username',
        };
      },
    });
  });
}
```

The `params` function runs on every value change. Return `undefined` to skip validation. The `factory` function runs once during setup and receives params as a signal. The resource updates automatically when params change.

### Using Observable-based services

If your application has existing services that return Observables, use `rxResource` from `@angular/core/rxjs-interop`:

```ts
import {Component, inject, signal, Signal} from '@angular/core';
import {rxResource} from '@angular/core/rxjs-interop';
import {form, validateAsync, FormField} from '@angular/forms/signals';
import {UsernameService} from './username-service';

@Component({
  selector: 'app-registration',
  imports: [FormField],
  template: `...`,
})
export class Registration {
  registrationModel = signal({username: ''});

  private usernameService = inject(UsernameService);

  private createUsernameResource = (usernameSignal: Signal<string | undefined>) => {
    return rxResource({
      request: () => usernameSignal(),
      stream: ({request: username}) => this.usernameService.checkUsername(username),
    });
  };

  registrationForm = form(this.registrationModel, (schemaPath) => {
    validateAsync(schemaPath.username, {
      params: ({value}) => value() || undefined,
      factory: this.createUsernameResource,
      onSuccess: (result) =>
        result?.available ? null : {kind: 'usernameTaken', message: 'Username taken'},
      onError: () => ({
        kind: 'serverError',
        message: 'Could not verify username',
      }),
    });
  });
}
```

The `rxResource` function works directly with Observables and handles subscription cleanup automatically when the field value changes.

## Understanding pending state

When async validation runs, the field's `pending()` signal returns `true`. During this time:

- `valid()` returns `false`
- `invalid()` returns `false`
- `errors()` returns an empty array
- `submit()` waits for validation to complete

Show the pending state in your template to provide feedback:

```angular-html
<input [formField]="loginForm.username" />

@if (loginForm.username().pending()) {
  <span class="loading">Checking availability...</span>
}

@if (loginForm.username().touched() && loginForm.username().invalid()) {
  @for (error of loginForm.username().errors(); track $index) {
    <span class="error">{{ error.message }}</span>
  }
}
```

Disable form submission while validation is pending:

```angular-html
<button
  type="submit"
  [disabled]="loginForm().pending()"
>
  @if (loginForm().pending()) {
    Validating...
  } @else {
    Submit
  }
</button>
```

TIP: See the [Field State Management guide](guide/forms/signals/field-state-management) for more patterns using `pending()`, `valid()`, and `invalid()` signals.

### Validation execution order

Async validation only runs after synchronous validation passes. This prevents unnecessary server requests for invalid input:

```ts
import {form, required, minLength, validateHttp} from '@angular/forms/signals';

form(model, (schemaPath) => {
  // 1. These synchronous validation rules run first
  required(schemaPath.username);
  minLength(schemaPath.username, 3);

  // 2. This async validation rule only runs if synchronous validation passes
  validateHttp(schemaPath.username, {
    request: ({value}) => `/api/check?username=${value()}`,
    onSuccess: (result) =>
      result.valid
        ? null
        : {
            kind: 'usernameTaken',
            message: 'Username taken',
          },
    onError: () => ({
      kind: 'serverError',
      message: 'Validation failed',
    }),
  });
});
```

This execution order improves performance by reducing server load and catching format errors instantly.

### Request cancellation

When a field value changes, Signal Forms automatically cancels any pending async validation request for that field. This prevents race conditions and ensures validation always reflects the current value. You don't need to implement cancellation logic yourself.

## Best practices

### Combine with synchronous validation

Always validate format before making async requests. This catches errors instantly and prevents unnecessary server requests:

```ts
import {form, required, email, validateHttp} from '@angular/forms/signals';

form(model, (schemaPath) => {
  // Validate format first
  required(schemaPath.email);
  email(schemaPath.email);

  // Then check availability
  validateHttp(schemaPath.email, {
    request: ({value}) => `/api/emails/check?email=${value()}`,
    onSuccess: (result) =>
      result.available
        ? null
        : {
            kind: 'emailInUse',
            message: 'Email already in use',
          },
    onError: () => ({
      kind: 'serverError',
      message: 'Could not verify email',
    }),
  });
});
```

### Skip validation when appropriate

Return `undefined` from the `request` function to skip validation. Use this to avoid validating empty fields or values that don't meet minimum requirements:

```ts
import {validateHttp} from '@angular/forms/signals';

validateHttp(schemaPath.username, {
  request: ({value}) => {
    const username = value();
    // Skip validation for empty or short usernames
    if (!username || username.length < 3) return undefined;

    return `/api/users/check?username=${username}`;
  },
  onSuccess: (result) =>
    result.valid
      ? null
      : {
          kind: 'usernameTaken',
          message: 'Username taken',
        },
  onError: () => ({
    kind: 'serverError',
    message: 'Validation failed',
  }),
});
```

### Handle errors gracefully

Provide clear, user-friendly error messages. Log technical details for debugging but show simple messages to users:

```ts
import {validateHttp} from '@angular/forms/signals';

validateHttp(schemaPath.field, {
  request: ({value}) => `/api/validate?field=${value()}`,
  onSuccess: (result) => {
    if (result.valid) return null;
    // Use server message when available
    return {
      kind: 'serverError',
      message: result.message || 'Validation failed',
    };
  },
  onError: (error) => {
    // Log for debugging
    console.error('Validation request failed:', error);

    // Show user-friendly message
    return {
      kind: 'serverError',
      message: 'Unable to validate. Please try again later.',
    };
  },
});
```

### Show clear feedback

Use the `pending()` signal to show when validation is happening. This helps users understand delays and provides better perceived performance:

```angular-html
@if (field().pending()) {
  <span class="checking">
    <span class="spinner"></span>
    Checking...
  </span>
}
@if (field().valid() && !field().pending()) {
  <span class="success">Available</span>
}
@if (field().invalid()) {
  <span class="error">{{ field().errors()[0]?.message }}</span>
}
```

## Next steps

This guide covered async validation with `validateHttp()` and `validateAsync()`. Related guides explore other aspects of Signal Forms:

<docs-pill-row>
  <docs-pill href="guide/forms/signals/validation" title="Validation"/>
  <docs-pill href="guide/forms/signals/field-state-management" title="Field State Management"/>
</docs-pill-row>

For detailed API documentation, see:

- [`validateHttp()`](api/forms/signals/validateHttp) - HTTP-based async validation
- [`validateAsync()`](api/forms/signals/validateAsync) - Custom resource-based async validation
- [`httpResource()`](api/common/http/httpResource) - Angular's HTTP resource API
- [`resource()`](api/core/resource) - Angular's resource primitive
