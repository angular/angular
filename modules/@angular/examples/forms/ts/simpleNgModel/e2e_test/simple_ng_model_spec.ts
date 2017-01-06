/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ElementArrayFinder, ElementFinder, browser, by, element} from 'protractor';
import {verifyNoBrowserErrors} from '../../../../_common/e2e_util';

describe('simpleNgModel example', () => {
  afterEach(verifyNoBrowserErrors);
  let input: ElementFinder;
  let paragraphs: ElementArrayFinder;
  let button: ElementFinder;

  beforeEach(() => {
    browser.get('/forms/ts/simpleNgModel/index.html');
    input = element(by.css('input'));
    paragraphs = element.all(by.css('p'));
    button = element(by.css('button'));
  });

  it('should update the domain model as you type', () => {
    input.click();
    input.sendKeys('Carson');

    expect(paragraphs.get(0).getText()).toEqual('Value: Carson');
  });

  it('should report the validity correctly', () => {
    expect(paragraphs.get(1).getText()).toEqual('Valid: false');
    input.click();
    input.sendKeys('a');

    expect(paragraphs.get(1).getText()).toEqual('Valid: true');
  });

  it('should set the value by changing the domain model', () => {
    button.click();
    expect(input.getAttribute('value')).toEqual('Nancy');
  });

});
