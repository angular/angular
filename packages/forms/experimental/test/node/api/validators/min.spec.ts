/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injector, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {NgValidationError} from '@angular/forms/experimental/src/api/validation_errors';
import {MIN, form, min} from '../../../../public_api';

describe('min validator', () => {
  it('returns min error when the value is smaller', () => {
    const cat = signal({name: 'pirojok-the-cat', age: 4});
    const f = form(
      cat,
      (p) => {
        min(p.age, 5);
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f.age().errors() as NgValidationError[]).toEqual([{kind: 'min', min: 5}]);
  });

  it('is inclusive', () => {
    const cat = signal({name: 'pirojok-the-cat', age: 4});
    const f = form(
      cat,
      (p) => {
        min(p.age, 4);
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f.age().errors()).toEqual([]);
  });

  it('returns no errors when the value is larger', () => {
    const cat = signal({name: 'pirojok-the-cat', age: 10});
    const f = form(
      cat,
      (p) => {
        min(p.age, 5);
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f.age().errors()).toEqual([]);
  });

  it('returns custom errors when provided', () => {
    const cat = signal({name: 'pirojok-the-cat', age: 3});
    const f = form(
      cat,
      (p) => {
        min(p.age, 5, {
          errors: ({value}) => {
            return {kind: 'special-min', message: value().toString()};
          },
        });
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f.age().errors()).toEqual([
      {
        kind: 'special-min',
        message: '3',
      },
    ]);
  });

  describe('metadata', () => {
    it('stores the metadata on min', () => {
      const cat = signal({name: 'pirojok-the-cat', age: 3});
      const f = form(
        cat,
        (p) => {
          min(p.age, 5, {
            errors: ({value}) => {
              return {kind: 'special-min', message: value().toString()};
            },
          });
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f.age().metadata(MIN)()).toBe(5);
    });

    it('merges two mins preferring the larger option', () => {
      const cat = signal({name: 'pirojok-the-cat', age: 3});
      const f = form(
        cat,
        (p) => {
          min(p.age, 5);
          min(p.age, 10);
        },
        {injector: TestBed.inject(Injector)},
      );

      f.age().value.set(3);
      expect(f.age().errors() as NgValidationError[]).toEqual([
        {kind: 'min', min: 5},
        {kind: 'min', min: 10},
      ]);
      f.age().value.set(7);
      expect(f.age().errors() as NgValidationError[]).toEqual([{kind: 'min', min: 10}]);
      f.age().value.set(15);
      expect(f.age().errors()).toEqual([]);

      expect(f.age().metadata(MIN)()).toBe(10);
    });

    it('merges two mins _dynamically_ preferring the larger option', () => {
      const cat = signal({name: 'pirojok-the-cat', age: 3});
      const minSignal = signal(5);
      const f = form(
        cat,
        (p) => {
          min(p.age, minSignal);
          min(p.age, 10);
        },
        {injector: TestBed.inject(Injector)},
      );

      f.age().value.set(3);
      expect(f.age().errors() as NgValidationError[]).toEqual([
        {kind: 'min', min: 5},
        {kind: 'min', min: 10},
      ]);
      f.age().value.set(7);
      expect(f.age().errors() as NgValidationError[]).toEqual([{kind: 'min', min: 10}]);
      f.age().value.set(15);
      expect(f.age().errors()).toEqual([]);
      minSignal.set(30);
      expect(f.age().errors() as NgValidationError[]).toEqual([{kind: 'min', min: 30}]);
      expect(f.age().metadata(MIN)()).toBe(30);
    });

    it('merges two mins _dynamically_ ignores undefined', () => {
      const cat = signal({name: 'pirojok-the-cat', age: 3});
      const minSignal = signal<number | undefined>(15);
      const minSignal2 = signal<number | undefined>(10);
      const f = form(
        cat,
        (p) => {
          min(p.age, minSignal);
          min(p.age, minSignal2);
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f.age().errors() as NgValidationError[]).toEqual([
        {kind: 'min', min: 15},
        {kind: 'min', min: 10},
      ]);
      minSignal.set(undefined);
      expect(f.age().errors() as NgValidationError[]).toEqual([{kind: 'min', min: 10}]);
      minSignal2.set(undefined);
      expect(f.age().errors()).toEqual([]);
    });
  });

  describe('dynamic values', () => {
    it('disables validation on undefined', () => {
      const cat = signal({name: 'pirojok-the-cat', age: 4});
      const minValue = signal<number | undefined>(5);
      const f = form(
        cat,
        (p) => {
          min(p.age, minValue);
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f.age().errors() as NgValidationError[]).toEqual([{kind: 'min', min: 5}]);
      minValue.set(undefined);
      expect(f.age().errors()).toEqual([]);
      minValue.set(5);
      expect(f.age().errors() as NgValidationError[]).toEqual([{kind: 'min', min: 5}]);
    });

    it('handles dynamic value', () => {
      const cat = signal({name: 'pirojok-the-cat', age: 4});
      const minValue = signal(5);
      const f = form(
        cat,
        (p) => {
          min(p.age, minValue);
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f.age().errors() as NgValidationError[]).toEqual([{kind: 'min', min: 5}]);
      minValue.set(2);
      expect(f.age().errors()).toEqual([]);
    });

    it('handles dynamic value based on other field', () => {
      const cat = signal({name: 'pirojok-the-cat', age: 4});

      const f = form(
        cat,
        (p) => {
          min(p.age, ({valueOf}) => {
            return valueOf(p.name) === 'pirojok-the-cat' ? 5 : 0;
          });
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f.age().errors() as NgValidationError[]).toEqual([{kind: 'min', min: 5}]);
      f.name().value.set('other cat');
      expect(f.age().errors()).toEqual([]);
    });
  });
});
