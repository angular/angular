import {Component, signal, ChangeDetectionStrategy} from '@angular/core';
// TODO: Import Field directive from @angular/forms/signals
import {form} from '@angular/forms/signals';

interface LoginData {
  email: string;
  password: string;
  rememberMe: boolean;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  // TODO: Add Field to imports array
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
