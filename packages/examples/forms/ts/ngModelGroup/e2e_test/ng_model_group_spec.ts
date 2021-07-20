/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {browser, by, element, ElementArrayFinder} from 'protractor';

import {verifyNoBrowserErrors} from '../../../../test-utils';

describe('ngModelGroup example', () => {
  afterEach(verifyNoBrowserErrors);
  let inputs: ElementArrayFinder;
  let buttons: ElementArrayFinder;

  beforeEach(() => {
    browser.get('/ngModelGroup');
    inputs = element.all(by.css('input'));
    buttons = element.all(by.css('button'));
  });

  it('should populate the UI with initial values', () => {
    expect(inputs.get(0).getAttribute('value')).toEqual('Nancy');
    expect(inputs.get(1).getAttribute('value')).toEqual('J');
    expect(inputs.get(2).getAttribute('value')).toEqual('Drew');
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
    expect(inputs.get(1).getAttribute('value')).toEqual('S');
    expect(inputs.get(2).getAttribute('value')).toEqual('Marvin');
  });
});
