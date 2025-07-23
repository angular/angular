/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {MAX, form, max} from '../../../../public_api';

describe('max validator', () => {
  it('returns max error when the value is larger', () => {
    const cat = signal({name: 'pirojok-the-cat', age: 6});
    const f = form(
      cat,
      (p) => {
        max(p.age, 5);
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f.age().errors()).toEqual([{kind: 'max'}]);
  });

  it('is inclusive', () => {
    const cat = signal({name: 'pirojok-the-cat', age: 5});
    const f = form(
      cat,
      (p) => {
        max(p.age, 5);
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f.age().errors()).toEqual([]);
  });

  it('returns no errors when the value is smaller', () => {
    const cat = signal({name: 'pirojok-the-cat', age: 4});
    const f = form(
      cat,
      (p) => {
        max(p.age, 5);
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f.age().errors()).toEqual([]);
  });

  it('returns custom errors when provided', () => {
    const cat = signal({name: 'pirojok-the-cat', age: 6});
    const f = form(
      cat,
      (p) => {
        max(p.age, 5, {
          errors: ({value}) => {
            return {kind: 'special-max', message: value().toString()};
          },
        });
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f.age().errors()).toEqual([
      {
        kind: 'special-max',
        message: '6',
      },
    ]);
  });

  describe('metadata', () => {
    it('stores the metadata on max', () => {
      const cat = signal({name: 'pirojok-the-cat', age: 6});
      const f = form(
        cat,
        (p) => {
          max(p.age, 5, {
            errors: ({value}) => {
              return {kind: 'special-max', message: value().toString()};
            },
          });
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f.age().metadata(MAX)()).toBe(5);
    });

    it('merges two maxes preferring the smaller option', () => {
      const cat = signal({name: 'pirojok-the-cat', age: 12});
      const f = form(
        cat,
        (p) => {
          max(p.age, 10);
          max(p.age, 5);
        },
        {injector: TestBed.inject(Injector)},
      );

      f.age().value.set(12);
      expect(f.age().errors()).toEqual([{kind: 'max'}, {kind: 'max'}]);
      f.age().value.set(7);
      expect(f.age().errors()).toEqual([{kind: 'max'}]);
      f.age().value.set(3);
      expect(f.age().errors()).toEqual([]);

      expect(f.age().metadata(MAX)()).toBe(5);
    });

    it('merges two maxes _dynamically_ preferring the smaller option', () => {
      const cat = signal({name: 'pirojok-the-cat', age: 12});
      const maxSignal = signal(10);
      const f = form(
        cat,
        (p) => {
          max(p.age, maxSignal);
          max(p.age, 5);
        },
        {injector: TestBed.inject(Injector)},
      );

      f.age().value.set(12);
      expect(f.age().errors()).toEqual([{kind: 'max'}, {kind: 'max'}]);
      f.age().value.set(7);
      expect(f.age().errors()).toEqual([{kind: 'max'}]);
      f.age().value.set(3);
      expect(f.age().errors()).toEqual([]);

      expect(f.age().metadata(MAX)()).toBe(5);

      maxSignal.set(2);
      f.age().value.set(3);
      expect(f.age().errors()).toEqual([{kind: 'max'}]);
      expect(f.age().metadata(MAX)()).toBe(2);
    });

    it('merges two maxes _dynamically_ ignores undefined', () => {
      const cat = signal({name: 'pirojok-the-cat', age: 20}); // Age is higher than both maxes
      const maxSignal = signal<number | undefined>(10);
      const maxSignal2 = signal<number | undefined>(15);
      const f = form(
        cat,
        (p) => {
          max(p.age, maxSignal);
          max(p.age, maxSignal2);
        },
        {injector: TestBed.inject(Injector)},
      );

      // Initially, age 20 is greater than both 10 and 15
      expect(f.age().errors()).toEqual([{kind: 'max'}, {kind: 'max'}]);

      // Set the first max threshold to undefined
      maxSignal.set(undefined);
      // Now, age 20 is only greater than 15
      expect(f.age().errors()).toEqual([{kind: 'max'}]);

      // Set the second max threshold to undefined
      maxSignal2.set(undefined);
      // No max constraints are active
      expect(f.age().errors()).toEqual([]);
    });
  });

  describe('dynamic values', () => {
    it('handles dynamic value', () => {
      const cat = signal({name: 'pirojok-the-cat', age: 6});
      const maxValue = signal(5);
      const f = form(
        cat,
        (p) => {
          max(p.age, maxValue);
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f.age().errors()).toEqual([{kind: 'max'}]);
      maxValue.set(7);
      expect(f.age().errors()).toEqual([]);
    });

    it('disables validation on undefined', () => {
      const cat = signal({name: 'pirojok-the-cat', age: 6});
      const maxValue = signal<number | undefined>(5);
      const f = form(
        cat,
        (p) => {
          max(p.age, maxValue);
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f.age().errors()).toEqual([{kind: 'max'}]);
      maxValue.set(undefined);
      expect(f.age().errors()).toEqual([]);
      maxValue.set(5);
      expect(f.age().errors()).toEqual([{kind: 'max'}]);
    });

    it('handles dynamic value based on other field', () => {
      const cat = signal({name: 'pirojok-the-cat', age: 6});

      const f = form(
        cat,
        (p) => {
          max(p.age, ({valueOf}) => {
            return valueOf(p.name) === 'pirojok-the-cat' ? 5 : 10;
          });
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f.age().errors()).toEqual([{kind: 'max'}]);

      f.name().value.set('other cat');

      expect(f.age().errors()).toEqual([]);
    });
  });
});
