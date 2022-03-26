/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {LOCALE_ID} from '@angular/core';
import {TestBed, waitForAsync} from '@angular/core/testing';
import {DateAdapter, MAT_DATE_LOCALE} from '@angular/material/core';
import {DateTime} from 'luxon';
import {LuxonDateModule} from './index';
import {MAT_LUXON_DATE_ADAPTER_OPTIONS} from './luxon-date-adapter';

const JAN = 1,
  FEB = 2,
  MAR = 3,
  DEC = 12;

describe('LuxonDateAdapter', () => {
  let adapter: DateAdapter<DateTime>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [LuxonDateModule],
    }).compileComponents();

    adapter = TestBed.inject(DateAdapter);
    adapter.setLocale('en-US');
  }));

  it('should get year', () => {
    expect(adapter.getYear(DateTime.local(2017, JAN, 1))).toBe(2017);
  });

  it('should get month', () => {
    expect(adapter.getMonth(DateTime.local(2017, JAN, 1))).toBe(0);
  });

  it('should get date', () => {
    expect(adapter.getDate(DateTime.local(2017, JAN, 1))).toBe(1);
  });

  it('should get day of week', () => {
    expect(adapter.getDayOfWeek(DateTime.local(2017, JAN, 1))).toBe(7);
  });

  it('should get long month names', () => {
    expect(adapter.getMonthNames('long')).toEqual([
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ]);
  });

  it('should get short month names', () => {
    expect(adapter.getMonthNames('short')).toEqual([
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ]);
  });

  it('should get narrow month names', () => {
    expect(adapter.getMonthNames('narrow')).toEqual([
      'J',
      'F',
      'M',
      'A',
      'M',
      'J',
      'J',
      'A',
      'S',
      'O',
      'N',
      'D',
    ]);
  });

  it('should get month names in a czech locale', () => {
    adapter.setLocale('cs-CZ');

    expect(adapter.getMonthNames('long')).toEqual([
      'leden',
      'únor',
      'březen',
      'duben',
      'květen',
      'červen',
      'červenec',
      'srpen',
      'září',
      'říjen',
      'listopad',
      'prosinec',
    ]);
  });

  it('should get month names in a different locale', () => {
    adapter.setLocale('da-DK');

    expect(adapter.getMonthNames('long')).toEqual([
      'januar',
      'februar',
      'marts',
      'april',
      'maj',
      'juni',
      'juli',
      'august',
      'september',
      'oktober',
      'november',
      'december',
    ]);
  });

  it('should get date names', () => {
    expect(adapter.getDateNames()).toEqual([
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      '10',
      '11',
      '12',
      '13',
      '14',
      '15',
      '16',
      '17',
      '18',
      '19',
      '20',
      '21',
      '22',
      '23',
      '24',
      '25',
      '26',
      '27',
      '28',
      '29',
      '30',
      '31',
    ]);
  });

  it('should get date names in a different locale', () => {
    adapter.setLocale('ja-JP');

    expect(adapter.getDateNames()).toEqual([
      '1日',
      '2日',
      '3日',
      '4日',
      '5日',
      '6日',
      '7日',
      '8日',
      '9日',
      '10日',
      '11日',
      '12日',
      '13日',
      '14日',
      '15日',
      '16日',
      '17日',
      '18日',
      '19日',
      '20日',
      '21日',
      '22日',
      '23日',
      '24日',
      '25日',
      '26日',
      '27日',
      '28日',
      '29日',
      '30日',
      '31日',
    ]);
  });

  it('should get long day of week names', () => {
    expect(adapter.getDayOfWeekNames('long')).toEqual([
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ]);
  });

  it('should get short day of week names', () => {
    expect(adapter.getDayOfWeekNames('short')).toEqual([
      'Sun',
      'Mon',
      'Tue',
      'Wed',
      'Thu',
      'Fri',
      'Sat',
    ]);
  });

  it('should get narrow day of week names', () => {
    expect(adapter.getDayOfWeekNames('narrow')).toEqual(['S', 'M', 'T', 'W', 'T', 'F', 'S']);
  });

  it('should get day of week names in a different locale', () => {
    adapter.setLocale('ja-JP');

    expect(adapter.getDayOfWeekNames('long')).toEqual([
      '日曜日',
      '月曜日',
      '火曜日',
      '水曜日',
      '木曜日',
      '金曜日',
      '土曜日',
    ]);
  });

  it('should get year name', () => {
    expect(adapter.getYearName(DateTime.local(2017, JAN, 1))).toBe('2017');
  });

  it('should get year name in a different locale', () => {
    adapter.setLocale('ja-JP');
    expect(adapter.getYearName(DateTime.local(2017, JAN, 1))).toBe('2017');
  });

  it('should get first day of week', () => {
    expect(adapter.getFirstDayOfWeek()).toBe(0);
  });

  it('should create Luxon date', () => {
    expect(adapter.createDate(2017, JAN, 1) instanceof DateTime).toBe(true);
  });

  it('should not create Luxon date with month over/under-flow', () => {
    expect(() => adapter.createDate(2017, 12, 1)).toThrow();
    expect(() => adapter.createDate(2017, -1, 1)).toThrow();
  });

  it('should not create Luxon date with date over/under-flow', () => {
    expect(() => adapter.createDate(2017, JAN, 32)).toThrow();
    expect(() => adapter.createDate(2017, JAN, 0)).toThrow();
  });

  it("should get today's date", () => {
    expect(adapter.sameDate(adapter.today(), DateTime.local()))
      .withContext("should be equal to today's date")
      .toBe(true);
  });

  it('should parse string according to given format', () => {
    expect(adapter.parse('1/2/2017', 'L/d/yyyy')!.toISO()).toEqual(
      DateTime.local(2017, JAN, 2).toISO(),
    );
    expect(adapter.parse('1/2/2017', 'd/L/yyyy')!.toISO()).toEqual(
      DateTime.local(2017, FEB, 1).toISO(),
    );
  });

  it('should parse string according to first matching format', () => {
    expect(adapter.parse('1/2/2017', ['L/d/yyyy', 'yyyy/d/L'])!.toISO()).toEqual(
      DateTime.local(2017, JAN, 2).toISO(),
    );

    expect(adapter.parse('1/2/2017', ['yyyy/d/L', 'L/d/yyyy'])!.toISO()).toEqual(
      DateTime.local(2017, JAN, 2).toISO(),
    );
  });

  it('should throw if parse formats are an empty array', () => {
    expect(() => adapter.parse('1/2/2017', [])).toThrowError('Formats array must not be empty.');
  });

  it('should parse number', () => {
    let timestamp = new Date().getTime();
    expect(adapter.parse(timestamp, 'LL/dd/yyyy')!.toISO()).toEqual(
      DateTime.fromMillis(timestamp).toISO(),
    );
  });

  it('should parse Date', () => {
    let date = new Date(2017, JAN, 1);
    expect(adapter.parse(date, 'LL/dd/yyyy')!.toISO()).toEqual(DateTime.fromJSDate(date).toISO());
  });

  it('should parse DateTime', () => {
    let date = DateTime.local(2017, JAN, 1);
    expect(adapter.parse(date, 'LL/dd/yyyy')!.toISO()).toEqual(date.toISO());
  });

  it('should parse empty string as null', () => {
    expect(adapter.parse('', 'LL/dd/yyyy')).toBeNull();
  });

  it('should parse invalid value as invalid', () => {
    let d = adapter.parse('hello', 'LL/dd/yyyy');
    expect(d).not.toBeNull();
    expect(adapter.isDateInstance(d)).toBe(true);
    expect(adapter.isValid(d as DateTime))
      .withContext('Expected to parse as "invalid date" object')
      .toBe(false);
  });

  it('should format date according to given format', () => {
    expect(adapter.format(DateTime.local(2017, JAN, 2), 'LL/dd/yyyy')).toEqual('01/02/2017');
  });

  it('should format with a different locale', () => {
    let date = adapter.format(DateTime.local(2017, JAN, 2), 'DD');

    expect(date).toEqual('Jan 2, 2017');
    adapter.setLocale('da-DK');

    date = adapter.format(DateTime.local(2017, JAN, 2), 'DD');
    expect(date).toEqual('2. jan. 2017');
  });

  it('should throw when attempting to format invalid date', () => {
    expect(() => adapter.format(DateTime.fromMillis(NaN), 'LL/dd/yyyy')).toThrowError(
      /LuxonDateAdapter: Cannot format invalid date\./,
    );
  });

  it('should add years', () => {
    expect(adapter.addCalendarYears(DateTime.local(2017, JAN, 1), 1).toISO()).toEqual(
      DateTime.local(2018, JAN, 1).toISO(),
    );
    expect(adapter.addCalendarYears(DateTime.local(2017, JAN, 1), -1).toISO()).toEqual(
      DateTime.local(2016, JAN, 1).toISO(),
    );
  });

  it('should respect leap years when adding years', () => {
    expect(adapter.addCalendarYears(DateTime.local(2016, FEB, 29), 1).toISO()).toEqual(
      DateTime.local(2017, FEB, 28).toISO(),
    );
    expect(adapter.addCalendarYears(DateTime.local(2016, FEB, 29), -1).toISO()).toEqual(
      DateTime.local(2015, FEB, 28).toISO(),
    );
  });

  it('should add months', () => {
    expect(adapter.addCalendarMonths(DateTime.local(2017, JAN, 1), 1).toISO()).toEqual(
      DateTime.local(2017, FEB, 1).toISO(),
    );
    expect(adapter.addCalendarMonths(DateTime.local(2017, JAN, 1), -1).toISO()).toEqual(
      DateTime.local(2016, DEC, 1).toISO(),
    );
  });

  it('should respect month length differences when adding months', () => {
    expect(adapter.addCalendarMonths(DateTime.local(2017, JAN, 31), 1).toISO()).toEqual(
      DateTime.local(2017, FEB, 28).toISO(),
    );
    expect(adapter.addCalendarMonths(DateTime.local(2017, MAR, 31), -1).toISO()).toEqual(
      DateTime.local(2017, FEB, 28).toISO(),
    );
  });

  it('should add days', () => {
    expect(adapter.addCalendarDays(DateTime.local(2017, JAN, 1), 1).toISO()).toEqual(
      DateTime.local(2017, JAN, 2).toISO(),
    );
    expect(adapter.addCalendarDays(DateTime.local(2017, JAN, 1), -1).toISO()).toEqual(
      DateTime.local(2016, DEC, 31).toISO(),
    );
  });

  it('should clone', () => {
    let date = DateTime.local(2017, JAN, 1);
    let clone = adapter.clone(date);

    expect(clone).not.toBe(date);
    expect(clone.toISO()).toEqual(date.toISO());
  });

  it('should compare dates', () => {
    expect(
      adapter.compareDate(DateTime.local(2017, JAN, 1), DateTime.local(2017, JAN, 2)),
    ).toBeLessThan(0);

    expect(
      adapter.compareDate(DateTime.local(2017, JAN, 1), DateTime.local(2017, FEB, 1)),
    ).toBeLessThan(0);

    expect(
      adapter.compareDate(DateTime.local(2017, JAN, 1), DateTime.local(2018, JAN, 1)),
    ).toBeLessThan(0);

    expect(adapter.compareDate(DateTime.local(2017, JAN, 1), DateTime.local(2017, JAN, 1))).toBe(0);

    expect(
      adapter.compareDate(DateTime.local(2018, JAN, 1), DateTime.local(2017, JAN, 1)),
    ).toBeGreaterThan(0);

    expect(
      adapter.compareDate(DateTime.local(2017, FEB, 1), DateTime.local(2017, JAN, 1)),
    ).toBeGreaterThan(0);

    expect(
      adapter.compareDate(DateTime.local(2017, JAN, 2), DateTime.local(2017, JAN, 1)),
    ).toBeGreaterThan(0);
  });

  it('should clamp date at lower bound', () => {
    expect(
      adapter.clampDate(
        DateTime.local(2017, JAN, 1),
        DateTime.local(2018, JAN, 1),
        DateTime.local(2019, JAN, 1),
      ),
    ).toEqual(DateTime.local(2018, JAN, 1));
  });

  it('should clamp date at upper bound', () => {
    expect(
      adapter.clampDate(
        DateTime.local(2020, JAN, 1),
        DateTime.local(2018, JAN, 1),
        DateTime.local(2019, JAN, 1),
      ),
    ).toEqual(DateTime.local(2019, JAN, 1));
  });

  it('should clamp date already within bounds', () => {
    expect(
      adapter.clampDate(
        DateTime.local(2018, FEB, 1),
        DateTime.local(2018, JAN, 1),
        DateTime.local(2019, JAN, 1),
      ),
    ).toEqual(DateTime.local(2018, FEB, 1));
  });

  it('should count today as a valid date instance', () => {
    let d = DateTime.local();
    expect(adapter.isValid(d)).toBe(true);
    expect(adapter.isDateInstance(d)).toBe(true);
  });

  it('should count an invalid date as an invalid date instance', () => {
    let d = DateTime.fromMillis(NaN);
    expect(adapter.isValid(d)).toBe(false);
    expect(adapter.isDateInstance(d)).toBe(true);
  });

  it('should count a string as not a date instance', () => {
    let d = '1/1/2017';
    expect(adapter.isDateInstance(d)).toBe(false);
  });

  it('should count a Date as not a date instance', () => {
    let d = new Date();
    expect(adapter.isDateInstance(d)).toBe(false);
  });

  it('should create valid dates from valid ISO strings', () => {
    assertValidDate(adapter, adapter.deserialize('1985-04-12T23:20:50.52Z'), true);
    assertValidDate(adapter, adapter.deserialize('1996-12-19T16:39:57-08:00'), true);
    assertValidDate(adapter, adapter.deserialize('1937-01-01T12:00:27.87+00:20'), true);
    assertValidDate(adapter, adapter.deserialize('1990-13-31T23:59:00Z'), false);
    assertValidDate(adapter, adapter.deserialize('1/1/2017'), false);
    expect(adapter.deserialize('')).toBeNull();
    expect(adapter.deserialize(null)).toBeNull();
    assertValidDate(adapter, adapter.deserialize(new Date()), true);
    assertValidDate(adapter, adapter.deserialize(new Date(NaN)), false);
    assertValidDate(adapter, adapter.deserialize(DateTime.local()), true);
    assertValidDate(adapter, adapter.deserialize(DateTime.invalid('Not valid')), false);
  });

  it('returned dates should have correct locale', () => {
    adapter.setLocale('ja-JP');
    expect(adapter.createDate(2017, JAN, 1).locale).toBe('ja-JP');
    expect(adapter.today().locale).toBe('ja-JP');
    expect(adapter.parse('1/1/2017', 'L/d/yyyy')!.locale).toBe('ja-JP');
    expect(adapter.addCalendarDays(DateTime.local(), 1).locale).toBe('ja-JP');
    expect(adapter.addCalendarMonths(DateTime.local(), 1).locale).toBe('ja-JP');
    expect(adapter.addCalendarYears(DateTime.local(), 1).locale).toBe('ja-JP');
  });

  it('should not change locale of DateTime passed as param', () => {
    const date = DateTime.local();
    const initialLocale = date.locale;
    expect(initialLocale).toBeTruthy();
    adapter.setLocale('ja-JP');
    adapter.getYear(date);
    adapter.getMonth(date);
    adapter.getDate(date);
    adapter.getDayOfWeek(date);
    adapter.getYearName(date);
    adapter.getNumDaysInMonth(date);
    adapter.clone(date);
    adapter.parse(date, 'LL/dd/yyyy');
    adapter.format(date, 'LL/dd/yyyy');
    adapter.addCalendarDays(date, 1);
    adapter.addCalendarMonths(date, 1);
    adapter.addCalendarYears(date, 1);
    adapter.toIso8601(date);
    adapter.isDateInstance(date);
    adapter.isValid(date);
    expect(date.locale).toBe(initialLocale);
  });

  it('should create invalid date', () => {
    assertValidDate(adapter, adapter.invalid(), false);
  });
});

describe('LuxonDateAdapter with MAT_DATE_LOCALE override', () => {
  let adapter: DateAdapter<DateTime>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [LuxonDateModule],
      providers: [{provide: MAT_DATE_LOCALE, useValue: 'da-DK'}],
    }).compileComponents();

    adapter = TestBed.inject(DateAdapter);
  }));

  it('should take the default locale id from the MAT_DATE_LOCALE injection token', () => {
    const date = adapter.format(DateTime.local(2017, JAN, 2), 'DD');
    expect(date).toEqual('2. jan. 2017');
  });
});

describe('LuxonDateAdapter with LOCALE_ID override', () => {
  let adapter: DateAdapter<DateTime>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [LuxonDateModule],
      providers: [{provide: LOCALE_ID, useValue: 'fr-FR'}],
    }).compileComponents();

    adapter = TestBed.inject(DateAdapter);
  }));

  it('should take the default locale id from the LOCALE_ID injection token', () => {
    const date = adapter.format(DateTime.local(2017, JAN, 2), 'DD');
    expect(date).toEqual('2 janv. 2017');
  });
});

describe('LuxonDateAdapter with MAT_LUXON_DATE_ADAPTER_OPTIONS override', () => {
  let adapter: DateAdapter<DateTime>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [LuxonDateModule],
      providers: [
        {
          provide: MAT_LUXON_DATE_ADAPTER_OPTIONS,
          useValue: {useUtc: true, firstDayOfWeek: 1},
        },
      ],
    }).compileComponents();

    adapter = TestBed.inject(DateAdapter);
  }));

  describe('use UTC', () => {
    it('should create Luxon date in UTC', () => {
      // Use 0 since createDate takes 0-indexed months.
      expect(adapter.createDate(2017, 0, 5).toISO()).toBe(DateTime.utc(2017, JAN, 5).toISO());
    });

    it('should get first day of week', () => {
      expect(adapter.getFirstDayOfWeek()).toBe(1);
    });

    it('should create today in UTC', () => {
      const today = adapter.today();
      expect(today.toISO()).toBe(today.toUTC().toISO());
    });

    it('should parse dates to UTC', () => {
      const date = adapter.parse('1/2/2017', 'LL/dd/yyyy')!;
      expect(date.toISO()).toBe(date.toUTC().toISO());
    });

    it('should return UTC date when deserializing', () => {
      const date = adapter.deserialize('1985-04-12T23:20:50.52Z')!;
      expect(date.toISO()).toBe(date.toUTC().toISO());
    });
  });
});

function assertValidDate(adapter: DateAdapter<DateTime>, d: DateTime | null, valid: boolean) {
  expect(adapter.isDateInstance(d))
    .not.withContext(`Expected ${d} to be a date instance`)
    .toBeNull();
  expect(adapter.isValid(d!))
    .withContext(
      `Expected ${d} to be ${valid ? 'valid' : 'invalid'},` +
        ` but was ${valid ? 'invalid' : 'valid'}`,
    )
    .toBe(valid);
}
