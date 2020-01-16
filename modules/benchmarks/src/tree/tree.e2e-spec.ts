/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {$} from 'protractor';

import {openTreeBenchmark} from './test_utils';

describe('tree benchmark', () => {
  it('should work for createDestroy', () => {
    openTreeBenchmark();
    $('#createDom').click();
    expect($('#root').getText()).toContain('1');
    $('#destroyDom').click();
    expect($('#root').getText() as any).toEqual('');
  });

  it('should work for update', () => {
    openTreeBenchmark();
    $('#createDom').click();
    $('#createDom').click();
    expect($('#root').getText()).toContain('A');
  });
});
