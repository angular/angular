/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';

// #docregion KeyValuePipe
@Component({
  selector: 'keyvalue-pipe',
  template: `<span>
    <p>Object</p>
    <div *ngFor="let item of object | keyvalue">
      {{item.key}}:{{item.value}}
    </div>
    <p>Map</p>
    <div *ngFor="let item of map | keyvalue">
      {{item.key}}:{{item.value}}
    </div>
  </span>`
})
export class KeyValuePipeComponent {
  object: {[key: number]: string} = {2: 'foo', 1: 'bar'};
  map = new Map([[2, 'foo'], [1, 'bar']]);
}
// #enddocregion
