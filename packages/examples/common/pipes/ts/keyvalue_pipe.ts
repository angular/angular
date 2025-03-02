/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component} from '@angular/core';

// #docregion KeyValuePipe
@Component({
  selector: 'keyvalue-pipe',
  template: `
  <span>
  <p>Object</p>
  @for (item of object | keyvalue; track item.key) {
    <div>{{ item.key }}:{{ item.value }}</div>
  }
  <p>Map</p>
  @for (item of map | keyvalue; track item.key) {
    <div>{{ item.key }}:{{ item.value }}</div>
  }
  <p>Natural order</p>
  @for (item of map | keyvalue : null; track item.key) {
    <div>{{ item.key }}:{{ item.value }}</div>
  }
</span>`,
  standalone: false,
})
export class KeyValuePipeComponent {
  object: {[key: number]: string} = {2: 'foo', 1: 'bar'};
  map = new Map([
    [2, 'foo'],
    [1, 'bar'],
  ]);
}
// #enddocregion
