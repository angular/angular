/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {$} from 'protractor';
import {runTreeBenchmark} from './test_utils';

describe('tree benchmark detect changes perf', () => {
  it('should work for detectChanges', async () => {
    await runTreeBenchmark({
      id: 'detectChanges',
      work: () => $('#detectChanges').click(),
      setup: () => $('#destroyDom').click()
    });
  });
});
