/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {browser, by, element, ElementFinder} from 'protractor';

import {verifyNoBrowserErrors} from '../../../../test-utils';

describe('nestedFormGroup example', () => {
  afterEach(verifyNoBrowserErrors);
  let firstInput: ElementFinder;
  let lastInput: ElementFinder;
  let button: ElementFinder;

  beforeEach(() => {
    browser.get('/nestedFormGroup');
    firstInput = element(by.css('[formControlName="first"]'));
    lastInput = element(by.css('[formControlName="last"]'));
    button = element(by.css('button:not([type="submit"])'));
  });

  it('should populate the UI with initial values', () => {
    expect(firstInput.getAttribute('value')).toEqual('Nancy');
    expect(lastInput.getAttribute('value')).toEqual('Drew');
  });

  it('should show the error when name is invalid', () => {
    firstInput.click();
    firstInput.clear();
    firstInput.sendKeys('a');

    expect(element(by.css('p')).getText()).toEqual('Name is invalid.');
  });

  it('should set the value programmatically', () => {
    button.click();
    expect(firstInput.getAttribute('value')).toEqual('Bess');
    expect(lastInput.getAttribute('value')).toEqual('Marvin');
  });
});
