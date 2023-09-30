// #docplaster
import { Component, OnInit } from '@angular/core';
import { NgFor } from '@angular/common';

import { UserService } from './user.service';
import { User} from './user';

// #docregion component-providers
@Component({
  // ...
  // #enddocregion component-providers
  standalone: true,
  selector: 'app-users',
  template: `
  <h1>Regular Users List</h1>

  <li *ngFor="let user of users">
    <span >{{user.id}}</span> {{user.name}}
  </li>
  `,
  imports: [ NgFor ],
  // #docregion component-providers
  providers: [UserService]
})
// #enddocregion component-providers
export class UsersComponent implements OnInit {
  users: User[] = [];

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.userService.getUsers().then(users => this.users = users);
  }
}
