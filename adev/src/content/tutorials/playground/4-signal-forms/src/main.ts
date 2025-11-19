import {Component, signal} from '@angular/core';
import {bootstrapApplication} from '@angular/platform-browser';
import {form, Field, required} from '@angular/forms/signals';

@Component({
  selector: 'app-root',
  template: `
    <section class="container">
        <label>Email</label>
        <input type="email" [field]="f.email" />
        <label>Password</label>
        <input type="password" [field]="f.password" />
        <button>Login</button>
    </section>
    <p>Is this form valid? {{ f().valid() }}</p>
  `,
  styleUrl: 'app.css',
  imports: [Field],
})
export class SampleForm {
  readonly data = signal({
    email: '',
    password: '',
  });

  readonly f = form(this.data, (path) => {
    (required(path.email), required(path.password));
  });
}

bootstrapApplication(SampleForm);
