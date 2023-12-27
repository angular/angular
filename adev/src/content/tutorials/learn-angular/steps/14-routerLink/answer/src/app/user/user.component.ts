import {Component} from '@angular/core';

@Component({
  selector: 'app-user',
  template: `
    <div>Username: {{ username }}</div>
  `,
  standalone: true,
})
export class UserComponent {
  username = 'youngTech';
}
