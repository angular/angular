---
name: angular-forms
description: Build forms in Angular using Reactive Forms (production-stable) with NonNullableFormBuilder, typed controls, validation, and dynamic FormArrays. Covers all form approaches including template-driven and experimental Signal Forms. Triggers on form implementation, adding validation, creating multi-step forms, or building forms with conditional fields. Do not use for simple display-only data or non-interactive UI.
license: MIT
metadata:
  author: Copyright 2026 Google LLC
  version: '1.0'
---

# Angular Forms


Build type-safe, reactive forms using Angular's Reactive Forms API with `NonNullableFormBuilder`, typed `FormControl`/`FormGroup`, and explicit control definitions.

## Choosing Form Approach

**Best Practice**: Prefer Reactive Forms over Template-driven forms.

| Approach | Use Case | Status | Reference |
|----------|----------|--------|-----------|
| **Reactive Forms** | Production apps, complex validation | Stable, recommended | This file |
| **Signal Forms** | New projects, modern patterns | Experimental (v21+) | See `references/signal-forms.md` |
| Template-driven | Simple forms only | Not recommended | See `references/template-driven-forms.md` |

## Basic Setup

```typescript
import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { ReactiveFormsModule, NonNullableFormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <label for="email">Email</label>
      <input id="email" formControlName="email" />
      @if (form.controls.email.errors?.['required'] && form.controls.email.touched) {
        <span class="error">Email is required</span>
      }

      <label for="password">Password</label>
      <input id="password" type="password" formControlName="password" />

      <button type="submit" [disabled]="form.invalid">Login</button>
    </form>
  `,
})
export class Login {
  #fb = inject(NonNullableFormBuilder);

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

**Form definition convention (mandatory):** Always use `this.#fb.control<T>('', {validators: [...]})`. Never use shorthand arrays like `['', Validators.required]`.

```typescript
// CORRECT — explicit typed controls
form = this.#fb.group({
  name: this.#fb.control<string>('', { validators: [Validators.required] }),
  address: this.#fb.group({
    street: this.#fb.control<string>(''),
    city: this.#fb.control<string>(''),
    zip: this.#fb.control<string>(''),
    state: this.#fb.group({
      name: this.#fb.control<string>(''),
      abbreviation: this.#fb.control<string>(''),
    }),
  }),
});

// WRONG — loses type inference, becomes AbstractControl
form = this.#fb.group({
  name: ['', Validators.required],
  address: this.#fb.group({
    street: [''],
    city: [''],
  }),
});
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

`NonNullableFormBuilder` creates controls that reset to their initial value instead of `null`. Always prefer it over `FormBuilder`:

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

## `[formControl]` vs `formControlName`

- `[formControl]` — binds a `FormControl` instance directly; type-safe but verbose for nested groups; best for standalone inputs and FormArray iteration
- `formControlName` — binds by string name within `[formGroup]`/`formGroupName`; cleaner hierarchical templates; best for standard forms

Refer to `references/form-patterns.md` for detailed examples of both directives with nested groups and comparison table.

## Nested FormGroups

```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
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

  onSubmit() {
    if (this.form.valid) {
      console.log(this.form.getRawValue());
    }
  }
}
```

## Dynamic Forms with FormArray

```typescript
import { FormArray } from '@angular/forms';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form">
      <div formArrayName="items">
        @for (item of form.controls.items.controls; track item; ) {
          // in the for loop you have access to the following variables:
          // $index , $odd, $even ,$first, $last out of the box
          <div [formGroupName]="$index">
            <input formControlName="product" placeholder="Product" />
            <input formControlName="quantity" type="number" />
            <button type="button" (click)="removeItem($index)">Remove</button>
          </div>
        }
      </div>
      <button type="button" (click)="addItem()">Add Item</button>
    </form>
  `,
})
export class OrderForm {
  #fb = inject(NonNullableFormBuilder);

  form = this.#fb.group({
    items: this.#fb.array([this.#createItem()]),
  });
  
  #createItem() {
    return this.#fb.group({
      product: this.#fb.control<string>('', { validators: [Validators.required] }),
      quantity: this.#fb.control<number>(1, { validators: [Validators.required, Validators.min(1)] }),
    });
  }

  addItem() {
    this.form.controls.items.push(this.#createItem());
  }

  removeItem(index: number) {
    this.form.controls.items.removeAt(index);
  }
}
```

## Custom Validators

Create sync validators with `ValidatorFn`, cross-field validators on `FormGroup`, and async validators with `AsyncValidatorFn`. Apply via the `validators` / `asyncValidators` options in `this.#fb.control<T>()` for per-control validation, or in `this.#fb.group()` for cross-field (group-level) validation.

Refer to `references/form-patterns.md` for custom validator examples including sync, cross-field, and async validators.

## Form State Management

Key state properties: `valid`, `invalid`, `pending`, `dirty`, `pristine`, `touched`, `untouched`. Update with `setValue()` (all fields) or `patchValue()` (partial). Reset with `form.reset()`. Mark all touched with `form.markAllAsTouched()`. Subscribe to `valueChanges` and `statusChanges` observables with `takeUntilDestroyed`. Use `form.events` (v21+) for unified ValueChangeEvent, StatusChangeEvent, FormSubmittedEvent, FormResetEvent.

Refer to `references/form-patterns.md` for form state management patterns, valueChanges, and unified events API.

## Error Display Pattern

```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
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
export class FormWithErrors {
  // Helper for cleaner templates
  hasError(controlName: string, errorKey: string): boolean {
    const control = this.form.get(controlName) as FormControl;
    return control?.hasError(errorKey) && control?.touched || false;
  }
}
```

## Form Submission Pattern

Use `signal<boolean>(false)` for `isSubmitting` state. Call `form.markAllAsTouched()` on invalid submit. Wrap the async call in try/finally to reset `isSubmitting`.

Refer to `references/form-patterns.md` for the complete form submission pattern with loading state and error handling.

## Form Accessibility

Forms MUST pass AXE checks and meet WCAG AA standards. Link labels to inputs via `for`/`id`. Announce error messages with `role="alert"`. Set `[attr.aria-invalid]` and `[attr.aria-describedby]` on inputs when invalid.

Refer to `references/form-patterns.md` for the complete accessible form template with ARIA attributes.

## Reference Guides

- Refer to `references/form-patterns.md` for Form Patterns (Advanced) — typed forms, FormBuilder patterns, FormArray, custom validators, state management, and formControl vs formControlName
- Refer to `references/signal-forms.md` for Signal Forms (Experimental) — Angular v21+ Signal Forms API with automatic two-way binding and schema-based validation
- Refer to `references/template-driven-forms.md` for Template-Driven Forms — FormsModule/NgModel patterns for simple forms
