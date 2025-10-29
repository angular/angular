import {Component, signal} from '@angular/core';
import {form, Field} from '@angular/forms/signals';

/**
 * @title Signal Forms - Login Example
 */
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrl: 'app.component.css',
  imports: [Field],
})
export class App {
  loginModel = signal({
    email: '',
    password: '',
  });

  loginForm = form(this.loginModel);
}
