/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {verifyNoBrowserErrors} from 'e2e_util/e2e_util';
import {browser, by, element, protractor} from 'protractor';

describe('WebWorkers Animations', function() {
  afterEach(() => {
    verifyNoBrowserErrors();
    browser.ignoreSynchronization = false;
  });

  const selector = 'animation-app';
  const URL = 'all/playground/src/web_workers/animations/index.html';

  it('should bootstrap', () => {
    // This test can't wait for Angular 2 as Testability is not available when using WebWorker
    browser.ignoreSynchronization = true;
    browser.get(URL);

    waitForBootstrap();
    let elem = element(by.css(selector + ' .box'));
    expect(elem.getText()).toEqual('...');
  });

  it('should animate to open', () => {
    // This test can't wait for Angular 2 as Testability is not available when using WebWorker
    browser.ignoreSynchronization = true;
    browser.get(URL);

    waitForBootstrap();
    element(by.css(selector + ' button')).click();

    let boxElm = element(by.css(selector + ' .box'));
    browser.wait(() => boxElm.getSize().then(sizes => sizes['width'] > 750), 1000);
  });

  function waitForBootstrap() {
    browser.wait(protractor.until.elementLocated(by.css(selector + ' .box')), 5000)
        .then(() => {}, () => {
          // jasmine will timeout if this gets called too many times
          console.log('>> unexpected timeout -> browser.refresh()');
          browser.refresh();
          waitForBootstrap();
        });
  }
});
