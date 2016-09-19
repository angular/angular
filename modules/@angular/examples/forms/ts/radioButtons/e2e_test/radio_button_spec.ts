/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {verifyNoBrowserErrors} from '../../../../_common/e2e_util';

describe('radioButtons example', () => {
  afterEach(verifyNoBrowserErrors);
  let inputs: protractor.ElementArrayFinder;
  let paragraphs: protractor.ElementArrayFinder;

  beforeEach(() => {
    browser.get('/forms/ts/radioButtons/index.html');
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
