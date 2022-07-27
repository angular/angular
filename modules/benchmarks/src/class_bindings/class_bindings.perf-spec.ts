/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {runBenchmark} from '@angular/build-tooling/bazel/benchmark/driver-utilities';
import {$, browser} from 'protractor';

describe('class bindings perf', () => {
  it('should work for update', async () => {
    browser.rootEl = '#root';
    await runBenchmark({
      id: 'create',
      url: '',
      ignoreBrowserSynchronization: true,
      params: [],
      prepare: () => $('#destroy').click(),
      work: () => $('#create').click()
    });
  });

  it('should work for update', async () => {
    browser.rootEl = '#root';
    await runBenchmark({
      id: 'update',
      url: '',
      ignoreBrowserSynchronization: true,
      params: [],
      prepare: () => $('#create').click(),
      work: () => $('#update').click()
    });
  });
});
