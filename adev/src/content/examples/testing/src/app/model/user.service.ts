import {Injectable, signal} from '@angular/core';

@Injectable({providedIn: 'root'})
export class UserService {
  isLoggedIn = signal(true);
  user = signal({name: 'Sam Spade'});
}
