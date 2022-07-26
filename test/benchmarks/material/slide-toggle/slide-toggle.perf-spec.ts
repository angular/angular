/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {$, browser} from 'protractor';
import {runBenchmark} from '@angular/build-tooling/bazel/benchmark/driver-utilities';

describe('slide toggle performance benchmarks', () => {
  beforeAll(() => {
    browser.angularAppRoot('#root');
  });

  it('renders a slide toggle', async () => {
    await runBenchmark({
      id: 'slide-toggle-render',
      url: '',
      ignoreBrowserSynchronization: true,
      prepare: async () => await $('#hide').click(),
      work: async () => await $('#show').click(),
    });
  });

  it('clicks a slide toggle', async () => {
    await runBenchmark({
      id: 'slide-toggle-click',
      url: '',
      ignoreBrowserSynchronization: true,
      setup: async () => await $('#show').click(),
      work: async () => await $('.mat-slide-toggle-bar').click(),
    });
  });
});
