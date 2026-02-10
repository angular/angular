/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injector, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {form, min, minError} from '../../../../public_api';

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

    expect(f.age().errors()).toEqual([minError(5, {fieldTree: f.age})]);
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

  describe('custom errors', () => {
    it('returns custom errors when provided', () => {
      const cat = signal({name: 'pirojok-the-cat', age: 3});
      const f = form(
        cat,
        (p) => {
          min(p.age, 5, {
            error: ({value}) => {
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
          fieldTree: f.age,
        },
      ]);
    });

    it('supports returning custom plain error, and wraps it as custom', () => {
      const cat = signal({name: 'pirojok-the-cat', age: 3});
      const f = form(
        cat,
        (p) => {
          min(p.age, 5, {
            error: ({value}) => {
              return {
                kind: 'special-min',
                message: value().toString(),
              };
            },
          });
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f.age().errors()).toEqual([
        {
          kind: 'special-min',
          message: '3',
          fieldTree: f.age,
        },
      ]);
    });

    it('supports custom error messages', () => {
      const cat = signal({name: 'pirojok-the-cat', age: 3});
      const f = form(
        cat,
        (p) => {
          min(p.age, 5, {
            message: 'min error!!',
          });
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f.age().errors()).toEqual([
        minError(5, {
          message: 'min error!!',
          fieldTree: f.age,
        }),
      ]);
    });

    it('Supports not returning nothing from error function', () => {
      const cat = signal({name: 'pirojok-the-cat', age: 3});
      const f = form(
        cat,
        (p) => {
          min(p.age, 5, {
            error: ({value, valueOf}) => {
              return valueOf(p.name) === 'disabled'
                ? []
                : {kind: 'special-min', message: value().toString()};
            },
          });
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f.age().errors()).toEqual([{kind: 'special-min', message: '3', fieldTree: f.age}]);
      f.name().value.set('disabled');
      expect(f.age().errors()).toEqual([]);
    });
  });

  it('treats NaN as no minimum', () => {
    const cat = signal({name: 'pirojok-the-cat', age: 4});
    const f = form(
      cat,
      (p) => {
        min(p.age, NaN);
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f.age().errors()).toEqual([]);
  });

  it('should treat empty value as valid', () => {
    const model = signal(NaN);
    const f = form(
      model,
      (p) => {
        min(p, 10);
      },
      {
        injector: TestBed.inject(Injector),
      },
    );

    expect(f().errors()).toEqual([]);
  });

  describe('custom properties', () => {
    it('stores the MIN property on min', () => {
      const cat = signal({name: 'pirojok-the-cat', age: 3});
      const f = form(
        cat,
        (p) => {
          min(p.age, 5);
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f.age().min?.()).toBe(5);
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
      expect(f.age().errors()).toEqual([
        minError(5, {fieldTree: f.age}),
        minError(10, {fieldTree: f.age}),
      ]);
      f.age().value.set(7);
      expect(f.age().errors()).toEqual([minError(10, {fieldTree: f.age})]);
      f.age().value.set(15);
      expect(f.age().errors()).toEqual([]);

      expect(f.age().min?.()).toBe(10);
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
      expect(f.age().errors()).toEqual([
        minError(5, {fieldTree: f.age}),
        minError(10, {fieldTree: f.age}),
      ]);
      f.age().value.set(7);
      expect(f.age().errors()).toEqual([minError(10, {fieldTree: f.age})]);
      f.age().value.set(15);
      expect(f.age().errors()).toEqual([]);
      minSignal.set(30);
      expect(f.age().errors()).toEqual([minError(30, {fieldTree: f.age})]);
      expect(f.age().min?.()).toBe(30);
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

      expect(f.age().errors()).toEqual([
        minError(15, {fieldTree: f.age}),
        minError(10, {fieldTree: f.age}),
      ]);
      minSignal.set(undefined);
      expect(f.age().errors()).toEqual([minError(10, {fieldTree: f.age})]);
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

      expect(f.age().errors()).toEqual([minError(5, {fieldTree: f.age})]);
      minValue.set(undefined);
      expect(f.age().errors()).toEqual([]);
      minValue.set(5);
      expect(f.age().errors()).toEqual([minError(5, {fieldTree: f.age})]);
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

      expect(f.age().errors()).toEqual([minError(5, {fieldTree: f.age})]);
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

      expect(f.age().errors()).toEqual([minError(5, {fieldTree: f.age})]);
      f.name().value.set('other cat');
      expect(f.age().errors()).toEqual([]);
    });
  });

  it('should validate properly formatted strings', () => {
    const f = form(
      signal<number | string | null>('4'),
      (p) => {
        min(p, 10);
      },
      {injector: TestBed.inject(Injector)},
    );
    expect(f().errors()).toEqual([jasmine.objectContaining({kind: 'min'})]);
  });

  it('should not validate improperly formatted strings or null', () => {
    const f = form(
      signal<number | string | null>('4f'),
      (p) => {
        min(p, 10);
      },
      {injector: TestBed.inject(Injector)},
    );
    expect(f().errors()).toEqual([]);
    f().value.set(null);
    expect(f().errors()).toEqual([]);
    f().value.set(4);
    expect(f().errors()).toEqual([jasmine.objectContaining({kind: 'min'})]);
  });
});
