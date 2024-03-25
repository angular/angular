import {Component} from '@angular/core';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-user',
  template: `
    <p>Username: {{ username }}</p>
    <p>Framework:</p>
    <label for="framework">Favorite Framework:</label>
    <input id="framework" type="text" [(ngModel)]="favoriteFramework" />
    <button (click)="showFramework()">Show Framework</button>
  `,
  standalone: true,
  imports: [FormsModule],
})
export class UserComponent {
  favoriteFramework = '';
  username = 'youngTech';

  showFramework() {}
}
