/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';

// #docregion EntriesPipe
@Component({
  selector: 'entries-pipe',
  template: `<div *ngFor="let entry of object | entries">
    key is {{entry.key}} and value is {{entry.value}}
  </div>`
})
export class EntriesPipeComponent {
  object: Object = {key1: 'value1', key2: 'value2'};
}
// #enddocregion
