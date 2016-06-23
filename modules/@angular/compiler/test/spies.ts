/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {XHR} from '@angular/compiler/src/xhr';

import {SpyObject, proxy} from '@angular/core/testing/testing_internal';

export class SpyXHR extends SpyObject {
  constructor() { super(XHR); }
}
