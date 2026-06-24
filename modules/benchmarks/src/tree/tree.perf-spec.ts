/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {$} from 'protractor';
import {runTreeBenchmark} from './test_utils';

describe('tree benchmark perf', () => {
  it('should work for createOnly', async () => {
    await runTreeBenchmark({
      // This cannot be called "createOnly" because the actual destroy benchmark
      // has the "createOnly" id already. See: https://github.com/angular/angular/pull/21503
      id: 'createOnlyForReal',
      prepare: () => $('#destroyDom').click(),
      work: () => $('#createDom').click(),
    });
  });

  it('should work for destroy', async () => {
    await runTreeBenchmark({
      // This is actually a benchmark for destroying the dom, but it has been accidentally
      // named "createOnly". See https://github.com/angular/angular/pull/21503.
      id: 'createOnly',
      prepare: () => $('#createDom').click(),
      work: () => $('#destroyDom').click(),
    });
  });

  it('should work for createDestroy', async () => {
    await runTreeBenchmark({
      id: 'createDestroy',
      work: () => {
        $('#destroyDom').click();
        $('#createDom').click();
      },
    });
  });

  it('should work for update', async () => {
    await runTreeBenchmark({
      id: 'update',
      work: () => $('#createDom').click(),
    });
  });
});
