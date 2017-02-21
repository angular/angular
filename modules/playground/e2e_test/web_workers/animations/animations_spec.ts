/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {verifyNoBrowserErrors} from 'e2e_util/e2e_util';
import {browser, by, element, protractor} from 'protractor';

// TODO(matsko): make this test work again with new view engine.
xdescribe('WebWorkers Animations', function() {
  afterEach(() => {
    verifyNoBrowserErrors();
    browser.ignoreSynchronization = false;
  });

  const selector = 'animation-app';
  const URL = 'all/playground/src/web_workers/animations/index.html';

  it('should bootstrap', () => {
    // This test can't wait for Angular as Testability is not available when using WebWorker
    browser.ignoreSynchronization = true;
    browser.get(URL);

    waitForBootstrap();
    const elem = element(by.css(selector + ' .box'));
    expect(elem.getText()).toEqual('...');
  });

  it('should animate to open', () => {
    // This test can't wait for Angular as Testability is not available when using WebWorker
    browser.ignoreSynchronization = true;
    browser.get(URL);

    waitForBootstrap();
    element(by.css(selector + ' button')).click();

    const boxElm = element(by.css(selector + ' .box'));
    browser.wait(() => boxElm.getSize().then(sizes => sizes['width'] > 750), 1000);
  });

  it('should cancel the animation midway and continue from where it left off', () => {
    browser.ignoreSynchronization = true;
    browser.get(URL);

    waitForBootstrap();

    const elem = element(by.css(selector + ' .box'));
    const btn = element(by.css(selector + ' button'));
    const getWidth = () => elem.getSize().then((sizes: any) => sizes['width']);

    btn.click();

    browser.sleep(250);

    btn.click();

    expect(getWidth()).toBeLessThan(600);

    browser.sleep(500);

    expect(getWidth()).toBeLessThan(50);
  });

  function waitForBootstrap() {
    browser.wait(protractor.until.elementLocated(by.css(selector + ' .box')), 5000)
        .then(() => {}, () => {
          // jasmine will timeout if this gets called too many times
          console.error('>> unexpected timeout -> browser.refresh()');
          browser.refresh();
          waitForBootstrap();
        });
  }
});
