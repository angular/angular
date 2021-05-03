import { Component } from '@angular/core';

import { CustomersService } from './customers.service';
import { UserService } from '../greeting/user.service';

@Component({
  template: `
    <h2>Customers of {{userName}}</h2>
    <router-outlet></router-outlet>
  `,
  providers: [ UserService ]
})
export class CustomersComponent {
  userName = '';
  constructor(userService: UserService) {
    this.userName = userService.userName;
  }
}

