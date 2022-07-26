/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {$, browser} from 'protractor';
import {runBenchmark} from '@angular/build-tooling/bazel/benchmark/driver-utilities';

function runTableRenderBenchmark(testId: string, buttonId: string) {
  return runBenchmark({
    id: testId,
    url: '',
    ignoreBrowserSynchronization: true,
    prepare: async () => await $('#hide').click(),
    work: async () => await $(buttonId).click(),
  });
}

describe('table performance benchmarks', () => {
  beforeAll(() => {
    browser.angularAppRoot('#root');
  });

  it('renders 10 rows with 5 cols', async () => {
    await runTableRenderBenchmark('table-render-10-rows-5-cols', '#show-10-rows-5-cols');
  });

  it('renders 100 rows with 5 cols', async () => {
    await runTableRenderBenchmark('table-render-100-rows-5-cols', '#show-100-rows-5-cols');
  });

  it('renders 1000 rows with 5 cols', async () => {
    await runTableRenderBenchmark('table-render-1000-rows-5-cols', '#show-1000-rows-5-cols');
  });

  it('renders 10 rows with 10 cols', async () => {
    await runTableRenderBenchmark('table-render-10-rows-10-cols', '#show-10-rows-10-cols');
  });

  it('renders 10 rows with 20 cols', async () => {
    await runTableRenderBenchmark('table-render-10-rows-20-cols', '#show-10-rows-20-cols');
  });
});
