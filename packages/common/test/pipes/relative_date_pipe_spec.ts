/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {RELATIVE_DATE_PIPE_DEFAULT_OPTIONS, RelativeDatePipe} from '../../index';

describe('RelativeDatePipe', () => {
  const NOW = new Date(2026, 8, 20, 12, 0, 0, 0); // Sept 20, 2026, noon
  let pipe: RelativeDatePipe;

  beforeEach(() => {
    jasmine.clock().install();
    jasmine.clock().mockDate(NOW);
    pipe = new RelativeDatePipe('en-US');
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  describe('supports', () => {
    it('should support Date objects', () => {
      expect(() => pipe.transform(new Date())).not.toThrow();
    });

    it('should support numbers (milliseconds)', () => {
      expect(() => pipe.transform(NOW.getTime() - 60000)).not.toThrow();
    });

    it('should support ISO strings', () => {
      expect(() => pipe.transform('2015-06-15T21:43:11Z')).not.toThrow();
    });

    it('should return null for null', () => {
      expect(pipe.transform(null)).toEqual(null);
    });

    it('should return null for undefined', () => {
      expect(pipe.transform(undefined)).toEqual(null);
    });

    it('should return null for empty string', () => {
      expect(pipe.transform('')).toEqual(null);
    });

    it('should return null for NaN', () => {
      expect(pipe.transform(Number.NaN)).toEqual(null);
    });

    it('should throw for invalid date values', () => {
      expect(() => pipe.transform('not-a-date')).toThrowError(/InvalidPipeArgument/);
    });
  });

  describe('transform', () => {
    it('should format a date in the past as "ago"', () => {
      const fiveMinutesAgo = NOW.getTime() - 5 * 60 * 1000;
      expect(pipe.transform(fiveMinutesAgo)).toBe('5 minutes ago');
    });

    it('should format a date in the future as "in"', () => {
      const inFiveMinutes = NOW.getTime() + 5 * 60 * 1000;
      expect(pipe.transform(inFiveMinutes)).toBe('in 5 minutes');
    });

    it('should format hours correctly', () => {
      const twoHoursAgo = NOW.getTime() - 2 * 60 * 60 * 1000;
      expect(pipe.transform(twoHoursAgo)).toBe('2 hours ago');
    });

    it('should format days correctly', () => {
      const threeDaysAgo = NOW.getTime() - 3 * 24 * 60 * 60 * 1000;
      expect(pipe.transform(threeDaysAgo)).toBe('3 days ago');
    });

    it('should format weeks correctly', () => {
      const twoWeeksAgo = NOW.getTime() - 14 * 24 * 60 * 60 * 1000;
      expect(pipe.transform(twoWeeksAgo)).toBe('2 weeks ago');
    });

    it('should format months correctly', () => {
      const threeMonthsAgo = NOW.getTime() - 91 * 24 * 60 * 60 * 1000;
      expect(pipe.transform(threeMonthsAgo)).toBe('3 months ago');
    });

    it('should format years correctly', () => {
      const twoYearsAgo = NOW.getTime() - 730 * 24 * 60 * 60 * 1000;
      expect(pipe.transform(twoYearsAgo)).toBe('2 years ago');
    });

    it('should format seconds for very recent times', () => {
      const justNow = NOW.getTime() - 30 * 1000;
      expect(pipe.transform(justNow)).toBe('30 seconds ago');
    });

    it('should handle "now" (0 seconds)', () => {
      expect(pipe.transform(NOW.getTime())).toBe('0 seconds ago');
    });
  });

  describe('style parameter', () => {
    it('should support short style', () => {
      const fiveMinutesAgo = NOW.getTime() - 5 * 60 * 1000;
      expect(pipe.transform(fiveMinutesAgo, 'short')).toBe('5 min. ago');
    });

    it('should support narrow style', () => {
      const fiveMinutesAgo = NOW.getTime() - 5 * 60 * 1000;
      expect(pipe.transform(fiveMinutesAgo, 'narrow')).toBe('5 min. ago');
    });

    it('should support long style', () => {
      const fiveMinutesAgo = NOW.getTime() - 5 * 60 * 1000;
      expect(pipe.transform(fiveMinutesAgo, 'long')).toBe('5 minutes ago');
    });
  });

  describe('numeric parameter', () => {
    it('should use numeric "always" by default', () => {
      const oneDayAgo = NOW.getTime() - 24 * 60 * 60 * 1000;
      expect(pipe.transform(oneDayAgo)).toBe('1 day ago');
    });

    it('should support numeric "auto" for natural language', () => {
      const oneDayAgo = NOW.getTime() - 24 * 60 * 60 * 1000;
      expect(pipe.transform(oneDayAgo, 'long', 'auto')).toBe('yesterday');
    });

    it('should support numeric "auto" for future', () => {
      const inOneDay = NOW.getTime() + 24 * 60 * 60 * 1000;
      expect(pipe.transform(inOneDay, 'long', 'auto')).toBe('tomorrow');
    });
  });

  describe('formatter caching', () => {
    it('should reuse the formatter for identical params', () => {
      const spy = spyOn(Intl, 'RelativeTimeFormat' as any).and.callThrough();
      const ts = NOW.getTime() - 5 * 60 * 1000;
      pipe.transform(ts);
      pipe.transform(ts);
      pipe.transform(ts);
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should create a new formatter when params change', () => {
      const spy = spyOn(Intl, 'RelativeTimeFormat' as any).and.callThrough();
      const ts = NOW.getTime() - 5 * 60 * 1000;
      pipe.transform(ts, 'long');
      pipe.transform(ts, 'short');
      expect(spy).toHaveBeenCalledTimes(2);
    });
  });

  describe('default options via DI', () => {
    it('should use options from default config', async () => {
      @Component({
        selector: 'test-component',
        imports: [RelativeDatePipe],
        template: '{{ value | relativeDate }}',
        providers: [
          {provide: RELATIVE_DATE_PIPE_DEFAULT_OPTIONS, useValue: {numeric: 'auto'}},
        ],
      })
      class TestComponent {
        value = NOW.getTime() - 24 * 60 * 60 * 1000;
      }

      const fixture = TestBed.createComponent(TestComponent);
      await fixture.whenStable();

      expect(fixture.nativeElement.textContent).toBe('yesterday');
    });

    it('should give precedence to passed-in parameters over defaults', async () => {
      @Component({
        selector: 'test-component',
        imports: [RelativeDatePipe],
        template: '{{ value | relativeDate:"long":"always" }}',
        providers: [
          {provide: RELATIVE_DATE_PIPE_DEFAULT_OPTIONS, useValue: {numeric: 'auto'}},
        ],
      })
      class TestComponent {
        value = NOW.getTime() - 24 * 60 * 60 * 1000;
      }

      const fixture = TestBed.createComponent(TestComponent);
      await fixture.whenStable();

      expect(fixture.nativeElement.textContent).toBe('1 day ago');
    });
  });

  it('should be available as a standalone pipe', async () => {
    @Component({
      selector: 'test-component',
      imports: [RelativeDatePipe],
      template: '{{ value | relativeDate }}',
    })
    class TestComponent {
      value = NOW.getTime() - 5 * 60 * 1000;
    }

    const fixture = TestBed.createComponent(TestComponent);
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toBe('5 minutes ago');
  });
});
