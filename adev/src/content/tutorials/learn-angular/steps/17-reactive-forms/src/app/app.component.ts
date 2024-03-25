import {Component} from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <form>
      <label for="name">Name</label>
      <input id="name" type="text" formControlName="name" />
      <label for="email">Email</label>
      <input id="email" type="email" formControlName="email" />
      <button type="submit">Submit</button>
    </form>
  `,
  standalone: true,
  imports: [],
})
export class AppComponent {}
