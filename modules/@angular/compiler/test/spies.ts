/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ResourceLoader} from '@angular/compiler/src/resource_loader';

import {SpyObject} from '@angular/core/testing/testing_internal';

export class SpyResourceLoader extends SpyObject {
  constructor() { super(ResourceLoader); }
}
