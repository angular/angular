/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {HttpClient} from '@angular/common/http';
import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'transfer-state-http',
  standalone: true,
  template: `
    <div class="one">{{ responseOne }}</div>
    <div class="two">{{ responseTwo }}</div>
  `,
  providers: [HttpClient]
})
export class TransferStateComponent implements OnInit {
  responseOne: string = '';
  responseTwo: string = '';

  constructor(private readonly httpClient: HttpClient) {
    // Test that HTTP cache works when HTTP call is made in the constructor.
    this.httpClient.get<any>('http://localhost:4206/api').subscribe((response) => {
      this.responseOne = response.data;
    });
  }

  ngOnInit(): void {
    // Test that HTTP cache works when HTTP call is made in a lifecycle hook.
    this.httpClient.get<any>('http://localhost:4206/api-2').subscribe((response) => {
      this.responseTwo = response.data;
    });
  }
}
