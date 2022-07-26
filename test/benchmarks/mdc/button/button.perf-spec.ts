/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {$, browser} from 'protractor';
import {runBenchmark} from '@angular/build-tooling/bazel/benchmark/driver-utilities';

describe('button performance benchmarks', () => {
  beforeAll(() => {
    browser.angularAppRoot('#root');
  });

  it('renders a basic raised button', async () => {
    await runBenchmark({
      id: 'button-render',
      url: '',
      ignoreBrowserSynchronization: true,
      prepare: async () => await $('#hide').click(),
      work: async () => await $('#show').click(),
    });
  });

  it('clicks a basic raised button', async () => {
    await runBenchmark({
      id: 'button-click',
      url: '',
      ignoreBrowserSynchronization: true,
      setup: async () => await $('#show').click(),
      work: async () => await $('.mat-mdc-raised-button').click(),
    });
  });
});
