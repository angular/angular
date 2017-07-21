/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CurrencyPipe, DecimalPipe, PercentPipe} from '@angular/common';
import {isNumeric} from '@angular/common/src/pipes/number_pipe';
import {beforeEach, describe, expect, it} from '@angular/core/testing/src/testing_internal';
import {NgLocaleEn} from '../../src/i18n/data/locale_en';
import {NgLocaleEsUS} from '../../src/i18n/data/locale_es-US';

export function main() {
  describe('Number pipes', () => {
    describe('DecimalPipe', () => {
      describe('transform', () => {
        let pipe: DecimalPipe;
        beforeEach(() => { pipe = new DecimalPipe('en-US', [NgLocaleEn]); });

        it('should return correct value for numbers', () => {
          expect(pipe.transform(12345)).toEqual('12,345');
          expect(pipe.transform(123, '.2')).toEqual('123.00');
          expect(pipe.transform(1, '3.')).toEqual('001');
          expect(pipe.transform(1.1, '3.4-5')).toEqual('001.1000');
          expect(pipe.transform(1.123456, '3.4-5')).toEqual('001.12346');
          expect(pipe.transform(1.1234)).toEqual('1.123');
        });

        it('should support strings', () => {
          expect(pipe.transform('12345')).toEqual('12,345');
          expect(pipe.transform('123', '.2')).toEqual('123.00');
          expect(pipe.transform('1', '3.')).toEqual('001');
          expect(pipe.transform('1.1', '3.4-5')).toEqual('001.1000');
          expect(pipe.transform('1.123456', '3.4-5')).toEqual('001.12346');
          expect(pipe.transform('1.1234')).toEqual('1.123');
        });

        it('should not support other objects', () => {
          expect(() => pipe.transform({})).toThrowError();
          expect(() => pipe.transform('123abc')).toThrowError();
        });
      });

      describe('transform with custom locales', () => {
        it('should return the correct format for es-US in IE11', () => {
          const pipe = new DecimalPipe('es-US', [NgLocaleEsUS]);
          expect(pipe.transform('9999999.99', '1.2-2')).toEqual('9,999,999.99');
        });
      })
    });

    describe('PercentPipe', () => {
      let pipe: PercentPipe;

      beforeEach(() => { pipe = new PercentPipe('en-US', [NgLocaleEn]); });

      describe('transform', () => {
        it('should return correct value for numbers', () => {
          expect(pipe.transform(1.23)).toEqual('123%');
          expect(pipe.transform(1.2, '.2')).toEqual('120.00%');
        });

        it('should not support other objects',
           () => { expect(() => pipe.transform({})).toThrowError(); });
      });
    });

    describe('CurrencyPipe', () => {
      let pipe: CurrencyPipe;

      beforeEach(() => { pipe = new CurrencyPipe('en-US', [NgLocaleEn]); });

      describe('transform', () => {
        it('should return correct value for numbers', () => {
          expect(pipe.transform(123)).toEqual('US Dollar123.00');
          expect(pipe.transform(12, 'EUR', 'code', '.1')).toEqual('EUR12.0');
          expect(pipe.transform(5.1234, 'USD', 'code', '.0-3')).toEqual('USD5.123');
          expect(pipe.transform(5.1234, 'USD', 'code')).toEqual('USD5.12');
          expect(pipe.transform(5.1234, 'USD', 'symbol')).toEqual('$5.12');
          expect(pipe.transform(5.1234, 'CAD', 'symbol')).toEqual('CA$5.12');
          expect(pipe.transform(5.1234, 'CAD', 'symbol-narrow')).toEqual('$5.12');
        });

        it('should not support other objects',
           () => { expect(() => pipe.transform({})).toThrowError(); });

        it('should warn if you are using the v4 signature', () => {
          const warnSpy = spyOn(console, 'warn');
          pipe.transform(123, 'USD', <any>true);
          expect(warnSpy).toHaveBeenCalledWith(
              `Warning: the currency pipe has been changed in Angular v5. The symbolDisplay option (third parameter) is now a string instead of a boolean. The accepted values are "code", "symbol" or "symbol-narrow".`);
        })
      });
    });

    describe('isNumeric', () => {
      it('should return true when passing correct numeric string',
         () => { expect(isNumeric('2')).toBe(true); });

      it('should return true when passing correct double string',
         () => { expect(isNumeric('1.123')).toBe(true); });

      it('should return true when passing correct negative string',
         () => { expect(isNumeric('-2')).toBe(true); });

      it('should return true when passing correct scientific notation string',
         () => { expect(isNumeric('1e5')).toBe(true); });

      it('should return false when passing incorrect numeric',
         () => { expect(isNumeric('a')).toBe(false); });

      it('should return false when passing parseable but non numeric',
         () => { expect(isNumeric('2a')).toBe(false); });
    });
  });
}
