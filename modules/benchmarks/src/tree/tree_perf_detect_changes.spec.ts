/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {$} from 'protractor';
import {openTreeBenchmark, runTreeBenchmark} from './tree_perf_test_utils';

describe('benchmark render', () => {
  it('should work for detectChanges', () => {
    openTreeBenchmark();
    $('#detectChanges').click();
    expect($('#numberOfChecks').getText()).toContain('10');
  });
});

describe('benchmarks', () => {
  it('should work for detectChanges', async() => {
    await runTreeBenchmark({
      id: 'detectChanges',
      work: () => $('#detectChanges').click(),
      setup: () => $('#destroyDom').click()
    });
  });
});
