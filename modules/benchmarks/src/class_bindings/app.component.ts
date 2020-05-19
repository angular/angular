/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Component} from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <button id="create" (click)="create()">Create</button>
    <button id="update" (click)="update()">Update</button>
    <button id="destroy" (click)="destroy()">Destroy</button>
    <class-bindings *ngIf="show" [msg]="msg" [list]="list"><class-bindings>
  `
})
export class AppComponent {
  show = false;
  msg = 'hello';
  list: {i: number, text: string}[] = [];

  constructor() {
    for (let i = 0; i < 1000; i++) {
      this.list.push({i, text: 'foobar' + i});
    }
  }

  create() {
    this.show = true;
  }

  update() {
    this.msg = this.msg === 'hello' ? 'bye' : 'hello';
    this.list[0].text = this.msg;
  }

  destroy() {
    this.show = false;
  }
}
