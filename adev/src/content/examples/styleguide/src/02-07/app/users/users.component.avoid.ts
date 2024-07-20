// #docregion
import {Component} from '@angular/core';
// #docregion example
/* avoid */

// UsersComponent is in an Admin feature
@Component({
  standalone: true,
  selector: 'users',
  template: '',
})
export class UsersComponent {}
// #enddocregion example
