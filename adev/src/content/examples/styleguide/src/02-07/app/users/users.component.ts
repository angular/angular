// #docplaster
// #docregion
import {Component} from '@angular/core';

// #docregion example
@Component({
  // #enddocregion example
  template: '<div>users component</div>',
  // #docregion example
  standalone: true,
  selector: 'admin-users',
})
export class UsersComponent {}
// #enddocregion example
