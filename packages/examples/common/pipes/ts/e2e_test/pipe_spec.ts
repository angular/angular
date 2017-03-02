/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {$, ExpectedConditions, browser, by, element} from 'protractor';
import {verifyNoBrowserErrors} from '../../../../_common/e2e_util';

function waitForElement(selector: string) {
  const EC = ExpectedConditions;
  // Waits for the element with id 'abc' to be present on the dom.
  browser.wait(EC.presenceOf($(selector)), 20000);
}

describe('pipe', () => {
  afterEach(verifyNoBrowserErrors);

  describe('async', () => {
    const URL = '/common/pipes/ts/';

    it('should resolve and display promise', () => {
      browser.get(URL);
      waitForElement('async-promise-pipe');
      expect(element.all(by.css('async-promise-pipe span')).get(0).getText())
          .toEqual('Wait for it...');
      element(by.css('async-promise-pipe button')).click();
      expect(element.all(by.css('async-promise-pipe span')).get(0).getText())
          .toEqual('Wait for it... hi there!');
    });

    it('should update lowercase/uppercase', () => {
      browser.get(URL);
      waitForElement('lowerupper-pipe');
      element(by.css('lowerupper-pipe input')).sendKeys('Hello World!');
      expect(element.all(by.css('lowerupper-pipe pre')).get(0).getText())
          .toEqual('\'hello world!\'');
      expect(element.all(by.css('lowerupper-pipe pre')).get(1).getText())
          .toEqual('\'HELLO WORLD!\'');
    });
  });
});
