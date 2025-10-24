import {Component, signal} from '@angular/core';
import {form, Field} from '@angular/forms/signals';

/**
 * @title Quick Signal Forms Example
 */
@Component({
  selector: 'app-login-form',
  templateUrl: 'app.component.html',
  styleUrl: 'app.component.css',
  imports: [Field],
})
export class LoginFormComponent {
  loginModel = signal({
    email: '',
    password: '',
  });

  loginForm = form(this.loginModel);
}
