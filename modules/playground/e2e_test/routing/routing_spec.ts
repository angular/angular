/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {verifyNoBrowserErrors} from 'e2e_util/e2e_util';
import {$, ExpectedConditions, browser, by, element} from 'protractor';

function waitForElement(selector: string) {
  // Waits for the element with id 'abc' to be present on the dom.
  browser.wait(ExpectedConditions.presenceOf($(selector)), 20000);
}

describe('routing inbox-app', () => {

  afterEach(verifyNoBrowserErrors);

  describe('index view', () => {
    const URL = 'all/playground/src/routing/';

    it('should list out the current collection of items', () => {
      browser.get(URL);
      waitForElement('.inbox-item-record');
      expect(element.all(by.css('.inbox-item-record')).count()).toEqual(200);
    });
  });
});
