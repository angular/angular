/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ApplicationRef, Injector, NgZone} from '@angular/core';

export class NgElementApplicationContext {
  applicationRef = this.injector.get<ApplicationRef>(ApplicationRef);
  ngZone = this.injector.get<NgZone>(NgZone);

  constructor(public injector: Injector) {}

  runInNgZone<R>(cb: () => R): R { return this.ngZone.run(cb); }
}
