/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {isPlatformServer} from '@angular/common';
import {HttpClient} from '@angular/common/http';
import {Component, Inject, PLATFORM_ID, TransferState, makeStateKey} from '@angular/core';

const COUNTER_KEY = makeStateKey<number>('counter');

@Component({
  selector: 'transfer-state',
  standalone: true,
  template: ` <div>{{ counter }}</div> `,
  providers: [HttpClient]
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
