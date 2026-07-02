/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injector, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {form, minDate, minDateError} from '../../../../public_api';

describe('minDate validator', () => {
  it('returns min error when the date is smaller', () => {
    const today = new Date('2026-04-01');
    const yesterday = new Date('2026-03-31');
    const model = signal(yesterday);
    const f = form(
      model,
      (p) => {
        minDate(p, today);
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f().errors()).toEqual([minDateError(today, {fieldTree: f})]);
  });

  it('returns no error when the date is equal', () => {
    const today = new Date('2026-04-01');
    const model = signal(today);
    const f = form(
      model,
      (p) => {
        minDate(p, today);
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f().errors()).toEqual([]);
  });

  it('returns no error when the date is larger', () => {
    const today = new Date('2026-04-01');
    const tomorrow = new Date('2026-04-02');
    const model = signal(tomorrow);
    const f = form(
      model,
      (p) => {
        minDate(p, today);
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f().errors()).toEqual([]);
  });

  it('handles invalid dates', () => {
    const model = signal(new Date('invalid'));
    const f = form(
      model,
      (p) => {
        minDate(p, new Date('2026-04-01'));
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f().errors()).toEqual([]);
  });
});
