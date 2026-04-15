# Form submission

When a user submits a form, your application typically needs to handle multiple concerns at once: surfacing validation errors, preventing duplicate submission, sending data to a server, and much more. Handling each of these manually can be tedious and prone to error.

Signal Forms provides a `submit()` function that helps you manage the form submission lifecycle. This guide walks through how to use it.

## What does `submit()` do?

The `submit()` function runs through a specific sequence:

1. **Mark interactive fields as touched** — Fields that display errors only after being touched will now show their validation errors. Hidden, disabled, and readonly fields are skipped.
1. **Check validation** — If any validation rules have failed, submission stops and the `action` function does not run.
1. **Run the action** — The `action` function executes with the form's current value. While it runs, `submitting()` returns `true`.
1. **Handle the result** — If the action returns errors, they are routed to their target fields. If it returns nothing, the submission is treated as successful.

The `submit()` function returns a `Promise<boolean>` that resolves to `true` when the action completes without errors, and `false` when validation fails or the action returns errors.

## Setting up form submission with `FormRoot`

The most common way to use the `submit()` function is through the `FormRoot` directive.

The `FormRoot` directive handles three things automatically when bound to a `<form>` element:

1. **Sets [`novalidate`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/form#novalidate)** — Disables the browser's built-in validation so Signal Forms manages validation instead
1. **Prevents default** — Stops the browser from navigating on form submission
1. **Calls `submit()`** — Triggers the submission flow when the user submits the form

NOTE: The `FormRoot` directive sets the `novalidate` attribute on the `form` element automatically. You do not need to add it manually when using `FormRoot`.

`FormRoot` handles the submission event, but you still need to tell it _what to do_ with the form data. That requires three things:

1. Bind your form to the `FormRoot` directive
1. Pass a `submission` option to the `form()` function
1. Define an `action` function within the `submission` option that manages the submitted data

```angular-ts
import {Component, signal} from '@angular/core';
import {form, FormField, FormRoot, required} from '@angular/forms/signals';

@Component({
  selector: 'app-contact',
  imports: [FormField, FormRoot],
  template: `
    <form [formRoot]="contactForm">
      <label>
        Name
        <input [formField]="contactForm.name" />
      </label>

      <label>
        Email
        <input type="email" [formField]="contactForm.email" />
      </label>

      <button type="submit">Send</button>
    </form>
  `,
})
export class Contact {
  contactModel = signal({
    name: '',
    email: '',
  });

  contactForm = form(
    this.contactModel,
    (schemaPath) => {
      required(schemaPath.name);
      required(schemaPath.email);
    },
    {
      submission: {
        action: async (field) => {
          const result = await saveContact(field().value());
          if (result.ok) return;

          return {kind: 'serverError', message: 'Failed to submit form'};
        },
      },
    },
  );
}
```

The `action` function runs only when no validation rules have failed. By default, pending async validators do not block submission (see [Controlling validation gating](#controlling-validation-gating-with-ignorevalidators) for more details). The action receives the field tree and a `detail` object with `root` and `submitted` field trees, which is useful when submitting a sub-form.

After validation passes, the action itself may still fail due to scenarios such as a network error or duplicate entry. In those cases, you can surface the failure by returning the error(s). On the other hand, to indicate success, you only need to return `null` or `undefined`, or call an empty `return`.

## Showing submission state with `submitting()`

When you need to track whether the form is in the process of submitting, Signal Forms provides a `submitting()` signal that returns `true` while the `action` function is running. Use it to show loading indicators or disable the submit button to prevent duplicate submissions.

```angular-html
<button type="submit" [disabled]="contactForm().submitting()">
  @if (contactForm().submitting()) {
    Sending...
  } @else {
    Send
  }
</button>
```

Once the `action` function succeeds or returns an error, the `submitting()` signal automatically resets back to `false`.

## Managing submission errors

### Server errors

When your `action` function communicates with a server, the server may return errors that need to appear on specific fields. Return these errors from the `action` to route them to their target fields.

#### Errors on the submitted field

By default, errors returned from the `action` are assigned to the submitted field (the field tree you passed to `submit()`):

```ts
action: async (field) => {
  const result = await saveContact(field().value());
  if (result.ok) return;

  return {kind: 'serverError', message: 'Failed to submit form'};
};
```

#### Errors on specific fields

When you want to route an error to a specific field, include a `fieldTree` property pointing to that field:

```ts
action: async (field) => {
  const result = await saveContact(field().value());
  if (result.ok) return;

  return {kind: 'taken', message: result.message, fieldTree: field.email};
};
```

#### Multiple errors

When you want to report errors on multiple fields, return an array:

```ts
action: async (field) => {
  const result = await registerUser(field().value());
  if (result.ok) return;

  return result.errors.map((err: {field: string; message: string}) => ({
    kind: 'serverError',
    message: err.message,
    fieldTree: field[err.field as keyof typeof field],
  }));
};
```

### Auto-clearing submission errors

Submission errors clear automatically when the user edits the field. If the `action` returns an error on the email field, that error disappears as soon as the user changes the email value.

This differs from validation errors, which recompute reactively. Validation rules run again on each change and may produce the same error. Submission errors are one-time results from the server — once cleared, they do not reappear unless the form is submitted again.

TIP: Submission errors appear alongside validation errors in the field's `errors()` signal. For guidance on displaying errors in your template, see the [Field State Management guide](guide/forms/signals/field-state-management).

## Handling invalid submissions with `onInvalid`

When validation fails, the `action` function does not run. If you need to respond to a failed submission attempt — such as scrolling to the first error, showing a toast, or focusing an invalid field — use the `onInvalid` callback.

```ts
contactForm = form(
  this.contactModel,
  (schemaPath) => {
    required(schemaPath.name);
    required(schemaPath.email);
  },
  {
    submission: {
      action: async (field) => {
        await saveContact(field().value());
      },
      onInvalid: (field) => {
        const firstError = field().errorSummary()[0];
        firstError?.fieldTree().focusBoundControl();
      },
    },
  },
);
```

The `onInvalid` callback receives the same `(field, detail)` parameters as `action`. It runs after all interactive fields are marked as touched, so validation errors are already visible in the UI when it executes.

## Controlling validation gating with `ignoreValidators`

By default, `submit()` ignores pending validators. If no validators have failed, the action runs even if some async validators are still in progress. The `ignoreValidators` option gives you control over this behavior.

| Value       | Behavior                                                                 |
| ----------- | ------------------------------------------------------------------------ |
| `'pending'` | Submit if no validators have failed, even if some are pending (default)  |
| `'none'`    | Submit only if all validators pass — pending validators block submission |
| `'all'`     | Always submit regardless of validation state                             |

```ts
contactForm = form(
  this.contactModel,
  (schemaPath) => {
    required(schemaPath.name);
    required(schemaPath.email);
  },
  {
    submission: {
      action: async (field) => {
        await saveContact(field().value());
      },
      ignoreValidators: 'none',
    },
  },
);
```

Use `'none'` when your form has async validators (such as checking username availability) and you need all validation to complete before submitting. Use `'all'` for draft-saving scenarios where you want to persist data regardless of validation state.

## Manual submission with `submit()`

The `FormRoot` directive is the most common way to trigger submission, but you can also call `submit()` directly. This is useful for multi-step wizards, auto-save, or triggering submission from outside the form element.

```angular-ts
import {Component, signal} from '@angular/core';
import {form, FormField, required, submit} from '@angular/forms/signals';

@Component({
  selector: 'app-contact',
  imports: [FormField],
  template: `
    <label>
      Name
      <input [formField]="contactForm.name" />
    </label>

    <label>
      Email
      <input type="email" [formField]="contactForm.email" />
    </label>

    <button (click)="onSave()">Save</button>
  `,
})
export class Contact {
  contactModel = signal({
    name: '',
    email: '',
  });

  contactForm = form(this.contactModel, (schemaPath) => {
    required(schemaPath.name);
    required(schemaPath.email);
  });

  async onSave() {
    // When calling `submit()` directly, you pass the action as the second argument
    // instead of configuring it in `FormOptions`.
    const success = await submit(this.contactForm, async (field) => {
      const result = await saveContact(field().value());
      if (result.ok) return;

      return {kind: 'serverError', message: 'Failed to save'};
    });

    if (success) {
      // Handle success — navigate, show confirmation, etc.
    }
  }
}
```

## Handling side effects

The `submit()` function returns a `Promise<boolean>` — `true` when the action completes without errors, `false` when validation fails or the action returns errors. Use this to trigger side effects like navigation or notifications.

```ts
async onSave() {
  const success = await submit(this.contactForm, async (field) => {
    await saveContact(field().value());
  });

  if (success) {
    await this.router.navigate(['/confirmation']);
  }
}
```

When the action produces data that a side effect needs, such as a server-generated ID, handle the side effect inside the action:

```ts
async onSave() {
  await submit(this.contactForm, async (field) => {
    const contact = await createContact(field().value());
    await this.router.navigate(['/confirmation', contact.id]);
  });
}
```

When using `FormRoot`, side effects also go inside the `action` since `FormRoot` calls `submit()` internally:

```ts
submission: {
  action: async (field) => {
    const result = await saveContact(field().value());
    if (result.ok) {
      await this.router.navigate(['/confirmation']);
      return;
    }

    return {kind: 'serverError', message: 'Failed to submit form'};
  },
}
```

## Next steps

This guide covered submitting forms and handling form submission errors. Related guides explore other aspects of Signal Forms:

<docs-pill-row>
  <docs-pill href="guide/forms/signals/validation" title="Validation" />
  <docs-pill href="guide/forms/signals/field-state-management" title="Field state management" />
  <docs-pill href="guide/forms/signals/form-logic" title="Adding form logic" />
</docs-pill-row>
