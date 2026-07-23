/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {$, browser, by, element, ExpectedConditions} from 'protractor';

import {verifyNoBrowserErrors} from '../../../../../test-utils';

function waitForElement(selector: string) {
  const EC = ExpectedConditions;
  // Waits for the element with id 'abc' to be present on the dom.
  browser.wait(EC.presenceOf($(selector)), 20000);
}

describe('animation example', () => {
  afterEach(verifyNoBrowserErrors);

  describe('index view', () => {
    const URL = '/animation/dsl/';

    it('should list out the current collection of items', () => {
      browser.get(URL);
      waitForElement('.toggle-container');
      expect(element.all(by.css('.toggle-container')).get(0).getText()).toEqual('Look at this box');
    });
  });
});
