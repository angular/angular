// #docregion
import {Component, inject, OnInit, signal} from '@angular/core';
import {UserService} from '../model/user.service';

@Component({
  selector: 'app-welcome',
  template: '<h3 class="welcome"><i>{{welcome()}}</i></h3>',
})
// #docregion class
export class WelcomeComponent {
  welcome = signal('');
  private userService = inject(UserService);

  constructor() {
    this.welcome.set(
      this.userService.isLoggedIn() ? 'Welcome, ' + this.userService.user().name : 'Please log in.',
    );
  }
}
// #enddocregion class
