/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injector, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {form, numeric, numericError} from '../../../../public_api';

describe('numeric validator', () => {
  it('returns numeric error when value is not numeric', () => {
    const cat = signal({tag: 'abc'});
    const f = form(
      cat,
      (p) => {
        numeric(p.tag);
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f.tag().errors()).toEqual([numericError({fieldTree: f.tag})]);
    f.tag().value.set('123.45');
    expect(f.tag().errors()).toEqual([]);
  });

  describe('custom errors', () => {
    it('returns custom errors when provided', () => {
      const cat = signal({tag: 'abc', code: 100});
      const f = form(
        cat,
        (p) => {
          numeric(p.tag, {
            error: (ctx) => ({kind: `numeric-${ctx.valueOf(p.code)}`}),
          });
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f.tag().errors()).toEqual([{kind: 'numeric-100', fieldTree: f.tag}]);
      f.tag().value.set('42');
      expect(f.tag().errors()).toEqual([]);
    });

    it('supports custom error messages', () => {
      const cat = signal({tag: 'abc'});
      const f = form(
        cat,
        (p) => {
          numeric(p.tag, {
            message: 'numeric error!!',
          });
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f.tag().errors()).toEqual([
        numericError({message: 'numeric error!!', fieldTree: f.tag}),
      ]);
      f.tag().value.set('42');
      expect(f.tag().errors()).toEqual([]);
    });
  });

  describe('dynamic rules', () => {
    it('supports custom condition via when', () => {
      const cat = signal({tag: 'abc', validate: false});
      const f = form(
        cat,
        (p) => {
          numeric(p.tag, {
            when({valueOf}) {
              return valueOf(p.validate);
            },
          });
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f.tag().errors()).toEqual([]);
      f.validate().value.set(true);
      expect(f.tag().errors()).toEqual([numericError({fieldTree: f.tag})]);
    });
  });
});
