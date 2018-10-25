// #docregion
import { Injectable } from '@angular/core';

export class User {
  constructor(
    public name: string,
    public isAuthorized = false) { }
}

// TODO: get the user; don't 'new' it.
let alice = new User('Alice', true);
let bob = new User('Bob', false);

@Injectable({
  providedIn: 'root'
})
export class UserService {
  user = bob;  // initial user is Bob

  // swap users
  getNewUser() {
    return this.user = this.user === bob ? alice : bob;
  }
}
