import {Component} from '@angular/core';

@Component({
  selector: 'app-user',
  template: `
    <div>Username: {{ username }}</div>
  `,
})
export class UserComponent {
  username = 'youngTech';
}
