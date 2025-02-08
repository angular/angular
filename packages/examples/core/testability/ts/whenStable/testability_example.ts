/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

@Component({
  selector: 'example-app',
  template: `
    <button class="start-button" (click)="start()">Start long-running task</button>
    <div class="status">Status: {{ status }}</div>
  `,
  standalone: false,
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

@NgModule({imports: [BrowserModule], declarations: [StableTestCmp], bootstrap: [StableTestCmp]})
export class AppModule {}
