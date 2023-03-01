/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {isPlatformServer} from '@angular/common';
import {Component, Inject, PLATFORM_ID} from '@angular/core';
import {StateKey, TransferState, makeStateKey} from '@angular/platform-browser';

const COUNTER_KEY = makeStateKey<number>('counter');

@Component({
  selector: 'transfer-state-app',
  template: `
    <div>{{counter}}</div>
  `,
})
export class TransferStateComponent {
  counter = 0;

  constructor(@Inject(PLATFORM_ID) private platformId: {}, private transferState: TransferState) {}

  ngOnInit() {
    if (isPlatformServer(this.platformId)) {
      // Set it to 5 in the server.
      this.counter = 5;
      this.transferState.set(COUNTER_KEY, 50);
    } else {
      // Get the transferred counter state in the client(should be 50 and not 0).
      this.counter = this.transferState.get(COUNTER_KEY, 0);
    }
  }
}
