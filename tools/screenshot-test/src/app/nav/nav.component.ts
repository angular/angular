import {Component} from '@angular/core';
import {FirebaseService} from '../firebase.service';


/** Nav bar with ability to sign in or sign out Github account */
@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html'
})
export class NavComponent {
  get user() {
    return this._service.user;
  }

  constructor(private _service: FirebaseService) { }

  signIntoGithub() {
    this._service.signIntoGithub();
  }

  signOutFromGithub() {
    this._service.signOutFromGithub();
  }
}
