/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {$} from 'protractor';

import {openTreeBenchmark} from './test_utils';

describe('tree benchmark', () => {
  it('should work for createDestroy', async () => {
    openTreeBenchmark();
    await $('#createDom').click();
    expect($('#root').getText()).toContain('1');
    await $('#destroyDom').click();
    expect(await $('#root').getText()).toEqual('');
  });

  it('should work for update', async () => {
    openTreeBenchmark();
    await $('#createDom').click();
    await $('#createDom').click();
    expect($('#root').getText()).toContain('A');
  });
});
