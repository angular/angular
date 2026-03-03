import {Component, ChangeDetectionStrategy} from '@angular/core';
import {FormGroup, FormControl, Validators, ReactiveFormsModule} from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="loginForm" (submit)="onSubmit()">
      <div>
        <label>
          Email
          <input type="email" formControlName="email" />
        </label>
        @if (loginForm.controls.email.touched && loginForm.controls.email.invalid) {
          <span class="error">
            @if (loginForm.controls.email.errors?.['required']) {
              Email is required
            }
            @if (loginForm.controls.email.errors?.['email']) {
              Enter a valid email address
            }
          </span>
        }
      </div>

      <div>
        <label>
          Password
          <input type="password" formControlName="password" />
        </label>
        @if (loginForm.controls.password.touched && loginForm.controls.password.invalid) {
          <span class="error">
            @if (loginForm.controls.password.errors?.['required']) {
              Password is required
            }
            @if (loginForm.controls.password.errors?.['minlength']) {
              Password must be at least 8 characters
            }
          </span>
        }
      </div>

      <button type="submit" [disabled]="loginForm.invalid">Sign In</button>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(8)]),
  });

  onSubmit() {
    if (this.loginForm.valid) {
      const credentials = this.loginForm.value;
      console.log('Submitting:', credentials);
    }
  }
}
