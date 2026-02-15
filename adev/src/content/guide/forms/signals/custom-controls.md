# Custom Controls

NOTE: This guide assumes familiarity with [Signal Forms essentials](essentials/signal-forms).

The browser's built-in form controls (like input, select, textarea) handle common cases, but applications often need specialized inputs. A date picker with calendar UI, a rich text editor with formatting toolbar, or a tag selector with autocomplete all require custom implementations.

Signal Forms works with any component that implements specific interfaces. A **control interface** defines the properties and signals that allow your component to communicate with the form system. When your component implements one of these interfaces, the `[formField]` directive automatically connects your control to form state, validation, and data binding.

## Creating a basic custom control

Let's start with a minimal implementation and add features as needed.

### Minimal input control

A basic custom input only needs to implement the `FormValueControl` interface and define the required `value` model signal.

```angular-ts
import {Component, model} from '@angular/core';
import {FormValueControl} from '@angular/forms/signals';

@Component({
  selector: 'app-basic-input',
  template: `
    <div class="basic-input">
      <input
        type="text"
        [value]="value()"
        (input)="value.set($event.target.value)"
        placeholder="Enter text..."
      />
    </div>
  `,
})
export class BasicInput implements FormValueControl<string> {
  /** The current input value */
  value = model('');
}
```

### Minimal checkbox control

A checkbox-style control needs two things:

1. Implement the `FormCheckboxControl` interface so the `FormField` directive will recognize it as a form control
2. Provide a `checked` model signal

```angular-ts
import {Component, model, ChangeDetectionStrategy} from '@angular/core';
import {FormCheckboxControl} from '@angular/forms/signals';

@Component({
  selector: 'app-basic-toggle',
  template: `
    <button type="button" [class.active]="checked()" (click)="toggle()">
      <span class="toggle-slider"></span>
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BasicToggle implements FormCheckboxControl {
  /** Whether the toggle is checked */
  checked = model<boolean>(false);

  toggle() {
    this.checked.update((val) => !val);
  }
}
```

### Using your custom control

Once you've created a control, you can use it anywhere you would use a built-in input by adding the `FormField` directive to it:

```angular-ts
import {Component, signal, ChangeDetectionStrategy} from '@angular/core';
import {form, FormField, required} from '@angular/forms/signals';
import {BasicInput} from './basic-input';
import {BasicToggle} from './basic-toggle';

@Component({
  imports: [FormField, BasicInput, BasicToggle],
  template: `
    <form novalidate>
      <label>
        Email
        <app-basic-input [formField]="registrationForm.email" />
      </label>

      <label>
        Accept terms
        <app-basic-toggle [formField]="registrationForm.acceptTerms" />
      </label>

      <button type="submit" [disabled]="registrationForm().invalid()">Register</button>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Registration {
  registrationModel = signal({
    email: '',
    acceptTerms: false,
  });

  registrationForm = form(this.registrationModel, (schemaPath) => {
    required(schemaPath.email, {message: 'Email is required'});
    required(schemaPath.acceptTerms, {message: 'You must accept the terms'});
  });
}
```

NOTE: The schema callback parameter (`schemaPath` in these examples) is a `SchemaPathTree` object that provides paths to all fields in your form. You can name this parameter anything you like.

The `[formField]` directive works identically for custom controls and built-in inputs. Signal Forms treats them the same - validation runs, state updates, and data binding works automatically.

## Understanding control interfaces

Now that you've seen custom controls in action, let's explore how they integrate with Signal Forms.

### Control interfaces

The `BasicInput` and `BasicToggle` components you created implement specific control interfaces that tell Signal Forms how to interact with them.

#### FormValueControl

`FormValueControl` is the interface for most input types - text inputs, number inputs, date pickers, select dropdowns, and any control that edits a single value. When your component implements this interface:

- **Required property**: Your component must provide a `value` model signal
- **What the FormField directive does**: Binds the form field's value to your control's `value` signal

IMPORTANT: Controls implementing `FormValueControl` must NOT have a `checked` property

#### FormCheckboxControl

`FormCheckboxControl` is the interface for checkbox-like controls - toggles, switches, and any control that represents a boolean on/off state. When your component implements this interface:

- **Required property**: Your component must provide a `checked` model signal
- **What the FormField directive does**: Binds the form field's value to your control's `checked` signal

IMPORTANT: Controls implementing `FormCheckboxControl` must NOT have a `value` property

### Optional state properties

Both `FormValueControl` and `FormCheckboxControl` extend `FormUiControl` - a base interface that provides optional properties for integrating with form state.

All properties are optional. Implement only what your control needs.

#### Interaction state

Track when users interact with your control:

| Property  | Purpose                                          |
| --------- | ------------------------------------------------ |
| `touched` | Whether the user has interacted with the field   |
| `dirty`   | Whether the value differs from its initial state |

#### Validation state

Display validation feedback to users:

| Property  | Purpose                                 |
| --------- | --------------------------------------- |
| `errors`  | Array of current validation errors      |
| `valid`   | Whether the field is valid              |
| `invalid` | Whether the field has validation errors |
| `pending` | Whether async validation is in progress |

#### Availability state

Control whether users can interact with your field:

| Property          | Purpose                                                  |
| ----------------- | -------------------------------------------------------- |
| `disabled`        | Whether the field is disabled                            |
| `disabledReasons` | Reasons why the field is disabled                        |
| `readonly`        | Whether the field is readonly (visible but not editable) |
| `hidden`          | Whether the field is hidden from view                    |

NOTE: `disabledReasons` is an array of `DisabledReason` objects. Each object has a `field` property (reference to the field tree) and an optional `message` property. Access the message via `reason.message`.

#### Validation constraints

Receive validation constraint values from the form:

| Property    | Purpose                                              |
| ----------- | ---------------------------------------------------- |
| `required`  | Whether the field is required                        |
| `min`       | Minimum numeric value (`undefined` if no constraint) |
| `max`       | Maximum numeric value (`undefined` if no constraint) |
| `minLength` | Minimum string length (undefined if no constraint)   |
| `maxLength` | Maximum string length (undefined if no constraint)   |
| `pattern`   | Array of regular expression patterns to match        |

#### Field metadata

| Property | Purpose                                                            |
| -------- | ------------------------------------------------------------------ |
| `name`   | The field's name attribute (which is unique across forms and apps) |

The "[Adding state signals](#adding-state-signals)" section below shows how to implement these properties in your controls.

### How the FormField directive works

The `[formField]` directive detects which interface your control implements and automatically binds the appropriate signals:

```angular-ts
import {Component, signal, ChangeDetectionStrategy} from '@angular/core';
import {form, FormField, required} from '@angular/forms/signals';
import {CustomInput} from './custom-input';
import {CustomToggle} from './custom-toggle';

@Component({
  selector: 'app-my-form',
  imports: [FormField, CustomInput, CustomToggle],
  template: `
    <form novalidate>
      <app-custom-input [formField]="userForm.username" />
      <app-custom-toggle [formField]="userForm.subscribe" />
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyForm {
  formModel = signal({
    username: '',
    subscribe: false,
  });

  userForm = form(this.formModel, (schemaPath) => {
    required(schemaPath.username, {message: 'Username is required'});
  });
}
```

TIP: For complete coverage of creating and managing form models, see the [Form Models guide](guide/forms/signals/models).

When you bind `[formField]="userForm.username"`, the FormField directive:

1. Detects your control implements `FormValueControl`
2. Internally accesses `userForm.username().value()` and binds it to your control's `value` model signal
3. Binds form state signals (`disabled()`, `errors()`, etc.) to your control's optional input signals
4. Updates occur automatically through signal reactivity

## Adding state signals

The minimal controls shown above work, but they don't respond to form state. You can add optional input signals to make your controls react to disabled state, display validation errors, and track user interaction.

Here's a comprehensive example that implements common state properties:

```angular-ts
import {Component, model, input, ChangeDetectionStrategy} from '@angular/core';
import {FormValueControl} from '@angular/forms/signals';
import type {ValidationError, DisabledReason} from '@angular/forms/signals';

@Component({
  selector: 'app-stateful-input',
  template: `
    @if (!hidden()) {
      <div class="input-container">
        <input
          type="text"
          [value]="value()"
          (input)="value.set($event.target.value)"
          [disabled]="disabled()"
          [readonly]="readonly()"
          [class.invalid]="invalid()"
          [attr.aria-invalid]="invalid()"
          (blur)="touched.set(true)"
        />

        @if (invalid()) {
          <div class="error-messages" role="alert">
            @for (error of errors(); track error) {
              <span class="error">{{ error.message }}</span>
            }
          </div>
        }

        @if (disabled() && disabledReasons().length > 0) {
          <div class="disabled-reasons">
            @for (reason of disabledReasons(); track reason) {
              <span>{{ reason.message }}</span>
            }
          </div>
        }
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatefulInput implements FormValueControl<string> {
  // Required
  value = model<string>('');

  // Writable interaction state - control updates these
  touched = model<boolean>(false);

  // Read-only state - form system manages these
  disabled = input<boolean>(false);
  disabledReasons = input<readonly DisabledReason[]>([]);
  readonly = input<boolean>(false);
  hidden = input<boolean>(false);
  invalid = input<boolean>(false);
  errors = input<readonly ValidationError.WithField[]>([]);
}
```

As a result, you can use the control with validation and state management:

```angular-ts
import {Component, signal, ChangeDetectionStrategy} from '@angular/core';
import {form, FormField, required, email} from '@angular/forms/signals';
import {StatefulInput} from './stateful-input';

@Component({
  imports: [FormField, StatefulInput],
  template: `
    <form novalidate>
      <label>
        Email
        <app-stateful-input [formField]="loginForm.email" />
      </label>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  loginModel = signal({email: ''});

  loginForm = form(this.loginModel, (schemaPath) => {
    required(schemaPath.email, {message: 'Email is required'});
    email(schemaPath.email, {message: 'Enter a valid email address'});
  });
}
```

When the user types an invalid email, the FormField directive automatically updates `invalid()` and `errors()`. Your control can display the validation feedback.

### Signal types for state properties

Most state properties use `input()` (read-only from the form). Use `model()` for `touched` when your control updates it on user interaction. The `touched` property uniquely supports `model()`, `input()`, or `OutputRef` depending on your needs.

## Value transformation

Controls sometimes display values differently than the form model stores them - a date picker might display "January 15, 2024" while storing "2024-01-15", or a currency input might show "$1,234.56" while storing 1234.56.

Use `linkedSignal()` (from `@angular/core`) to transform the model value for display, and handle input events to parse user input back to the storage format:

```angular-ts
import {formatCurrency} from '@angular/common';
import {ChangeDetectionStrategy, Component, linkedSignal, model} from '@angular/core';
import {FormValueControl} from '@angular/forms/signals';

@Component({
  selector: 'app-currency-input',
  template: `
    <input
      type="text"
      [value]="displayValue()"
      (input)="displayValue.set($event.target.value)"
      (blur)="updateModel()"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CurrencyInput implements FormValueControl<number> {
  // Stores numeric value (1234.56)
  readonly value = model.required<number>();

  // Stores display value ("1,234.56")
  readonly displayValue = linkedSignal(() => formatCurrency(this.value(), 'en', 'USD'));

  // Update the model from the display value.
  updateModel() {
    this.value.set(parseCurrency(this.displayValue()));
  }
}

// Converts a currency string to a number (e.g. "USD1,234.56" -> 1234.56).
function parseCurrency(value: string): number {
  return parseFloat(value.replace(/^[^\d-]+/, '').replace(/,/g, ''));
}
```

## Validation integration

Controls display validation state but don't perform validation. Validation happens in the form schema - your control receives `invalid()` and `errors()` signals from the FormField directive and displays them (as shown in the StatefulInput example above).

The FormField directive also passes validation constraint values like `required`, `min`, `max`, `minLength`, `maxLength`, and `pattern`. Your control can use these to enhance the UI:

```ts
export class NumberInput implements FormValueControl<number> {
  value = model<number>(0);

  // Constraint values from schema validation rules
  required = input<boolean>(false);
  min = input<number | undefined>(undefined);
  max = input<number | undefined>(undefined);
}
```

When you add `min()` and `max()` validation rules to the schema, the FormField directive passes these values to your control. Use them to apply HTML5 attributes or show constraint hints in your template.

IMPORTANT: Don't implement validation logic in your control. Define validation rules in the form schema and let your control display the results:

```ts {avoid}
// Avoid: Validation in control
export class BadControl implements FormValueControl<string> {
  value = model<string>('');
  isValid() {
    return this.value().length >= 8;
  } // Don't do this!
}
```

```ts {prefer}
// Good: Validation in schema, control displays results
accountForm = form(this.accountModel, (schemaPath) => {
  minLength(schemaPath.password, 8, {message: 'Password must be at least 8 characters'});
});
```

## Next steps

This guide covered building custom controls that integrate with Signal Forms. Related guides explore other aspects of Signal Forms:

<docs-pill-row>
  <docs-pill href="guide/forms/signals/models" title="Form models" />
  <docs-pill href="guide/forms/signals/field-state-management" title="Field state management" />
  <docs-pill href="guide/forms/signals/validation" title="Validation" />
  <!-- <docs-pill href="guide/forms/signals/arrays" title="Working with Arrays" /> -->
</docs-pill-row>
