/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ElementArrayFinder, browser, by, element} from 'protractor';
import {verifyNoBrowserErrors} from '../../../../_common/e2e_util';

describe('nestedFormArray example', () => {
  afterEach(verifyNoBrowserErrors);
  let inputs: ElementArrayFinder;
  let buttons: ElementArrayFinder;

  beforeEach(() => {
    browser.get('/forms/ts/nestedFormArray/index.html');
    inputs = element.all(by.css('input'));
    buttons = element.all(by.css('button'));
  });

  it('should populate the UI with initial values', () => {
    expect(inputs.get(0).getAttribute('value')).toEqual('SF');
    expect(inputs.get(1).getAttribute('value')).toEqual('NY');
  });

  it('should add inputs programmatically', () => {
    expect(inputs.count()).toBe(2);

    buttons.get(1).click();
    inputs = element.all(by.css('input'));

    expect(inputs.count()).toBe(3);
  });

  it('should set the value programmatically', () => {
    buttons.get(2).click();
    expect(inputs.get(0).getAttribute('value')).toEqual('LA');
    expect(inputs.get(1).getAttribute('value')).toEqual('MTV');
  });

});
