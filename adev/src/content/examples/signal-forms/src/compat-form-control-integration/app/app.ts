import {JsonPipe} from '@angular/common';
import {Component, computed, signal} from '@angular/core';
import {AbstractControl, FormControl, Validators} from '@angular/forms';
import {FormField} from '@angular/forms/signals';
import {compatForm} from '@angular/forms/signals/compat';

// Dummy enterprisePasswordValidator for the example
function enterprisePasswordValidator() {
  return (control: AbstractControl) => {
    if (control.value && control.value.length < 8) {
      return {enterprisePassword: {message: 'Password must be at least 8 characters.'}};
    }
    return null;
  };
}

@Component({
  selector: 'app',
  imports: [FormField, JsonPipe],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  // 1. Existing legacy control with a specialized validator
  readonly passwordControl = new FormControl('', {
    validators: [Validators.required, enterprisePasswordValidator()],
    nonNullable: true,
  });

  // 2. Wrap it inside your form state signal
  readonly user = signal({
    email: '',
    password: this.passwordControl, // Nest the legacy control directly
  });

  // 3. Create the form
  readonly f = compatForm(this.user);

  // We have to manually extract values, because JSON pipe can't serialize FormControl
  readonly formValue = computed(() => ({
    email: this.f.email().value(),
    password: this.f.password().value(),
  }));

  constructor() {
    console.log(this.f.email().value()); // "angular_user"
    console.log(this.f.password().value()); // Current value of passwordControl
  }
}
