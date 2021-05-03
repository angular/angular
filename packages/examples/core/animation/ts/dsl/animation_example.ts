/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {animate, state, style, transition, trigger} from '@angular/animations';
import {Component, NgModule} from '@angular/core';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

@Component({
  selector: 'example-app',
  styles: [`
    .toggle-container {
      background-color:white;
      border:10px solid black;
      width:200px;
      text-align:center;
      line-height:100px;
      font-size:50px;
      box-sizing:border-box;
      overflow:hidden;
    }
  `],
  animations: [trigger(
      'openClose',
      [
        state('collapsed, void', style({height: '0px', color: 'maroon', borderColor: 'maroon'})),
        state('expanded', style({height: '*', borderColor: 'green', color: 'green'})),
        transition('collapsed <=> expanded', [animate(500, style({height: '250px'})), animate(500)])
      ])],
  template: `
    <button (click)="expand()">Open</button>
    <button (click)="collapse()">Closed</button>
    <hr />
    <div class="toggle-container" [@openClose]="stateExpression">
      Look at this box
    </div>
  `
})
export class MyExpandoCmp {
  // TODO(issue/24571): remove '!'.
  stateExpression!: string;
  constructor() {
    this.collapse();
  }
  expand() {
    this.stateExpression = 'expanded';
  }
  collapse() {
    this.stateExpression = 'collapsed';
  }
}

@NgModule(
    {imports: [BrowserAnimationsModule], declarations: [MyExpandoCmp], bootstrap: [MyExpandoCmp]})
export class AppModule {
}
