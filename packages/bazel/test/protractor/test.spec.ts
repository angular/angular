/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 *
 * @fileoverview A small demo of how to run a protractor test.
 */

import {$, browser} from 'protractor';

describe('Basic test', () => {
  it('should say hello world', () => {
    browser.waitForAngularEnabled(false);
    browser.get('/');

    expect($('body').getText()).toContain('Hello World');
  });
});
