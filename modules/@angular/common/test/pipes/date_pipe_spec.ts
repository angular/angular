/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DatePipe} from '@angular/common';
import {PipeResolver} from '@angular/compiler/src/pipe_resolver';
import {beforeEach, describe, expect, it} from '@angular/core/testing/testing_internal';
import {browserDetection} from '@angular/platform-browser/testing/browser_util';

export function main() {
  describe('DatePipe', () => {
    var date: Date;
    var pipe: DatePipe;

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
       () => { expect(new PipeResolver().resolve(DatePipe).pure).toEqual(true); });

    describe('supports', () => {
      it('should support date', () => { expect(() => pipe.transform(date)).not.toThrow(); });
      it('should support int', () => { expect(() => pipe.transform(123456789)).not.toThrow(); });
      it('should support numeric strings',
         () => { expect(() => pipe.transform('123456789')).not.toThrow(); });

      it('should support decimal strings',
         () => { expect(() => pipe.transform('123456789.11')).not.toThrow(); });

      it('should support ISO string',
         () => { expect(() => pipe.transform('2015-06-15T21:43:11Z')).not.toThrow(); });

      it('should not support other objects', () => {
        expect(() => pipe.transform({})).toThrow();
        expect(() => pipe.transform('')).toThrow();
      });
    });

    describe('transform', () => {
      it('should format each component correctly', () => {
        expect(pipe.transform(date, 'y')).toEqual('2015');
        expect(pipe.transform(date, 'yy')).toEqual('15');
        expect(pipe.transform(date, 'M')).toEqual('6');
        expect(pipe.transform(date, 'MM')).toEqual('06');
        expect(pipe.transform(date, 'MMM')).toEqual('Jun');
        expect(pipe.transform(date, 'MMMM')).toEqual('June');
        expect(pipe.transform(date, 'd')).toEqual('15');
        expect(pipe.transform(date, 'E')).toEqual('Mon');
        expect(pipe.transform(date, 'EEEE')).toEqual('Monday');
        if (!browserDetection.isOldChrome) {
          expect(pipe.transform(date, 'h')).toEqual('9');
          expect(pipe.transform(date, 'hh')).toEqual('09');
          expect(pipe.transform(date, 'j')).toEqual('9 AM');
        }
        // IE and Edge can't format a date to minutes and seconds without hours
        if (!browserDetection.isEdge && !browserDetection.isIE ||
            !browserDetection.supportsNativeIntlApi) {
          if (!browserDetection.isOldChrome) {
            expect(pipe.transform(date, 'HH')).toEqual('09');
          }
          expect(pipe.transform(date, 'm')).toEqual('3');
          expect(pipe.transform(date, 's')).toEqual('1');
          expect(pipe.transform(date, 'mm')).toEqual('03');
          expect(pipe.transform(date, 'ss')).toEqual('01');
        }
        expect(pipe.transform(date, 'Z')).toBeDefined();
      });

      it('should format common multi component patterns', () => {
        expect(pipe.transform(date, 'E, M/d/y')).toEqual('Mon, 6/15/2015');
        expect(pipe.transform(date, 'E, M/d')).toEqual('Mon, 6/15');
        expect(pipe.transform(date, 'MMM d')).toEqual('Jun 15');
        expect(pipe.transform(date, 'dd/MM/yyyy')).toEqual('15/06/2015');
        expect(pipe.transform(date, 'MM/dd/yyyy')).toEqual('06/15/2015');
        expect(pipe.transform(date, 'yMEd')).toEqual('20156Mon15');
        expect(pipe.transform(date, 'MEd')).toEqual('6Mon15');
        expect(pipe.transform(date, 'MMMd')).toEqual('Jun15');
        expect(pipe.transform(date, 'yMMMMEEEEd')).toEqual('Monday, June 15, 2015');
        // IE and Edge can't format a date to minutes and seconds without hours
        if (!browserDetection.isEdge && !browserDetection.isIE ||
            !browserDetection.supportsNativeIntlApi) {
          expect(pipe.transform(date, 'ms')).toEqual('31');
        }
        if (!browserDetection.isOldChrome) {
          expect(pipe.transform(date, 'jm')).toEqual('9:03 AM');
        }
      });

      it('should format with pattern aliases', () => {
        if (!browserDetection.isOldChrome) {
          // IE and Edge do not add a coma after the year in these 2 cases
          if ((browserDetection.isEdge || browserDetection.isIE) &&
              browserDetection.supportsNativeIntlApi) {
            expect(pipe.transform(date, 'medium')).toEqual('Jun 15, 2015 9:03:01 AM');
            expect(pipe.transform(date, 'short')).toEqual('6/15/2015 9:03 AM');
          } else {
            expect(pipe.transform(date, 'medium')).toEqual('Jun 15, 2015, 9:03:01 AM');
            expect(pipe.transform(date, 'short')).toEqual('6/15/2015, 9:03 AM');
          }
        }
        expect(pipe.transform(date, 'MM/dd/yyyy')).toEqual('06/15/2015');
        expect(pipe.transform(date, 'fullDate')).toEqual('Monday, June 15, 2015');
        expect(pipe.transform(date, 'longDate')).toEqual('June 15, 2015');
        expect(pipe.transform(date, 'mediumDate')).toEqual('Jun 15, 2015');
        expect(pipe.transform(date, 'shortDate')).toEqual('6/15/2015');
        if (!browserDetection.isOldChrome) {
          expect(pipe.transform(date, 'mediumTime')).toEqual('9:03:01 AM');
          expect(pipe.transform(date, 'shortTime')).toEqual('9:03 AM');
        }
      });

      it('should remove bidi control characters',
         () => { expect(pipe.transform(date, 'MM/dd/yyyy').length).toEqual(10); });
    });
  });
}
