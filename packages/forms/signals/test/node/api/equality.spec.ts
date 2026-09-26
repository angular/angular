/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injector, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {applyEach, applyWhen, equality, form} from '../../../public_api';

class PlainDate {
  constructor(readonly iso: string) {}
}

describe('equality', () => {
  it('does not update the value when the custom equality function considers it equal', () => {
    const f = form(
      signal({date: new PlainDate('2024-01-01')}),
      (p) => {
        equality(p.date, (a, b) => a.iso === b.iso);
      },
      {injector: TestBed.inject(Injector)},
    );

    const before = f.date().value();
    // A new object instance representing the same logical value.
    f.date().value.set(new PlainDate('2024-01-01'));

    expect(f.date().value()).toBe(before);
  });

  it('updates the value when the custom equality function considers it different', () => {
    const f = form(
      signal({date: new PlainDate('2024-01-01')}),
      (p) => {
        equality(p.date, (a, b) => a.iso === b.iso);
      },
      {injector: TestBed.inject(Injector)},
    );

    const next = new PlainDate('2024-02-02');
    f.date().value.set(next);

    expect(f.date().value()).toBe(next);
  });

  it('falls back to default equality when no custom function is configured', () => {
    const f = form(signal({date: new PlainDate('2024-01-01')}), () => {}, {
      injector: TestBed.inject(Injector),
    });

    const next = new PlainDate('2024-01-01');
    f.date().value.set(next);

    expect(f.date().value()).toBe(next);
  });

  it('handles null values safely within the equality comparator', () => {
    const f = form(
      signal({date: null as PlainDate | null}),
      (p) => {
        equality(p.date, (a, b) => a?.iso === b?.iso);
      },
      {injector: TestBed.inject(Injector)},
    );

    f.date().value.set(new PlainDate('2024-01-01'));
    expect(f.date().value()).toEqual(new PlainDate('2024-01-01'));

    // Setting to null
    f.date().value.set(null);
    expect(f.date().value()).toBeNull();
  });

  it('works with primitive value comparison customizations', () => {
    const f = form(
      signal({text: 'hello'}),
      (p) => {
        // Case-insensitive string equality
        equality(p.text, (a, b) => a.toLowerCase() === b.toLowerCase());
      },
      {injector: TestBed.inject(Injector)},
    );

    const initial = f.text().value();
    f.text().value.set('HELLO');

    expect(f.text().value()).toBe(initial);
  });

  it('applies custom equality check when updating value via update()', () => {
    const f = form(
      signal({date: new PlainDate('2024-01-01')}),
      (p) => {
        equality(p.date, (a, b) => a.iso === b.iso);
      },
      {injector: TestBed.inject(Injector)},
    );

    const before = f.date().value();
    f.date().value.update(() => new PlainDate('2024-01-01'));

    expect(f.date().value()).toBe(before);
  });

  it('respects equality setting when form is reset', () => {
    const initialDate = new PlainDate('2024-01-01');
    const f = form(
      signal({date: initialDate}),
      (p) => {
        equality(p.date, (a, b) => a.iso === b.iso);
      },
      {injector: TestBed.inject(Injector)},
    );

    f.date().value.set(new PlainDate('2024-05-05'));
    expect(f.date().value().iso).toBe('2024-05-05');

    // Resetting to a new object with identical value
    const resetDate = new PlainDate('2024-01-01');
    f().reset({date: resetDate});

    // Asserts that the internal value updated correctly to the reset payload instance
    expect(f.date().value()).toBe(resetDate);
  });

  it('supports custom equality on nested child fields', () => {
    const f = form(
      signal({
        user: {
          dob: new PlainDate('2000-01-01'),
        },
      }),
      (p) => {
        equality(p.user.dob, (a, b) => a.iso === b.iso);
      },
      {injector: TestBed.inject(Injector)},
    );

    const initial = f.user.dob().value();
    f.user.dob().value.set(new PlainDate('2000-01-01'));

    expect(f.user.dob().value()).toBe(initial);
  });

  it('applies custom equality when updating a parent object', () => {
    const initial = new PlainDate('2024-01-01');
    const f = form(
      signal({date: initial}),
      (p) => {
        equality(p.date, (a, b) => a.iso === b.iso);
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f.date().value()).toBe(initial);
    f().value.set({date: new PlainDate('2024-01-01')});

    expect(f.date().value()).toBe(initial);
  });

  it('supports custom equality on array items', () => {
    const initial = new PlainDate('2024-01-01');
    const f = form(
      signal({dates: [initial]}),
      (p) => {
        applyEach(p.dates, (date) => {
          equality(date, (a, b) => a.iso === b.iso);
        });
      },
      {injector: TestBed.inject(Injector)},
    );

    f.dates[0]().value.set(new PlainDate('2024-01-01'));

    expect(f.dates[0]().value()).toBe(initial);
  });

  it('supports conditionally applied equality', () => {
    const initial = new PlainDate('2024-01-01');
    const f = form(
      signal({enabled: false, date: initial}),
      (p) => {
        applyWhen(
          p,
          ({value}) => value().enabled,
          (path) => equality(path.date, (a, b) => a.iso === b.iso),
        );
      },
      {injector: TestBed.inject(Injector)},
    );

    const disabledUpdate = new PlainDate('2024-01-01');
    f.date().value.set(disabledUpdate);
    expect(f.date().value()).toBe(disabledUpdate);

    f.enabled().value.set(true);
    const enabledUpdate = new PlainDate('2024-01-01');
    f.date().value.set(enabledUpdate);
    expect(f.date().value()).toBe(disabledUpdate);
  });
});
