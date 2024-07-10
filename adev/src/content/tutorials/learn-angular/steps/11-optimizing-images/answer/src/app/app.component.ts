import {Component} from '@angular/core';
import {UserComponent} from './user.component';

@Component({
  selector: 'app-root',
  template: `
    <app-user />
  `,
  standalone: true,
  imports: [UserComponent],
})
export class AppComponent {}
