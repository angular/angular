/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {$, browser, by, element, protractor} from 'protractor';

import {verifyNoBrowserErrors} from '../../../../test-utils';

function waitForElement(selector: string) {
  const EC = (<any>protractor).ExpectedConditions;
  // Waits for the element with id 'abc' to be present on the dom.
  browser.wait(EC.presenceOf($(selector)), 20000);
}

describe('Location', () => {
  afterEach(verifyNoBrowserErrors);

  it('should verify paths', () => {
    browser.get('/location/#/bar/baz');
    waitForElement('hash-location');
    expect(element.all(by.css('path-location code')).get(0).getText()).toEqual('/location');
    expect(element.all(by.css('hash-location code')).get(0).getText()).toEqual('/bar/baz');
  });
});
