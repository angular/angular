/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DatePipe} from '@angular/common';
import {PipeResolver} from '@angular/compiler/src/pipe_resolver';
import {browserDetection} from '@angular/platform-browser/testing/src/browser_util';

export function main() {
  describe('DatePipe', () => {
    let date: Date;
    const isoStringWithoutTime = '2015-01-01';
    let pipe: DatePipe;

    // Check the transformation of a date into a pattern
    function expectDateFormatAs(date: Date | string, pattern: any, output: string): void {
      expect(pipe.transform(date, pattern)).toEqual(output);
    }

    // TODO: reactivate the disabled expectations once emulators are fixed in SauceLabs
    // In some old versions of Chrome in Android emulators, time formatting returns dates in the
    // timezone of the VM host,
    // instead of the device timezone. Same symptoms as
    // https://bugs.chromium.org/p/chromium/issues/detail?id=406382
    // This happens locally and in SauceLabs, so some checks are disabled to avoid failures.
    // Tracking issue: https://github.com/angular/angular/issues/11187

    beforeEach(() => {
      date = new Date(2015, 5, 15, 9, 3, 1);
      pipe = new DatePipe('en-US');
    });

    it('should be marked as pure',
       () => { expect(new PipeResolver().resolve(DatePipe) !.pure).toEqual(true); });

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
          'y': '2015',
          'yy': '15',
          'M': '6',
          'MM': '06',
          'MMM': 'Jun',
          'MMMM': 'June',
          'd': '15',
          'dd': '15',
          'EEE': 'Mon',
          'EEEE': 'Monday'
        };

        const isoStringWithoutTimeFixtures: any = {
          'y': '2015',
          'yy': '15',
          'M': '1',
          'MM': '01',
          'MMM': 'Jan',
          'MMMM': 'January',
          'd': '1',
          'dd': '01',
          'EEE': 'Thu',
          'EEEE': 'Thursday'
        };

        if (!browserDetection.isOldChrome) {
          dateFixtures['h'] = '9';
          dateFixtures['hh'] = '09';
          dateFixtures['j'] = '9 AM';
          isoStringWithoutTimeFixtures['h'] = '12';
          isoStringWithoutTimeFixtures['hh'] = '12';
          isoStringWithoutTimeFixtures['j'] = '12 AM';
        }

        // IE and Edge can't format a date to minutes and seconds without hours
        if (!browserDetection.isEdge && !browserDetection.isIE ||
            !browserDetection.supportsNativeIntlApi) {
          if (!browserDetection.isOldChrome) {
            dateFixtures['HH'] = '09';
            isoStringWithoutTimeFixtures['HH'] = '00';
          }
          dateFixtures['E'] = 'M';
          dateFixtures['L'] = 'J';
          dateFixtures['m'] = '3';
          dateFixtures['s'] = '1';
          dateFixtures['mm'] = '03';
          dateFixtures['ss'] = '01';
          isoStringWithoutTimeFixtures['m'] = '0';
          isoStringWithoutTimeFixtures['s'] = '0';
          isoStringWithoutTimeFixtures['mm'] = '00';
          isoStringWithoutTimeFixtures['ss'] = '00';
        }

        Object.keys(dateFixtures).forEach((pattern: string) => {
          expectDateFormatAs(date, pattern, dateFixtures[pattern]);
        });

        Object.keys(isoStringWithoutTimeFixtures).forEach((pattern: string) => {
          expectDateFormatAs(isoStringWithoutTime, pattern, isoStringWithoutTimeFixtures[pattern]);
        });

        expect(pipe.transform(date, 'Z')).toBeDefined();
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
          'yMMMMEEEEd': 'Monday, June 15, 2015'
        };

        // IE and Edge can't format a date to minutes and seconds without hours
        if (!browserDetection.isEdge && !browserDetection.isIE ||
            !browserDetection.supportsNativeIntlApi) {
          dateFixtures['ms'] = '31';
        }

        if (!browserDetection.isOldChrome) {
          dateFixtures['jm'] = '9:03 AM';
        }

        Object.keys(dateFixtures).forEach((pattern: string) => {
          expectDateFormatAs(date, pattern, dateFixtures[pattern]);
        });

      });

      it('should format with pattern aliases', () => {
        const dateFixtures: any = {
          'MM/dd/yyyy': '06/15/2015',
          'fullDate': 'Monday, June 15, 2015',
          'longDate': 'June 15, 2015',
          'mediumDate': 'Jun 15, 2015',
          'shortDate': '6/15/2015'
        };

        if (!browserDetection.isOldChrome) {
          // IE and Edge do not add a coma after the year in these 2 cases
          if ((browserDetection.isEdge || browserDetection.isIE) &&
              browserDetection.supportsNativeIntlApi) {
            dateFixtures['medium'] = 'Jun 15, 2015 9:03:01 AM';
            dateFixtures['short'] = '6/15/2015 9:03 AM';
          } else {
            dateFixtures['medium'] = 'Jun 15, 2015, 9:03:01 AM';
            dateFixtures['short'] = '6/15/2015, 9:03 AM';
          }
        }

        if (!browserDetection.isOldChrome) {
          dateFixtures['mediumTime'] = '9:03:01 AM';
          dateFixtures['shortTime'] = '9:03 AM';
        }

        Object.keys(dateFixtures).forEach((pattern: string) => {
          expectDateFormatAs(date, pattern, dateFixtures[pattern]);
        });

      });

      it('should format invalid in IE ISO date',
         () => expect(pipe.transform('2017-01-11T09:25:14.014-0500')).toEqual('Jan 11, 2017'));

      it('should format invalid in Safari ISO date',
         () => expect(pipe.transform('2017-01-20T19:00:00+0000')).toEqual('Jan 20, 2017'));

      it('should remove bidi control characters',
         () => expect(pipe.transform(date, 'MM/dd/yyyy') !.length).toEqual(10));
    });
  });
}
