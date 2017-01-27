/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {verifyNoBrowserErrors} from 'e2e_util/e2e_util';
import {ExpectedConditions, browser, by, element, protractor} from 'protractor';

describe('WebWorkers Kitchen Sink', function() {
  afterEach(() => {
    verifyNoBrowserErrors();
    browser.ignoreSynchronization = false;
  });
  const selector = 'hello-app .greeting';
  const URL = 'all/playground/src/web_workers/kitchen_sink/index.html';

  it('should greet', () => {
    // This test can't wait for Angular as Testability is not available when using WebWorker
    browser.ignoreSynchronization = true;
    browser.get(URL);

    browser.wait(protractor.until.elementLocated(by.css(selector)), 15000);
    const elem = element(by.css(selector));
    browser.wait(ExpectedConditions.textToBePresentInElement(elem, 'hello world!'), 5000);
    expect(elem.getText()).toEqual('hello world!');

  });

  it('should change greeting', () => {
    // This test can't wait for Angular as Testability is not available when using WebWorker
    browser.ignoreSynchronization = true;
    browser.get(URL);
    const changeButtonSelector = 'hello-app .changeButton';

    browser.wait(protractor.until.elementLocated(by.css(changeButtonSelector)), 15000);
    element(by.css(changeButtonSelector)).click();
    const elem = element(by.css(selector));
    browser.wait(ExpectedConditions.textToBePresentInElement(elem, 'howdy world!'), 5000);
    expect(elem.getText()).toEqual('howdy world!');
  });

  it('should display correct key names', () => {
    // This test can't wait for Angular as Testability is not available when using WebWorker
    browser.ignoreSynchronization = true;
    browser.get(URL);
    browser.wait(protractor.until.elementLocated(by.css('.sample-area')), 15000);

    const area = element.all(by.css('.sample-area')).first();
    expect(area.getText()).toEqual('(none)');

    area.sendKeys('u');
    browser.wait(ExpectedConditions.textToBePresentInElement(area, 'U'), 5000);
    expect(area.getText()).toEqual('U');
  });
});
