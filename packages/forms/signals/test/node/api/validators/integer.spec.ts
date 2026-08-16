/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injector, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {form, integer, integerError} from '../../../../public_api';

describe('integer validator', () => {
  it('returns integer error when value is not an integer', () => {
    const cat = signal({age: '12.34'});
    const f = form(
      cat,
      (p) => {
        integer(p.age);
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f.age().errors()).toEqual([integerError({fieldTree: f.age})]);
    f.age().value.set('4');
    expect(f.age().errors()).toEqual([]);
  });

  describe('custom errors', () => {
    it('returns custom errors when provided', () => {
      const cat = signal({age: '12.34', level: 1});
      const f = form(
        cat,
        (p) => {
          integer(p.age, {
            error: (ctx) => ({kind: `integer-${ctx.valueOf(p.level)}`}),
          });
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f.age().errors()).toEqual([{kind: 'integer-1', fieldTree: f.age}]);
      f.age().value.set('4');
      expect(f.age().errors()).toEqual([]);
    });

    it('supports custom error messages', () => {
      const cat = signal({age: '12.34'});
      const f = form(
        cat,
        (p) => {
          integer(p.age, {
            message: 'integer error!!',
          });
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f.age().errors()).toEqual([
        integerError({message: 'integer error!!', fieldTree: f.age}),
      ]);
      f.age().value.set('4');
      expect(f.age().errors()).toEqual([]);
    });
  });

  describe('dynamic rules', () => {
    it('supports custom condition via when', () => {
      const cat = signal({age: '12.34', active: false});
      const f = form(
        cat,
        (p) => {
          integer(p.age, {
            when({valueOf}) {
              return valueOf(p.active);
            },
          });
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f.age().errors()).toEqual([]);
      f.active().value.set(true);
      expect(f.age().errors()).toEqual([integerError({fieldTree: f.age})]);
    });
  });
});
