/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {isPlatformServer} from '@angular/common';
import {Component, Inject, PLATFORM_ID} from '@angular/core';
import {StateKey, TransferState, makeStateKey} from '@angular/platform-browser';

const COUNTER_KEY = makeStateKey<number>('counter');
const RANDOM_KEY = makeStateKey<number>('randomKey');

@Component({
  selector: 'transfer-state-app',
  template: `
    <div>{{counter}}</div>
  `,
})
export class TransferStateAsyncComponent {
  counter = 0;

  constructor(@Inject(PLATFORM_ID) private platformId: {}, private transferState: TransferState) {}

  ngOnInit() {
    if (isPlatformServer(this.platformId)) {
      // Set it to 5 in the server.
      this.counter = 5;
      const largeObject = [];
      for (let i = 0; i < 1e6; i++) {
        largeObject[i] = i + Math.random().toString();
      }
      // store a large object to slow down the DOM loading
      this.transferState.set(RANDOM_KEY, largeObject);
      this.transferState.set(COUNTER_KEY, 50);
    } else {
      this.counter = 0;
      // Get the transferred counter state in the client(should be 50 and not 0).
      this.transferState.getAsync(COUNTER_KEY, 0).subscribe(value => { this.counter = value; });
    }
  }
}
