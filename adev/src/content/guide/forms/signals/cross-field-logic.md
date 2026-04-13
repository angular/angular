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

NOTE: When a rule involves multiple fields, you need to decide where the error belongs: on a specific field, on multiple fields, or on the parent. In general, place the error where the user would most likely go to fix the problem.

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

For example, a confirm-password field should only check for a match once the user has interacted with the password field. If the user hasn't touched the password yet, flagging a mismatch on the confirmation is premature:

```ts
import {Component, signal} from '@angular/core';
import {form, validate} from '@angular/forms/signals';

@Component({
  /* ... */
})
export class PasswordForm {
  passwordModel = signal({
    password: '',
    confirmPassword: '',
  });

  passwordForm = form(this.passwordModel, (schemaPath) => {
    validate(schemaPath.confirmPassword, ({value, valueOf, stateOf}) => {
      if (!stateOf(schemaPath.password).touched()) {
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

WARNING: Be careful not to read state which depends on your field's validation, as that creates a circular loop. For example, a validator which checks whether the parent field is valid will create an infinite loop because the parent's validity depends on its children's validity (which includes your validator).

## Using validateTree

The examples so far use `validate()` to check individual fields. Sometimes you need to validate a group of fields where the logic is inherently about multiple fields in a group, and direct errors to specific children within it. `validateTree` handles is ideal for these kinds of scenarios.

For example, in a Sudoku puzzle, each row must contain unique numbers. This is a group-level rule: you check the entire row, then flag the specific cells that violate it. This kind of validation can't be expressed cleanly with `validate` on individual fields, because each cell would need to know about every other cell.

```ts
import {Component, signal} from '@angular/core';
import {form, validateTree} from '@angular/forms/signals';

@Component({
  /* ... */
})
export class SudokuRow {
  rowModel = signal({
    cell1: 1,
    cell2: 3,
    cell3: 1,
    cell4: 4,
  });

  rowForm = form(this.rowModel, (schemaPath) => {
    validateTree(schemaPath, ({value, fieldTreeOf}) => {
      const row = value();
      const entries = [
        {val: row.cell1, fieldTree: fieldTreeOf(schemaPath.cell1)},
        {val: row.cell2, fieldTree: fieldTreeOf(schemaPath.cell2)},
        {val: row.cell3, fieldTree: fieldTreeOf(schemaPath.cell3)},
        {val: row.cell4, fieldTree: fieldTreeOf(schemaPath.cell4)},
      ];

      const counts = new Map<number, number>();
      for (const {val} of entries) {
        if (val !== 0) {
          counts.set(val, (counts.get(val) ?? 0) + 1);
        }
      }

      const errors = entries
        .filter(({val}) => val !== 0 && (counts.get(val) ?? 0) > 1)
        .map(({val, fieldTree}) => ({
          kind: 'duplicateInRow',
          message: `${val} already appears in this row`,
          fieldTree,
        }));

      return errors.length > 0 ? errors : null;
    });
  });
}
```

The validator runs on the parent field (the row), reads all cell values, counts duplicates, and returns an error for each cell that contains a repeated number. The `fieldTree` property on each error tells Angular exactly which cell should show the error. Without `fieldTree`, the errors would apply to the row itself — not where the user needs to see them.

Because `validateTree` can return an array of errors, a single validator can flag multiple cells at once. Each error includes a `fieldTree` pointing to its target, so Angular routes the errors to the correct fields.

### When to use validateTree vs validate

Prefer `validate()` with `valueOf()` when the error belongs on the field being validated — even if the rule reads from other fields. Reach for `validateTree` when:

- The validation logic is inherently about a group of fields, not any single field
- The validator needs to return errors targeting different child fields

TIP: For an introduction to `validateTree` and its return type, see the [Validation guide](/guide/forms/signals/validation).

## Next steps

This guide covered the field context API and common cross-field patterns. To learn more about related Signal Forms guide, check out:

<docs-pill-row>
  <docs-pill href="guide/forms/signals/validation" title="Validation" />
  <docs-pill href="guide/forms/signals/field-state-management" title="Field state management" />
  <docs-pill href="guide/forms/signals/custom-controls" title="Custom controls" />
</docs-pill-row>
