import { Component, OnInit } from '@angular/core';

import { User, UserService } from './user.service';

// #docregion component-providers
@Component({
  // #enddocregion component-providers
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  // #docregion component-providers
  providers: [UserService]
})
// #enddocregion component-providers
export class AppComponent implements OnInit {
  title = 'Users list';
  users: User[];

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.userService.getUsers().then(users => this.users = users);
  }

}
