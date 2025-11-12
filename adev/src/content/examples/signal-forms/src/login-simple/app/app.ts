import {Component, signal} from '@angular/core';
import {form, Field} from '@angular/forms/signals';

/**
 * @title Signal Forms - Login Example
 */
@Component({
  selector: 'app-root',
  templateUrl: 'app.html',
  styleUrl: 'app.css',
  imports: [Field],
})
export class App {
  loginModel = signal({
    email: '',
    password: '',
  });

  loginForm = form(this.loginModel);
}
