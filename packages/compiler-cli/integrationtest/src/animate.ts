/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {animate, AUTO_STYLE, state, style, transition, trigger} from '@angular/animations';
import {Component} from '@angular/core';

@Component({
  selector: 'animate-cmp',
  animations: [trigger(
      'openClose',
      [
        state('*', style({height: AUTO_STYLE, color: 'black', borderColor: 'black'})),
        state('closed, void', style({height: '0px', color: 'maroon', borderColor: 'maroon'})),
        state('open', style({height: AUTO_STYLE, borderColor: 'green', color: 'green'})),
        transition('* => *', animate('1s'))
      ])],
  template: `
    <button (click)="setAsOpen()">Open</button>
    <button (click)="setAsClosed()">Closed</button>
    <button (click)="setAsSomethingElse()">Something Else</button>
    <hr />
    <div [@openClose]="stateExpression">
      Look at this box
    </div>
  `
})
export class AnimateCmp {
  stateExpression: string;
  constructor() {
    this.setAsClosed();
  }
  setAsSomethingElse() {
    this.stateExpression = 'something';
  }
  setAsOpen() {
    this.stateExpression = 'open';
  }
  setAsClosed() {
    this.stateExpression = 'closed';
  }
}
