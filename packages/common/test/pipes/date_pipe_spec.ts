/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DatePipe} from '@angular/common';
import localeEn from '@angular/common/locales/en';
import localeEnExtra from '@angular/common/locales/extra/en';
import {PipeResolver} from '@angular/compiler/src/pipe_resolver';
import {ɵregisterLocaleData, ɵunregisterLocaleData} from '@angular/core';
import {JitReflector} from '@angular/platform-browser-dynamic/src/compiler_reflector';

{
  let date: Date;
  describe('DatePipe', () => {
    const isoStringWithoutTime = '2015-01-01';
    let pipe: DatePipe;

    beforeAll(() => ɵregisterLocaleData(localeEn, localeEnExtra));
    afterAll(() => ɵunregisterLocaleData());

    beforeEach(() => {
      date = new Date(2015, 5, 15, 9, 3, 1, 550);
      pipe = new DatePipe('en-US');
    });

    it('should be marked as pure', () => {
      expect(new PipeResolver(new JitReflector()).resolve(DatePipe)!.pure).toEqual(true);
    });

    describe('supports', () => {
      it('should support date', () => {
        expect(() => pipe.transform(date)).not.toThrow();
      });

      it('should support int', () => {
        expect(() => pipe.transform(123456789)).not.toThrow();
      });

      it('should support numeric strings', () => {
        expect(() => pipe.transform('123456789')).not.toThrow();
      });

      it('should support decimal strings', () => {
        expect(() => pipe.transform('123456789.11')).not.toThrow();
      });

      it('should support ISO string',
         () => expect(() => pipe.transform('2015-06-15T21:43:11Z')).not.toThrow());

      it('should return null for empty string', () => {
        expect(pipe.transform('')).toEqual(null);
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

      it('should support ISO string without time', () => {
        expect(() => pipe.transform(isoStringWithoutTime)).not.toThrow();
      });

      it('should not support other objects', () => {
        expect(() => pipe.transform({} as any)).toThrowError(/InvalidPipeArgument/);
      });
    });

    describe('transform', () => {
      it('should use "mediumDate" as the default format',
         () => expect(pipe.transform('2017-01-11T10:14:39+0000')).toEqual('Jan 11, 2017'));

      it('should return first week if some dates fall in previous year but belong to next year according to ISO 8601 format',
         () => {
           expect(pipe.transform('2019-12-28T00:00:00', 'w')).toEqual('52');
           expect(pipe.transform('2019-12-29T00:00:00', 'w')).toEqual('1');
           expect(pipe.transform('2019-12-30T00:00:00', 'w')).toEqual('1');
         });

      it('should return first week if some dates fall in previous leap year but belong to next year according to ISO 8601 format',
         () => {
           expect(pipe.transform('2012-12-29T00:00:00', 'w')).toEqual('52');
           expect(pipe.transform('2012-12-30T00:00:00', 'w')).toEqual('1');
           expect(pipe.transform('2012-12-31T00:00:00', 'w')).toEqual('1');
         });


      it('should round milliseconds down to the nearest millisecond', () => {
        expect(pipe.transform('2020-08-01T23:59:59.999', 'yyyy-MM-dd')).toEqual('2020-08-01');
        expect(pipe.transform('2020-08-01T23:59:59.9999', 'yyyy-MM-dd, h:mm:ss SSS'))
            .toEqual('2020-08-01, 11:59:59 999');
      });
    });
  });
}
