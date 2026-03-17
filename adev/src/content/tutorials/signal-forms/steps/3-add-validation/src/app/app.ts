import {ChangeDetectionStrategy, Component, signal} from '@angular/core';
// TODO: Import required and email validators
import {form, FormField} from '@angular/forms/signals';

interface LoginData {
  email: string;
  password: string;
  rememberMe: boolean;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  imports: [FormField],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  loginModel = signal<LoginData>({
    email: '',
    password: '',
    rememberMe: false,
  });

  // TODO: Add schema function as second parameter to form()
  // TODO: Add required() and email() validators for email field
  // TODO: Add required() validator for password field
  loginForm = form(this.loginModel);
}
