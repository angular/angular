/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component} from '@angular/core';
import {Observable, Observer} from 'rxjs';

// #docregion AsyncPipePromise
@Component({
  selector: 'async-promise-pipe',
  template: `<div>
    <code>promise|async</code>:
    <button (click)="clicked()">{{ arrived ? 'Reset' : 'Resolve' }}</button>
    <span>Wait for it... {{ greeting | async }}</span>
  </div>`,
  standalone: false,
})
export class AsyncPromisePipeComponent {
  greeting: Promise<string> | null = null;
  arrived: boolean = false;

  private resolve: Function | null = null;

  constructor() {
    this.reset();
  }

  reset() {
    this.arrived = false;
    this.greeting = new Promise<string>((resolve, reject) => {
      this.resolve = resolve;
    });
  }

  clicked() {
    if (this.arrived) {
      this.reset();
    } else {
      this.resolve!('hi there!');
      this.arrived = true;
    }
  }
}
// #enddocregion

// #docregion AsyncPipeObservable
@Component({
  selector: 'async-observable-pipe',
  template: '<div><code>observable|async</code>: Time: {{ time | async }}</div>',
  standalone: false,
})
export class AsyncObservablePipeComponent {
  time = new Observable<string>((observer: Observer<string>) => {
    setInterval(() => observer.next(new Date().toString()), 1000);
  });
}
// #enddocregion

// For some reason protractor hangs on setInterval. So we will run outside of angular zone so that
// protractor will not see us. Also we want to have this outside the docregion so as not to confuse
// the reader.
function setInterval(fn: Function, delay: number) {
  const zone = (window as any)['Zone'].current;
  let rootZone = zone;
  while (rootZone.parent) {
    rootZone = rootZone.parent;
  }
  rootZone.run(() => {
    window.setInterval(function (this: unknown) {
      zone.run(fn, this, arguments as any);
    }, delay);
  });
}
