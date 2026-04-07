# Angular Form Patterns

## Table of Contents
- [Reactive Forms (Production-Stable)](#reactive-forms-production-stable)
- [Typed Reactive Forms](#typed-reactive-forms)
- [FormBuilder Patterns](#formbuilder-patterns)
- [Dynamic Forms with FormArray](#dynamic-forms-with-formarray)
- [Custom Validators](#custom-validators)
- [Form State Management](#form-state-management)
- [Error Display Pattern](#error-display-pattern)
- [Form Submission Pattern](#form-submission-pattern)
- [`[formControl]` vs `formControlName`](#formcontrol-vs-formcontrolname)

## Reactive Forms (Production-Stable)

For production applications requiring stability guarantees, use Reactive Forms:

```typescript
import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { ReactiveFormsModule, NonNullableFormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <input formControlName="email" />
      @if (form.controls.email.errors?.['required'] && form.controls.email.touched) {
        <span class="error">Email is required</span>
      }

      <input type="password" formControlName="password" />

      <button type="submit" [disabled]="form.invalid">Login</button>
    </form>
  `,
})
export class Login {
  #fb = inject(NonNullableFormBuilder);

  // Always use explicit typed controls — never shorthand arrays
  form = this.#fb.group({
    email: this.#fb.control<string>('', { validators: [Validators.required, Validators.email] }),
    password: this.#fb.control<string>('', { validators: [Validators.required, Validators.minLength(8)] }),
  });

  onSubmit() {
    if (this.form.valid) {
      console.log(this.form.getRawValue());
    }
  }
}
```

## Typed Reactive Forms

### Typed FormControl

```typescript
import { FormControl } from '@angular/forms';

// Inferred type: FormControl<string | null>
const name = new FormControl<string>('');

// Non-nullable (no reset to null)
const email = new FormControl<string>('', { nonNullable: true });
// Type: FormControl<string>

// With validators
const username = new FormControl<string>('', {
  nonNullable: true,
  validators: [Validators.required, Validators.minLength(3)],
});
```

### Typed FormGroup

```typescript
import { FormGroup, FormControl } from '@angular/forms';

interface UserForm {
  name: FormControl<string>;
  email: FormControl<string>;
  age: FormControl<number | null>;
}

const form = new FormGroup<UserForm>({
  name: new FormControl<string>('', { nonNullable: true }),
  email: new FormControl<string>('', { nonNullable: true }),
  age: new FormControl<number | null>(null),
});

// Typed value access
const name: string = form.controls.name.value;
```

### NonNullableFormBuilder

```typescript
import { inject } from '@angular/core';
import { NonNullableFormBuilder, Validators } from '@angular/forms';

type Theme = 'light' | 'dark';

@Component({...})
export class Profile {
  #fb = inject(NonNullableFormBuilder);

  form = this.#fb.group({
    name: this.#fb.control<string>('', { validators: [Validators.required] }),
    email: this.#fb.control<string>('', { validators: [Validators.required, Validators.email] }),
    preferences: this.#fb.group({
      newsletter: this.#fb.control<boolean>(false),
      theme: this.#fb.control<Theme>('light'),
    }),
  });
}
```

## FormBuilder Patterns

### Nested FormGroups

```typescript
@Component({
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <input formControlName="name" placeholder="Name" />
      
      <div formGroupName="address">
        <input formControlName="street" placeholder="Street" />
        <input formControlName="city" placeholder="City" />
        <input formControlName="zip" placeholder="ZIP" />
      </div>
      
      <button type="submit">Submit</button>
    </form>
  `,
})
export class Profile {
  #fb = inject(NonNullableFormBuilder);

  form = this.#fb.group({
    name: this.#fb.control<string>('', { validators: [Validators.required] }),
    address: this.#fb.group({
      street: this.#fb.control<string>(''),
      city: this.#fb.control<string>(''),
      zip: this.#fb.control<string>(''),
    }),
  });
}
```

## Dynamic Forms with FormArray

```typescript
import { FormArray } from '@angular/forms';

@Component({
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form">
      <div formArrayName="items">
        @for (item of items.controls; track $index; let i = $index) {
          <div [formGroupName]="i">
            <input formControlName="product" placeholder="Product" />
            <input formControlName="quantity" type="number" />
            <button type="button" (click)="removeItem(i)">Remove</button>
          </div>
        }
      </div>
      <button type="button" (click)="addItem()">Add Item</button>
    </form>
  `,
})
export class Order {
  #fb = inject(NonNullableFormBuilder);

  form = this.#fb.group({
    items: this.#fb.array([this.#createItem()]),
  });

  get items() {
    return this.form.controls.items;
  }

  #createItem() {
    return this.#fb.group({
      product: this.#fb.control<string>('', { validators: [Validators.required] }),
      quantity: this.#fb.control<number>(1, { validators: [Validators.required, Validators.min(1)] }),
    });
  }

  addItem() {
    this.items.push(this.#createItem());
  }
  
  removeItem(index: number) {
    this.items.removeAt(index);
  }
}
```

## Custom Validators

### Sync Validator

```typescript
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function forbiddenValue(forbidden: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    return control.value === forbidden 
      ? { forbiddenValue: { value: control.value } } 
      : null;
  };
}

// Usage
name: this.#fb.control<string>('', { validators: [Validators.required, forbiddenValue('admin')] }),
```

### Cross-Field Validator

```typescript
export function passwordMatch(): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const password = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return password === confirm ? null : { passwordMismatch: true };
  };
}

// Usage
form = this.#fb.group({
  password: this.#fb.control<string>('', { validators: [Validators.required, Validators.minLength(8)] }),
  confirmPassword: this.#fb.control<string>('', { validators: [Validators.required] }),
}, { validators: [passwordMatch()] });
```

### Async Validator

```typescript
import { AsyncValidatorFn } from '@angular/forms';
import { map, catchError, of } from 'rxjs';

export function uniqueEmail(userService: UserService): AsyncValidatorFn {
  return (control: AbstractControl) => {
    return userService.checkEmail(control.value).pipe(
      map(exists => exists ? { emailTaken: true } : null),
      catchError(() => of(null))
    );
  };
}

// Usage
email: this.#fb.control<string>('', {
  validators: [Validators.required, Validators.email],
  asyncValidators: [uniqueEmail(this.#userService)],
}),
```

## Form State Management

### State Properties

```typescript
// Check states
form.valid      // All validations pass
form.invalid    // Has validation errors
form.pending    // Async validation in progress
form.dirty      // Value changed by user
form.pristine   // Value not changed
form.touched    // Control has been focused
form.untouched  // Control never focused

// Update values
form.setValue({ name: 'John', email: 'john@example.com' }); // Must include all
form.patchValue({ name: 'John' }); // Partial update

// Reset
form.reset();
form.reset({ name: 'Default' });

// Disable/Enable
form.disable();
form.enable();
form.controls.email.disable();

// Mark states
form.markAllAsTouched(); // Show all errors
form.markAsPristine();
form.markAsDirty();
```

### Value Changes Observable

```typescript
// Subscribe to value changes
form.valueChanges.subscribe(value => {
  console.log('Form value:', value);
});

// Single control with debounce
form.controls.email.valueChanges.pipe(
  debounceTime(300),
  distinctUntilChanged()
).subscribe(email => {
  this.validateEmail(email);
});

// Status changes
form.statusChanges.subscribe(status => {
  console.log('Form status:', status); // VALID, INVALID, PENDING
});
```

### Unified Events (Angular v21+)

```typescript
import { 
  ValueChangeEvent, StatusChangeEvent, 
  FormSubmittedEvent, FormResetEvent 
} from '@angular/forms';

form.events.subscribe(event => {
  if (event instanceof ValueChangeEvent) {
    console.log('Value changed:', event.value);
  }
  if (event instanceof StatusChangeEvent) {
    console.log('Status changed:', event.status);
  }
  if (event instanceof FormSubmittedEvent) {
    console.log('Form submitted');
  }
  if (event instanceof FormResetEvent) {
    console.log('Form reset');
  }
});
```

## Error Display Pattern

```typescript
@Component({
  template: `
    <input formControlName="email" />
    
    @if (form.controls.email.invalid && form.controls.email.touched) {
      <div class="errors">
        @if (form.controls.email.errors?.['required']) {
          <span>Email is required</span>
        }
        @if (form.controls.email.errors?.['email']) {
          <span>Invalid email format</span>
        }
      </div>
    }
  `,
})
export class Form {
  // Helper for cleaner templates
  hasError(controlName: string, errorKey: string): boolean {
    const control = this.form.get(controlName);
    return control?.hasError(errorKey) && control?.touched || false;
  }
}
```

## Form Submission Pattern

```typescript
@Component({
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <!-- fields -->
      <button type="submit" [disabled]="form.invalid || isSubmitting">
        {{ isSubmitting ? 'Submitting...' : 'Submit' }}
      </button>
    </form>
  `,
})
export class Form {
  isSubmitting = false;
  
  async onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    
    this.isSubmitting = true;
    try {
      await this.api.submit(this.form.getRawValue());
      this.form.reset();
    } catch (error) {
      // Handle error
    } finally {
      this.isSubmitting = false;
    }
  }
}
```

## `[formControl]` vs `formControlName`

Angular provides two directives for binding form controls in templates. Understanding when to use each is critical for correct form wiring.

### `FormControlDirective` — `[formControl]`

Binds a `FormControl` instance directly to a DOM element. Does **not** require a parent `[formGroup]` or `formGroupName`.

```typescript
@Component({
  imports: [ReactiveFormsModule],
  template: `
    <input [formControl]="nameControl" />
    <p>Value: {{ nameControl.value }}</p>
  `,
})
export class StandaloneInput {
  #fb = inject(NonNullableFormBuilder);
  nameControl = this.#fb.control<string>('', { validators: [Validators.required] });
}
```

### `FormControlName` — `formControlName`

Binds a control **by name** within a parent `[formGroup]` or `formGroupName` context. Angular resolves the `FormControl` from the group hierarchy.

```typescript
@Component({
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <input formControlName="name" />
      <input formControlName="email" />
    </form>
  `,
})
export class NameBasedForm {
  #fb = inject(NonNullableFormBuilder);

  form = this.#fb.group({
    name: this.#fb.control<string>('', { validators: [Validators.required] }),
    email: this.#fb.control<string>('', { validators: [Validators.required, Validators.email] }),
  });

  onSubmit() {
    if (this.form.valid) {
      console.log(this.form.getRawValue());
    }
  }
}
```

### Nested Groups Comparison

**`formGroupName` + `formControlName` (recommended for nested forms):**

```html
<form [formGroup]="form" (ngSubmit)="onSubmit()">
  <input formControlName="name" />
  <fieldset formGroupName="address">
    <legend>Address</legend>
    <input formControlName="street" />
    <input formControlName="city" />
    <input formControlName="zip" />
    <fieldset formGroupName="state">
      <legend>State</legend>
      <input formControlName="name" />
      <input formControlName="abbreviation" />
    </fieldset>
  </fieldset>
</form>
```

**`[formControl]` with explicit paths (alternative):**

```html
<form [formGroup]="form" (ngSubmit)="onSubmit()">
  <input [formControl]="form.controls.name" />
  <fieldset>
    <legend>Address</legend>
    <input [formControl]="form.controls.address.controls.street" />
    <input [formControl]="form.controls.address.controls.city" />
    <input [formControl]="form.controls.address.controls.zip" />
    <fieldset>
      <legend>State</legend>
      <input [formControl]="form.controls.address.controls.state.controls.name" />
      <input [formControl]="form.controls.address.controls.state.controls.abbreviation" />
    </fieldset>
  </fieldset>
</form>
```

### When to Use Each

| Scenario | Recommended | Why |
|----------|-------------|-----|
| Standard forms with `[formGroup]` | `formControlName` | Cleaner templates, automatic group hierarchy |
| Standalone inputs (no parent group) | `[formControl]` | Only option without a `FormGroup` context |
| `FormArray` iteration | `[formControl]` | Direct binding to each array element's control |
| Reusable input components | `[formControl]` | Accept `FormControl` as input, no group dependency |
| Dynamic/programmatic controls | `[formControl]` | Direct reference to the control instance |
| Deeply nested groups | `formGroupName` + `formControlName` | Avoids long `.controls.x.controls.y` chains |

### FormArray with `[formControl]`

When iterating `FormArray` items, `[formControl]` provides direct access to each control:

```typescript
@Component({
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form">
      @for (tag of tags.controls; track $index; let i = $index) {
        <div>
          <input [formControl]="tag" />
          <button type="button" (click)="removeTag(i)">Remove</button>
        </div>
      }
      <button type="button" (click)="addTag()">Add Tag</button>
    </form>
  `,
})
export class TagEditor {
  #fb = inject(NonNullableFormBuilder);

  form = this.#fb.group({
    tags: this.#fb.array([
      this.#fb.control<string>('', { validators: [Validators.required] }),
    ]),
  });

  get tags() {
    return this.form.controls.tags;
  }

  addTag() {
    this.tags.push(this.#fb.control<string>('', { validators: [Validators.required] }));
  }

  removeTag(index: number) {
    this.tags.removeAt(index);
  }
}
```

### Summary

- **`formControlName`**: Use with `formGroupName`/`[formGroup]` for clean, hierarchical templates. Angular resolves control references by name.
- **`[formControl]`**: Use for standalone controls, `FormArray` iteration, reusable components, or when you need a direct reference to the `FormControl` instance.
