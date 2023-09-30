// #docplaster
// #docregion skeleton
import { Injectable, OnDestroy } from '@angular/core';
// #enddocregion skeleton

import { User, users } from './user';
// #docregion skeleton

@Injectable({
  providedIn: 'root',
})
export class UserService implements OnDestroy{
  // #enddocregion skeleton
  // called when UserComponent is created
  constructor() { console.log('UserService instance created.'); }
  // called when navigate away and UserComponent is destroyed
  ngOnDestroy() { console.log('UserService instance destroyed.'); }

  getUsers(): Promise<User[]> {
    return Promise.resolve(users);
  }
  // #docregion skeleton
}
// #enddocregion skeleton
