/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {$, browser} from 'protractor';
import {runBenchmark} from '@angular/build-tooling/bazel/benchmark/driver-utilities';

describe('radio button performance benchmarks', () => {
  beforeAll(() => {
    browser.angularAppRoot('#root');
  });

  it('renders two radio buttons', async () => {
    await runBenchmark({
      id: 'render-two-radio-buttons',
      url: '',
      ignoreBrowserSynchronization: true,
      prepare: async () => await $('#hide-two').click(),
      work: async () => await $('#show-two').click(),
    });
  });

  it('renders ten radio buttons', async () => {
    await runBenchmark({
      id: 'render-ten-radio-buttons',
      url: '',
      ignoreBrowserSynchronization: true,
      prepare: async () => await $('#hide-ten').click(),
      work: async () => await $('#show-ten').click(),
    });
  });

  it('changing between radio buttons', async () => {
    await runBenchmark({
      id: 'click-radio-button',
      url: '',
      ignoreBrowserSynchronization: true,
      setup: async () => await $('#show-two').click(),
      prepare: async () => await $('#btn-1').click(),
      work: async () => await $('#btn-2').click(),
    });
  });
});
