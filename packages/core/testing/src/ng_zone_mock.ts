/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {EventEmitter, Injectable, NgZone} from '@angular/core';


/**
 * A mock implementation of {@link NgZone}.
 */
@Injectable()
export class MockNgZone extends NgZone {
  onStable: EventEmitter<any> = new EventEmitter(false);

  constructor() {
    super({enableLongStackTrace: false, shouldCoalesceEventChangeDetection: false});
  }

  run(fn: Function): any {
    return fn();
  }

  runOutsideAngular(fn: Function): any {
    return fn();
  }

  simulateZoneExit(): void {
    this.onStable.emit(null);
  }
}
