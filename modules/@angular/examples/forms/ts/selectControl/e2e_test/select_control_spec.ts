/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {verifyNoBrowserErrors} from '../../../../_common/e2e_util';

describe('selectControl example', () => {
  afterEach(verifyNoBrowserErrors);
  let select: protractor.ElementFinder;
  let options: protractor.ElementArrayFinder;
  let p: protractor.ElementFinder;

  beforeEach(() => {
    browser.get('/forms/ts/selectControl/index.html');
    select = element(by.css('select'));
    options = element.all(by.css('option'));
    p = element(by.css('p'));
  });

  it('should initially select the placeholder option',
     () => { expect(options.get(0).getAttribute('selected')).toBe('true'); });

  it('should update the model when the value changes in the UI', () => {
    select.click();
    options.get(1).click();

    expect(p.getText()).toEqual('Form value: { "state": { "name": "Arizona", "abbrev": "AZ" } }');
  });

});
