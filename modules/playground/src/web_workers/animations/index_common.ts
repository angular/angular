/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, animate, state, style, transition, trigger} from '@angular/core';

@Component({
  selector: 'animation-app',
  styles: [`
    .box {
      border:10px solid black;
      text-align:center;
      overflow:hidden;
      background:red;
      color:white;
      font-size:100px;
      line-height:200px;
    }
  `],
  animations: [trigger(
      'animate',
      [
        state('off', style({width: '0px'})), state('on', style({width: '750px'})),
        transition('off <=> on', animate(500))
      ])],
  template: `
    <button (click)="animate=!animate">
      Start Animation 
    </button>
    
    <div class="box" [@animate]="animate ? 'on' : 'off'">
      ... 
    </div>
  `
})
export class AnimationCmp {
  animate = false;
}
