/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector, ɵglobal as global} from '@angular/core';
import {ApplicationRef} from '@angular/core/src/application_ref';
import {SpyObject} from '@angular/core/testing/src/testing_internal';

export class SpyApplicationRef extends SpyObject {
  constructor() {
    super(ApplicationRef);
  }
}

export class SpyComponentRef extends SpyObject {
  injector: any /** TODO #9100 */;
  constructor() {
    super();
    this.injector =
        Injector.create([{provide: ApplicationRef, useClass: SpyApplicationRef, deps: []}]);
  }
}

export function callNgProfilerTimeChangeDetection(config?: any /** TODO #9100 */): void {
  (<any>global).ng.profiler.timeChangeDetection(config);
}
