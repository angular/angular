/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
// #docregion
import { Component, OnDestroy } from '@angular/core';
import { filter } from 'rxjs/operators';
import { AuthService } from '../model/auth.service';

@Component({
  template: `
    <input value="{{user}}" (change)="user = $event.target.value"/>
    <button (click)="doSomeWork1()">do some work 1</button>
    <button (click)="doSomeWork2()">do some work 2</button>
    {{result}}
  `
})
export class AuthComponent implements OnDestroy {
  user: string;
  result: string;
  token: string;
  counter: number;
  counterInterval = -1;

  constructor(private authService: AuthService) {}

  ngOnDestroy() {
    this.authService.logout(this.user);
    this.token = '';
  }

  doSomeWork1() {
    this.authService.userToken$.pipe(filter(token => !!token)).subscribe(t => {
      this.token = t;
      this.result = `work1 done after auth with token ${t}`;
    });
    this.authService.auth(this.user);
  }

  doSomeWork2() {
    this.authService.userToken$.pipe(filter(token => !!token)).subscribe(t => {
      this.token = t;
      this.result = `work2 done after auth with token ${t}`;
    });
    this.authService.auth(this.user);
  }

  start() {
    this.authService.userToken$.pipe(filter(token => !!token)).subscribe(t => {
      this.token = t;
      this.counterInterval = setInterval(() => {
        this.counter ++;
      }, 100);
    });
    this.authService.auth(this.user);
  }

  stop() {
    if (this.counterInterval !== -1) {
      clearInterval(this.counterInterval);
    }
  }

  reset() {
    this.counter = 0;
    this.counterInterval = -1;
  }
}
