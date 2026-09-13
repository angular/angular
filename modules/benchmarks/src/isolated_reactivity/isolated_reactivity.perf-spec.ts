/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {runBenchmark, verifyNoBrowserErrors} from '../../../utilities/index.js';
import {$} from 'protractor';

describe('isolated reactivity benchmark', () => {
  afterEach(verifyNoBrowserErrors);

  for (const benchmarkCase of ['baseline', 'isolated', 'component']) {
    it(`updates the ${benchmarkCase} case`, async () => {
      await runBenchmark({
        id: `isolated_reactivity.${benchmarkCase}`,
        url: '/',
        ignoreBrowserSynchronization: true,
        prepare: () => $('#reset-metrics').click(),
        work: () => $(`#update-${benchmarkCase}`).click(),
      });
    });
  }
});
