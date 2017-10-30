/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {LOCALE_ID} from '@angular/core';
import {async, inject, TestBed} from '@angular/core/testing';
import {DateAdapter, DEC, FEB, JAN, MAR, MAT_DATE_LOCALE} from '@angular/material/core';
import * as moment from 'moment';
import {MomentDateModule} from './index';
import {MomentDateAdapter} from './moment-date-adapter';


describe('MomentDateAdapter', () => {
  let adapter: MomentDateAdapter;
  let assertValidDate: (d: moment.Moment | null, valid: boolean) => void;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MomentDateModule]
    }).compileComponents();
  }));

  beforeEach(inject([DateAdapter], (dateAdapter: MomentDateAdapter) => {
    moment.locale('en');
    adapter = dateAdapter;
    adapter.setLocale('en');

    assertValidDate = (d: moment.Moment | null, valid: boolean) => {
      expect(adapter.isDateInstance(d)).not.toBeNull(`Expected ${d} to be a date instance`);
      expect(adapter.isValid(d!)).toBe(valid,
          `Expected ${d} to be ${valid ? 'valid' : 'invalid'},` +
          ` but was ${valid ? 'invalid' : 'valid'}`);
    };
  }));

  it('should get year', () => {
    expect(adapter.getYear(moment([2017,  JAN,  1]))).toBe(2017);
  });

  it('should get month', () => {
    expect(adapter.getMonth(moment([2017,  JAN,  1]))).toBe(0);
  });

  it('should get date', () => {
    expect(adapter.getDate(moment([2017,  JAN,  1]))).toBe(1);
  });

  it('should get day of week', () => {
    expect(adapter.getDayOfWeek(moment([2017,  JAN,  1]))).toBe(0);
  });

  it('should get same day of week in a locale with a different first day of the week', () => {
    adapter.setLocale('fr');
    expect(adapter.getDayOfWeek(moment([2017,  JAN,  1]))).toBe(0);
  });

  it('should get long month names', () => {
    expect(adapter.getMonthNames('long')).toEqual([
      'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September',
      'October', 'November', 'December'
    ]);
  });

  it('should get long month names', () => {
    expect(adapter.getMonthNames('short')).toEqual([
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ]);
  });

  it('should get narrow month names', () => {
    expect(adapter.getMonthNames('narrow')).toEqual([
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ]);
  });

  it('should get month names in a different locale', () => {
    adapter.setLocale('ja-JP');
    expect(adapter.getMonthNames('long')).toEqual([
      '1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'
    ]);
  });

  it('should get date names', () => {
    expect(adapter.getDateNames()).toEqual([
      '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17',
      '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31'
    ]);
  });

  it('should get date names in a different locale', () => {
    adapter.setLocale('ja-JP');
    expect(adapter.getDateNames()).toEqual([
      '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17',
      '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31'
    ]);
  });

  it('should get long day of week names', () => {
    expect(adapter.getDayOfWeekNames('long')).toEqual([
      'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
    ]);
  });

  it('should get short day of week names', () => {
    expect(adapter.getDayOfWeekNames('short')).toEqual([
      'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'
    ]);
  });

  it('should get narrow day of week names', () => {
    expect(adapter.getDayOfWeekNames('narrow')).toEqual([
      'Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'
    ]);
  });

  it('should get day of week names in a different locale', () => {
    adapter.setLocale('ja-JP');
    expect(adapter.getDayOfWeekNames('long')).toEqual([
      '日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'
    ]);
  });

  it('should get year name', () => {
    expect(adapter.getYearName(moment([2017,  JAN,  1]))).toBe('2017');
  });

  it('should get year name in a different locale', () => {
    adapter.setLocale('ja-JP');
    expect(adapter.getYearName(moment([2017,  JAN,  1]))).toBe('2017');
  });

  it('should get first day of week', () => {
    expect(adapter.getFirstDayOfWeek()).toBe(0);
  });

  it('should get first day of week in a different locale', () => {
    adapter.setLocale('fr');
    expect(adapter.getFirstDayOfWeek()).toBe(1);
  });

  it('should create Moment date', () => {
    expect(adapter.createDate(2017, JAN, 1).format()).toEqual(moment([2017,  JAN,  1]).format());
  });

  it('should not create Moment date with month over/under-flow', () => {
    expect(() => adapter.createDate(2017, DEC + 1, 1)).toThrow();
    expect(() => adapter.createDate(2017, JAN - 1, 1)).toThrow();
  });

  it('should not create Moment date with date over/under-flow', () => {
    expect(() => adapter.createDate(2017, JAN, 32)).toThrow();
    expect(() => adapter.createDate(2017, JAN, 0)).toThrow();
  });

  it('should create Moment date with low year number', () => {
    expect(adapter.createDate(-1, JAN, 1).year()).toBe(-1);
    expect(adapter.createDate(0, JAN, 1).year()).toBe(0);
    expect(adapter.createDate(50, JAN, 1).year()).toBe(50);
    expect(adapter.createDate(99, JAN, 1).year()).toBe(99);
    expect(adapter.createDate(100, JAN, 1).year()).toBe(100);
  });

  it("should get today's date", () => {
    expect(adapter.sameDate(adapter.today(), moment()))
        .toBe(true, "should be equal to today's date");
  });

  it('should parse string according to given format', () => {
    expect(adapter.parse('1/2/2017', 'MM/DD/YYYY')!.format())
        .toEqual(moment([2017,  JAN,  2]).format());
    expect(adapter.parse('1/2/2017', 'DD/MM/YYYY')!.format())
        .toEqual(moment([2017,  FEB,  1]).format());
  });

  it('should parse number', () => {
    let timestamp = new Date().getTime();
    expect(adapter.parse(timestamp, 'MM/DD/YYYY')!.format()).toEqual(moment(timestamp).format());
  });

  it ('should parse Date', () => {
    let date = new Date(2017, JAN, 1);
    expect(adapter.parse(date, 'MM/DD/YYYY')!.format()).toEqual(moment(date).format());
  });

  it ('should parse Moment date', () => {
    let date = moment([2017,  JAN,  1]);
    let parsedDate = adapter.parse(date, 'MM/DD/YYYY');
    expect(parsedDate!.format()).toEqual(date.format());
    expect(parsedDate).not.toBe(date);
  });

  it('should parse empty string as null', () => {
    expect(adapter.parse('', 'MM/DD/YYYY')).toBeNull();
  });

  it('should parse invalid value as invalid', () => {
    let d = adapter.parse('hello', 'MM/DD/YYYY');
    expect(d).not.toBeNull();
    expect(adapter.isDateInstance(d))
        .toBe(true, 'Expected string to have been fed through Date.parse');
    expect(adapter.isValid(d as moment.Moment))
        .toBe(false, 'Expected to parse as "invalid date" object');
  });

  it('should format date according to given format', () => {
    expect(adapter.format(moment([2017,  JAN,  2]), 'MM/DD/YYYY')).toEqual('01/02/2017');
    expect(adapter.format(moment([2017,  JAN,  2]), 'DD/MM/YYYY')).toEqual('02/01/2017');
  });

  it('should format with a different locale', () => {
    expect(adapter.format(moment([2017,  JAN,  2]), 'll')).toEqual('Jan 2, 2017');
    adapter.setLocale('ja-JP');
    expect(adapter.format(moment([2017,  JAN,  2]), 'll')).toEqual('2017年1月2日');
  });

  it('should throw when attempting to format invalid date', () => {
    expect(() => adapter.format(moment(NaN), 'MM/DD/YYYY'))
        .toThrowError(/MomentDateAdapter: Cannot format invalid date\./);
  });

  it('should add years', () => {
    expect(adapter.addCalendarYears(moment([2017, JAN, 1]), 1).format())
        .toEqual(moment([2018, JAN, 1]).format());
    expect(adapter.addCalendarYears(moment([2017, JAN, 1]), -1).format())
        .toEqual(moment([2016, JAN, 1]).format());
  });

  it('should respect leap years when adding years', () => {
    expect(adapter.addCalendarYears(moment([2016, FEB, 29]), 1).format())
        .toEqual(moment([2017, FEB, 28]).format());
    expect(adapter.addCalendarYears(moment([2016, FEB, 29]), -1).format())
        .toEqual(moment([2015, FEB, 28]).format());
  });

  it('should add months', () => {
    expect(adapter.addCalendarMonths(moment([2017, JAN, 1]), 1).format())
        .toEqual(moment([2017, FEB, 1]).format());
    expect(adapter.addCalendarMonths(moment([2017, JAN, 1]), -1).format())
        .toEqual(moment([2016, DEC, 1]).format());
  });

  it('should respect month length differences when adding months', () => {
    expect(adapter.addCalendarMonths(moment([2017, JAN, 31]), 1).format())
        .toEqual(moment([2017, FEB, 28]).format());
    expect(adapter.addCalendarMonths(moment([2017, MAR, 31]), -1).format())
        .toEqual(moment([2017, FEB, 28]).format());
  });

  it('should add days', () => {
    expect(adapter.addCalendarDays(moment([2017, JAN, 1]), 1).format())
        .toEqual(moment([2017, JAN, 2]).format());
    expect(adapter.addCalendarDays(moment([2017, JAN, 1]), -1).format())
        .toEqual(moment([2016, DEC, 31]).format());
  });

  it('should clone', () => {
    let date = moment([2017, JAN, 1]);
    expect(adapter.clone(date).format()).toEqual(date.format());
    expect(adapter.clone(date)).not.toBe(date);
  });

  it('should compare dates', () => {
    expect(adapter.compareDate(moment([2017, JAN, 1]), moment([2017, JAN, 2]))).toBeLessThan(0);
    expect(adapter.compareDate(moment([2017, JAN, 1]), moment([2017, FEB, 1]))).toBeLessThan(0);
    expect(adapter.compareDate(moment([2017, JAN, 1]), moment([2018, JAN, 1]))).toBeLessThan(0);
    expect(adapter.compareDate(moment([2017, JAN, 1]), moment([2017, JAN, 1]))).toBe(0);
    expect(adapter.compareDate(moment([2018, JAN, 1]), moment([2017, JAN, 1]))).toBeGreaterThan(0);
    expect(adapter.compareDate(moment([2017, FEB, 1]), moment([2017, JAN, 1]))).toBeGreaterThan(0);
    expect(adapter.compareDate(moment([2017, JAN, 2]), moment([2017, JAN, 1]))).toBeGreaterThan(0);
  });

  it('should clamp date at lower bound', () => {
    expect(adapter.clampDate(
        moment([2017, JAN, 1]), moment([2018, JAN, 1]), moment([2019, JAN, 1])))
        .toEqual(moment([2018, JAN, 1]));
  });

  it('should clamp date at upper bound', () => {
    expect(adapter.clampDate(
        moment([2020, JAN, 1]), moment([2018, JAN, 1]), moment([2019, JAN, 1])))
        .toEqual(moment([2019, JAN, 1]));
  });

  it('should clamp date already within bounds', () => {
    expect(adapter.clampDate(
        moment([2018, FEB, 1]), moment([2018, JAN, 1]), moment([2019, JAN, 1])))
        .toEqual(moment([2018, FEB, 1]));
  });

  it('should count today as a valid date instance', () => {
    let d = moment();
    expect(adapter.isValid(d)).toBe(true);
    expect(adapter.isDateInstance(d)).toBe(true);
  });

  it('should count an invalid date as an invalid date instance', () => {
    let d = moment(NaN);
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
    assertValidDate(adapter.deserialize('1985-04-12T23:20:50.52Z'), true);
    assertValidDate(adapter.deserialize('1996-12-19T16:39:57-08:00'), true);
    assertValidDate(adapter.deserialize('1937-01-01T12:00:27.87+00:20'), true);
    assertValidDate(adapter.deserialize('1990-13-31T23:59:00Z'), false);
    assertValidDate(adapter.deserialize('1/1/2017'), false);
    expect(adapter.deserialize('')).toBeNull();
    expect(adapter.deserialize(null)).toBeNull();
    assertValidDate(adapter.deserialize(new Date()), true);
    assertValidDate(adapter.deserialize(new Date(NaN)), false);
    assertValidDate(adapter.deserialize(moment()), true);
    assertValidDate(adapter.deserialize(moment.invalid()), false);
  });

  it('setLocale should not modify global moment locale', () => {
    expect(moment.locale()).toBe('en');
    adapter.setLocale('ja-JP');
    expect(moment.locale()).toBe('en');
  });

  it('returned Moments should have correct locale', () => {
    adapter.setLocale('ja-JP');
    expect(adapter.createDate(2017, JAN, 1).locale()).toBe('ja');
    expect(adapter.today().locale()).toBe('ja');
    expect(adapter.clone(moment()).locale()).toBe('ja');
    expect(adapter.parse('1/1/2017', 'MM/DD/YYYY')!.locale()).toBe('ja');
    expect(adapter.addCalendarDays(moment(), 1).locale()).toBe('ja');
    expect(adapter.addCalendarMonths(moment(), 1).locale()).toBe('ja');
    expect(adapter.addCalendarYears(moment(), 1).locale()).toBe('ja');
  });

  it('should not change locale of Moments passed as params', () => {
    let date = moment();
    expect(date.locale()).toBe('en');
    adapter.setLocale('ja-JP');
    adapter.getYear(date);
    adapter.getMonth(date);
    adapter.getDate(date);
    adapter.getDayOfWeek(date);
    adapter.getYearName(date);
    adapter.getNumDaysInMonth(date);
    adapter.clone(date);
    adapter.parse(date, 'MM/DD/YYYY');
    adapter.format(date, 'MM/DD/YYYY');
    adapter.addCalendarDays(date, 1);
    adapter.addCalendarMonths(date, 1);
    adapter.addCalendarYears(date, 1);
    adapter.toIso8601(date);
    adapter.isDateInstance(date);
    adapter.isValid(date);
    expect(date.locale()).toBe('en');
  });

  it('should create invalid date', () => {
    assertValidDate(adapter.invalid(), false);
  });
});

describe('MomentDateAdapter with MAT_DATE_LOCALE override', () => {
  let adapter: MomentDateAdapter;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MomentDateModule],
      providers: [{provide: MAT_DATE_LOCALE, useValue: 'ja-JP'}]
    }).compileComponents();
  }));

  beforeEach(inject([DateAdapter], (d: MomentDateAdapter) => {
    adapter = d;
  }));

  it('should take the default locale id from the MAT_DATE_LOCALE injection token', () => {
    expect(adapter.format(moment([2017,  JAN,  2]), 'll')).toEqual('2017年1月2日');
  });
});

describe('MomentDateAdapter with LOCALE_ID override', () => {
  let adapter: MomentDateAdapter;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MomentDateModule],
      providers: [{provide: LOCALE_ID, useValue: 'fr'}]
    }).compileComponents();
  }));

  beforeEach(inject([DateAdapter], (d: MomentDateAdapter) => {
    adapter = d;
  }));

  it('should take the default locale id from the LOCALE_ID injection token', () => {
    expect(adapter.format(moment([2017,  JAN,  2]), 'll')).toEqual('2 janv. 2017');
  });
});
