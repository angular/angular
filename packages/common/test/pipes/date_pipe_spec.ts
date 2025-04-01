/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DATE_PIPE_DEFAULT_OPTIONS, DatePipe} from '../../index';
import localeEn from '../../locales/en';
import localeEnExtra from '../../locales/extra/en';
import {Component, ɵregisterLocaleData, ɵunregisterLocaleData} from '@angular/core';
import {TestBed} from '@angular/core/testing';

describe('DatePipe', () => {
  const isoStringWithoutTime = '2015-01-01';
  let pipe: DatePipe;
  let date: Date;

  beforeAll(() => ɵregisterLocaleData(localeEn, localeEnExtra));
  afterAll(() => ɵunregisterLocaleData());

  beforeEach(() => {
    date = new Date(2015, 5, 15, 9, 3, 1, 550);
    pipe = new DatePipe('en-US', null);
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

    it('should support ISO string', () =>
      expect(() => pipe.transform('2015-06-15T21:43:11Z')).not.toThrow());

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
    it('should use "mediumDate" as the default format if no format is provided', () =>
      expect(pipe.transform('2017-01-11T10:14:39+0000')).toEqual('Jan 11, 2017'));

    it('should give precedence to the passed in format', () =>
      expect(pipe.transform('2017-01-11T10:14:39+0000', 'shortDate')).toEqual('1/11/17'));

    it('should use format provided in component as default format when no format is passed in', () => {
      @Component({
        selector: 'test-component',
        imports: [DatePipe],
        template: '{{ value | date }}',
        providers: [{provide: DATE_PIPE_DEFAULT_OPTIONS, useValue: {dateFormat: 'shortDate'}}],
      })
      class TestComponent {
        value = '2017-01-11T10:14:39+0000';
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      const content = fixture.nativeElement.textContent;
      expect(content).toBe('1/11/17');
    });

    it('should use format provided in module as default format when no format is passed in', () => {
      @Component({
        selector: 'test-component',
        imports: [DatePipe],
        template: '{{ value | date }}',
      })
      class TestComponent {
        value = '2017-01-11T10:14:39+0000';
      }

      TestBed.configureTestingModule({
        imports: [TestComponent],
        providers: [{provide: DATE_PIPE_DEFAULT_OPTIONS, useValue: {dateFormat: 'shortDate'}}],
      });
      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      const content = fixture.nativeElement.textContent;
      expect(content).toBe('1/11/17');
    });

    it('should return first week if some dates fall in previous year but belong to next year according to ISO 8601 format', () => {
      expect(pipe.transform('2019-12-28T00:00:00', 'w')).toEqual('52');

      // December 29th is a Sunday, week number is from previous thursday
      expect(pipe.transform('2019-12-29T00:00:00', 'w')).toEqual('52');

      // December 30th is a monday, week number is from next thursday
      expect(pipe.transform('2019-12-30T00:00:00', 'w')).toEqual('1');
    });

    it('should return first week if some dates fall in previous leap year but belong to next year according to ISO 8601 format', () => {
      expect(pipe.transform('2012-12-29T00:00:00', 'w')).toEqual('52');

      // December 30th is a Sunday, week number is from previous thursday
      expect(pipe.transform('2012-12-30T00:00:00', 'w')).toEqual('52');

      // December 31th is a monday, week number is from next thursday
      expect(pipe.transform('2012-12-31T00:00:00', 'w')).toEqual('1');
    });

    it('should round milliseconds down to the nearest millisecond', () => {
      expect(pipe.transform('2020-08-01T23:59:59.999', 'yyyy-MM-dd')).toEqual('2020-08-01');
      expect(pipe.transform('2020-08-01T23:59:59.9999', 'yyyy-MM-dd, h:mm:ss SSS')).toEqual(
        '2020-08-01, 11:59:59 999',
      );
    });

    it('should take timezone into account with timezone offset', () => {
      expect(pipe.transform('2017-01-11T00:00:00', 'mediumDate', '-1200')).toEqual('Jan 10, 2017');
    });

    it('should support an empty string for the timezone', () => {
      expect(pipe.transform('2017-01-11T00:00:00', 'mediumDate', '')).toEqual('Jan 11, 2017');
    });

    it('should take timezone into account', () => {
      expect(pipe.transform('2017-01-11T00:00:00', 'mediumDate', '-1200')).toEqual('Jan 10, 2017');
    });

    it('should take timezone into account with timezone offset', () => {
      expect(pipe.transform('2017-01-11T00:00:00', 'mediumDate', '-1200')).toEqual('Jan 10, 2017');
    });

    it('should take the default timezone into account when no timezone is passed in', () => {
      pipe = new DatePipe('en-US', '-1200');
      expect(pipe.transform('2017-01-11T00:00:00', 'mediumDate')).toEqual('Jan 10, 2017');
    });

    it('should give precedence to the passed in timezone over the default one', () => {
      pipe = new DatePipe('en-US', '-1200');
      expect(pipe.transform('2017-01-11T00:00:00', 'mediumDate', '+0100')).toEqual('Jan 11, 2017');
    });

    it('should use timezone provided in component as default timezone when no format is passed in', () => {
      @Component({
        selector: 'test-component',
        imports: [DatePipe],
        template: '{{ value | date }}',
        providers: [{provide: DATE_PIPE_DEFAULT_OPTIONS, useValue: {timezone: '-1200'}}],
      })
      class TestComponent {
        value = '2017-01-11T00:00:00';
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      const content = fixture.nativeElement.textContent;
      expect(content).toBe('Jan 10, 2017');
    });

    it('should use timezone provided in module as default timezone when no format is passed in', () => {
      @Component({
        selector: 'test-component',
        imports: [DatePipe],
        template: '{{ value | date }}',
      })
      class TestComponent {
        value = '2017-01-11T00:00:00';
      }

      TestBed.configureTestingModule({
        imports: [TestComponent],
        providers: [{provide: DATE_PIPE_DEFAULT_OPTIONS, useValue: {timezone: '-1200'}}],
      });
      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      const content = fixture.nativeElement.textContent;
      expect(content).toBe('Jan 10, 2017');
    });
  });

  it('should be available as a standalone pipe', () => {
    @Component({
      selector: 'test-component',
      imports: [DatePipe],
      template: '{{ value | date }}',
    })
    class TestComponent {
      value = '2017-01-11T10:14:39+0000';
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const content = fixture.nativeElement.textContent;
    expect(content).toBe('Jan 11, 2017');
  });
});
