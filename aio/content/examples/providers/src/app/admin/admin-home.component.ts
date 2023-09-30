import { Component, OnInit } from '@angular/core';

import { AdminUserService } from './admin-user.service';

@Component({
  standalone: true,
  selector: 'app-admin-home',
  template: `
  <h2>Admin Home</h2>
  <p>There are {{userCount}} admin users!</p>
  `
})
export class AdminHomeComponent implements OnInit {
  userCount: number | string = 'no';

  constructor(private userService: AdminUserService) { }

  ngOnInit(): void {
    this.userService.getUsers().then(users => this.userCount = users.length);
  }
}
