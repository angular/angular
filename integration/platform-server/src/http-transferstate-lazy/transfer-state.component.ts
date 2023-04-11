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

const httpCacheKeyOne = makeStateKey<string>('http-one');
const httpCacheKeyTwo = makeStateKey<string>('http-two');

@Component({
  selector: 'transfer-state-app-http',
  template: `
    <div class="one">{{ responseOne }}</div>
    <div class="two">{{ responseTwo }}</div>
  `,
})
export class TransferStateComponent {
  responseOne: string = '';
  responseTwo: string = '';

  constructor(
    @Inject(PLATFORM_ID) private platformId: {},
    private readonly httpClient: HttpClient,
    private readonly transferState: TransferState
  ) {}

  ngOnInit() {
    if (isPlatformServer(this.platformId)) {
      this.httpClient.get<any>(`http://localhost:4206/api`).subscribe((response) => {
        this.transferState.set(httpCacheKeyOne, response.data);
        this.responseOne = response.data;
      });

      this.httpClient.get<any>(`http://localhost:4206/api-2`).subscribe((response) => {
        this.transferState.set(httpCacheKeyTwo, response.data);
        this.responseTwo = response.data;
      });
    } else {
      this.responseOne = this.transferState.get(httpCacheKeyOne, '');
      this.responseTwo = this.transferState.get(httpCacheKeyTwo, '');
    }
  }
}
