# Adding form logic

Signal Forms allow you to add logic to your form using schemas. Validation logic is covered in the [Validation guide](guide/forms/signals/validation), and this guide discusses other rules available in schemas. You can disable fields conditionally, hide them based on other values, make them readonly, debounce user input, and attach metadata for custom controls.

This guide shows you how to use rules like `disabled()`, `hidden()`, `readonly()`, `debounce()`, and `metadata()` to control field behavior.

## When to add form logic

Use rules when field behavior depends on other field values or needs to update reactively. For example:

- A coupon code field that's disabled when the order total is too low
- An address field that's hidden unless shipping is required
- A search field that debounces to reduce API calls

## How rules work

Rules bind reactive logic to specific fields in your form. Most rules accept a reactive logic function as an optional argument. The reactive logic function automatically recomputes whenever the signals it references change, just like a `computed`.

```ts
const orderForm = form(this.orderModel, (schemaPath) => {
  disabled(schemaPath.couponCode, ({valueOf}) => valueOf(schemaPath.total) < 50);
  //~~~~~~ ~~~~~~~~~~~~~~~~~~~~~  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  //rule     path                   reactive logic function
});
```

Reactive logic functions receive a `FieldContext` object that provides access to field values and state through helper functions like `valueOf()` and `stateOf()`. It is often destructured to access these helpers directly.

NOTE: The schema callback parameter (`schemaPath` in these examples) is a `SchemaPathTree` object that provides paths to all fields in your form. You can name this parameter anything you like.

For complete details on `FieldContext` properties and methods, see the [Validation guide](guide/forms/signals/validation).

## Prevent field updates with `disabled()`

The `disabled()` rule configures a field's disabled state.

It works with the `[formField]` directive to automatically bind the `disabled` attribute based on the field's state, so you don't need to manually add `[disabled]="yourForm.fieldName().disabled()"` to your template.

NOTE: Disabled fields skip validation - they don't participate in form validation checks. The field's value is preserved but not validated. For details on validation behavior, see the [Validation guide](guide/forms/signals/validation).

### Always disabled

To disable a field permanently, call `disabled()` with just the field path:

```angular-ts
import {Component, signal} from '@angular/core';
import {form, FormField, disabled} from '@angular/forms/signals';

@Component({
  selector: 'app-settings',
  imports: [FormField],
  template: `
    <label>
      System ID (cannot be changed)
      <input [formField]="settingsForm.systemId" />
    </label>
  `,
})
export class Settings {
  settingsModel = signal({
    systemId: 'SYS-12345',
    userName: '',
  });

  settingsForm = form(this.settingsModel, (schemaPath) => {
    disabled(schemaPath.systemId);
  });
}
```

### Conditional disabling

To disable a field based on conditions, provide a reactive logic function that returns `true` (disabled) or `false` (enabled):

```angular-ts
import {Component, signal} from '@angular/core';
import {form, FormField, disabled} from '@angular/forms/signals';

@Component({
  selector: 'app-order',
  imports: [FormField],
  template: `
    <label>
      Order Total
      <input type="number" [formField]="orderForm.total" />
    </label>

    <label>
      Coupon Code
      <input [formField]="orderForm.couponCode" />
    </label>
  `,
})
export class Order {
  orderModel = signal({
    total: 25,
    couponCode: '',
  });

  orderForm = form(this.orderModel, (schemaPath) => {
    disabled(schemaPath.couponCode, ({valueOf}) => valueOf(schemaPath.total) < 50);
  });
}
```

In this example, when the order total is less than $50, the coupon code field is disabled.

### Disabled reasons

When you disable a field, provide user-facing explanations by returning a string instead of `true`:

```angular-ts
import {Component, signal} from '@angular/core';
import {form, FormField, disabled} from '@angular/forms/signals';

@Component({
  selector: 'app-order',
  imports: [FormField],
  template: `
    <label>
      Order Total
      <input type="number" [formField]="orderForm.total" />
    </label>

    <label>
      Coupon Code
      <input [formField]="orderForm.couponCode" />
    </label>

    @if (orderForm.couponCode().disabled()) {
      <div class="info">
        @for (reason of orderForm.couponCode().disabledReasons(); track reason) {
          <p>{{ reason.message }}</p>
        }
      </div>
    }
  `,
})
export class Order {
  orderModel = signal({
    total: 25,
    couponCode: '',
  });

  orderForm = form(this.orderModel, (schemaPath) => {
    disabled(schemaPath.couponCode, ({valueOf}) =>
      valueOf(schemaPath.total) < 50 ? 'Order must be $50 or more to use a coupon' : false,
    );
  });
}
```

The reactive logic function returns:

- A **string** to disable the field with a reason
- `false` to enable the field (not just any falsy value - use `false` explicitly)

Access the reasons through the `disabledReasons()` signal on the field state. Each reason has a `message` property containing the string you returned.

#### Multiple disabled reasons

You can also call `disabled()` multiple times on the same field, and all of the returned reasons accumulate:

```angular-ts
orderForm = form(this.orderModel, (schemaPath) => {
  disabled(schemaPath.promoCode, ({valueOf}) =>
    !valueOf(schemaPath.hasAccount) ? 'You must have an account to use promo codes' : false,
  );
  disabled(schemaPath.promoCode, ({valueOf}) =>
    valueOf(schemaPath.total) < 25 ? 'Order must be at least $25' : false,
  );
});
```

If both conditions are true, the field shows both disabled reasons. This pattern is useful for complex availability rules that you want to keep separate.

## Configuring `hidden()` state on fields

The `hidden()` rule configures a field's hidden state. However, this only sets a programmatic state. **You control whether the field appears in the UI**.

IMPORTANT: Unlike `disabled` and `readonly`, there is no native DOM property for `hidden` state. The `[formField]` directive does not apply a `hidden` attribute to elements. You must use `@if` or CSS in your template to conditionally render fields based on the `hidden()` state.

NOTE: Like disabled fields, hidden fields also skip validation. See the [Validation guide](guide/forms/signals/validation) for details.

### Basic field hiding

Use `hidden()` with a reactive logic function that returns `true` (hidden) or `false` (visible):

```angular-ts
import {Component, signal} from '@angular/core';
import {form, FormField, hidden} from '@angular/forms/signals';

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
  `,
})
export class Profile {
  profileModel = signal({
    isPublic: false,
    publicUrl: '',
  });

  profileForm = form(this.profileModel, (schemaPath) => {
    hidden(schemaPath.publicUrl, ({valueOf}) => !valueOf(schemaPath.isPublic));
  });
}
```

## Display uneditable fields with `readonly()`

The `readonly()` rule prevents users from updating a field. The `[FormField]` directive automatically binds this state to the HTML `readonly` attribute, which prevents editing while still allowing users to focus and select text.

NOTE: Readonly fields skip [validation](guide/forms/signals/validation).

### Always readonly

To make a field permanently readonly, call `readonly()` with just the field path:

```angular-ts
import {Component, signal} from '@angular/core';
import {form, FormField, readonly} from '@angular/forms/signals';

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
  `,
})
export class Account {
  accountModel = signal({
    username: 'johndoe',
    email: 'john@example.com',
  });

  accountForm = form(this.accountModel, (schemaPath) => {
    readonly(schemaPath.username);
  });
}
```

The `[FormField]` directive automatically binds the `readonly` attribute based on the field's state.

### Conditional readonly

To make a field readonly based on conditions, provide a reactive logic function:

```angular-ts
import {Component, signal} from '@angular/core';
import {form, FormField, readonly} from '@angular/forms/signals';

@Component({
  selector: 'app-document',
  imports: [FormField],
  template: `
    <label>
      <input type="checkbox" [formField]="documentForm.isLocked" />
      Lock document
    </label>

    <label>
      Document Title
      <input [formField]="documentForm.title" />
    </label>
  `,
})
export class Document {
  documentModel = signal({
    isLocked: false,
    title: 'Untitled',
  });

  documentForm = form(this.documentModel, (schemaPath) => {
    readonly(schemaPath.title, ({valueOf}) => valueOf(schemaPath.isLocked));
  });
}
```

When `isLocked` is true, the title field becomes readonly.

## Choose between hidden, disabled, and readonly

These three configuration functions control field availability in different ways:

Choose `hidden()` when the field:

- Should not appear in the UI at all
- Is irrelevant to the current form state
- Example: Shipping address fields when "same as billing" is checked

Choose `disabled()` when the field:

- Should be visible but not editable
- Needs to show why it's unavailable (using disabled reasons)
- Should be excluded from HTML form submission
- Example: Submit button disabled until form is valid, approval fields disabled for non-admin users

Choose `readonly()` when the field:

- Should be visible but not editable
- Contains data users need to see, select, or copy
- Should be included in HTML form submission
- Example: Order confirmation number, system-generated reference codes

All three skip validation and prevent user editing while active. The key differences:

| Feature                          | `hidden()` | `disabled()` | `readonly()` |
| -------------------------------- | ---------- | ------------ | ------------ |
| Visible in UI                    | No         | Yes          | Yes          |
| Users can focus/select           | No         | No           | Yes          |
| Included in HTML form submission | No         | No           | Yes          |

## Delay input operations with `debounce()`

The `debounce()` rule delays updating the form model. This is useful for performance optimization and reducing unnecessary operations during rapid input.

### What debouncing does

Without debouncing, every keystroke immediately updates the form model. This can trigger:

- Expensive computed signals that recalculate on every change
- Validation checks after each character
- API calls or other side effects tied to the model value

Debouncing delays these updates and reduces unnecessary work.

### Basic debouncing

You can debounce a field by specifying a delay in milliseconds:

```angular-ts
import {Component, signal} from '@angular/core';
import {form, FormField, debounce} from '@angular/forms/signals';

@Component({
  selector: 'app-search',
  imports: [FormField],
  template: `
    <label>
      Search
      <input [formField]="searchForm.query" />
    </label>

    <p>Searching for: {{ searchForm.query().value() }}</p>
  `,
})
export class Search {
  searchModel = signal({
    query: '',
  });

  searchForm = form(this.searchModel, (schemaPath) => {
    debounce(schemaPath.query, 300);
  });
}
```

With a 300ms debounce:

- User types in the input field
- Form model updates only after 300ms of typing inactivity
- If user keeps typing, the timer resets with each keystroke
- Once user pauses for 300ms, the model updates with the final value

### Timing guarantees

The `debounce()` function ensures users don't lose data through these mechanisms:

- **When marked as touched:** The value syncs immediately, aborting any pending debounce delay. This happens when the field loses focus (blur) or when explicitly marked as touched.
- **On form submission:** All fields are marked as touched before validation, which ensures all debounced values sync immediately.

This means users can type quickly, tab away, or submit the form without waiting for debounce delays to expire.

### Custom debounce logic

For advanced control, provide a debouncer function that controls when to synchronize the value. This function is called every time the control value is updated and can return either `undefined` to synchronize immediately, or a Promise that prevents synchronization until it resolves:

```angular-ts
import {Component, signal} from '@angular/core';
import {form, FormField, debounce} from '@angular/forms/signals';

@Component({
  selector: 'app-search',
  imports: [FormField],
  template: `
    <label>
      Search
      <input [formField]="searchForm.query" />
    </label>
  `,
})
export class Search {
  searchModel = signal({
    query: '',
  });

  searchForm = form(this.searchModel, (schemaPath) => {
    debounce(schemaPath.query, () => {
      // Return a promise that resolves after 500ms
      return new Promise<void>((resolve) => {
        setTimeout(() => resolve(), 500);
      });
    });
  });
}
```

The debouncer function can return:

- `undefined` to synchronize the value immediately
- A `Promise<void>` that prevents synchronization until it resolves

Use cases for custom debounce logic:

- Implementing custom timing logic beyond simple delays
- Coordinating synchronization with external events
- Conditional debouncing based on application state

### When to use debouncing

Debouncing is most useful when:

- You have expensive computed signals that depend on the field value
- The field triggers API calls or other side effects
- You want to reduce validation overhead during rapid typing
- Performance profiling shows model updates are causing slowdowns

Don't use debouncing if:

- The field needs immediate updates for good UX (such as calculator inputs)
- The performance benefit is negligible
- Users expect real-time feedback

## Associate data with a field using `metadata()`

Metadata allows you to attach computed information to fields that can be read by [custom controls](guide/forms/signals/custom-controls) or form logic. Common use cases include HTML input attributes (min, max, maxlength, pattern), custom UI hints (placeholder text, help text), and accessibility information.

### Pre-defined metadata keys

Signal Forms provides six pre-defined metadata keys that validation rules automatically populate:

- `REQUIRED` - Whether the field is required (`boolean`)
- `MIN` - Minimum numeric value (`number | undefined`)
- `MAX` - Maximum numeric value (`number | undefined`)
- `MIN_LENGTH` - Minimum string/array length (`number | undefined`)
- `MAX_LENGTH` - Maximum string/array length (`number | undefined`)
- `PATTERN` - Regular expression pattern (`RegExp[]` - array to support multiple patterns)

When you use validation rules like `required()` or `min()`, they automatically set the corresponding metadata. The `metadata()` function provides a way to publish additional data associated with a field.

### Reading pre-defined metadata

The `[FormField]` directive automatically binds built-in metadata to HTML attributes. You can also read metadata directly using the built-in accessors on field state:

```angular-ts
import {Component, signal} from '@angular/core';
import {form, FormField, required, min, max} from '@angular/forms/signals';

@Component({
  selector: 'app-age',
  imports: [FormField],
  template: `
    <label>
      Age (between {{ ageForm.age().min() }} and {{ ageForm.age().max() }})
      <input type="number" [formField]="ageForm.age" />
    </label>

    @if (ageForm.age().required()) {
      <span class="required-indicator">*</span>
    }
  `,
})
export class Age {
  ageModel = signal({
    age: 0,
  });

  ageForm = form(this.ageModel, (schemaPath) => {
    required(schemaPath.age);
    min(schemaPath.age, 18);
    max(schemaPath.age, 120);
  });
}
```

The `[formField]` directive automatically binds `required`, `min`, and `max` attributes to the input. You can read these values using `field().required()`, `field().min()`, and `field().max()` for display or logic purposes.

### Setting metadata manually

Use the `metadata()` function to set metadata values when validation rules don't automatically set them. For built-in metadata like `MIN` and `MAX`, prefer using the validation rules:

```angular-ts
import {Component, signal} from '@angular/core';
import {form, FormField, min, max, validate} from '@angular/forms/signals';

@Component({
  selector: 'app-custom',
  imports: [formField],
  template: ` <input [formField]="customForm.score" /> `,
})
export class Custom {
  customModel = signal({score: 0});

  customForm = form(this.customModel, (schemaPath) => {
    // Use built-in validation rules - they automatically set metadata
    min(schemaPath.score, 0);
    max(schemaPath.score, 100);

    // Add custom validation logic if needed
    validate(schemaPath.score, ({value}) => {
      const score = value();
      // Custom validation beyond min/max (e.g., must be multiple of 5)
      if (score % 5 !== 0) {
        return {kind: 'increment', message: 'Score must be a multiple of 5'};
      }
      return null;
    });
  });
}
```

### Creating custom metadata keys

Create your own metadata keys for application-specific information:

```angular-ts
import {createMetadataKey, metadata} from '@angular/forms/signals';

// Define at module level (not inside components)
export const PLACEHOLDER = createMetadataKey<string>();
export const HELP_TEXT = createMetadataKey<string>();

// Use in schema
form(model, (schemaPath) => {
  metadata(schemaPath.email, PLACEHOLDER, () => 'user@example.com');
  metadata(schemaPath.email, HELP_TEXT, () => 'We will never share your email');
});

// Read in component
const placeholderText = myForm.email().metadata(PLACEHOLDER);
const helpText = myForm.email().metadata(HELP_TEXT);
```

By default, custom metadata keys use a "last write wins" strategy - if you call `metadata()` multiple times with the same key, only the last value is kept.

**Important:** Always define metadata keys at module level, never inside components. Metadata keys rely on object identity, and recreating them loses that identity.

### Accumulating metadata with reducers

By default, calling `metadata()` multiple times with the same key uses "last write wins" - only the final value is kept. To accumulate values instead, pass a reducer to `createMetadataKey()`:

```angular-ts
import {createMetadataKey, metadata, MetadataReducer} from '@angular/forms/signals';

// Create a key that accumulates values into an array
export const HINTS = createMetadataKey<string, string[]>(MetadataReducer.list());

// Multiple calls accumulate values
form(model, (schemaPath) => {
  metadata(schemaPath.password, HINTS, () => 'At least 8 characters');
  metadata(schemaPath.password, HINTS, () => 'Include a number');
  metadata(schemaPath.password, HINTS, () => 'Include a special character');
});

// Result: Signal containing the accumulated array
const passwordHints = passwordForm.password().metadata(HINTS)();
// ['At least 8 characters', 'Include a number', 'Include a special character']
```

Angular provides built-in reducers through `MetadataReducer`:

- `MetadataReducer.list()` - Accumulates values into an array
- `MetadataReducer.min()` - Keeps the minimum value
- `MetadataReducer.max()` - Keeps the maximum value
- `MetadataReducer.or()` - Logical OR of boolean values
- `MetadataReducer.and()` - Logical AND of boolean values

### Managed metadata keys

Use `createManagedMetadataKey()` when you need to compute a new value from the accumulated result. The transform function receives a signal of the reduced value and returns the computed result:

```angular-ts
import {createManagedMetadataKey, metadata, MetadataReducer} from '@angular/forms/signals';

// Accumulate hints and compute additional data from the result
export const HINTS = createManagedMetadataKey(
  (signal) =>
    computed(() => {
      const hints = signal();
      return {
        messages: hints,
        count: hints?.length ?? 0,
      };
    }),
  MetadataReducer.list(),
);

// Multiple calls accumulate values
form(model, (schemaPath) => {
  metadata(schemaPath.password, HINTS, () => 'At least 8 characters');
  metadata(schemaPath.password, HINTS, () => 'Include a number');
  metadata(schemaPath.password, HINTS, () => 'Include a special character');
});

// Result: Signal with transformed value
const passwordHints = passwordForm.password().metadata(HINTS)();
// { messages: ['At least 8 characters', 'Include a number', 'Include a special character'], count: 3 }
```

The managed metadata key takes two arguments:

1. **Transform function** - Computes a new value from the accumulated result (receives a signal of the reduced value)
2. **Reducer** - Determines how values accumulate (optional - defaults to "last write wins")

### Reactive metadata

Make metadata reactive to other field values:

```angular-ts
import {Component, signal} from '@angular/core';
import {form, FormField, max} from '@angular/forms/signals';

@Component({
  selector: 'app-inventory',
  imports: [formField],
  template: `
    <label>
      Item
      <select [formField]="inventoryForm.item">
        <option value="widget">Widget</option>
        <option value="gadget">Gadget</option>
      </select>
    </label>

    <label>
      Quantity (max: {{ inventoryForm.quantity().max() }})
      <input
        type="number"
        [formField]="inventoryForm.quantity"
        [max]="inventoryForm.quantity().max()"
      />
    </label>
  `,
})
export class Inventory {
  inventoryModel = signal({
    item: 'widget',
    quantity: 0,
  });

  inventoryForm = form(this.inventoryModel, (schemaPath) => {
    max(schemaPath.quantity, ({valueOf}) => {
      const item = valueOf(schemaPath.item);
      return item === 'widget' ? 100 : 50;
    });
  });
}
```

The `max()` validation rule sets the `MAX` metadata reactively based on the selected item. This demonstrates how validation rules can have conditional values that change when other fields update.

### Using metadata in custom controls

Custom controls can read metadata to configure their HTML attributes and behavior:

```angular-ts
import {Component, input, computed, model} from '@angular/core';
import {FormValueControl, Field, PLACEHOLDER} from '@angular/forms/signals';

@Component({
  selector: 'custom-input',
  template: `
    <input
      type="number"
      [value]="state().value()"
      (input)="state().value.set(($event.target as HTMLInputElement).valueAsNumber)"
      [min]="state().min()"
      [max]="state().max()"
      [required]="state().required()"
      [placeholder]="placeholderText()"
    />
  `,
})
export class CustomInput implements FormValueControl<number> {
  // Bind to the form field.
  formField = input.required<Field<number>>();

  // Compute the current field state.
  state = computed(() => this.formField()());

  // Required property of the FormValueControl interface.
  value = model(0);

  placeholderText = computed(() => this.state().metadata(PLACEHOLDER)() ?? '');
}
```

This pattern allows custom controls to automatically configure themselves based on the validation rules and metadata defined in the schema.

TIP: For more information on creating custom controls, see the [Custom Controls guide](guide/forms/signals/custom-controls).

## Combining rules

You can apply multiple rules to the same field, and you can use conditional logic to apply entire groups of rules based on form state.

### Multiple rules on one field

Apply multiple rules to configure all aspects of a field's behavior:

```angular-ts
import {Component, signal} from '@angular/core';
import {
  form,
  FormField,
  disabled,
  hidden,
  debounce,
  metadata,
  PLACEHOLDER,
} from '@angular/forms/signals';

@Component({
  selector: 'app-promo',
  imports: [formField],
  template: `
    @if (!promoForm.promoCode().hidden()) {
      <label>
        Promo Code
        <input [formField]="promoForm.promoCode" />
      </label>
    }
  `,
})
export class Promo {
  promoModel = signal({
    hasAccount: false,
    subscriptionType: 'free' as 'free' | 'premium',
    promoCode: '',
  });

  promoForm = form(this.promoModel, (schemaPath) => {
    disabled(schemaPath.promoCode, ({valueOf}) =>
      !valueOf(schemaPath.hasAccount) ? 'You must have an account' : false,
    );
    hidden(schemaPath.promoCode, ({valueOf}) => valueOf(schemaPath.subscriptionType) === 'free');
    debounce(schemaPath.promoCode, 300);
    metadata(schemaPath.promoCode, PLACEHOLDER, () => 'Enter promo code');
  });
}
```

These rules work together:

- Hidden takes precedence - if the field is hidden, disabled state doesn't matter
- Disabled prevents editing regardless of readonly state
- Debouncing affects model updates regardless of other state
- Metadata is independent and always available

### Conditional logic with applyWhen

Use `applyWhen()` to conditionally apply entire groups of rules:

```angular-ts
import {Component, signal} from '@angular/core';
import {form, FormField, applyWhen, required, pattern} from '@angular/forms/signals';

@Component({
  selector: 'app-address',
  imports: [formField],
  template: `
    <label>
      Country
      <select [formField]="addressForm.country">
        <option value="US">United States</option>
        <option value="CA">Canada</option>
      </select>
    </label>

    <label>
      Zip/Postal Code
      <input [formField]="addressForm.zipCode" />
    </label>
  `,
})
export class Address {
  addressModel = signal({
    country: 'US',
    zipCode: '',
  });

  addressForm = form(this.addressModel, (schemaPath) => {
    applyWhen(
      schemaPath,
      ({valueOf}) => valueOf(schemaPath.country) === 'US',
      (schemaPath) => {
        // Only applied when country is US
        required(schemaPath.zipCode);
        pattern(schemaPath.zipCode, /^\d{5}(-\d{4})?$/);
      },
    );
  });
}
```

The `applyWhen()` function receives:

1. A path to apply logic to (often the root form path)
2. A reactive logic function that returns `true` (apply) or `false` (don't apply)
3. A schema function that defines the conditional rules

The conditional rules only run when the condition is true. This is useful for complex forms where validation rules or behavior changes based on user choices.

### Reusable schema functions

Extract common rule configurations into reusable functions:

```angular-ts
import {SchemaPath, debounce, metadata, maxLength, PLACEHOLDER} from '@angular/forms/signals';

function emailFieldConfig(path: SchemaPath<string>) {
  debounce(path, 300);
  metadata(path, PLACEHOLDER, () => 'user@example.com');
  maxLength(path, 255);
}

// Use in multiple forms
const contactForm = form(contactModel, (schemaPath) => {
  emailFieldConfig(schemaPath.email);
  emailFieldConfig(schemaPath.alternateEmail);
});

const registrationForm = form(registrationModel, (schemaPath) => {
  emailFieldConfig(schemaPath.email);
});
```

This pattern is useful when you have standard field configurations that you use across multiple forms in your application.

## Next steps

To learn more about Signal Forms, check out these related guides:

- [Field State Management](guide/forms/signals/field-state-management) - Learn how to use the state signals created by these functions in your templates and component logic
- [Validation](guide/forms/signals/validation) - Learn about validation rules and error handling
- [Custom Controls](guide/forms/signals/custom-controls) - Learn how custom controls can read metadata and state to configure themselves automatically
