import {Component, signal} from '@angular/core';
import {form, Field, required, email, submit} from '@angular/forms/signals';

interface LoginData {
  email: string;
  password: string;
}

@Component({
  selector: 'app-root',
  templateUrl: 'app.html',
  styleUrl: 'app.css',
  imports: [Field],
})
export class App {
  loginModel = signal<LoginData>({
    email: '',
    password: '',
  });

  loginForm = form(this.loginModel, (p) => {
    required(p.email, {message: 'Email is required'});
    email(p.email, {message: 'Enter a valid email address'});
    required(p.password, {message: 'Password is required'});
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
