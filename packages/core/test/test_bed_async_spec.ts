/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {TestBed} from '@angular/core/testing/src/test_bed';
import {AsyncTestCompleter, ddescribe, describe, inject, it} from '@angular/core/testing/src/testing_internal';

describe('TestBed with async processing', () => {
  beforeEach(() => {
    TestBed.resetTestingModule();
  });

  it('should allow injecting AsyncTestCompleter',
     inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
       async.done();
     }));
});
