/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector, signal} from '@angular/core';
import {form} from '../../../src/api/structure';
import {min} from '../../../src/api/validators';
import {MIN} from '../../../src/api/metadata';
import {TestBed} from '@angular/core/testing';


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

    expect(f.age.$state.errors()).toEqual([{kind: 'min'}]);
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

    expect(f.age.$state.errors()).toEqual([]);
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

      f.age.$state.value.set(3);
      expect(f.age.$state.errors()).toEqual([{kind: 'min'}, {kind: 'min'}]);
      f.age.$state.value.set(7);
      expect(f.age.$state.errors()).toEqual([{kind: 'min'}]);
      f.age.$state.value.set(15);
      expect(f.age.$state.errors()).toEqual([]);
      minSignal.set(30);
      expect(f.age.$state.errors()).toEqual([{kind: 'min'}]);
      expect(f.age.$state.metadata(MIN)()).toBe(30);
    });
  });

  describe('dynamic values', () => {
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

      expect(f.age.$state.errors()).toEqual([{kind: 'min'}]);
      minValue.set(2);
      expect(f.age.$state.errors()).toEqual([]);
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

      expect(f.age.$state.errors()).toEqual([{kind: 'min'}]);
      f.name.$state.value.set('other cat');
      expect(f.age.$state.errors()).toEqual([]);
    });
  });
});
