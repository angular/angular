/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {animate, keyframes, state, style, transition, trigger} from '@angular/animations';
import {Component} from '@angular/core';

@Component({
  host: {
    '[@backgroundAnimation]': 'bgStatus',
    '(@backgroundAnimation.start)': 'bgStatusChanged($event, "started")',
    '(@backgroundAnimation.done)': 'bgStatusChanged($event, "completed")'
  },
  selector: 'animate-app',
  styleUrls: ['../css/animate-app.css'],
  template: `
    <button (click)="state='start'">Start State</button>
    <button (click)="state='active'">Active State</button>
    |
    <button (click)="state='void'">Void State</button>
    <button (click)="reorderAndRemove()">Scramble!</button>
    <button (click)="state='default'">Unhandled (default) State</button>
    <button style="float:right" (click)="bgStatus='blur'">Blur Page (Host)</button>
    <hr />
    <div *ngFor="let item of items; let i=index" class="box" [@boxAnimation]="state">
      {{ item }} - {{ i }}
      <button (click)="remove(item)">x</button>
    </div>
  `,
  animations: [
    trigger('backgroundAnimation', [
      state('focus', style({ 'background-color':'white' })),
      state('blur', style({ 'background-color':'grey' })),
      transition('* => *', [
        animate(500)
      ])
    ]),
    trigger('boxAnimation', [
      state('*', style({ 'height': '*', 'background-color': '#dddddd', 'color':'black' })),
      state('void, hidden', style({ 'height': 0, 'opacity': 0 })),
      state('start', style({ 'background-color': 'red', 'height': '*' })),
      state('active', style({ 'background-color': 'orange', 'color': 'white', 'font-size':'100px' })),

      transition('active <=> start', [
        animate(500, style({ 'transform': 'scale(2)' })),
        animate(500)
      ]),

      transition('* => *', [
        animate(1000, style({ 'opacity': 1, 'height': 300 })),
        animate(1000, style({ 'background-color': 'blue' })),
        animate(1000, keyframes([
          style({ 'background-color': 'blue', 'color': 'black', 'offset': 0.2 }),
          style({ 'background-color': 'brown', 'color': 'black', 'offset': 0.5 }),
          style({ 'background-color': 'black', 'color': 'white', 'offset': 1 })
        ])),
        animate(2000)
      ])
    ])
  ]
})
export class AnimateApp {
  public items: number[] = [];
  private _state: ('start'|'active'|'void'|'default');

  public bgStatus = 'focus';

  remove(item: number) {
    const index = this.items.indexOf(item);
    if (index >= 0) {
      this.items.splice(index, 1);
    }
  }

  reorderAndRemove() {
    this.items = this.items.sort((a, b) => Math.random() - 0.5);
    this.items.splice(Math.floor(Math.random() * this.items.length), 1);
    this.items.splice(Math.floor(Math.random() * this.items.length), 1);
    this.items[Math.floor(Math.random() * this.items.length)] = 99;
  }

  bgStatusChanged(data: {[key: string]: string}, phase: string) {
    alert(`backgroundAnimation has ${phase} from ${data['fromState']} to ${data['toState']}`);
  }

  get state() {
    return this._state;
  }
  set state(s) {
    this._state = s;
    if (s == 'void') {
      this.items = [];
    } else {
      this.items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
    }
  }
}
