import { Component, OnInit } from '@angular/core';
import { NgFor } from '@angular/common';

import { AdminUserService } from './admin-user.service';
import { User} from '../user';

@Component({
  standalone: true,
  selector: 'app-admin-users',
  template: `
  <h2>Admin Users List</h2>

  <li *ngFor="let user of users">
    <span >{{user.id}}</span> {{user.name}}
  </li>
  `,
  imports: [ NgFor ]
})
export class AdminUsersComponent implements OnInit {
  users: User[] = [];

  constructor(private userService: AdminUserService) { }

  ngOnInit(): void {
    this.userService.getUsers().then(users => this.users = users);
  }
}
