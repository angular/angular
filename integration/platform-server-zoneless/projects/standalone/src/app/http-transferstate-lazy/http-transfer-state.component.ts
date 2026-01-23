/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {HttpClient} from '@angular/common/http';
import {ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit} from '@angular/core';

@Component({
  selector: 'transfer-state-http',
  standalone: true,
  template: `
    <div class="one">{{ responseOne }}</div>
    <div class="two">{{ responseTwo }}</div>
  `,
  providers: [HttpClient],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransferStateComponent implements OnInit {
  responseOne: string = '';
  responseTwo: string = '';
  private readonly httpClient: HttpClient = inject(HttpClient);
  private readonly cdr: ChangeDetectorRef = inject(ChangeDetectorRef);

  constructor() {
    // Test that HTTP cache works when HTTP call is made in the constructor.
    this.httpClient.get<any>('http://localhost:4209/api').subscribe((response) => {
      this.responseOne = response.data;
      this.cdr.markForCheck();
    });
  }

  ngOnInit(): void {
    // Test that HTTP cache works when HTTP call is made in a lifecycle hook.
    this.httpClient.get<any>('/api-2').subscribe((response) => {
      this.responseTwo = response.data;
      this.cdr.markForCheck();
    });
  }
}
