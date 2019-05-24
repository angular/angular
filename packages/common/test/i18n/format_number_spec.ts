/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import localeEn from '@angular/common/locales/en';
import localeEsUS from '@angular/common/locales/es-US';
import localeFr from '@angular/common/locales/fr';
import localeAr from '@angular/common/locales/ar';
import {formatCurrency, formatNumber, formatPercent, registerLocaleData} from '@angular/common';
import {describe, expect, it} from '@angular/core/testing/src/testing_internal';

describe('Format number', () => {
  const defaultLocale = 'en-US';

  beforeAll(() => {
    registerLocaleData(localeEn);
    registerLocaleData(localeEsUS);
    registerLocaleData(localeFr);
    registerLocaleData(localeAr);
  });

  describe('Number', () => {
    describe('transform', () => {
      it('should return correct value for numbers', () => {
        expect(formatNumber(12345, defaultLocale)).toEqual('12,345');
        expect(formatNumber(123, defaultLocale, '.2')).toEqual('123.00');
        expect(formatNumber(1, defaultLocale, '3.')).toEqual('001');
        expect(formatNumber(1.1, defaultLocale, '3.4-5')).toEqual('001.1000');
        expect(formatNumber(1.123456, defaultLocale, '3.4-5')).toEqual('001.12346');
        expect(formatNumber(1.1234, defaultLocale)).toEqual('1.123');
        expect(formatNumber(1.123456, defaultLocale, '.2')).toEqual('1.123');
        expect(formatNumber(1.123456, defaultLocale, '.4')).toEqual('1.1235');
      });

      it('should throw if minFractionDigits is explicitly higher than maxFractionDigits', () => {
        expect(() => formatNumber(1.1, defaultLocale, '3.4-2'))
            .toThrowError(/is higher than the maximum/);
      });
    });

    describe('transform with custom locales', () => {
      it('should return the correct format for es-US',
         () => { expect(formatNumber(9999999.99, 'es-US', '1.2-2')).toEqual('9,999,999.99'); });
    });
  });

  describe('Percent', () => {
    describe('transform', () => {
      it('should return correct value for numbers', () => {
        expect(formatPercent(1.23, defaultLocale)).toEqual('123%');
        expect(formatPercent(1.2, defaultLocale, '.2')).toEqual('120.00%');
        expect(formatPercent(1.2, defaultLocale, '4.2')).toEqual('0,120.00%');
        expect(formatPercent(1.2, 'fr', '4.2')).toEqual('0 120,00 %');
        expect(formatPercent(1.2, 'ar', '4.2')).toEqual('0,120.00‎%‎');
        // see issue #20136
        expect(formatPercent(0.12345674, defaultLocale, '0.0-10')).toEqual('12.345674%');
        expect(formatPercent(0, defaultLocale, '0.0-10')).toEqual('0%');
        expect(formatPercent(0.00, defaultLocale, '0.0-10')).toEqual('0%');
        expect(formatPercent(1, defaultLocale, '0.0-10')).toEqual('100%');
        expect(formatPercent(0.1, defaultLocale, '0.0-10')).toEqual('10%');
        expect(formatPercent(0.12, defaultLocale, '0.0-10')).toEqual('12%');
        expect(formatPercent(0.123, defaultLocale, '0.0-10')).toEqual('12.3%');
        expect(formatPercent(12.3456, defaultLocale, '0.0-10')).toEqual('1,234.56%');
        expect(formatPercent(12.345600, defaultLocale, '0.0-10')).toEqual('1,234.56%');
        expect(formatPercent(12.345699999, defaultLocale, '0.0-6')).toEqual('1,234.57%');
        expect(formatPercent(12.345699999, defaultLocale, '0.4-6')).toEqual('1,234.5700%');
        expect(formatPercent(100, defaultLocale, '0.4-6')).toEqual('10,000.0000%');
        expect(formatPercent(100, defaultLocale, '0.0-10')).toEqual('10,000%');
        expect(formatPercent(1.5e2, defaultLocale)).toEqual('15,000%');
        expect(formatPercent(1e100, defaultLocale)).toEqual('1E+102%');
      });
    });
  });

  describe('Currency', () => {
    const defaultCurrencyCode = 'USD';
    describe('transform', () => {
      it('should return correct value for numbers', () => {
        expect(formatCurrency(123, defaultLocale, '$')).toEqual('$123.00');
        expect(formatCurrency(12, defaultLocale, 'EUR', 'EUR', '.1')).toEqual('EUR12.0');
        expect(
            formatCurrency(5.1234, defaultLocale, defaultCurrencyCode, defaultCurrencyCode, '.0-3'))
            .toEqual('USD5.123');
        expect(formatCurrency(5.1234, defaultLocale, defaultCurrencyCode)).toEqual('USD5.12');
        expect(formatCurrency(5.1234, defaultLocale, '$')).toEqual('$5.12');
        expect(formatCurrency(5.1234, defaultLocale, 'CA$')).toEqual('CA$5.12');
        expect(formatCurrency(5.1234, defaultLocale, '$')).toEqual('$5.12');
        expect(formatCurrency(5.1234, defaultLocale, '$', defaultCurrencyCode, '5.2-2'))
            .toEqual('$00,005.12');
        expect(formatCurrency(5.1234, 'fr', '$', defaultCurrencyCode, '5.2-2'))
            .toEqual('00 005,12 $');
        expect(formatCurrency(5, 'fr', '$US', defaultCurrencyCode)).toEqual('5,00 $US');
      });

      it('should support any currency code name', () => {
        // currency code is unknown, default formatting options will be used
        expect(formatCurrency(5.1234, defaultLocale, 'unexisting_ISO_code'))
            .toEqual('unexisting_ISO_code5.12');
        // currency code is USD, the pipe will format based on USD but will display "Custom name"
        expect(formatCurrency(5.1234, defaultLocale, 'Custom name')).toEqual('Custom name5.12');
      });

      it('should round to the default number of digits if no digitsInfo', () => {
        // IDR has a default number of digits of 0
        expect(formatCurrency(5.1234, defaultLocale, 'IDR', 'IDR')).toEqual('IDR5');
        expect(formatCurrency(5.1234, defaultLocale, 'IDR', 'IDR', '.2')).toEqual('IDR5.12');
        expect(formatCurrency(5.1234, defaultLocale, 'Custom name', 'IDR')).toEqual('Custom name5');
        // BHD has a default number of digits of 3
        expect(formatCurrency(5.1234, defaultLocale, 'BHD', 'BHD')).toEqual('BHD5.123');
        expect(formatCurrency(5.1234, defaultLocale, 'BHD', 'BHD', '.1-2')).toEqual('BHD5.12');
      });
    });
  });
});
