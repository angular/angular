/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import localeAr from '@angular/common/locales/ar';
import localeDe from '@angular/common/locales/de';
import localeEn from '@angular/common/locales/en';
import localeEnExtra from '@angular/common/locales/extra/en';
import localeFi from '@angular/common/locales/fi';
import localeHu from '@angular/common/locales/hu';
import localeSr from '@angular/common/locales/sr';
import localeTh from '@angular/common/locales/th';
import {formatDate, isDate, toDate} from '@angular/common/src/i18n/format_date';
import {ɵDEFAULT_LOCALE_ID, ɵregisterLocaleData, ɵunregisterLocaleData} from '@angular/core';

describe('Format date', () => {
  describe('toDate', () => {
    it('should support date', () => {
      expect(isDate(toDate(new Date()))).toBeTruthy();
    });

    it('should support int', () => {
      expect(isDate(toDate(123456789))).toBeTruthy();
    });

    it('should support numeric strings', () => {
      expect(isDate(toDate('123456789'))).toBeTruthy();
    });

    it('should support decimal strings', () => {
      expect(isDate(toDate('123456789.11'))).toBeTruthy();
    });

    it('should support ISO string', () => {
      expect(isDate(toDate('2015-06-15T21:43:11Z'))).toBeTruthy();
    });

    it('should throw for empty string', () => {
      expect(() => toDate('')).toThrow();
    });

    it('should throw for alpha numeric strings', () => {
      expect(() => toDate('123456789 hello')).toThrow();
    });

    it('should throw for NaN', () => {
      expect(() => toDate(Number.NaN)).toThrow();
    });

    it('should support ISO string without time', () => {
      expect(isDate(toDate('2015-01-01'))).toBeTruthy();
    });

    it('should throw for objects', () => {
      expect(() => toDate({} as any)).toThrow();
    });
  });

  describe('formatDate', () => {
    const isoStringWithoutTime = '2015-01-01';
    const isoStringWithoutTimeOrDate = '2015-01';
    const isoStringWithoutTimeOrDateOrMonth = '2015';
    const defaultFormat = 'mediumDate';
    let date: Date;

    // Check the transformation of a date into a pattern
    function expectDateFormatAs(date: Date|string, pattern: any, output: string): void {
      expect(formatDate(date, pattern, ɵDEFAULT_LOCALE_ID))
          .toEqual(output, `pattern: "${pattern}"`);
    }

    beforeAll(() => {
      ɵregisterLocaleData(localeEn, localeEnExtra);
      ɵregisterLocaleData(localeDe);
      ɵregisterLocaleData(localeHu);
      ɵregisterLocaleData(localeSr);
      ɵregisterLocaleData(localeTh);
      ɵregisterLocaleData(localeAr);
      ɵregisterLocaleData(localeFi);
    });

    afterAll(() => ɵunregisterLocaleData());

    beforeEach(() => {
      date = new Date(2015, 5, 15, 9, 3, 1, 550);
    });

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
        Y: '2015',
        YY: '15',
        YYY: '2015',
        YYYY: '2015',
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
        c: '1',
        cc: '1',
        ccc: 'Mon',
        cccc: 'Monday',
        ccccc: 'M',
        cccccc: 'Mo',
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
        Y: '2015',
        YY: '15',
        YYY: '2015',
        YYYY: '2015',
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
        c: '4',
        cc: '4',
        ccc: 'Thu',
        cccc: 'Thursday',
        ccccc: 'T',
        cccccc: 'Th',
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

      const midnightCrossingPeriods: any = {
        b: 'night',
        bb: 'night',
        bbb: 'night',
        bbbb: 'night',
        bbbbb: 'night',
        B: 'at night',
        BB: 'at night',
        BBB: 'at night',
        BBBB: 'at night',
        BBBBB: 'at night',
      };

      Object.keys(dateFixtures).forEach((pattern: string) => {
        expectDateFormatAs(date, pattern, dateFixtures[pattern]);
      });

      Object.keys(isoStringWithoutTimeFixtures).forEach((pattern: string) => {
        expectDateFormatAs(isoStringWithoutTime, pattern, isoStringWithoutTimeFixtures[pattern]);
      });

      Object.keys(isoStringWithoutTimeFixtures).forEach((pattern: string) => {
        expectDateFormatAs(
            isoStringWithoutTimeOrDate, pattern, isoStringWithoutTimeFixtures[pattern]);
      });

      Object.keys(isoStringWithoutTimeFixtures).forEach((pattern: string) => {
        expectDateFormatAs(
            isoStringWithoutTimeOrDateOrMonth, pattern, isoStringWithoutTimeFixtures[pattern]);
      });

      const nightTime = new Date(2015, 5, 15, 2, 3, 1, 550);
      Object.keys(midnightCrossingPeriods).forEach(pattern => {
        expectDateFormatAs(nightTime, pattern, midnightCrossingPeriods[pattern]);
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
        expect(formatDate(date, pattern, ɵDEFAULT_LOCALE_ID, '+0430'))
            .toMatch(dateFixtures[pattern]);
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
        expect(formatDate(date, pattern, ɵDEFAULT_LOCALE_ID)).toMatch(dateFixtures[pattern]);
      });
    });

    it('should format invalid in IE ISO date',
       () => expect(formatDate('2017-01-11T12:00:00.014-0500', defaultFormat, ɵDEFAULT_LOCALE_ID))
                 .toEqual('Jan 11, 2017'));

    it('should format invalid in Safari ISO date',
       () => expect(formatDate('2017-01-20T12:00:00+0000', defaultFormat, ɵDEFAULT_LOCALE_ID))
                 .toEqual('Jan 20, 2017'));

    // https://github.com/angular/angular/issues/9524
    // https://github.com/angular/angular/issues/9524
    it('should format correctly with iso strings that contain time',
       () => expect(formatDate('2017-05-07T22:14:39', 'dd-MM-yyyy HH:mm', ɵDEFAULT_LOCALE_ID))
                 .toMatch(/07-05-2017 \d{2}:\d{2}/));

    // https://github.com/angular/angular/issues/21491
    it('should not assume UTC for iso strings in Safari if the timezone is not defined', () => {
      // this test only works if the timezone is not in UTC
      // which is the case for BrowserStack when we test Safari
      if (new Date().getTimezoneOffset() !== 0) {
        expect(formatDate('2018-01-11T13:00:00', 'HH', ɵDEFAULT_LOCALE_ID))
            .not.toEqual(formatDate('2018-01-11T13:00:00Z', 'HH', ɵDEFAULT_LOCALE_ID));
      }
    });

    // https://github.com/angular/angular/issues/16624
    // https://github.com/angular/angular/issues/17478
    it('should show the correct time when the timezone is fixed', () => {
      expect(formatDate('2017-06-13T10:14:39+0000', 'shortTime', ɵDEFAULT_LOCALE_ID, '+0000'))
          .toEqual('10:14 AM');
      expect(formatDate('2017-06-13T10:14:39+0000', 'h:mm a', ɵDEFAULT_LOCALE_ID, '+0000'))
          .toEqual('10:14 AM');
    });

    // The following test is disabled because backwards compatibility requires that date-only ISO
    // strings are parsed with the local timezone.

    // it('should create UTC date objects when an ISO string is passed with no time components',
    //    () => {
    //      expect(formatDate('2019-09-20', `MMM d, y, h:mm:ss a ZZZZZ`, ɵDEFAULT_LOCALE_ID))
    //          .toEqual('Sep 20, 2019, 12:00:00 AM Z');
    //    });

    // This test is to ensure backward compatibility for parsing date-only ISO strings.
    it('should create local timezone date objects when an ISO string is passed with no time components',
       () => {
         // Dates created with individual components are evaluated against the local timezone. See
         // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/Date#Individual_date_and_time_component_values
         const localDate = new Date(2019, 8, 20, 0, 0, 0, 0);
         expect(formatDate('2019-09-20', `MMM d, y, h:mm:ss a ZZZZZ`, ɵDEFAULT_LOCALE_ID))
             .toEqual(formatDate(localDate, `MMM d, y, h:mm:ss a ZZZZZ`, ɵDEFAULT_LOCALE_ID));
       });

    it('should create local timezone date objects when an ISO string is passed with time components',
       () => {
         const localDate = new Date(2019, 8, 20, 0, 0, 0, 0);
         expect(formatDate('2019-09-20T00:00:00', `MMM d, y, h:mm:ss a ZZZZZ`, ɵDEFAULT_LOCALE_ID))
             .toEqual(formatDate(localDate, `MMM d, y, h:mm:ss a ZZZZZ`, ɵDEFAULT_LOCALE_ID));
       });

    it('should remove bidi control characters',
       () => expect(formatDate(date, 'MM/dd/yyyy', ɵDEFAULT_LOCALE_ID)!.length).toEqual(10));

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

    // https://github.com/angular/angular/issues/38739
    it('should return correct ISO 8601 week-numbering year for dates close to year end/beginning',
       () => {
         expect(formatDate('2013-12-27', 'YYYY', 'en')).toEqual('2013');
         expect(formatDate('2013-12-29', 'YYYY', 'en')).toEqual('2014');
         expect(formatDate('2010-01-02', 'YYYY', 'en')).toEqual('2009');
         expect(formatDate('2010-01-04', 'YYYY', 'en')).toEqual('2010');
         expect(formatDate('0049-01-01', 'YYYY', 'en')).toEqual('0048');
         expect(formatDate('0049-01-04', 'YYYY', 'en')).toEqual('0049');
       });

    // https://github.com/angular/angular/issues/40377
    it('should format date with year between 0 and 99 correctly', () => {
      expect(formatDate('0098-01-11', 'YYYY', ɵDEFAULT_LOCALE_ID)).toEqual('0098');
      expect(formatDate('0099-01-11', 'YYYY', ɵDEFAULT_LOCALE_ID)).toEqual('0099');
      expect(formatDate('0100-01-11', 'YYYY', ɵDEFAULT_LOCALE_ID)).toEqual('0100');
      expect(formatDate('0001-01-11', 'YYYY', ɵDEFAULT_LOCALE_ID)).toEqual('0001');
      expect(formatDate('0000-01-11', 'YYYY', ɵDEFAULT_LOCALE_ID)).toEqual('0000');
    });

    // https://github.com/angular/angular/issues/26922
    it('should support fullDate in finnish, which uses standalone week day', () => {
      expect(formatDate(date, 'fullDate', 'fi')).toMatch('maanantai 15. kesäkuuta 2015');
    });
  });
});
