/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ResourceLoader} from '@angular/compiler/src/resource_loader';

import {SpyObject} from '@angular/core/testing/src/testing_internal';

export class SpyResourceLoader extends SpyObject {
  public static PROVIDE = {provide: ResourceLoader, useClass: SpyResourceLoader, deps: []};
  constructor() {
    super(ResourceLoader);
  }
}
