/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DEFAULT_CURRENCY_CODE, LOCALE_ID} from '../src/core';

import {TestBed} from '../testing';

describe('Application module', () => {
  it('should set the default locale to "en-US"', () => {
    const defaultLocale = TestBed.inject(LOCALE_ID);
    expect(defaultLocale).toEqual('en-US');
  });

  it('should set the default currency code to "USD"', () => {
    const defaultCurrencyCode = TestBed.inject(DEFAULT_CURRENCY_CODE);
    expect(defaultCurrencyCode).toEqual('USD');
  });
});
