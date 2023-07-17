/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';

@Component({
  selector: 'async-app',
  template: `
    <div id='increment'>
      <span class='val'>{{val1}}</span>
      <button class='action' (click)="increment()">Increment</button>
    </div>
    <div id='delayedIncrement'>
      <span class='val'>{{val2}}</span>
      <button class='action' (click)="delayedIncrement()">Delayed Increment</button>
      <button class='cancel' *ngIf="timeoutId != null" (click)="cancelDelayedIncrement()">Cancel</button>
    </div>
    <div id='multiDelayedIncrements'>
      <span class='val'>{{val3}}</span>
      <button class='action' (click)="multiDelayedIncrements(10)">10 Delayed Increments</button>
      <button class='cancel' *ngIf="multiTimeoutId != null" (click)="cancelMultiDelayedIncrements()">Cancel</button>
    </div>
    <div id='periodicIncrement'>
      <span class='val'>{{val4}}</span>
      <button class='action' (click)="periodicIncrement()">Periodic Increment</button>
      <button class='cancel' *ngIf="intervalId != null" (click)="cancelPeriodicIncrement()">Cancel</button>
    </div>
  `
})
class AsyncApplication {
  val1: number = 0;
  val2: number = 0;
  val3: number = 0;
  val4: number = 0;
  timeoutId: any = null;
  multiTimeoutId: any = null;
  intervalId: any = null;

  increment(): void {
    this.val1++;
  }

  delayedIncrement(): void {
    this.cancelDelayedIncrement();
    this.timeoutId = setTimeout(() => {
      this.val2++;
      this.timeoutId = null;
    }, 2000);
  }

  multiDelayedIncrements(i: number): void {
    this.cancelMultiDelayedIncrements();

    const self = this;
    function helper(_i: number) {
      if (_i <= 0) {
        self.multiTimeoutId = null;
        return;
      }

      self.multiTimeoutId = setTimeout(() => {
        self.val3++;
        helper(_i - 1);
      }, 500);
    }
    helper(i);
  }

  periodicIncrement(): void {
    this.cancelPeriodicIncrement();
    this.intervalId = setInterval(() => this.val4++, 2000);
  }

  cancelDelayedIncrement(): void {
    if (this.timeoutId != null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  cancelMultiDelayedIncrements(): void {
    if (this.multiTimeoutId != null) {
      clearTimeout(this.multiTimeoutId);
      this.multiTimeoutId = null;
    }
  }

  cancelPeriodicIncrement(): void {
    if (this.intervalId != null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

@NgModule(
    {declarations: [AsyncApplication], bootstrap: [AsyncApplication], imports: [BrowserModule]})
class ExampleModule {
}

platformBrowserDynamic().bootstrapModule(ExampleModule);
