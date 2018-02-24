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

const COUNTER_KEYS: StateKey<number>[] = [];

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
    for (let i = 0; i < 1e3; i++) {
      COUNTER_KEYS[i] = makeStateKey<number>(i + '_counter');
    }
    if (isPlatformServer(this.platformId)) {
      // Set it to 5 in the server.
      this.counter = 5;
      for (let i = 0; i < 1e3; i++) {
        this.transferState.set(COUNTER_KEYS[i], 50 + i);
      }
    } else {
      const defaultValue: number = 0;
      // Get the transferred counter state in the client (should be 1e6 + 49 and not 0).
      this.transferState.get$(COUNTER_KEYS[1e3 - 1], defaultValue).subscribe((v: number) => {
        this.counter = v;
      });
    }
  }
}
