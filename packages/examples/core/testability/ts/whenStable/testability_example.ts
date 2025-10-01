/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component} from '@angular/core';

@Component({
  selector: 'example-app',
  template: `
    <button class="start-button" (click)="start()">Start long-running task</button>
    <div class="status">Status: {{ status }}</div>
  `,
})
export class StableTestCmp {
  status = 'none';
  start() {
    this.status = 'running';
    setTimeout(() => {
      this.status = 'done';
    }, 5000);
  }
}
