/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DatePipe, registerLocaleData} from '@angular/common';
import {PipeResolver} from '@angular/compiler/src/pipe_resolver';
import {JitReflector} from '@angular/platform-browser-dynamic/src/compiler_reflector';
import localeEn from '../../locales/en';
import localeEnExtra from '../../locales/extra/en';
import localeDe from '../../locales/de';
import localeHu from '../../locales/hu';
import localeSr from '../../locales/sr';
import localeTh from '../../locales/th';

export function main() {
  describe('DatePipe', () => {
    let date: Date;
    const isoStringWithoutTime = '2015-01-01';
    let pipe: DatePipe;

    // Check the transformation of a date into a pattern
    function expectDateFormatAs(date: Date | string, pattern: any, output: string): void {
      expect(pipe.transform(date, pattern)).toEqual(output);
    }

    beforeAll(() => {
      registerLocaleData(localeEn, localeEnExtra);
      registerLocaleData(localeDe);
      registerLocaleData(localeHu);
      registerLocaleData(localeSr);
      registerLocaleData(localeTh);
    });

    beforeEach(() => {
      date = new Date(2015, 5, 15, 9, 3, 1, 550);
      pipe = new DatePipe('en-US');
    });

    it('should be marked as pure', () => {
      expect(new PipeResolver(new JitReflector()).resolve(DatePipe) !.pure).toEqual(true);
    });

    describe('supports', () => {
      it('should support date', () => { expect(() => pipe.transform(date)).not.toThrow(); });

      it('should support int', () => { expect(() => pipe.transform(123456789)).not.toThrow(); });

      it('should support numeric strings',
         () => { expect(() => pipe.transform('123456789')).not.toThrow(); });

      it('should support decimal strings',
         () => { expect(() => pipe.transform('123456789.11')).not.toThrow(); });

      it('should support ISO string',
         () => expect(() => pipe.transform('2015-06-15T21:43:11Z')).not.toThrow());

      it('should return null for empty string', () => expect(pipe.transform('')).toEqual(null));

      it('should return null for NaN', () => expect(pipe.transform(Number.NaN)).toEqual(null));

      it('should support ISO string without time',
         () => { expect(() => pipe.transform(isoStringWithoutTime)).not.toThrow(); });

      it('should not support other objects',
         () => expect(() => pipe.transform({})).toThrowError(/InvalidPipeArgument/));
    });

    describe('transform', () => {
      it('should format each component correctly', () => {
        const dateFixtures: any = {
          G: 'AD',
          GG: 'AD',
          GGG: 'AD',
          GGGG: 'Anno Domini',
          GGGGG: 'A',
          y: '2015',
          yy: '15',
          yyy: '2015',
          yyyy: '2015',
          M: '6',
          MM: '06',
          MMM: 'Jun',
          MMMM: 'June',
          MMMMM: 'J',
          L: '6',
          LL: '06',
          LLL: 'Jun',
          LLLL: 'June',
          LLLLL: 'J',
          w: '25',
          ww: '25',
          W: '3',
          d: '15',
          dd: '15',
          E: 'Mon',
          EE: 'Mon',
          EEE: 'Mon',
          EEEE: 'Monday',
          EEEEEE: 'Mo',
          h: '9',
          hh: '09',
          H: '9',
          HH: '09',
          m: '3',
          mm: '03',
          s: '1',
          ss: '01',
          S: '6',
          SS: '55',
          SSS: '550',
          a: 'AM',
          aa: 'AM',
          aaa: 'AM',
          aaaa: 'AM',
          aaaaa: 'a',
          b: 'morning',
          bb: 'morning',
          bbb: 'morning',
          bbbb: 'morning',
          bbbbb: 'morning',
          B: 'in the morning',
          BB: 'in the morning',
          BBB: 'in the morning',
          BBBB: 'in the morning',
          BBBBB: 'in the morning',
        };

        const isoStringWithoutTimeFixtures: any = {
          G: 'AD',
          GG: 'AD',
          GGG: 'AD',
          GGGG: 'Anno Domini',
          GGGGG: 'A',
          y: '2015',
          yy: '15',
          yyy: '2015',
          yyyy: '2015',
          M: '1',
          MM: '01',
          MMM: 'Jan',
          MMMM: 'January',
          MMMMM: 'J',
          L: '1',
          LL: '01',
          LLL: 'Jan',
          LLLL: 'January',
          LLLLL: 'J',
          w: '1',
          ww: '01',
          W: '1',
          d: '1',
          dd: '01',
          E: 'Thu',
          EE: 'Thu',
          EEE: 'Thu',
          EEEE: 'Thursday',
          EEEEE: 'T',
          EEEEEE: 'Th',
          h: '12',
          hh: '12',
          H: '0',
          HH: '00',
          m: '0',
          mm: '00',
          s: '0',
          ss: '00',
          S: '0',
          SS: '00',
          SSS: '000',
          a: 'AM',
          aa: 'AM',
          aaa: 'AM',
          aaaa: 'AM',
          aaaaa: 'a',
          b: 'midnight',
          bb: 'midnight',
          bbb: 'midnight',
          bbbb: 'midnight',
          bbbbb: 'midnight',
          B: 'midnight',
          BB: 'midnight',
          BBB: 'midnight',
          BBBB: 'midnight',
          BBBBB: 'mi',
        };

        Object.keys(dateFixtures).forEach((pattern: string) => {
          expectDateFormatAs(date, pattern, dateFixtures[pattern]);
        });

        Object.keys(isoStringWithoutTimeFixtures).forEach((pattern: string) => {
          expectDateFormatAs(isoStringWithoutTime, pattern, isoStringWithoutTimeFixtures[pattern]);
        });
      });

      it('should format with timezones', () => {
        const dateFixtures: any = {
          z: /GMT(\+|-)\d/,
          zz: /GMT(\+|-)\d/,
          zzz: /GMT(\+|-)\d/,
          zzzz: /GMT(\+|-)\d{2}\:30/,
          Z: /(\+|-)\d{2}30/,
          ZZ: /(\+|-)\d{2}30/,
          ZZZ: /(\+|-)\d{2}30/,
          ZZZZ: /GMT(\+|-)\d{2}\:30/,
          ZZZZZ: /(\+|-)\d{2}\:30/,
          O: /GMT(\+|-)\d/,
          OOOO: /GMT(\+|-)\d{2}\:30/,
        };

        Object.keys(dateFixtures).forEach((pattern: string) => {
          expect(pipe.transform(date, pattern, '+0430')).toMatch(dateFixtures[pattern]);
        });
      });

      it('should format common multi component patterns', () => {
        const dateFixtures: any = {
          'EEE, M/d/y': 'Mon, 6/15/2015',
          'EEE, M/d': 'Mon, 6/15',
          'MMM d': 'Jun 15',
          'dd/MM/yyyy': '15/06/2015',
          'MM/dd/yyyy': '06/15/2015',
          'yMEEEd': '20156Mon15',
          'MEEEd': '6Mon15',
          'MMMd': 'Jun15',
          'EEEE, MMMM d, y': 'Monday, June 15, 2015',
          'H:mm a': '9:03 AM',
          'ms': '31',
          'MM/dd/yy hh:mm': '06/15/15 09:03',
          'MM/dd/y': '06/15/2015'
        };

        Object.keys(dateFixtures).forEach((pattern: string) => {
          expectDateFormatAs(date, pattern, dateFixtures[pattern]);
        });

      });

      it('should format with pattern aliases', () => {
        const dateFixtures: any = {
          'MM/dd/yyyy': '06/15/2015',
          shortDate: '6/15/15',
          mediumDate: 'Jun 15, 2015',
          longDate: 'June 15, 2015',
          fullDate: 'Monday, June 15, 2015',
          short: '6/15/15, 9:03 AM',
          medium: 'Jun 15, 2015, 9:03:01 AM',
          long: /June 15, 2015 at 9:03:01 AM GMT(\+|-)\d/,
          full: /Monday, June 15, 2015 at 9:03:01 AM GMT(\+|-)\d{2}:\d{2}/,
          shortTime: '9:03 AM',
          mediumTime: '9:03:01 AM',
          longTime: /9:03:01 AM GMT(\+|-)\d/,
          fullTime: /9:03:01 AM GMT(\+|-)\d{2}:\d{2}/,
        };

        Object.keys(dateFixtures).forEach((pattern: string) => {
          expect(pipe.transform(date, pattern)).toMatch(dateFixtures[pattern]);
        });
      });

      it('should format invalid in IE ISO date',
         () => expect(pipe.transform('2017-01-11T09:25:14.014-0500')).toEqual('Jan 11, 2017'));

      it('should format invalid in Safari ISO date',
         () => expect(pipe.transform('2017-01-20T19:00:00+0000')).toEqual('Jan 20, 2017'));

      // test for the following bugs:
      // https://github.com/angular/angular/issues/9524
      // https://github.com/angular/angular/issues/9524
      it('should format correctly with iso strings that contain time',
         () => expect(pipe.transform('2017-05-07T22:14:39', 'dd-MM-yyyy HH:mm'))
                   .toMatch(/07-05-2017 \d{2}:\d{2}/));

      // test for the following bugs:
      // https://github.com/angular/angular/issues/16624
      // https://github.com/angular/angular/issues/17478
      it('should show the correct time when the timezone is fixed', () => {
        expect(pipe.transform('2017-06-13T10:14:39+0000', 'shortTime', '+0000'))
            .toEqual('10:14 AM');
        expect(pipe.transform('2017-06-13T10:14:39+0000', 'h:mm a', '+0000')).toEqual('10:14 AM');
      });

      it('should remove bidi control characters',
         () => expect(pipe.transform(date, 'MM/dd/yyyy') !.length).toEqual(10));

      it(`should format the date correctly in various locales`, () => {
        expect(new DatePipe('de').transform(date, 'short')).toEqual('15.06.15, 09:03');
        expect(new DatePipe('th').transform(date, 'dd-MM-yy')).toEqual('15-06-15');
        expect(new DatePipe('hu').transform(date, 'a')).toEqual('de.');
        expect(new DatePipe('sr').transform(date, 'a')).toEqual('пре подне');

        // TODO(ocombe): activate this test when we support local numbers
        // expect(new DatePipe('mr', [localeMr]).transform(date, 'hh')).toEqual('०९');
      });

      it('should throw if we use getExtraDayPeriods without loading extra locale data', () => {
        expect(() => new DatePipe('de').transform(date, 'b'))
            .toThrowError(/Missing extra locale data for the locale "de"/);
      });
    });
  });
}
