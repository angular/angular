/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CurrencyPipe, DecimalPipe, PercentPipe} from '@angular/common';
import {beforeEach, describe, expect, it} from '@angular/core/testing/testing_internal';
import {browserDetection} from '@angular/platform-browser/testing/browser_util';

export function main() {
  describe('Number pipes', () => {
    describe('DecimalPipe', () => {
      var pipe: DecimalPipe;

      beforeEach(() => { pipe = new DecimalPipe('en-US'); });

      describe('transform', () => {
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
          expect(() => pipe.transform(new Object())).toThrowError();
          expect(() => pipe.transform('123abc')).toThrowError();
        });
      });
    });

    describe('PercentPipe', () => {
      var pipe: PercentPipe;

      beforeEach(() => { pipe = new PercentPipe('en-US'); });

      describe('transform', () => {
        it('should return correct value for numbers', () => {
          expect(normalize(pipe.transform(1.23))).toEqual('123%');
          expect(normalize(pipe.transform(1.2, '.2'))).toEqual('120.00%');
        });

        it('should not support other objects',
           () => { expect(() => pipe.transform(new Object())).toThrowError(); });
      });
    });

    describe('CurrencyPipe', () => {
      var pipe: CurrencyPipe;

      beforeEach(() => { pipe = new CurrencyPipe('en-US'); });

      describe('transform', () => {
        it('should return correct value for numbers', () => {
          // In old Chrome, default formatiing for USD is different
          if (browserDetection.isOldChrome) {
            expect(normalize(pipe.transform(123))).toEqual('USD123');
          } else {
            expect(normalize(pipe.transform(123))).toEqual('USD123.00');
          }
          expect(normalize(pipe.transform(12, 'EUR', false, '.1'))).toEqual('EUR12.0');
          expect(normalize(pipe.transform(5.1234, 'USD', false, '.0-3'))).toEqual('USD5.123');
        });

        it('should not support other objects',
           () => { expect(() => pipe.transform(new Object())).toThrowError(); });
      });
    });
  });
}

// Between the symbol and the number, Edge adds a no breaking space and IE11 adds a standard space
function normalize(s: string): string {
  return s.replace(/\u00A0| /g, '');
}
