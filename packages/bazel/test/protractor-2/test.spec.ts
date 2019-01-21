/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 *
 * @fileoverview A small demo of how to run a protractor test.
 */

import {ExpectedConditions, browser, by, element} from 'protractor';


// This test uses Protractor without Angular, so disable Angular features
browser.waitForAngularEnabled(false);

describe('app', () => {
  beforeAll(() => {
    browser.get('');
    browser.wait(ExpectedConditions.presenceOf(element(by.css('div.ts1'))), 100000);
  });

  it('should display: Hello, Protractor', (done) => {
    const div = element(by.css('div.ts1'));
    div.getText().then(t => expect(t).toEqual(`Hello, Protractor`));
    done();
  });
});
