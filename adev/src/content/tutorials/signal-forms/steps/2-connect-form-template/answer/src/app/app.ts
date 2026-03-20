import {ChangeDetectionStrategy, Component, signal} from '@angular/core';
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

  loginForm = form(this.loginModel);
}
