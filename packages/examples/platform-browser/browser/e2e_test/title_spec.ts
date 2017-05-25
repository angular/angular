/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {$, ExpectedConditions, browser, by, element, ElementFinder} from 'protractor';
import {verifyNoBrowserErrors} from '../../../_common/e2e_util';

function waitForElement(selector: string) {
  const EC = ExpectedConditions;
  // Waits for the element with id 'abc' to be present on the dom.
  browser.wait(EC.presenceOf($(selector)), 20000);
}

fdescribe('Set Document Title', function() {
  const URL = '/platform-browser/browser/';
  afterEach(verifyNoBrowserErrors);

  it('should set the document title', function() {
    browser.get(URL);

    let titles = ['Good morning!', 'Good afternoon!', 'Good evening!'];

    element.all(by.css('ul li a')).each(function iterator(element: ElementFinder, i: number) {

      element.click();
      expect(browser.getTitle()).toEqual(titles[i]);

    });

  });

});
