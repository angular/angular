/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { animate, keyframes, state, style, transition, trigger } from '@angular/animations';
import { Component } from '@angular/core';

@Component({
  host: {
    '[@backgroundAnimation]': 'bgStatus',
    '(@backgroundAnimation.start)': 'bgStatusChanged($event, "started")',
    '(@backgroundAnimation.done)': 'bgStatusChanged($event, "completed")',
  },
  selector: 'animate-app',
  styleUrls: ['../css/animate-app.css'],
  template: `
    <button (click)="state = 'start'">Start State</button>
    <button (click)="state = 'active'">Active State</button>
    |
    <button (click)="state = 'void'">Void State</button>
    <button (click)="reorderAndRemove()">Scramble!</button>
    <button (click)="state = 'default'">Unhandled (default) State</button>
    <button style="float:right" (click)="bgStatus = 'blur'">Blur Page (Host)</button>
    <hr />
    <div
      *ngFor="let item of items; let i = index; trackBy: trackByFn"
      class="box"
      [@boxAnimation]="state"
    >
      {{ item }} - {{ i }}
      <button (click)="remove(item)">x</button>
    </div>
  `,
  animations: [
    trigger('backgroundAnimation', [
      state('focus', style({ 'background-color': 'white' })),
      state('blur', style({ 'background-color': 'grey' })),
      transition('* => *', [animate(500)]),
    ]),
    trigger('boxAnimation', [
      state('*', style({ height: '*', 'background-color': '#dddddd', color: 'black' })),
      state('void, hidden', style({ height: 0, opacity: 0 })),
      state('start', style({ 'background-color': 'red', height: '*' })),
      state('active', style({ 'background-color': 'orange', color: 'white', 'font-size': '100px' })),

      transition('active <=> start', [
        animate(500, style({ transform: 'scale(2)' })),
        animate(500),
      ]),

      transition('* => *', [
        animate(1000, style({ opacity: 1, height: 300 })),
        animate(1000, style({ 'background-color': 'blue' })),
        animate(
          1000,
          keyframes([
            style({ 'background-color': 'blue', color: 'black', offset: 0.2 }),
            style({ 'background-color': 'brown', color: 'black', offset: 0.5 }),
            style({ 'background-color': 'black', color: 'white', offset: 1 }),
          ])
        ),
        animate(2000),
      ]),
    ]),
  ],
})
export class AnimateApp {
  public items: number[] = [];
  private _state: 'start' | 'active' | 'void' | 'default' = 'default';

  public bgStatus = 'focus';

  remove(item: number) {
    const index = this.items.indexOf(item);
    if (index >= 0) {
      this.items.splice(index, 1);
    } else {
      console.warn(`Item ${item} not found in the list.`);
    }
  }

  reorderAndRemove() {
    // Improved shuffling using Fisher-Yates algorithm
    for (let i = this.items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.items[i], this.items[j]] = [this.items[j], this.items[i]];
    }

    // Remove up to two items if possible
    if (this.items.length > 0) {
      this.items.splice(Math.floor(Math.random() * this.items.length), 1);
    }
    if (this.items.length > 0) {
      this.items.splice(Math.floor(Math.random() * this.items.length), 1);
    }

    // Replace a random item with 99
    if (this.items.length > 0) {
      const randomIndex = Math.floor(Math.random() * this.items.length);
      this.items[randomIndex] = 99;
    }
  }

  bgStatusChanged(data: { [key: string]: string }, phase: string) {
    // Replaced alert with console.log to avoid blocking UI
    console.log(
      `backgroundAnimation has ${phase} from ${data['fromState']} to ${data['toState']}`
    );
  }

  get state(): 'start' | 'active' | 'void' | 'default' {
    return this._state;
  }
  set state(s: 'start' | 'active' | 'void' | 'default') {
    this._state = s;
    if (s === 'void') {
      this.items = [];
    } else {
      // Initialized items array using Array.from for clarity
      this.items = Array.from({ length: 20 }, (_, i) => i + 1);
    }
  }

  trackByFn(index: number, item: number): number {
    return item;
  }
}
