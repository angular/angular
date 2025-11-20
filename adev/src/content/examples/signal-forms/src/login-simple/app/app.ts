import {Component, signal, ChangeDetectionStrategy} from '@angular/core';
import {form, Field} from '@angular/forms/signals';

interface LoginData {
  email: string;
  password: string;
}

@Component({
  selector: 'app-root',
  templateUrl: 'app.html',
  styleUrl: 'app.css',
  imports: [Field],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  loginModel = signal<LoginData>({
    email: '',
    password: '',
  });

  loginForm = form(this.loginModel);
}
