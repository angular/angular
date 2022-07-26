/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {$, browser} from 'protractor';
import {runBenchmark} from '@angular/build-tooling/bazel/benchmark/driver-utilities';

async function runRenderBenchmark(testId: string, showBtnId: string) {
  return runBenchmark({
    id: testId,
    url: '',
    ignoreBrowserSynchronization: true,
    prepare: async () => await $('#hide').click(),
    work: async () => await $(showBtnId).click(),
  });
}

describe('chip performance benchmarks', () => {
  beforeAll(() => {
    browser.angularAppRoot('#root');
  });

  it('renders a single chip', async () => {
    await runRenderBenchmark('single-chip-render', '#show-single-chip');
  });

  it('renders a set', async () => {
    await runRenderBenchmark('chip-set-render', '#show-chip-set');
  });

  it('renders a grid', async () => {
    await runRenderBenchmark('chip-grid-render', '#show-chip-grid');
  });

  it('renders a listbox', async () => {
    await runRenderBenchmark('chip-listbox-render', '#show-chip-listbox');
  });

  it('clicks a chip', async () => {
    await runBenchmark({
      id: 'chip-click',
      url: '',
      ignoreBrowserSynchronization: true,
      setup: async () => await $('#show-single-chip').click(),
      work: async () => await $('#single-chip').click(),
    });
  });
});
