/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {HttpClient} from '@angular/common/http';
import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'transfer-state-http',
  standalone: true,
  template: ` <div class="one">{{ responseOne }}</div> `,
  providers: [HttpClient],
})
export class TransferStateOnInitComponent implements OnInit {
  responseOne: string = '';

  constructor(private readonly httpClient: HttpClient) {}

  ngOnInit(): void {
    // Test that HTTP cache works when HTTP call is made in a lifecycle hook.
    this.httpClient.get<any>('http://localhost:4206/api').subscribe((response) => {
      this.responseOne = response.data;
    });
  }
}
