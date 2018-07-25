/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {registerLocaleData} from '@angular/common';
import localeAr from '@angular/common/locales/ar';
import localeDe from '@angular/common/locales/de';
import localeEn from '@angular/common/locales/en';
import localeEnExtra from '@angular/common/locales/extra/en';
import localeHu from '@angular/common/locales/hu';
import localeSr from '@angular/common/locales/sr';
import localeTh from '@angular/common/locales/th';
import {isDate, toDate, formatDate} from '@angular/common/src/i18n/format_date';

describe('Format date', () => {
  describe('toDate', () => {
    it('should support date', () => { expect(isDate(toDate(new Date()))).toBeTruthy(); });

    it('should support int', () => { expect(isDate(toDate(123456789))).toBeTruthy(); });

    it('should support numeric strings',
       () => { expect(isDate(toDate('123456789'))).toBeTruthy(); });

    it('should support decimal strings',
       () => { expect(isDate(toDate('123456789.11'))).toBeTruthy(); });

    it('should support ISO string',
       () => { expect(isDate(toDate('2015-06-15T21:43:11Z'))).toBeTruthy(); });

    it('should throw for empty string', () => { expect(() => toDate('')).toThrow(); });

    it('should throw for alpha numeric strings',
       () => { expect(() => toDate('123456789 hello')).toThrow(); });

    it('should throw for NaN', () => { expect(() => toDate(Number.NaN)).toThrow(); });

    it('should support ISO string without time',
       () => { expect(isDate(toDate('2015-01-01'))).toBeTruthy(); });

    it('should throw for objects', () => { expect(() => toDate({} as any)).toThrow(); });
  });

  describe('formatDate', () => {
    const isoStringWithoutTime = '2015-01-01';
    const defaultLocale = 'en-US';
    const defaultFormat = 'mediumDate';
    let date: Date;

    // Check the transformation of a date into a pattern
    function expectDateFormatAs(date: Date | string, pattern: any, output: string): void {
      expect(formatDate(date, pattern, defaultLocale)).toEqual(output, `pattern: "${pattern}"`);
    }

    beforeAll(() => {
      registerLocaleData(localeEn, localeEnExtra);
      registerLocaleData(localeDe);
      registerLocaleData(localeHu);
      registerLocaleData(localeSr);
      registerLocaleData(localeTh);
      registerLocaleData(localeAr);
    });

    beforeEach(() => { date = new Date(2015, 5, 15, 9, 3, 1, 550); });

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
        S: '5',
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
        expect(formatDate(date, pattern, defaultLocale, '+0430')).toMatch(dateFixtures[pattern]);
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
        expect(formatDate(date, pattern, defaultLocale)).toMatch(dateFixtures[pattern]);
      });
    });

    it('should format invalid in IE ISO date',
       () => expect(formatDate('2017-01-11T12:00:00.014-0500', defaultFormat, defaultLocale))
                 .toEqual('Jan 11, 2017'));

    it('should format invalid in Safari ISO date',
       () => expect(formatDate('2017-01-20T12:00:00+0000', defaultFormat, defaultLocale))
                 .toEqual('Jan 20, 2017'));

    // https://github.com/angular/angular/issues/9524
    // https://github.com/angular/angular/issues/9524
    it('should format correctly with iso strings that contain time',
       () => expect(formatDate('2017-05-07T22:14:39', 'dd-MM-yyyy HH:mm', defaultLocale))
                 .toMatch(/07-05-2017 \d{2}:\d{2}/));

    // https://github.com/angular/angular/issues/21491
    it('should not assume UTC for iso strings in Safari if the timezone is not defined', () => {
      // this test only works if the timezone is not in UTC
      // which is the case for BrowserStack when we test Safari
      if (new Date().getTimezoneOffset() !== 0) {
        expect(formatDate('2018-01-11T13:00:00', 'HH', defaultLocale))
            .not.toEqual(formatDate('2018-01-11T13:00:00Z', 'HH', defaultLocale));
      }
    });

    // https://github.com/angular/angular/issues/16624
    // https://github.com/angular/angular/issues/17478
    it('should show the correct time when the timezone is fixed', () => {
      expect(formatDate('2017-06-13T10:14:39+0000', 'shortTime', defaultLocale, '+0000'))
          .toEqual('10:14 AM');
      expect(formatDate('2017-06-13T10:14:39+0000', 'h:mm a', defaultLocale, '+0000'))
          .toEqual('10:14 AM');
    });

    it('should remove bidi control characters',
       () => expect(formatDate(date, 'MM/dd/yyyy', defaultLocale) !.length).toEqual(10));

    it(`should format the date correctly in various locales`, () => {
      expect(formatDate(date, 'short', 'de')).toEqual('15.06.15, 09:03');
      expect(formatDate(date, 'short', 'ar')).toEqual('15‏/6‏/2015 9:03 ص');
      expect(formatDate(date, 'dd-MM-yy', 'th')).toEqual('15-06-15');
      expect(formatDate(date, 'a', 'hu')).toEqual('de.');
      expect(formatDate(date, 'a', 'sr')).toEqual('пре подне');

      // TODO(ocombe): activate this test when we support local numbers
      // expect(formatDate(date, 'hh', 'mr')).toEqual('०९');
    });

    it('should throw if we use getExtraDayPeriods without loading extra locale data', () => {
      expect(() => formatDate(date, 'b', 'de'))
          .toThrowError(/Missing extra locale data for the locale "de"/);
    });

    // https://github.com/angular/angular/issues/24384
    it('should not round fractional seconds', () => {
      expect(formatDate(3999, 'm:ss', 'en')).toEqual('0:03');
      expect(formatDate(3999, 'm:ss.S', 'en')).toEqual('0:03.9');
      expect(formatDate(3999, 'm:ss.SS', 'en')).toEqual('0:03.99');
      expect(formatDate(3999, 'm:ss.SSS', 'en')).toEqual('0:03.999');
      expect(formatDate(3000, 'm:ss', 'en')).toEqual('0:03');
      expect(formatDate(3000, 'm:ss.S', 'en')).toEqual('0:03.0');
      expect(formatDate(3000, 'm:ss.SS', 'en')).toEqual('0:03.00');
      expect(formatDate(3000, 'm:ss.SSS', 'en')).toEqual('0:03.000');
      expect(formatDate(3001, 'm:ss', 'en')).toEqual('0:03');
      expect(formatDate(3001, 'm:ss.S', 'en')).toEqual('0:03.0');
      expect(formatDate(3001, 'm:ss.SS', 'en')).toEqual('0:03.00');
      expect(formatDate(3001, 'm:ss.SSS', 'en')).toEqual('0:03.001');
    });
  });
});
