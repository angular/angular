/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {max, min} from '../../src/api/built_in_validators';
import {form} from '../../src/api/structure';
import {MAX, MIN} from '../../src/api/metadata';

describe('build-in validators', () => {
  describe('min', () => {
    it('returns min error when the value is smaller', () => {
      const cat = signal({name: 'pirojok-the-cat', age: 4});
      const f = form(
        cat,
        (p) => {
          min(p.age, 5);
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f.age.$state.errors()).toEqual([{kind: 'min'}]);
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

      expect(f.age.$state.errors()).toEqual([]);
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

      expect(f.age.$state.errors()).toEqual([
        {
          kind: 'special-min',
          message: '3',
        },
      ]);
    });

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

      expect(f.age.$state.metadata(MIN)()).toBe(5);
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

      f.age.$state.value.set(3);
      expect(f.age.$state.errors()).toEqual([{kind: 'min'}, {kind: 'min'}]);
      f.age.$state.value.set(7);
      expect(f.age.$state.errors()).toEqual([{kind: 'min'}]);
      f.age.$state.value.set(15);
      expect(f.age.$state.errors()).toEqual([]);

      expect(f.age.$state.metadata(MIN)()).toBe(10);
    });
  });

  describe('max', () => {
    it('returns max error when the value is larger', () => {
      const cat = signal({name: 'pirojok-the-cat', age: 10});
      const f = form(
        cat,
        (p) => {
          max(p.age, 5);
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f.age.$state.errors()).toEqual([{kind: 'max'}]);
    });

    it('returns no errors when the value is smaller or equal', () => {
      const catSmaller = signal({name: 'pirojok-the-cat', age: 4});
      const fSmaller = form(
        catSmaller,
        (p) => {
          max(p.age, 5);
        },
        {injector: TestBed.inject(Injector)},
      );
      expect(fSmaller.age.$state.errors()).toEqual([]);

      const catEqual = signal({name: 'pirojok-the-cat', age: 5});
      const fEqual = form(
        catEqual,
        (p) => {
          max(p.age, 5);
        },
        {injector: TestBed.inject(Injector)},
      );
      expect(fEqual.age.$state.errors()).toEqual([]);
    });

    it('returns custom errors when provided', () => {
      const cat = signal({name: 'pirojok-the-cat', age: 7});
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

      expect(f.age.$state.errors()).toEqual([
        {
          kind: 'special-max',
          message: '7',
        },
      ]);
    });

    it('stores the metadata on max', () => {
      const cat = signal({name: 'pirojok-the-cat', age: 7});
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

      expect(f.age.$state.metadata(MAX)()).toBe(5);
    });

    it('merges two max validators preferring the smaller option', () => {
      const cat = signal({name: 'pirojok-the-cat', age: 15});
      const f = form(
        cat,
        (p) => {
          max(p.age, 5);
          max(p.age, 10);
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f.age.$state.errors()).toEqual([{kind: 'max'}, {kind: 'max'}]);

      f.age.$state.value.set(7);
      expect(f.age.$state.errors()).toEqual([{kind: 'max'}]);

      f.age.$state.value.set(3);
      expect(f.age.$state.errors()).toEqual([]);

      expect(f.age.$state.metadata(MAX)()).toBe(5);
    });
  });
});
