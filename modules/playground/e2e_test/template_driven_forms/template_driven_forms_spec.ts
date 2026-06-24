/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {verifyNoBrowserErrors} from '../../../utilities/index';
import {browser, by, element} from 'protractor';

describe('Template-Driven Forms', function () {
  afterEach(verifyNoBrowserErrors);

  const URL = '/';

  it('should display errors', function () {
    browser.get(URL);

    const form = element.all(by.css('form')).first();
    const input = element.all(by.css('#creditCard')).first();
    const firstName = element.all(by.css('#firstName')).first();

    input.sendKeys('invalid');
    firstName.click();

    expect(form.getAttribute('innerHTML')).toContain('is invalid credit card number');
  });
});
