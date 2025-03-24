/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {browser, by, element, ElementArrayFinder} from 'protractor';

import {verifyNoBrowserErrors} from '../../../../test-utils';

describe('radioButtons example', () => {
  afterEach(verifyNoBrowserErrors);
  let inputs: ElementArrayFinder;
  let paragraphs: ElementArrayFinder;

  beforeEach(() => {
    browser.get('/radioButtons');
    inputs = element.all(by.css('input'));
    paragraphs = element.all(by.css('p'));
  });

  it('should populate the UI with initial values', () => {
    expect(inputs.get(0).getAttribute('checked')).toEqual(null);
    expect(inputs.get(1).getAttribute('checked')).toEqual('true');
    expect(inputs.get(2).getAttribute('checked')).toEqual(null);

    expect(paragraphs.get(0).getText()).toEqual('Form value: { "food": "lamb" }');
    expect(paragraphs.get(1).getText()).toEqual('myFood value: lamb');
  });

  it('update model and other buttons as the UI value changes', () => {
    inputs.get(0).click();

    expect(inputs.get(0).getAttribute('checked')).toEqual('true');
    expect(inputs.get(1).getAttribute('checked')).toEqual(null);
    expect(inputs.get(2).getAttribute('checked')).toEqual(null);

    expect(paragraphs.get(0).getText()).toEqual('Form value: { "food": "beef" }');
    expect(paragraphs.get(1).getText()).toEqual('myFood value: beef');
  });
});
