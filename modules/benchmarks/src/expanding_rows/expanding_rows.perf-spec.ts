/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {runBenchmark} from '../../../utilities/index';
import {$, browser} from 'protractor';

describe('benchmarks', () => {
  it('should work for create', async () => {
    browser.rootEl = '#root';
    await runBenchmark({
      id: 'create',
      url: '',
      ignoreBrowserSynchronization: true,
      params: [],
      prepare: () => $('#reset').click(),
      work: () => $('#init').click(),
    });
  });
});
