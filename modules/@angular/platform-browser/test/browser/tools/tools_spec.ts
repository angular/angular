/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {afterEach, beforeEach, describe, it} from '@angular/core/testing/testing_internal';
import {disableDebugTools, enableDebugTools} from '@angular/platform-browser';

import {SpyComponentRef, callNgProfilerTimeChangeDetection} from './spies';

export function main() {
  describe('profiler', () => {
    beforeEach(() => { enableDebugTools((<any>new SpyComponentRef())); });

    afterEach(() => { disableDebugTools(); });

    it('should time change detection', () => { callNgProfilerTimeChangeDetection(); });

    it('should time change detection with recording',
       () => { callNgProfilerTimeChangeDetection({'record': true}); });
  });
}
