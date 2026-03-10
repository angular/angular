/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injector, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {form, maxDate} from '../../../../public_api';

describe('maxDate validator', () => {
  it('returns max error when date is after the maximum', () => {
    const model = signal({date: '2025-12-31'});
    const f = form(
      model,
      (p) => {
        maxDate(p.date, '2025-06-01');
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f.date().errors()).toEqual([jasmine.objectContaining({kind: 'max'})]);
  });

  it('returns no error when date equals the maximum (inclusive)', () => {
    const model = signal({date: '2025-06-01'});
    const f = form(
      model,
      (p) => {
        maxDate(p.date, '2025-06-01');
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f.date().errors()).toEqual([]);
  });

  it('returns no error when date is before the maximum', () => {
    const model = signal({date: '2025-01-01'});
    const f = form(
      model,
      (p) => {
        maxDate(p.date, '2025-06-01');
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
        maxDate(p.date, '2025-06-01');
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f.date().errors()).toEqual([]);
  });

  it('supports dynamic string max value via LogicFn', () => {
    const model = signal({date: '2025-12-31', endDate: '2025-06-01'});
    const f = form(
      model,
      (p) => {
        maxDate(p.date, ({valueOf}) => valueOf(p.endDate));
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f.date().errors()).toEqual([jasmine.objectContaining({kind: 'max'})]);
    f.endDate().value.set('2026-01-01');
    expect(f.date().errors()).toEqual([]);
  });

  it('supports custom error messages', () => {
    const model = signal({date: '2025-12-31'});
    const f = form(
      model,
      (p) => {
        maxDate(p.date, '2025-06-01', {message: 'Date must not be in the future'});
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f.date().errors()).toEqual([
      jasmine.objectContaining({kind: 'max', message: 'Date must not be in the future'}),
    ]);
  });

  it('supports custom error function', () => {
    const model = signal({date: '2025-12-31'});
    const f = form(
      model,
      (p) => {
        maxDate(p.date, '2025-06-01', {
          error: ({value}) => ({kind: 'custom-max-date', message: `${value()} is too late`}),
        });
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f.date().errors()).toEqual([
      jasmine.objectContaining({kind: 'custom-max-date', message: '2025-12-31 is too late'}),
    ]);
  });

  it('revalidates when the date value changes', () => {
    const model = signal({date: '2025-12-31'});
    const f = form(
      model,
      (p) => {
        maxDate(p.date, '2025-06-01');
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f.date().errors()).toEqual([jasmine.objectContaining({kind: 'max'})]);
    f.date().value.set('2025-01-01');
    expect(f.date().errors()).toEqual([]);
  });

  it('works with time strings', () => {
    const model = signal({time: '18:00'});
    const f = form(
      model,
      (p) => {
        maxDate(p.time, '17:00');
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f.time().errors()).toEqual([jasmine.objectContaining({kind: 'max'})]);
    f.time().value.set('16:00');
    expect(f.time().errors()).toEqual([]);
  });

  it('works with datetime-local strings', () => {
    const model = signal({datetime: '2025-12-31T18:00'});
    const f = form(
      model,
      (p) => {
        maxDate(p.datetime, '2025-06-01T17:00');
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f.datetime().errors()).toEqual([jasmine.objectContaining({kind: 'max'})]);
    f.datetime().value.set('2025-06-01T16:00');
    expect(f.datetime().errors()).toEqual([]);
  });
});
