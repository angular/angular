/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injector, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {form, minDate} from '../../../../public_api';

describe('minDate validator', () => {
  it('returns min error when date is before the minimum', () => {
    const model = signal({date: '2025-01-01'});
    const f = form(
      model,
      (p) => {
        minDate(p.date, '2025-06-01');
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f.date().errors()).toEqual([jasmine.objectContaining({kind: 'min'})]);
  });

  it('returns no error when date equals the minimum (inclusive)', () => {
    const model = signal({date: '2025-06-01'});
    const f = form(
      model,
      (p) => {
        minDate(p.date, '2025-06-01');
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f.date().errors()).toEqual([]);
  });

  it('returns no error when date is after the minimum', () => {
    const model = signal({date: '2025-12-31'});
    const f = form(
      model,
      (p) => {
        minDate(p.date, '2025-06-01');
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f.date().errors()).toEqual([]);
  });

  it('treats empty string as valid (no error)', () => {
    const model = signal({date: ''});
    const f = form(
      model,
      (p) => {
        minDate(p.date, '2025-06-01');
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f.date().errors()).toEqual([]);
  });

  it('supports dynamic string min value via LogicFn', () => {
    const model = signal({date: '2025-01-01', startDate: '2025-06-01'});
    const f = form(
      model,
      (p) => {
        minDate(p.date, ({valueOf}) => valueOf(p.startDate));
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f.date().errors()).toEqual([jasmine.objectContaining({kind: 'min'})]);
    f.startDate().value.set('2024-01-01');
    expect(f.date().errors()).toEqual([]);
  });

  it('supports custom error messages', () => {
    const model = signal({date: '2025-01-01'});
    const f = form(
      model,
      (p) => {
        minDate(p.date, '2025-06-01', {message: 'Date must not be in the past'});
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f.date().errors()).toEqual([
      jasmine.objectContaining({kind: 'min', message: 'Date must not be in the past'}),
    ]);
  });

  it('supports custom error function', () => {
    const model = signal({date: '2025-01-01'});
    const f = form(
      model,
      (p) => {
        minDate(p.date, '2025-06-01', {
          error: ({value}) => ({kind: 'custom-min-date', message: `${value()} is too early`}),
        });
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f.date().errors()).toEqual([
      jasmine.objectContaining({kind: 'custom-min-date', message: '2025-01-01 is too early'}),
    ]);
  });

  it('revalidates when the date value changes', () => {
    const model = signal({date: '2025-01-01'});
    const f = form(
      model,
      (p) => {
        minDate(p.date, '2025-06-01');
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f.date().errors()).toEqual([jasmine.objectContaining({kind: 'min'})]);
    f.date().value.set('2025-07-01');
    expect(f.date().errors()).toEqual([]);
  });

  it('works with time strings', () => {
    const model = signal({time: '08:00'});
    const f = form(
      model,
      (p) => {
        minDate(p.time, '09:00');
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f.time().errors()).toEqual([jasmine.objectContaining({kind: 'min'})]);
    f.time().value.set('10:00');
    expect(f.time().errors()).toEqual([]);
  });

  it('works with datetime-local strings', () => {
    const model = signal({datetime: '2025-01-01T08:00'});
    const f = form(
      model,
      (p) => {
        minDate(p.datetime, '2025-06-01T09:00');
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f.datetime().errors()).toEqual([jasmine.objectContaining({kind: 'min'})]);
    f.datetime().value.set('2025-06-01T10:00');
    expect(f.datetime().errors()).toEqual([]);
  });
});
