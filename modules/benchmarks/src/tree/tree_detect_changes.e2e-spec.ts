/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {$} from 'protractor';

import {openTreeBenchmark} from './test_utils';

describe('tree benchmark detect changes', () => {
  it('should work for detectChanges', async () => {
    openTreeBenchmark();
    await $('#detectChanges').click();
    expect($('#numberOfChecks').getText()).toContain('10');
  });
});
