/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {$, browser} from 'protractor';

import {openBrowser} from '../../../e2e_util/e2e_util';
import {runBenchmark} from '../../../e2e_util/perf_util';

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

  it('should work for detectChanges', () => {
    openTreeBenchmark();
    $('#detectChanges').click();
    expect($('#numberOfChecks').getText()).toContain('10');
  });

});

describe('benchmarks', () => {

  it('should work for createOnly', done => {
    runTreeBenchmark({
      id: 'createOnly',
      prepare: () => $('#destroyDom').click(),
      work: () => $('#createDom').click()
    }).then(done, done.fail);
  });

  it('should work for destroy', done => {
    runTreeBenchmark({
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

  it('should work for detectChanges', done => {
    runTreeBenchmark({
      id: 'detectChanges',
      work: () => $('#detectChanges').click(),
      setup: () => $('#destroyDom').click()
    }).then(done, done.fail);
  });

});

function runTreeBenchmark({id, prepare, setup, work}:
                              {id: string; prepare ? () : void; setup ? () : void; work(): void;}) {
  browser.rootEl = '#root';
  return runBenchmark({
    id: id,
    url: '',
    ignoreBrowserSynchronization: true,
    params: [{name: 'depth', value: 11}],
    work: work,
    prepare: prepare,
    setup: setup
  });
}

function openTreeBenchmark() {
  browser.rootEl = '#root';
  openBrowser({
    url: '',
    ignoreBrowserSynchronization: true,
    params: [{name: 'depth', value: 4}],
  });
}
