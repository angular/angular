/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable, NgZone} from '@angular/core';
import {EventEmitter} from './facade/async';

/**
 * A mock implementation of {@link NgZone}.
 */
@Injectable()
export class MockNgZone extends NgZone {
  private _mockOnStable: EventEmitter<any> = new EventEmitter(false);

  constructor() { super({enableLongStackTrace: false}); }

  get onStable() { return this._mockOnStable; }

  run(fn: Function): any { return fn(); }

  runOutsideAngular(fn: Function): any { return fn(); }

  simulateZoneExit(): void { this.onStable.emit(null); }
}
