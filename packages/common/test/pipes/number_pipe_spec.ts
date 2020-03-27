/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CurrencyPipe, DecimalPipe, PercentPipe} from '@angular/common';
import localeAr from '@angular/common/locales/ar';
import localeDa from '@angular/common/locales/da';
import localeDeAt from '@angular/common/locales/de-AT';
import localeEn from '@angular/common/locales/en';
import localeEsUS from '@angular/common/locales/es-US';
import localeFr from '@angular/common/locales/fr';
import {ɵregisterLocaleData, ɵunregisterLocaleData} from '@angular/core';
import {beforeEach, describe, expect, it} from '@angular/core/testing/src/testing_internal';

{
  describe('Number pipes', () => {
    beforeAll(() => {
      ɵregisterLocaleData(localeEn);
      ɵregisterLocaleData(localeEsUS);
      ɵregisterLocaleData(localeFr);
      ɵregisterLocaleData(localeAr);
      ɵregisterLocaleData(localeDeAt);
      ɵregisterLocaleData(localeDa);
    });

    afterAll(() => ɵunregisterLocaleData());

    describe('DecimalPipe', () => {
      describe('transform', () => {
        let pipe: DecimalPipe;
        beforeEach(() => {
          pipe = new DecimalPipe('en-US');
        });

        it('should return correct value for numbers', () => {
          expect(pipe.transform(12345)).toEqual('12,345');
          expect(pipe.transform(1.123456, '3.4-5')).toEqual('001.12346');
        });

        it('should support strings', () => {
          expect(pipe.transform('12345')).toEqual('12,345');
          expect(pipe.transform('123', '.2')).toEqual('123.00');
          expect(pipe.transform('1', '3.')).toEqual('001');
          expect(pipe.transform('1.1', '3.4-5')).toEqual('001.1000');
          expect(pipe.transform('1.123456', '3.4-5')).toEqual('001.12346');
          expect(pipe.transform('1.1234')).toEqual('1.123');
        });

        it('should return null for NaN', () => {
          expect(pipe.transform(Number.NaN)).toEqual(null);
        });

        it('should return null for null', () => {
          expect(pipe.transform(null)).toEqual(null);
        });

        it('should return null for undefined', () => {
          expect(pipe.transform(undefined)).toEqual(null);
        });

        it('should not support other objects', () => {
          expect(() => pipe.transform({} as any))
              .toThrowError(
                  `InvalidPipeArgument: '[object Object] is not a number' for pipe 'DecimalPipe'`);
          expect(() => pipe.transform('123abc'))
              .toThrowError(`InvalidPipeArgument: '123abc is not a number' for pipe 'DecimalPipe'`);
        });
      });

      describe('transform with custom locales', () => {
        it('should return the correct format for es-US', () => {
          const pipe = new DecimalPipe('es-US');
          expect(pipe.transform('9999999.99', '1.2-2')).toEqual('9,999,999.99');
        });
      });
    });

    describe('PercentPipe', () => {
      let pipe: PercentPipe;

      beforeEach(() => {
        pipe = new PercentPipe('en-US');
      });

      describe('transform', () => {
        it('should return correct value for numbers', () => {
          expect(pipe.transform(1.23)).toEqual('123%');
          expect(pipe.transform(1.234)).toEqual('123%');
          expect(pipe.transform(1.236)).toEqual('124%');
          expect(pipe.transform(12.3456, '0.0-10')).toEqual('1,234.56%');
        });

        it('should return null for NaN', () => {
          expect(pipe.transform(Number.NaN)).toEqual(null);
        });

        it('should return null for null', () => {
          expect(pipe.transform(null)).toEqual(null);
        });

        it('should return null for undefined', () => {
          expect(pipe.transform(undefined)).toEqual(null);
        });

        it('should not support other objects', () => {
          expect(() => pipe.transform({} as any))
              .toThrowError(
                  `InvalidPipeArgument: '[object Object] is not a number' for pipe 'PercentPipe'`);
        });
      });
    });

    describe('CurrencyPipe', () => {
      let pipe: CurrencyPipe;

      beforeEach(() => {
        pipe = new CurrencyPipe('en-US', 'USD');
      });

      describe('transform', () => {
        it('should return correct value for numbers', () => {
          expect(pipe.transform(123)).toEqual('$123.00');
          expect(pipe.transform(12, 'EUR', 'code', '.1')).toEqual('EUR12.0');
          expect(pipe.transform(5.1234, 'USD', 'code', '.0-3')).toEqual('USD5.123');
          expect(pipe.transform(5.1234, 'USD', 'code')).toEqual('USD5.12');
          expect(pipe.transform(5.1234, 'USD', '')).toEqual('5.12');
          expect(pipe.transform(5.1234, 'USD', 'symbol')).toEqual('$5.12');
          expect(pipe.transform(5.1234, 'CAD', 'symbol')).toEqual('CA$5.12');
          expect(pipe.transform(5.1234, 'CAD', 'symbol-narrow')).toEqual('$5.12');
          expect(pipe.transform(5.1234, 'CAD', 'symbol-narrow', '5.2-2')).toEqual('$00,005.12');
          expect(pipe.transform(5.1234, 'CAD', 'symbol-narrow', '5.2-2', 'fr'))
              .toEqual('00\u202f005,12 $');
          expect(pipe.transform(5, 'USD', 'symbol', '', 'fr')).toEqual('5,00 $US');
          expect(pipe.transform(123456789, 'EUR', 'symbol', '', 'de-at'))
              .toEqual('€ 123.456.789,00');
          expect(pipe.transform(5.1234, 'EUR', '', '', 'de-at')).toEqual('5,12');
          expect(pipe.transform(5.1234, 'DKK', '', '', 'da')).toEqual('5,12');
        });

        it('should support any currency code name', () => {
          // currency code is unknown, default formatting options will be used
          expect(pipe.transform(5.1234, 'unexisting_ISO_code', 'symbol'))
              .toEqual('unexisting_ISO_code5.12');
          // currency code is USD, the pipe will format based on USD but will display "Custom name"
          expect(pipe.transform(5.1234, 'USD', 'Custom name')).toEqual('Custom name5.12');
        });

        it('should return null for NaN', () => {
          expect(pipe.transform(Number.NaN)).toEqual(null);
        });

        it('should return null for null', () => {
          expect(pipe.transform(null)).toEqual(null);
        });

        it('should return null for undefined', () => {
          expect(pipe.transform(undefined)).toEqual(null);
        });

        it('should not support other objects', () => {
          expect(() => pipe.transform({} as any))
              .toThrowError(
                  `InvalidPipeArgument: '[object Object] is not a number' for pipe 'CurrencyPipe'`);
        });

        it('should warn if you are using the v4 signature', () => {
          const warnSpy = spyOn(console, 'warn');
          pipe.transform(123, 'USD', true);
          expect(warnSpy).toHaveBeenCalledWith(
              `Warning: the currency pipe has been changed in Angular v5. The symbolDisplay option (third parameter) is now a string instead of a boolean. The accepted values are "code", "symbol" or "symbol-narrow".`);
        });
      });
    });
  });
}
