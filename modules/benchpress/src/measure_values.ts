/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Map} from '@angular/facade/src/collection';
import {Date, DateWrapper} from '@angular/facade/src/lang';

export class MeasureValues {
  constructor(
      public runIndex: number, public timeStamp: Date, public values: {[key: string]: any}) {}

  toJson() {
    return {
      'timeStamp': DateWrapper.toJson(this.timeStamp),
      'runIndex': this.runIndex,
      'values': this.values
    };
  }
}
