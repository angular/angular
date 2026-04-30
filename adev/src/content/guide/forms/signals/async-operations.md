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
import {Component, signal} from '@angular/core';
import {form, validateHttp, FormField} from '@angular/forms/signals';

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
  `,
})
export class Registration {
  registrationModel = signal({username: ''});

  registrationForm = form(this.registrationModel, (schemaPath) => {
    validateHttp(schemaPath.username, {
      request: ({value}) => {
        const username = value();
        return username ? `/api/users/check?username=${username}` : undefined;
      },
      onSuccess: (response) => {
        return response.available
          ? null
          : {
              kind: 'usernameTaken',
              message: 'Username is already taken',
            };
      },
      onError: (error) => {
        console.error('Validation request failed:', error);
        return {
          kind: 'serverError',
          message: 'Could not verify username availability',
        };
      },
    });
  });
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
      params: () => usernameSignal(),
      stream: ({params: username}) => this.usernameService.checkUsername(username),
    });
  };

  registrationForm = form(this.registrationModel, (schemaPath) => {
    validateAsync(schemaPath.username, {
      params: ({value}) => value(),
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

## Debouncing

The `debounce` rule delays when a user's input is committed to the form model. You can think of it as the rule holding back values until the user pauses typing. This is useful when downstream behavior shouldn't react to every keystroke, such as expensive derived computations, validation that flashes errors mid-word, or search filters that reapply on each character.

Add the `debounce` rule inside a schema to delay how a form field's UI changes reach the form model. In its simplest form, `debounce(path, ms)` holds each UI change for the given number of milliseconds before writing it to the model. A new change within that window resets the timer.

The following example applies `debounce` and `validateHttp` to the username field to delay the username availability check in a registration form until the user pauses typing:

```angular-ts
import {Component, signal} from '@angular/core';
import {form, debounce, validateHttp, FormField} from '@angular/forms/signals';

@Component({
  selector: 'app-registration',
  imports: [FormField],
  template: `
    <label>
      Username:
      <input [formField]="registrationForm.username" />
    </label>

    @if (registrationForm.username().pending()) {
      <span class="checking">Checking availability...</span>
    }
  `,
})
export class Registration {
  registrationModel = signal({username: ''});

  registrationForm = form(this.registrationModel, (schemaPath) => {
    // Hold UI updates for 300 ms before writing to the model
    debounce(schemaPath.username, 300);

    // Runs against the debounced model value, not every keystroke
    validateHttp(schemaPath.username, {
      request: ({value}) => {
        const username = value();
        // Skip the request for blank values
        return username ? `/api/users/check?username=${username}` : undefined;
      },
      onSuccess: (response) =>
        response.available ? null : {kind: 'usernameTaken', message: 'Username is already taken'},
      onError: () => ({
        kind: 'serverError',
        message: 'Could not verify username availability',
      }),
    });
  });
}
```

With a 300 ms debounce, the model updates and validates only after the user pauses typing longer than the configured duration. For example, typing "signal forms" in a quick burst fires one validation request instead of twelve.

### Touch flushes the model

Regardless of the debounce duration, the framework writes the field's `controlValue()` to the model immediately when the field becomes touched. Native inputs become touched on blur, so a user who finishes typing and tabs away doesn't have to wait for the debounce timer to expire. Custom controls can mark the field as touched in response to any event they choose.

In the typical case, this matters for form submission. When the user clicks a submit button, the focused input blurs, which touches that field and flushes its pending debounce before the submission handler runs.

### Commit only on blur

Some fields shouldn't update mid-typing at all, and instead should only update after the user has finished entering a value. For example, if you have a search filter that reapplies on every change or a form that triggers expensive derived state, it is often better for the model to wait until the user finishes typing.

In these scenarios, pass `'blur'` instead of a duration to defer all updates until the field becomes touched:

```ts
form(this.registrationModel, (schemaPath) => {
  debounce(schemaPath.username, 'blur');
});
```

With `'blur'`, the model keeps its previous value while the user is typing. Sync and async validation, derived signals, and any reactive rules reading the field all see the previous value until the field becomes touched. This commonly occurs when the user blurs a native input, or when a custom control signals touch on its own.

### Custom timing logic

For timing logic that a duration or `'blur'` can't express, pass a `Debouncer` function. The function receives the field context and an [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal), and returns a `Promise<void>` that resolves when the model should update:

```ts
import {debounce, type Debouncer} from '@angular/forms/signals';

const shorterWhenLonger: Debouncer<string> = ({value}, abortSignal) => {
  // Shorter queries get a longer delay since the user is likely still typing.
  const ms = value().length < 3 ? 500 : 200;
  return new Promise((resolve) => {
    const timeoutId = setTimeout(resolve, ms);
    // Abort fires when this field is touched or its value changes, so the pending timer is cleared
    abortSignal.addEventListener(
      'abort',
      () => {
        clearTimeout(timeoutId);
        resolve();
      },
      {once: true},
    );
  });
};

form(this.registrationModel, (schemaPath) => {
  debounce(schemaPath.username, shorterWhenLonger);
});
```

The `abortSignal` fires when the field is touched, or when its value changes before the debounce resolves. Resolve the promise on abort so your debouncer releases any pending timers. The framework writes the pending value to the model on touch, and discards it when a newer value arrives. See the [`debounce` API reference](api/forms/signals/debounce) for the full `Debouncer` signature.

### Debouncing a single async validator

The `debounce` rule holds back every reaction to the field, from sync validation to derived signals to async validation. However, there are times when you want the opposite: cheap sync validators like `required` or `email` running immediately for instant feedback, while only the expensive async call waits for the user to settle. Both `validateHttp()` and `validateAsync()` accept their own [`debounce` option](api/forms/signals/validateAsync) that throttles just that validator:

```ts
form(this.registrationModel, (schemaPath) => {
  validateHttp(schemaPath.username, {
    // Throttles only this HTTP call
    debounce: 300,
    request: ({value}) => {
      const username = value();
      // Skip the request for blank values
      return username ? `/api/users/check?username=${username}` : undefined;
    },
    onSuccess: (response) =>
      response.available ? null : {kind: 'usernameTaken', message: 'Username is already taken'},
    onError: () => ({
      kind: 'serverError',
      message: 'Could not verify username availability',
    }),
  });
});
```

The model still updates on every keystroke, and any other rules attached to the field still react immediately. Only the HTTP request is debounced: each change waits 300 ms of quiet before firing, so a request only goes out once the user has paused typing.

Choose between the two layers based on scope:

| Option                                                        | When to use                                                                                                                         |
| ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `debounce()` rule                                             | Sync validation, derived state, and submission should all wait until the field commits. The whole field shouldn't react mid-typing. |
| `validateHttp({ debounce })` or `validateAsync({ debounce })` | Cheap sync validators should give immediate feedback, but expensive async calls should wait for the user to pause.                  |

Both options accept a duration in milliseconds. Their custom-timing callbacks differ: the form-level rule takes a `Debouncer`, and the validator-level option takes a `DebounceTimer` from `@angular/core`. The two signatures are not interchangeable.

## Composing resources in async validation with a factory

The built-in [`debounce` option](api/forms/signals/validateAsync) covers throttling, but `validateAsync()` exposes a deeper composition point: the `factory` function. The factory receives the params as a signal and returns a resource. Between those two points, you're free to compose whatever you need.

In its simplest form, a factory wraps a single resource. A username-availability check can live as a method on the component class, and then be wired into `validateAsync` by reference:

```ts
export class Registration {
  registrationModel = signal({username: ''});
  private usernameValidator = inject(UsernameValidator);

  // Factory function
  checkUsernameAvailable = (username: Signal<string | undefined>) =>
    resource({
      params: () => username(),
      loader: async ({params: name}) => this.usernameValidator.checkAvailability(name),
    });

  registrationForm = form(this.registrationModel, (schemaPath) => {
    validateAsync(schemaPath.username, {
      params: ({value}) => {
        const username = value();
        // Skip validation for short usernames
        return username.length >= 3 ? username : undefined;
      },
      debounce: 300,
      // Reference to the factory defined above
      factory: this.checkUsernameAvailable,
      onSuccess: (result) =>
        result?.available ? null : {kind: 'usernameTaken', message: 'Username taken'},
      onError: () => ({kind: 'serverError', message: 'Could not verify'}),
    });
  });
}
```

The `params` callback returns `undefined` for short usernames, signaling that validation should skip. With `debounce: 300` applied, the resource waits until the user pauses typing for 300 ms before acting on each change. It then runs the loader for valid usernames and stays idle once the debounced value settles to `undefined`.

### Combining debounce with additional logic

When you need logic beyond a plain duration debounce, use a custom factory to combine debouncing with that logic. A common case is caching validated responses. For example, once the server has confirmed a username, you don't need to ask again on subsequent keystrokes that revisit the same value.

```ts
export class Registration {
  registrationModel = signal({username: ''});
  private usernameValidator = inject(UsernameValidator);

  registrationForm = form(this.registrationModel, (schemaPath) => {
    validateAsync(schemaPath.username, {
      params: ({value}) => {
        const username = value();
        return username.length >= 3 ? username : undefined;
      },
      factory: (username) => {
        // Core primitive: settles 300 ms after the source stops changing
        const debouncedUsername = debounced(username, 300);
        // Cache lives in the factory's closure and persists for the field's lifetime
        const cache = new Map<string, {available: boolean}>();
        return resource({
          // Read from the debounced signal, not the raw one
          params: () => debouncedUsername.value(),
          loader: async ({params: name}) => {
            const cached = cache.get(name);
            if (cached) return cached;

            const result = await this.usernameValidator.checkAvailability(name);
            cache.set(name, result);
            return result;
          },
        });
      },
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

The `cache` lives in the factory's closure, so it persists for the field's lifetime. Once the user has typed a username the server has already checked, the loader reads from the cache instead of making a new network request.

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
<button type="submit" [disabled]="loginForm().pending()">
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
