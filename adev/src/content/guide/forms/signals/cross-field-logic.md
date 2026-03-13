# Cross-field logic

**Cross-field logic** is necessary when any rule, validation, or behavior of one field depends on another field's value or state.

Signal forms provide a **field context** to every rule function. The field context provides access to the current field's value and state, and lets you read other fields in the form using `valueOf()`, `stateOf()`, and `fieldTreeOf()`.

This guide covers the field context API in depth and shows common cross-field patterns. For single-field validation, see the [Validation guide](/guide/forms/signals/validation).

## Understanding the field context

Every rule function in signal forms receives a **field context** parameter, which is an object that describes the current field and provides access to the rest of the form.

There are three properties you can access for the current field:

| Property    | Type                 | Description                                                          |
| ----------- | -------------------- | -------------------------------------------------------------------- |
| `value`     | `Signal<TValue>`     | The current field's value as a signal                                |
| `state`     | `FieldState<TValue>` | The current field's state (such as validity, errors, touched, dirty) |
| `fieldTree` | `FieldTree<TValue>`  | The current field's tree, for programmatic access to child fields    |

For cross-field logic, the following three properties allow you to access other parts of the form:

| Property        | Type                           | Description                                                                                                                        |
| --------------- | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| `valueOf()`     | `(path) => PValue`             | Most common. Use when you need another field's raw value for comparisons or calculations.                                          |
| `stateOf()`     | `(path) => FieldState<PValue>` | Use when your logic depends on another field's state, such as whether it's valid, touched, or dirty.                               |
| `fieldTreeOf()` | `(path) => FieldTree<PModel>`  | Use when you need programmatic access to another field's tree, such as pushing errors to a specific child field with validateTree. |

Here is an example of using `value` and `valueOf()` to validate that the current field (end date) comes after the start date in the form:

```ts
import {Component, signal} from '@angular/core';
import {form, validate} from '@angular/forms/signals';

@Component({
  /* ... */
})
export class EventForm {
  eventModel = signal({
    startDate: new Date('2026-06-01'),
    endDate: new Date('2026-06-05'),
  });

  eventForm = form(this.eventModel, (schemaPath) => {
    validate(schemaPath.endDate, (fieldContext) => {
      if (fieldContext.value() <= fieldContext.valueOf(schemaPath.startDate)) {
        return {
          kind: 'invalidDateRange',
          message: 'End date must be after start date',
        };
      }

      return null;
    });
  });
}
```

NOTE: The `fieldContext` parameter is typically destructured to pull out only what the rule needs. The remaining examples in this guide use this pattern.

## Cross-field validation patterns

The date range example from the previous section validates the end date against the start date. Because the rule reads `valueOf(schemaPath.startDate)`, it re-evaluates automatically whenever either date changes. In other words, a single validator is enough to keep the error state correct.

However, that single validator only places the error on the end date field. If you want both fields to show an error when the range is invalid, add a matching validation rule to each field:

```ts
import {Component, signal} from '@angular/core';
import {form, validate} from '@angular/forms/signals';

@Component({
  /* ... */
})
export class EventForm {
  eventModel = signal({
    startDate: new Date('2026-06-01'),
    endDate: new Date('2026-06-05'),
  });

  eventForm = form(this.eventModel, (schemaPath) => {
    validate(schemaPath.startDate, ({value, valueOf}) => {
      if (value() >= valueOf(schemaPath.endDate)) {
        return {
          kind: 'invalidDateRange',
          message: 'Start date must be before end date',
        };
      }
      return null;
    });

    validate(schemaPath.endDate, ({value, valueOf}) => {
      if (value() <= valueOf(schemaPath.startDate)) {
        return {
          kind: 'invalidDateRange',
          message: 'End date must be after start date',
        };
      }
      return null;
    });
  });
}
```

Both rules make use of `valueOf()` to read the other field. Because each rule is reactive, changing either date re-evaluates both validations automatically.

### Conditional requirements

In some forms, certain fields are only required under certain conditions. For example, a registration form might require a company name only when the user selects a business account type:

```ts
import {Component, signal} from '@angular/core';
import {form, required} from '@angular/forms/signals';

@Component({
  /* ... */
})
export class RegistrationForm {
  registrationModel = signal({
    accountType: 'personal' as 'personal' | 'business',
    companyName: '',
  });

  registrationForm = form(this.registrationModel, (schemaPath) => {
    required(schemaPath.companyName, {
      when: ({valueOf}) => valueOf(schemaPath.accountType) === 'business',
      message: 'Company name is required for business accounts',
    });
  });
}
```

The `when` option receives the same field context as any other rule function, so `valueOf` works the same way. When the user switches back to `'personal'`, the condition re-evaluates and the requirement — along with its error — clears automatically.

Using `required()` with `when` instead of a manual `validate()` check also adds proper required metadata to the field, which enables accessibility features like marking the field as required for screen readers.

### Validating based on another field's state

The examples so far use `valueOf()` to read another field's value. Sometimes your logic depends on another field's _state_ instead — whether it's valid, touched, or dirty. Use `stateOf()` for this.

For example, a confirm-password field should only check for a match when the password field itself is valid. If the password is too short, flagging a mismatch on the confirmation is just noise:

```ts
import {Component, signal} from '@angular/core';
import {form, validate, minLength} from '@angular/forms/signals';

@Component({
  /* ... */
})
export class PasswordForm {
  passwordModel = signal({
    password: '',
    confirmPassword: '',
  });

  passwordForm = form(this.passwordModel, (schemaPath) => {
    minLength(schemaPath.password, 8);

    validate(schemaPath.confirmPassword, ({value, valueOf, stateOf}) => {
      if (stateOf(schemaPath.password).invalid()) {
        return null;
      }
      if (value() !== valueOf(schemaPath.password)) {
        return {
          kind: 'passwordMismatch',
          message: 'Passwords do not match',
        };
      }
      return null;
    });
  });
}
```

The `stateOf()` call returns the other field's [field state](api/forms/signals/FieldState), giving you access to signals like `invalid()`, `touched()`, and `dirty()`. Because these are signals, the rule re-evaluates whenever the password field's validity changes.

## Using validateTree

The examples so far use `validate()` to add an error to the field being validated. But sometimes the error belongs on a _different_ field. For example, a shipping form might need to restrict shipping methods based on package weight — the validation logic needs both fields, but the error should appear on the shipping method field.

`validateTree` handles this by letting you specify which field receives the error:

```ts
import {Component, signal} from '@angular/core';
import {form, validateTree} from '@angular/forms/signals';

@Component({
  /* ... */
})
export class ShippingForm {
  shippingModel = signal({
    packageWeight: 0,
    shippingMethod: 'standard' as 'standard' | 'express' | 'freight',
  });

  shippingForm = form(this.shippingModel, (schemaPath) => {
    validateTree(schemaPath, ({valueOf, fieldTreeOf}) => {
      if (
        valueOf(schemaPath.packageWeight) > 50 &&
        valueOf(schemaPath.shippingMethod) === 'standard'
      ) {
        return {
          kind: 'shippingUnavailable',
          message: 'Standard shipping is not available for packages over 50 lbs',
          fieldTree: fieldTreeOf(schemaPath.shippingMethod),
        };
      }
      return null;
    });
  });
}
```

The `fieldTree` property on the returned error tells Angular which field should receive the error. Without it, the error would apply to the root form — not where the user needs to see it.

### When to use validateTree vs validate

Prefer `validate()` with `valueOf()` when the error belongs on the field being validated. Reach for `validateTree` when:

- The error needs to appear on a different field than where the logic runs
- The validation logic spans multiple fields and the error target isn't the field being checked

TIP: For an introduction to `validateTree` and its return type, see the [Validation guide](/guide/forms/signals/validation).

## Next steps

This guide covered the field context API and common cross-field patterns. To learn more about related Signal Forms guide, check out:

<docs-pill-row>
  <docs-pill href="guide/forms/signals/validation" title="Validation" />
  <docs-pill href="guide/forms/signals/field-state-management" title="Field state management" />
  <docs-pill href="guide/forms/signals/custom-controls" title="Custom controls" />
</docs-pill-row>
