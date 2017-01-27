/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {verifyNoBrowserErrors} from 'e2e_util/e2e_util';
import {ExpectedConditions, browser, by, element, protractor} from 'protractor';


describe('WebWorkers Input', function() {
  afterEach(() => {
    verifyNoBrowserErrors();
    browser.ignoreSynchronization = false;
  });
  const selector = 'input-app';
  const URL = 'all/playground/src/web_workers/input/index.html';
  const VALUE = 'test val';

  it('should bootstrap', () => {
    // This test can't wait for Angular as Testability is not available when using WebWorker
    browser.ignoreSynchronization = true;
    browser.get(URL);

    waitForBootstrap();
    const elem = element(by.css(selector + ' h2'));
    expect(elem.getText()).toEqual('Input App');
  });

  it('should bind to input value', () => {
    // This test can't wait for Angular as Testability is not available when using WebWorker
    browser.ignoreSynchronization = true;
    browser.get(URL);

    waitForBootstrap();
    const input = element(by.css(selector + ' input'));
    input.sendKeys(VALUE);
    const displayElem = element(by.css(selector + ' .input-val'));
    const expectedVal = `Input val is ${VALUE}.`;
    browser.wait(ExpectedConditions.textToBePresentInElement(displayElem, expectedVal), 5000);
    expect(displayElem.getText()).toEqual(expectedVal);
  });

  it('should bind to textarea value', () => {
    // This test can't wait for Angular as Testability is not available when using WebWorker
    browser.ignoreSynchronization = true;
    browser.get(URL);

    waitForBootstrap();
    const input = element(by.css(selector + ' textarea'));
    input.sendKeys(VALUE);
    const displayElem = element(by.css(selector + ' .textarea-val'));
    const expectedVal = `Textarea val is ${VALUE}.`;
    browser.wait(ExpectedConditions.textToBePresentInElement(displayElem, expectedVal), 5000);
    expect(displayElem.getText()).toEqual(expectedVal);
  });

  function waitForBootstrap() {
    browser.wait(protractor.until.elementLocated(by.css(selector + ' h2')), 5000)
        .then(
            () => {
              const elem = element(by.css(selector + ' h2'));
              browser.wait(
                  protractor.ExpectedConditions.textToBePresentInElement(elem, 'Input App'), 5000);
            },
            () => {
              // jasmine will timeout if this gets called too many times
              console.error('>> unexpected timeout -> browser.refresh()');
              browser.refresh();
              waitForBootstrap();
            });
  }
});
