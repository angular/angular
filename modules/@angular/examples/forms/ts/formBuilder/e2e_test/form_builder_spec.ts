/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {verifyNoBrowserErrors} from '../../../../_common/e2e_util';

describe('formBuilder example', () => {
  afterEach(verifyNoBrowserErrors);
  let inputs: protractor.ElementArrayFinder;
  let paragraphs: protractor.ElementArrayFinder;

  beforeEach(() => {
    browser.get('/forms/ts/formBuilder/index.html');
    inputs = element.all(by.css('input'));
    paragraphs = element.all(by.css('p'));
  });

  it('should populate the UI with initial values', () => {
    expect(inputs.get(0).getAttribute('value')).toEqual('Nancy');
    expect(inputs.get(1).getAttribute('value')).toEqual('Drew');
  });

  it('should update the validation status', () => {
    expect(paragraphs.get(1).getText()).toEqual('Validation status: VALID');

    inputs.get(0).click();
    inputs.get(0).clear();
    inputs.get(0).sendKeys('a');
    expect(paragraphs.get(1).getText()).toEqual('Validation status: INVALID');
  });

});
