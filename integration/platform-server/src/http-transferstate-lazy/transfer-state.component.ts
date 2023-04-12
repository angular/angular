/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {HttpClient} from '@angular/common/http';
import {Component} from '@angular/core';

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
    private readonly httpClient: HttpClient,
  ) {
    this.httpClient.get<any>(`http://localhost:4206/api`).subscribe((response) => {
      this.responseOne = response.data;
    });

    this.httpClient.get<any>(`http://localhost:4206/api-2`).subscribe((response) => {
      this.responseTwo = response.data;
    });
  }
}
