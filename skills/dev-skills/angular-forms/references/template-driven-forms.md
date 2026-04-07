# Angular Template-Driven Forms

> **Not recommended for complex forms.** Template-driven forms are suitable only for simple scenarios. For production applications with complex validation, use Reactive Forms (see [SKILL.md](../SKILL.md)). For experimental signal-based forms, see [signal-forms.md](signal-forms.md).


## Overview

Template-driven forms use directives from `FormsModule` to create forms directly in the template. They rely on two-way data binding with `[(ngModel)]` and use an **asynchronous** data flow (values and validation update on the next change detection cycle). This async nature means tests require `fixture.whenStable()` before assertions.

## Setup

```typescript
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <form #loginForm="ngForm" (ngSubmit)="onSubmit(loginForm)">
      <label for="email">Email</label>
      <input
        id="email"
        name="email"
        type="email"
        [(ngModel)]="templateDrivenForm().email"
        #emailRef="ngModel"
        required
        email
      />
      @if (emailRef.invalid && emailRef.touched) {
        <div class="errors">
          @if (emailRef.errors?.['required']) {
            <span>Email is required</span>
          }
          @if (emailRef.errors?.['email']) {
            <span>Invalid email format</span>
          }
        </div>
      }

      <label for="password">Password</label>
      <input
        id="password"
        name="password"
        type="password"
        [(ngModel)]="templateDrivenForm().password"
        #passwordRef="ngModel"
        required
        minlength="8"
      />
      @if (passwordRef.invalid && passwordRef.touched) {
        <div class="errors">
          @if (passwordRef.errors?.['required']) {
            <span>Password is required</span>
          }
          @if (passwordRef.errors?.['minlength']) {
            <span>Password must be at least 8 characters</span>
          }
        </div>
      }

      <button type="submit" [disabled]="loginForm.invalid">Login</button>
    </form>
  `,
})
export class Login {
    templateDrivenForm = signal<LoginUser>({
        email: '',
        password: '',
    })
  onSubmit(form: any) {
    if (form.valid) {
      console.log('Submitting:', { email: this.email, password: this.password });
    }
  }
}
```

## Core Directives

| Directive | Export As | Description |
|-----------|----------|-------------|
| `NgModel` | `ngModel` | Two-way binding for form controls. Requires `name` attribute. |
| `NgForm` | `ngForm` | Top-level form directive, auto-applied to `<form>` elements. |
| `NgModelGroup` | `ngModelGroup` | Groups related controls under a sub-object. |

## CSS State Classes

Angular automatically adds CSS classes to form controls based on their state:

| State | True Class | False Class |
|-------|-----------|-------------|
| Visited | `ng-touched` | `ng-untouched` |
| Changed | `ng-dirty` | `ng-pristine` |
| Valid | `ng-valid` | `ng-invalid` |

```css
input.ng-invalid.ng-touched {
  border-color: red;
}

input.ng-valid.ng-touched {
  border-color: green;
}
```

## Template Reference Variables

Access control state using template reference variables exported as `ngModel`:

```html
<input
  name="username"
  [(ngModel)]="username"
  #usernameRef="ngModel"
  required
  minlength="3"
/>

<!-- Access state properties -->
@if (usernameRef.invalid && usernameRef.touched) {
  <span>Username is invalid</span>
}

<!-- Available properties -->
<!-- usernameRef.valid, usernameRef.invalid -->
<!-- usernameRef.touched, usernameRef.untouched -->
<!-- usernameRef.dirty, usernameRef.pristine -->
<!-- usernameRef.errors -->
```

## Grouping Controls with NgModelGroup

```typescript

@Component({
    selector: 'app-profile',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FormsModule],
    template: `
     <form #profileForm="ngForm" (ngSubmit)="onProfileSubmit(profileForm)" class="form-container"
            style="margin-top: 40px;">
        <label for="td-name" class="form-label">Name
          <input id="td-name" name="name" class="form-input" [(ngModel)]="templateDrivenFormV2().name" required/>
        </label>

        <fieldset ngModelGroup="address" #addressGroup="ngModelGroup" class="form-fieldset">
          <legend class="form-legend">Address</legend>
          <div class="fieldset-content">
            <label for="td-street" class="form-label">Street
              <input id="td-street" name="street" class="form-input"
                     [(ngModel)]="templateDrivenFormV2().address.street"/>
            </label>

            <label for="td-city" class="form-label">City
              <input id="td-city" name="city" class="form-input" [(ngModel)]="templateDrivenFormV2().address.city"
                     required/>
            </label>

            <label for="td-zip" class="form-label">Zip
              <input id="td-zip" name="zip" class="form-input" [(ngModel)]="templateDrivenFormV2().address.zip"
                     minlength="3"/>
            </label>
          </div>
        </fieldset>

        @if (addressGroup.invalid && addressGroup.touched) {
          <div class="errors">
            <span>Please complete the address</span>
          </div>
        }

        <button type="submit" class="submit-button">Save</button>
      </form>
  `,
})
export class Profile {
    templateDrivenFormV2 = signal({
        name: '',
        address: {
            street: '',
            city: '',
            zip: '',
        }
    })


    protected onProfileSubmit(form: NgForm) {
        form.form.markAllAsTouched(); //  to force validation errors to show if the user tries to submit without interacting with the form
        if (form.valid) {
            console.log('Profile form submitted:', {
                name: this.templateDrivenFormV2().name,
                address: this.templateDrivenFormV2().address
            });
        }
    }
}
```

## Validation

### Built-in HTML5 Validators

Angular maps standard HTML5 validation attributes to built-in validator directives:

```html
<input name="email" [(ngModel)]="email" required email />
<input name="age" [(ngModel)]="age" required min="18" max="120" />
<input name="username" [(ngModel)]="username" required minlength="3" maxlength="20" />
<input name="phone" [(ngModel)]="phone" pattern="^\d{3}-\d{3}-\d{4}$" />
```

### Custom Validator Directive

Create reusable validators as directives that implement `Validator` and provide `NG_VALIDATORS`:

```typescript
import { Directive } from '@angular/core';
import { NG_VALIDATORS, Validator, AbstractControl, ValidationErrors } from '@angular/forms';

@Directive({
  selector: '[appForbiddenValue]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: ForbiddenValueDirective,
      multi: true,
    },
  ],
})
export class ForbiddenValueDirective implements Validator {
  forbiddenValue = input.required<string>({ alias: 'appForbiddenValue' });

  validate(control: AbstractControl): ValidationErrors | null {
    return control.value === this.forbiddenValue()
      ? { forbiddenValue: { value: control.value } }
      : null;
  }
}
```

```html
<input name="username" [(ngModel)]="username" appForbiddenValue="admin" />
```

### Cross-Field Validator Directive

```typescript
import { Directive } from '@angular/core';
import { NG_VALIDATORS, Validator, AbstractControl, ValidationErrors } from '@angular/forms';

@Directive({
  selector: '[appPasswordMatch]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: PasswordMatchDirective,
      multi: true,
    },
  ],
})
export class PasswordMatchDirective implements Validator {
  validate(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return password === confirm ? null : { passwordMismatch: true };
  }
}
```

```html
<div ngModelGroup="passwords" appPasswordMatch>
  <input name="password" [(ngModel)]="password" required />
  <input name="confirmPassword" [(ngModel)]="confirmPassword" required />
  @if (passwordsGroup.errors?.['passwordMismatch']) {
    <span>Passwords do not match</span>
  }
</div>
```

## Form Submission

```typescript
@Component({
  selector: 'app-contact',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <form #contactForm="ngForm" (ngSubmit)="onSubmit(contactForm)">
      <label for="message">Message</label>
      <textarea
        id="message"
        name="message"
        [(ngModel)]="message"
        required
        minlength="10"
      ></textarea>

      <button type="submit" [disabled]="contactForm.invalid">Send</button>
    </form>
  `,
})
export class Contact {
  message = signal<string>('');
  

  onSubmit(form: NgForm) {
    if (form.invalid) return;

    console.log('Sending:', this.message());

    // Reset form state and values
    form.resetForm();
    this.message.set('');
  }
}
```

**Key points:**
- Use `(ngSubmit)` on the form, not `(submit)` or `(click)` on the button
- Use `resetForm()` (not `reset()`) to clear both values and validation state
- Pass the template reference variable to the handler for access to form state

## Testing

Template-driven forms are **asynchronous** — values and validation update on the next change detection cycle. Tests must account for this:

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

describe('Login', () => {
  let fixture: ComponentFixture<Login>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Login, FormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    fixture.detectChanges();
    await fixture.whenStable(); // Wait for async form initialization
  });

  it('should validate required email', async () => {
    const emailInput: HTMLInputElement = fixture.nativeElement.querySelector('#email');

    emailInput.value = '';
    emailInput.dispatchEvent(new Event('input'));
    emailInput.dispatchEvent(new Event('blur'));

    fixture.detectChanges();
    await fixture.whenStable(); // Wait for async validation

    const error = fixture.nativeElement.querySelector('.errors span');
    expect(error?.textContent).toContain('Email is required');
  });
});
```

## Accessibility

```html
<form #form="ngForm" (ngSubmit)="onSubmit(form)">
  <div role="group" aria-labelledby="name-label">
    <label id="name-label" for="name-input">Name</label>
    <input
      id="name-input"
      name="name"
      [(ngModel)]="name"
      #nameRef="ngModel"
      required
      [attr.aria-invalid]="nameRef.invalid && nameRef.touched"
      [attr.aria-describedby]="nameRef.invalid && nameRef.touched ? 'name-error' : null"
    />
    @if (nameRef.invalid && nameRef.touched) {
      <p id="name-error" role="alert" class="error">Name is required</p>
    }
  </div>

  <button type="submit" [disabled]="form.invalid">Submit</button>
</form>
```

**Requirements:**
- Labels linked to inputs via `for`/`id`
- Error messages announced with `role="alert"`
- Invalid state communicated with `aria-invalid`
- Every input must have a `name` attribute (required by NgModel)
- Must pass AXE accessibility checks

## When to Use

| Suitable For | Not Suitable For |
|-------------|-----------------|
| Simple login/contact forms | Complex multi-step wizards |
| Quick prototyping | Dynamic form generation |
| Forms with few fields | Forms with complex cross-field validation |
| Teams familiar with AngularJS | Forms requiring programmatic control |
| Static form structures | Forms needing unit-testable validation logic |
