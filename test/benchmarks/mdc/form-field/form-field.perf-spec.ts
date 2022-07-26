/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {$, browser} from 'protractor';
import {runBenchmark} from '@angular/build-tooling/bazel/benchmark/driver-utilities';

function runFormFieldRenderBenchmark(testId: string, showBtnId: string) {
  return runBenchmark({
    id: testId,
    url: '',
    ignoreBrowserSynchronization: true,
    prepare: async () => await $('#hide').click(),
    work: async () => await $(showBtnId).click(),
  });
}

describe('form field performance benchmarks', () => {
  beforeAll(() => {
    browser.angularAppRoot('#root');
  });

  it('renders an input in a form field', async () => {
    await runFormFieldRenderBenchmark('input-form-field-render', '#show-input');
  });

  it('renders an textarea in a form field', async () => {
    await runFormFieldRenderBenchmark('textarea-form-field-render', '#show-textarea');
  });
});
