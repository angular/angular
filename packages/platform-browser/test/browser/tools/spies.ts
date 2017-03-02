/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ReflectiveInjector, ɵglobal as global} from '@angular/core';
import {ApplicationRef, ApplicationRef_} from '@angular/core/src/application_ref';
import {SpyObject} from '@angular/core/testing/src/testing_internal';

export class SpyApplicationRef extends SpyObject {
  constructor() { super(ApplicationRef_); }
}

export class SpyComponentRef extends SpyObject {
  injector: any /** TODO #9100 */;
  constructor() {
    super();
    this.injector = ReflectiveInjector.resolveAndCreate(
        [{provide: ApplicationRef, useClass: SpyApplicationRef}]);
  }
}

export function callNgProfilerTimeChangeDetection(config?: any /** TODO #9100 */): void {
  (<any>global).ng.profiler.timeChangeDetection(config);
}
