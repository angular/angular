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

  beforeEach(() => {
    browser.get('/forms/ts/reactiveRadioButtons/index.html');
    inputs = element.all(by.css('input'));
  });

  it('should populate the UI with initial values', () => {
    expect(inputs.get(0).getAttribute('checked')).toEqual(null);
    expect(inputs.get(1).getAttribute('checked')).toEqual('true');
    expect(inputs.get(2).getAttribute('checked')).toEqual(null);

    expect(element(by.css('p')).getText()).toEqual('Form value: { "food": "lamb" }');
  });

  it('update model and other buttons as the UI value changes', () => {
    inputs.get(0).click();

    expect(inputs.get(0).getAttribute('checked')).toEqual('true');
    expect(inputs.get(1).getAttribute('checked')).toEqual(null);
    expect(inputs.get(2).getAttribute('checked')).toEqual(null);

    expect(element(by.css('p')).getText()).toEqual('Form value: { "food": "beef" }');
  });
});
