import {Component, ChangeDetectionStrategy} from '@angular/core';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  template: `
    <form #loginForm="ngForm" (submit)="onSubmit()">
      <div>
        <label>
          Email
          <input
            type="email"
            name="email"
            [(ngModel)]="email"
            #emailInput="ngModel"
            required
            email
          />
        </label>
        @if (emailInput.touched && emailInput.invalid) {
          <span class="error">
            @if (emailInput.errors?.['required']) {
              Email is required
            }
            @if (emailInput.errors?.['email']) {
              Enter a valid email address
            }
          </span>
        }
      </div>

      <div>
        <label>
          Password
          <input
            type="password"
            name="password"
            [(ngModel)]="password"
            #passwordInput="ngModel"
            required
            minlength="8"
          />
        </label>
        @if (passwordInput.touched && passwordInput.invalid) {
          <span class="error">
            @if (passwordInput.errors?.['required']) {
              Password is required
            }
            @if (passwordInput.errors?.['minlength']) {
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
  email = '';
  password = '';

  onSubmit() {
    const credentials = {
      email: this.email,
      password: this.password,
    };
    console.log('Submitting:', credentials);
  }
}
