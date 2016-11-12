/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {verifyNoBrowserErrors} from 'e2e_util/e2e_util';
import {browser, by, element} from 'protractor';

describe('Model-Driven Forms', function() {

  afterEach(verifyNoBrowserErrors);

  const URL = 'all/playground/src/model_driven_forms/index.html';

  it('should display errors', function() {
    browser.get(URL);

    const form = element.all(by.css('form')).first();
    const input = element.all(by.css('#creditCard')).first();
    const firstName = element.all(by.css('#firstName')).first();

    input.sendKeys('invalid');
    firstName.click();

    // TODO: getInnerHtml has been deprecated by selenium-webdriver in the
    // upcoming release of 3.0.0. Protractor has removed this method from
    // ElementFinder but can still be accessed via WebElement.
    expect(form.getWebElement().getInnerHtml()).toContain('is invalid credit card number');
  });
});
