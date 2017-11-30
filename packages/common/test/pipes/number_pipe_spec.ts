/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import localeEn from '../../locales/en';
import localeEsUS from '../../locales/es-US';
import localeFr from '../../locales/fr';
import {registerLocaleData, CurrencyPipe, DecimalPipe, PercentPipe} from '@angular/common';
import {beforeEach, describe, expect, it} from '@angular/core/testing/src/testing_internal';

export function main() {
  describe('Number pipes', () => {
    beforeAll(() => {
      registerLocaleData(localeEn);
      registerLocaleData(localeEsUS);
      registerLocaleData(localeFr);
    });

    function isNumeric(value: any): boolean { return !isNaN(value - parseFloat(value)); }

    describe('DecimalPipe', () => {
      describe('transform', () => {
        let pipe: DecimalPipe;
        beforeEach(() => { pipe = new DecimalPipe('en-US'); });

        it('should return correct value for numbers', () => {
          expect(pipe.transform(12345)).toEqual('12,345');
          expect(pipe.transform(123, '.2')).toEqual('123.00');
          expect(pipe.transform(1, '3.')).toEqual('001');
          expect(pipe.transform(1.1, '3.4-5')).toEqual('001.1000');
          expect(pipe.transform(1.123456, '3.4-5')).toEqual('001.12346');
          expect(pipe.transform(1.1234)).toEqual('1.123');
          expect(pipe.transform(1.123456, '.2')).toEqual('1.123');
          expect(pipe.transform(1.123456, '.4')).toEqual('1.1235');
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
          expect(() => pipe.transform({}))
              .toThrowError(
                  `InvalidPipeArgument: '[object Object] is not a number' for pipe 'DecimalPipe'`);
          expect(() => pipe.transform('123abc'))
              .toThrowError(`InvalidPipeArgument: '123abc is not a number' for pipe 'DecimalPipe'`);
        });

        it('should throw if minFractionDigits is explicitly higher than maxFractionDigits', () => {
          expect(() => pipe.transform('1.1', '3.4-2')).toThrowError(/is higher than the maximum/);
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

      beforeEach(() => { pipe = new PercentPipe('en-US'); });

      describe('transform', () => {
        it('should return correct value for numbers', () => {
          expect(pipe.transform(1.23)).toEqual('123%');
          expect(pipe.transform(1.2, '.2')).toEqual('120.00%');
          expect(pipe.transform(1.2, '4.2')).toEqual('0,120.00%');
          expect(pipe.transform(1.2, '4.2', 'fr')).toEqual('0 120,00 %');
        });

        it('should not support other objects', () => {
          expect(() => pipe.transform({}))
              .toThrowError(
                  `InvalidPipeArgument: '[object Object] is not a number' for pipe 'PercentPipe'`);
        });
      });
    });

    describe('CurrencyPipe', () => {
      let pipe: CurrencyPipe;

      beforeEach(() => { pipe = new CurrencyPipe('en-US'); });

      describe('transform', () => {
        it('should return correct value for numbers', () => {
          expect(pipe.transform(123)).toEqual('$123.00');
          expect(pipe.transform(12, 'EUR', 'code', '.1')).toEqual('EUR12.0');
          expect(pipe.transform(5.1234, 'USD', 'code', '.0-3')).toEqual('USD5.123');
          expect(pipe.transform(5.1234, 'USD', 'code')).toEqual('USD5.12');
          expect(pipe.transform(5.1234, 'USD', 'symbol')).toEqual('$5.12');
          expect(pipe.transform(5.1234, 'CAD', 'symbol')).toEqual('CA$5.12');
          expect(pipe.transform(5.1234, 'CAD', 'symbol-narrow')).toEqual('$5.12');
          expect(pipe.transform(5.1234, 'CAD', 'symbol-narrow', '5.2-2')).toEqual('$00,005.12');
          expect(pipe.transform(5.1234, 'CAD', 'symbol-narrow', '5.2-2', 'fr'))
              .toEqual('00 005,12 $');
        });

        it('should not support other objects', () => {
          expect(() => pipe.transform({}))
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
