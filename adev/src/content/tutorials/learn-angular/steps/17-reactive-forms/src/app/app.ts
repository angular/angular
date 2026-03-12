import {Component} from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <form>
      <label>
        Name
        <input type="text" formControlName="name" />
      </label>
      <label>
        Email
        <input type="email" formControlName="email" />
      </label>
      <button type="submit">Submit</button>
    </form>
  `,
  imports: [],
})
export class App {}
