/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {browser, by, element, ElementArrayFinder} from 'protractor';

import {verifyNoBrowserErrors} from '../../../../test-utils';

describe('simpleForm example', () => {
  afterEach(verifyNoBrowserErrors);
  let inputs: ElementArrayFinder;
  let paragraphs: ElementArrayFinder;

  beforeEach(() => {
    browser.get('/simpleForm');
    inputs = element.all(by.css('input'));
    paragraphs = element.all(by.css('p'));
  });

  it('should update the domain model as you type', () => {
    inputs.get(0).click();
    inputs.get(0).sendKeys('Nancy');

    inputs.get(1).click();
    inputs.get(1).sendKeys('Drew');

    expect(paragraphs.get(0).getText()).toEqual('First name value: Nancy');
    expect(paragraphs.get(2).getText()).toEqual('Form value: { "first": "Nancy", "last": "Drew" }');
  });

  it('should report the validity correctly', () => {
    expect(paragraphs.get(1).getText()).toEqual('First name valid: false');
    expect(paragraphs.get(3).getText()).toEqual('Form valid: false');
    inputs.get(0).click();
    inputs.get(0).sendKeys('a');

    expect(paragraphs.get(1).getText()).toEqual('First name valid: true');
    expect(paragraphs.get(3).getText()).toEqual('Form valid: true');
  });
});
