import {Component} from '@angular/core';
import {UserComponent} from './user.component';

@Component({
  standalone: true,
  selector: 'app-root',
  template: `
    <app-user />
  `,
  imports: [UserComponent],
})
export class AppComponent {}
