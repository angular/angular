import {
  ddescribe,
  describe,
  it,
  iit,
  xit,
  expect,
  beforeEach,
  afterEach,
  browserDetection
} from 'angular2/testing_internal';

import {DatePipe} from 'angular2/common';
import {DateWrapper} from 'angular2/src/facade/lang';
import {PipeResolver} from 'angular2/src/core/linker/pipe_resolver';

export function main() {
  describe("DatePipe", () => {
    var date;
    var dateNumber;
    var dateString;
    var pipe;

    beforeEach(() => {
      date = DateWrapper.create(2015, 6, 15, 21, 43, 11);
      dateString = `2015-06-15T${15 - date.getTimezoneOffset() / 60}:43:11.000Z`;
      dateNumber = DateWrapper.toMillis(date);
      pipe = new DatePipe();
    });

    it('should be marked as pure',
       () => { expect(new PipeResolver().resolve(DatePipe).pure).toEqual(true); });

    describe("supports", () => {
      it("should support date", () => { expect(pipe.supports(date)).toBe(true); });
      it("should support int", () => { expect(pipe.supports(123456789)).toBe(true); });
      it("should support date iso string",
         () => { expect(pipe.supports('2016-04-15T18:06:08-07:00')).toBe(true); });

      it("should not support other objects", () => {
        expect(pipe.supports(new Object())).toBe(false);
        expect(pipe.supports(null)).toBe(false);
        expect(pipe.supports('definetely not iso date')).toBe(false);
        expect(pipe.supports('january 2015 13 friday')).toBe(false);
      });
    });

    let componentExpects = (date) => {
      expect(pipe.transform(date, ['y'])).toEqual('2015');
      expect(pipe.transform(date, ['yy'])).toEqual('15');
      expect(pipe.transform(date, ['M'])).toEqual('6');
      expect(pipe.transform(date, ['MM'])).toEqual('06');
      expect(pipe.transform(date, ['MMM'])).toEqual('Jun');
      expect(pipe.transform(date, ['MMMM'])).toEqual('June');
      expect(pipe.transform(date, ['d'])).toEqual('15');
      expect(pipe.transform(date, ['E'])).toEqual('Mon');
      expect(pipe.transform(date, ['EEEE'])).toEqual('Monday');
      expect(pipe.transform(date, ['H'])).toEqual('21');
      expect(pipe.transform(date, ['j'])).toEqual('9 PM');
      expect(pipe.transform(date, ['m'])).toEqual('43');
      expect(pipe.transform(date, ['s'])).toEqual('11');
    };

    let multiComponentExpects = (date) => {
      expect(pipe.transform(date, ['yMEd'])).toEqual('Mon, 6/15/2015');
      expect(pipe.transform(date, ['MEd'])).toEqual('Mon, 6/15');
      expect(pipe.transform(date, ['MMMd'])).toEqual('Jun 15');
      expect(pipe.transform(date, ['yMMMMEEEEd'])).toEqual('Monday, June 15, 2015');
      expect(pipe.transform(date, ['jms'])).toEqual('9:43:11 PM');
      expect(pipe.transform(date, ['ms'])).toEqual('43:11');
    };

    let patternExpects = (date) => {
      expect(pipe.transform(date, ['medium'])).toEqual('Jun 15, 2015, 9:43:11 PM');
      expect(pipe.transform(date, ['short'])).toEqual('6/15/2015, 9:43 PM');
      expect(pipe.transform(date, ['fullDate'])).toEqual('Monday, June 15, 2015');
      expect(pipe.transform(date, ['longDate'])).toEqual('June 15, 2015');
      expect(pipe.transform(date, ['mediumDate'])).toEqual('Jun 15, 2015');
      expect(pipe.transform(date, ['shortDate'])).toEqual('6/15/2015');
      expect(pipe.transform(date, ['mediumTime'])).toEqual('9:43:11 PM');
      expect(pipe.transform(date, ['shortTime'])).toEqual('9:43 PM');
    };

    // TODO(mlaval): enable tests when Intl API is no longer used, see
    // https://github.com/angular/angular/issues/3333
    if (browserDetection.supportsIntlApi) {
      describe("transform", () => {
        it('should format each component correctly', () => { componentExpects(date); });

        it('should format common multi component patterns', () => { multiComponentExpects(date); });

        it('should format with pattern aliases', () => { patternExpects(date); });
      });

      describe("transform number", () => {
        it('should format each component correctly', () => { componentExpects(dateNumber); });

        it('should format common multi component patterns',
           () => { multiComponentExpects(dateNumber); });

        it('should format with pattern aliases', () => { patternExpects(dateNumber); });
      });

      describe("transform ISO string", () => {
        it('should format each component correctly', () => { componentExpects(dateString); });

        it('should format common multi component patterns',
           () => { multiComponentExpects(dateString); });

        it('should format with pattern aliases', () => { patternExpects(dateString); });
      });
    }
  });
}
