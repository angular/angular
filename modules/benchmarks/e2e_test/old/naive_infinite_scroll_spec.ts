/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {verifyNoBrowserErrors} from '@angular/testing/src/e2e_util';
import {runClickBenchmark} from '@angular/testing/src/perf_util';

describe('ng2 naive infinite scroll benchmark', function() {

  const URL = 'benchmarks/src/naive_infinite_scroll/index.html?appSize=3';

  afterEach(verifyNoBrowserErrors);

  it('should not throw errors', function() {
    browser.get(URL);
    const expectedRowCount = 18;
    const expectedCellsPerRow = 27;
    const allScrollItems = 'scroll-app #testArea scroll-item';
    const cells = `${ allScrollItems } .row *`;
    const stageButtons = `${ allScrollItems } .row stage-buttons button`;

    const count = function(selector) {
      return browser.executeScript(
          `return ` +
          `document.querySelectorAll("${ selector }").length;`);
    };

    const clickFirstOf = function(selector) {
      return browser.executeScript(`document.querySelector("${ selector }").click();`);
    };

    const firstTextOf = function(selector) {
      return browser.executeScript(
          `return ` +
          `document.querySelector("${ selector }").innerText;`);
    };

    // Make sure rows are rendered
    count(allScrollItems).then(function(c) { expect(c).toEqual(expectedRowCount); });

    // Make sure cells are rendered
    count(cells).then(function(c) { expect(c).toEqual(expectedRowCount * expectedCellsPerRow); });

    // Click on first enabled button and verify stage changes
    firstTextOf(`${ stageButtons }:enabled`).then(function(text) {
      expect(text).toEqual('Pitched');
      clickFirstOf(`${ stageButtons }:enabled`).then(function() {
        firstTextOf(`${ stageButtons }:enabled`).then((text) => expect(text).toEqual('Won'));
      });
    });

    $('#reset-btn').click();
    $('#run-btn').click();
    browser.wait(() => {
      return $('#done').getText().then(function() { return true; }, function() { return false; });
    }, 10000);
  });

});
