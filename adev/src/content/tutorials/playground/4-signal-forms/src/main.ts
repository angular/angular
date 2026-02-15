import {ChangeDetectionStrategy, Component, signal} from '@angular/core';
import {email, form, FormField, required, submit} from '@angular/forms/signals';
import {bootstrapApplication} from '@angular/platform-browser';

interface LoginData {
  email: string;
  password: string;
}

@Component({
  selector: 'app-root',
  template: `
    <form (submit)="onSubmit($event)">
      <div>
        <label>
          Email:
          <input type="email" [formField]="loginForm.email" />
        </label>

        @if (loginForm.email().invalid()) {
          <ul class="error-list">
            @for (error of loginForm.email().errors(); track error) {
              <li>{{ error.message }}</li>
            }
          </ul>
        }
      </div>

      <div>
        <label>
          Password:
          <input type="password" [formField]="loginForm.password" />
        </label>

        @if (loginForm.password().invalid()) {
          <div class="error">
            @for (error of loginForm.password().errors(); track error) {
              <p>{{ error.message }}</p>
            }
          </div>
        }
      </div>

      <button type="submit">Log In</button>
    </form>
  `,
  styleUrl: 'main.css',
  imports: [FormField],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginApp {
  loginModel = signal<LoginData>({
    email: '',
    password: '',
  });

  loginForm = form(this.loginModel, (schemaPath) => {
    required(schemaPath.email, {message: 'Email is required'});
    email(schemaPath.email, {message: 'Enter a valid email address'});
    required(schemaPath.password, {message: 'Password is required'});
  });

  onSubmit(event: Event) {
    event.preventDefault();
    submit(this.loginForm, async () => {
      // Perform login logic here
      const credentials = this.loginModel();
      console.log('Logging in with:', credentials);
      // e.g., await this.authService.login(credentials);
    });
  }
}

bootstrapApplication(LoginApp);
