# Angular Form Patterns

## Table of Contents

- [Reactive Forms (Production-Stable)](#reactive-forms-production-stable)
- [Typed Reactive Forms](#typed-reactive-forms)
- [FormBuilder Patterns](#formbuilder-patterns)
- [Dynamic Forms with FormArray](#dynamic-forms-with-formarray)
- [Custom Validators](#custom-validators)
- [Form State Management](#form-state-management)

## Reactive Forms (Production-Stable)

For production applications requiring stability guarantees, use Reactive Forms:

```typescript
import {Component, inject} from '@angular/core';
import {ReactiveFormsModule, FormBuilder, Validators} from '@angular/forms';

@Component({
  selector: 'app-login',
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
  private fb = inject(FormBuilder);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  onSubmit() {
    if (this.form.valid) {
      console.log(this.form.value);
    }
  }
}
```

## Typed Reactive Forms

### Typed FormControl

```typescript
import {FormControl} from '@angular/forms';

// Inferred type: FormControl<string | null>
const name = new FormControl('');

// Non-nullable (no reset to null)
const email = new FormControl('', {nonNullable: true});
// Type: FormControl<string>

// With validators
const username = new FormControl('', {
  nonNullable: true,
  validators: [Validators.required, Validators.minLength(3)],
});
```

### Typed FormGroup

```typescript
import {FormGroup, FormControl} from '@angular/forms';

interface UserForm {
  name: FormControl<string>;
  email: FormControl<string>;
  age: FormControl<number | null>;
}

const form = new FormGroup<UserForm>({
  name: new FormControl('', {nonNullable: true}),
  email: new FormControl('', {nonNullable: true}),
  age: new FormControl<number | null>(null),
});

// Typed value access
const name: string = form.controls.name.value;
```

### NonNullableFormBuilder

```typescript
import { inject } from '@angular/core';
import { NonNullableFormBuilder } from '@angular/forms';

@Component({...})
export class Profile {
  private fb = inject(NonNullableFormBuilder);

  form = this.fb.group({
    name: ['', Validators.required],           // FormControl<string>
    email: ['', [Validators.required, Validators.email]],
    preferences: this.fb.group({
      newsletter: [false],                      // FormControl<boolean>
      theme: ['light' as 'light' | 'dark'],    // FormControl<'light' | 'dark'>
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
  private fb = inject(NonNullableFormBuilder);

  form = this.fb.group({
    name: ['', Validators.required],
    address: this.fb.group({
      street: [''],
      city: ['', Validators.required],
      zip: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]],
    }),
  });
}
```

## Dynamic Forms with FormArray

```typescript
import {FormArray} from '@angular/forms';

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
  private fb = inject(NonNullableFormBuilder);

  form = this.fb.group({
    items: this.fb.array([this.createItem()]),
  });

  get items() {
    return this.form.controls.items;
  }

  createItem() {
    return this.fb.group({
      product: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
    });
  }

  addItem() {
    this.items.push(this.createItem());
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
name: ['', [Validators.required, forbiddenValue('admin')]],
```

### Cross-Field Validator

```typescript
export function passwordMatch(): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const password = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return password === confirm ? null : {passwordMismatch: true};
  };
}

// Usage
form = this.fb.group(
  {
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
  },
  {validators: passwordMatch()},
);
```

### Async Validator

```typescript
import { AsyncValidatorFn } from '@angular/forms';
import { map, catchError, of } from 'rxjs';

export function uniqueEmail(userService: User): AsyncValidatorFn {
  return (control: AbstractControl) => {
    return userService.checkEmail(control.value).pipe(
      map(exists => exists ? { emailTaken: true } : null),
      catchError(() => of(null))
    );
  };
}

// Usage
email: ['',
  [Validators.required, Validators.email],  // sync validators
  [uniqueEmail(this.userService)]            // async validators
],
```

## Form State Management

### State Properties

```typescript
// Check states
form.valid; // All validations pass
form.invalid; // Has validation errors
form.pending; // Async validation in progress
form.dirty; // Value changed by user
form.pristine; // Value not changed
form.touched; // Control has been focused
form.untouched; // Control never focused

// Update values
form.setValue({name: 'John', email: 'john@example.com'}); // Must include all
form.patchValue({name: 'John'}); // Partial update

// Reset
form.reset();
form.reset({name: 'Default'});

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
form.valueChanges.subscribe((value) => {
  console.log('Form value:', value);
});

// Single control with debounce
form.controls.email.valueChanges
  .pipe(debounceTime(300), distinctUntilChanged())
  .subscribe((email) => {
    this.validateEmail(email);
  });

// Status changes
form.statusChanges.subscribe((status) => {
  console.log('Form status:', status); // VALID, INVALID, PENDING
});
```

### Unified Events (Angular v21+)

```typescript
import {
  ValueChangeEvent,
  StatusChangeEvent,
  FormSubmittedEvent,
  FormResetEvent,
} from '@angular/forms';

form.events.subscribe((event) => {
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
    return (control?.hasError(errorKey) && control?.touched) || false;
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
