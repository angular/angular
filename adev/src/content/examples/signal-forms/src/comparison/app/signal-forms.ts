import {ChangeDetectionStrategy, Component, signal} from '@angular/core';
import {email, form, FormField, minLength, required} from '@angular/forms/signals';

@Component({
  selector: 'app-login',
  imports: [FormField],
  template: `
    <form (submit)="onSubmit()">
      <div>
        <label>
          Email
          <input type="email" [formField]="loginForm.email" />
        </label>
        @if (loginForm.email().touched() && loginForm.email().invalid()) {
          <span class="error">
            {{ loginForm.email().errors()[0].message }}
          </span>
        }
      </div>

      <div>
        <label>
          Password
          <input type="password" [formField]="loginForm.password" />
        </label>
        @if (loginForm.password().touched() && loginForm.password().invalid()) {
          <span class="error">
            {{ loginForm.password().errors()[0].message }}
          </span>
        }
      </div>

      <button type="submit" [disabled]="loginForm().invalid()">Sign In</button>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  loginModel = signal({
    email: '',
    password: '',
  });

  loginForm = form(this.loginModel, (fieldPath) => {
    required(fieldPath.email, {message: 'Email is required'});
    email(fieldPath.email, {message: 'Enter a valid email address'});

    required(fieldPath.password, {message: 'Password is required'});
    minLength(fieldPath.password, 8, {message: 'Password must be at least 8 characters'});
  });

  onSubmit() {
    if (this.loginForm().valid()) {
      const credentials = this.loginModel();
      console.log('Submitting:', credentials);
    }
  }
}
