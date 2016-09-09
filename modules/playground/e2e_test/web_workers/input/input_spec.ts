/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {verifyNoBrowserErrors} from 'e2e_util/e2e_util';

describe('WebWorkers Input', function() {
  afterEach(() => {
    verifyNoBrowserErrors();
    browser.ignoreSynchronization = false;
  });
  const selector = 'input-app';
  const URL = 'all/playground/src/web_workers/input/index.html';
  const VALUE = 'test val';

  it('should bootstrap', () => {
    // This test can't wait for Angular 2 as Testability is not available when using WebWorker
    browser.ignoreSynchronization = true;
    browser.get(URL);

    waitForBootstrap();
    let elem = element(by.css(selector + ' h2'));
    expect(elem.getText()).toEqual('Input App');
  });

  it('should bind to input value', () => {
    // This test can't wait for Angular 2 as Testability is not available when using WebWorker
    browser.ignoreSynchronization = true;
    browser.get(URL);

    waitForBootstrap();
    let input = element(by.css(selector + ' input'));
    input.sendKeys(VALUE);
    let displayElem = element(by.css(selector + ' .input-val'));
    const expectedVal = `Input val is ${VALUE}.`;
    browser.wait(
        protractor.ExpectedConditions.textToBePresentInElement(displayElem, expectedVal), 5000);
    expect(displayElem.getText()).toEqual(expectedVal);
  });

  it('should bind to textarea value', () => {
    // This test can't wait for Angular 2 as Testability is not available when using WebWorker
    browser.ignoreSynchronization = true;
    browser.get(URL);

    waitForBootstrap();
    let input = element(by.css(selector + ' textarea'));
    input.sendKeys(VALUE);
    let displayElem = element(by.css(selector + ' .textarea-val'));
    const expectedVal = `Textarea val is ${VALUE}.`;
    browser.wait(
        protractor.ExpectedConditions.textToBePresentInElement(displayElem, expectedVal), 5000);
    expect(displayElem.getText()).toEqual(expectedVal);
  });

  function waitForBootstrap() {
    browser.wait(protractor.until.elementLocated(by.css(selector + ' h2')), 5000)
        .then(
            _ => {
              let elem = element(by.css(selector + ' h2'));
              browser.wait(
                  protractor.ExpectedConditions.textToBePresentInElement(elem, 'Input App'), 5000);
            },
            _ => {
              // jasmine will timeout if this gets called too many times
              console.log('>> unexpected timeout -> browser.refresh()');
              browser.refresh();
              waitForBootstrap();
            });
  }
});
