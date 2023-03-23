/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {isPlatformServer} from '@angular/common';
import {HttpClient} from '@angular/common/http';
import {Component, Inject, PLATFORM_ID} from '@angular/core';
import {TransferState, makeStateKey} from '@angular/platform-browser';

const httpCacheKey = makeStateKey<string>('http');

@Component({
  selector: 'transfer-state-app-http',
  template: `
    <div>{{ response }}</div>
  `,
})
export class TransferStateComponent {
  response: string = '';

  constructor(
    @Inject(PLATFORM_ID) private platformId: {},
    private readonly httpClient: HttpClient,
    private readonly transferState: TransferState
  ) {}

  ngOnInit() {
    if (isPlatformServer(this.platformId)) {
      this.httpClient.get<any>(`http://localhost:4206/api`).subscribe((response) => {
        this.transferState.set(httpCacheKey, response.data);
        this.response = response.data;
      });
    } else {
      this.response = this.transferState.get(httpCacheKey, '');
    }
  }
}
