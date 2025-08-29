import {Component, input} from '@angular/core';

@Component({
  selector: 'app-user',
  template: `
    <p>The user's name is {{ name() }}</p>
  `,
})
export class User {
  readonly name = input<string>();
}
