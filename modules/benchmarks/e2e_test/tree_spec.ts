/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {openBrowser, verifyNoBrowserErrors} from 'e2e_util/e2e_util';
import {$, browser} from 'protractor';

import {Benchmark, Benchmarks, CreateBtn, DestroyBtn, DetectChangesBtn, NumberOfChecksEl, RootEl} from './tree_data';

describe('tree benchmark spec', () => {

  let _oldRootEl: any;
  beforeEach(() => _oldRootEl = browser.rootEl);

  afterEach(() => {
    browser.rootEl = _oldRootEl;
    verifyNoBrowserErrors();
  });

  Benchmarks.forEach(benchmark => {
    describe(benchmark.id, () => {
      it('should work for createDestroy', () => {
        openTreeBenchmark(benchmark);
        $(CreateBtn).click();
        expect($(RootEl).getText()).toContain('0');
        $(DestroyBtn).click();
        expect($(RootEl).getText()).toEqual('');
      });

      it('should work for update', () => {
        openTreeBenchmark(benchmark);
        $(CreateBtn).click();
        $(CreateBtn).click();
        expect($(RootEl).getText()).toContain('A');
      });

      if (benchmark.buttons.indexOf(DetectChangesBtn) !== -1) {
        it('should work for detectChanges', () => {
          openTreeBenchmark(benchmark);
          $(DetectChangesBtn).click();
          expect($(NumberOfChecksEl).getText()).toContain('10');
        });
      }
    });
  });

  function openTreeBenchmark(benchmark: Benchmark) {
    let params = [{name: 'depth', value: 4}];
    if (benchmark.extraParams) {
      params = params.concat(benchmark.extraParams);
    }
    browser.rootEl = RootEl;
    openBrowser({
      url: benchmark.url,
      ignoreBrowserSynchronization: benchmark.ignoreBrowserSynchronization,
      params: params,
    });
  }
});
