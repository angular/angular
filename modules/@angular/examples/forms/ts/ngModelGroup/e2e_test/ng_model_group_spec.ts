/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {verifyNoBrowserErrors} from '../../../../_common/e2e_util';

describe('ngModelGroup example', () => {
  afterEach(verifyNoBrowserErrors);
  let inputs: protractor.ElementArrayFinder;
  let buttons: protractor.ElementArrayFinder;

  beforeEach(() => {
    browser.get('/forms/ts/ngModelGroup/index.html');
    inputs = element.all(by.css('input'));
    buttons = element.all(by.css('button'));
  });

  it('should populate the UI with initial values', () => {
    expect(inputs.get(0).getAttribute('value')).toEqual('Nancy');
    expect(inputs.get(1).getAttribute('value')).toEqual('Drew');
  });

  it('should show the error when name is invalid', () => {
    inputs.get(0).click();
    inputs.get(0).clear();
    inputs.get(0).sendKeys('a');

    expect(element(by.css('p')).getText()).toEqual('Name is invalid.');
  });

  it('should set the value when changing the domain model', () => {
    buttons.get(1).click();
    expect(inputs.get(0).getAttribute('value')).toEqual('Bess');
    expect(inputs.get(1).getAttribute('value')).toEqual('Marvin');
  });

});
