// #docplaster
// #docregion
// #docregion imports
import { Component, Inject } from '@angular/core';

import { APP_CONFIG, AppConfig } from './app.config';
import { Logger } from './logger.service';
import { UserService } from './user.service';
// #enddocregion imports

@Component({
  selector: 'my-app',
  template:  `
    <h1>{{title}}</h1>
    <my-car></my-car>
    <my-injectors></my-injectors>
    <my-tests></my-tests>
    <h2>User</h2>
    <p id="user">
      {{userInfo}}
      <button (click)="nextUser()">Next User</button>
    <p>
    <my-heroes id="authorized" *ngIf="isAuthorized"></my-heroes>
    <my-heroes id="unauthorized" *ngIf="!isAuthorized"></my-heroes>
    <my-providers></my-providers>
  `,
  providers: [Logger]
})
export class AppComponent {
  title: string;

  // #docregion ctor
  constructor(
    @Inject(APP_CONFIG) config: AppConfig,
    private userService: UserService) {
    this.title = config.title;
  }
  // #enddocregion ctor

  get isAuthorized() { return this.user.isAuthorized; }
  nextUser()         { this.userService.getNewUser(); }
  get user()         { return this.userService.user; }

  get userInfo()     {
    return `Current user, ${this.user.name}, is ` +
           `${this.isAuthorized ? '' : 'not'} authorized. `;
  }
}
