/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {$} from 'protractor';
import {openTreeBenchmark, runTreeBenchmark} from './tree_perf_test_utils';

describe('benchmarks', () => {

  it('should work for createOnly', done => {
    runTreeBenchmark({
      // This cannot be called "createOnly" because the actual destroy benchmark
      // has the "createOnly" id already. See: https://github.com/angular/angular/pull/21503
      id: 'createOnlyForReal',
      prepare: () => $('#destroyDom').click(),
      work: () => $('#createDom').click()
    }).then(done, done.fail);
  });

});
