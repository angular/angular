/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {$} from 'protractor';
import {openTreeBenchmark, runTreeBenchmark} from './tree_perf_test_utils';

describe('benchmark render', () => {
  it('should work for createDestroy', () => {
    openTreeBenchmark();
    $('#createDom').click();
    expect($('#root').getText()).toContain('0');
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

describe('benchmarks', () => {

  it('should work for createOnly', done => {
    runTreeBenchmark({
      // This cannot be called "createOnly" because the actual destroy benchmark
      // has the "createOnly" id already. See: https://github.com/angular/angular/pull/21503
      id: 'createOnlyForReal',
      prepare: () => $('#destroyDom').click(),
      work: () => $('#createDom').click()
    }).then(done, done.fail);
  });

  it('should work for destroy', done => {
    runTreeBenchmark({
      // This is actually a benchmark for destroying the dom, but it has been accidentally
      // named "createOnly". See https://github.com/angular/angular/pull/21503.
      id: 'createOnly',
      prepare: () => $('#createDom').click(),
      work: () => $('#destroyDom').click()
    }).then(done, done.fail);
  });

  it('should work for createDestroy', done => {
    runTreeBenchmark({
      id: 'createDestroy',
      work: () => {
        $('#destroyDom').click();
        $('#createDom').click();
      }
    }).then(done, done.fail);
  });

  it('should work for update', done => {
    runTreeBenchmark({id: 'update', work: () => $('#createDom').click()}).then(done, done.fail);
  });
});
