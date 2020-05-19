/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectorRef} from '@angular/core/src/change_detection/change_detector_ref';
import {SpyObject} from '@angular/core/testing/src/testing_internal';

export class SpyChangeDetectorRef extends SpyObject {
  constructor() {
    super(ChangeDetectorRef);
    this.spy('markForCheck');
  }
}

export class SpyNgControl extends SpyObject {
  path = [];
}

export class SpyValueAccessor extends SpyObject {
  writeValue: any;
}
