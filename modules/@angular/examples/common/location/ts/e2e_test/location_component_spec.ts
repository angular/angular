/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {verifyNoBrowserErrors} from '../../../../_common/e2e_util';
import {browser, by, element, protractor} from 'protractor';


function waitForElement(selector: string) {
  var EC = (<any>protractor).ExpectedConditions;
  // Waits for the element with id 'abc' to be present on the dom.
  browser.wait(EC.presenceOf($(selector)), 20000);
}

describe('Location', () => {
  afterEach(verifyNoBrowserErrors);

  var URL = '/common/location/ts/#/bar/baz';

  it('should verify paths', () => {
    browser.get(URL);
    waitForElement('hash-location');
    expect(element.all(by.css('path-location code')).get(0).getText())
        .toEqual('/common/location/ts');
    expect(element.all(by.css('hash-location code')).get(0).getText()).toEqual('/bar/baz');
  });
});
