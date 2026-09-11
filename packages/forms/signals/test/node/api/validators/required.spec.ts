/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injector, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {form, required} from '../../../../public_api';
import {requiredError} from '../../../../src/api/rules/validation/validation_errors';

describe('required validator', () => {
  // Documented on `required()` and in guide/forms/signals/validation#required. `false` follows the
  // native semantics of `required` on `<input type="checkbox">`; `NaN` is not a valid number.
  describe('emptiness', () => {
    it('treats null, empty string, false and NaN as empty', () => {
      const model = signal<{
        nullable: string | null;
        text: string;
        checkbox: boolean;
        num: number;
      }>({nullable: null, text: '', checkbox: false, num: Number.NaN});
      const f = form(
        model,
        (p) => {
          required(p.nullable);
          required(p.text);
          required(p.checkbox);
          required(p.num);
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f.nullable().errors()).toEqual([requiredError({fieldTree: f.nullable})]);
      expect(f.text().errors()).toEqual([requiredError({fieldTree: f.text})]);
      expect(f.checkbox().errors()).toEqual([requiredError({fieldTree: f.checkbox})]);
      expect(f.num().errors()).toEqual([requiredError({fieldTree: f.num})]);
    });

    it('treats 0, an empty array and other filled values as non-empty', () => {
      const model = signal<{
        zero: number;
        list: string[];
        checkbox: boolean;
        text: string;
      }>({zero: 0, list: [], checkbox: true, text: 'a'});
      const f = form(
        model,
        (p) => {
          required(p.zero);
          required(p.list);
          required(p.checkbox);
          required(p.text);
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f.zero().errors()).toEqual([]);
      expect(f.list().errors()).toEqual([]);
      expect(f.checkbox().errors()).toEqual([]);
      expect(f.text().errors()).toEqual([]);
    });
  });

  it('returns required Error when the value is not present', () => {
    const cat = signal({name: ''});
    const f = form(
      cat,
      (p) => {
        required(p.name);
      },
      {
        injector: TestBed.inject(Injector),
      },
    );

    expect(f.name().errors()).toEqual([requiredError({fieldTree: f.name})]);
    f.name().value.set('pirojok-the-cat');
    expect(f.name().errors()).toEqual([]);
  });

  it('supports custom errors', () => {
    const cat = signal({name: '', age: 5});
    const f = form(
      cat,
      (p) => {
        required(p.name, {
          error: (ctx) => ({kind: `required-${ctx.valueOf(p.age)}`}),
        });
      },
      {
        injector: TestBed.inject(Injector),
      },
    );

    expect(f.name().errors()).toEqual([{kind: 'required-5', fieldTree: f.name}]);
    f.name().value.set('pirojok-the-cat');
    expect(f.name().errors()).toEqual([]);
  });

  it('supports custom error messages', () => {
    const cat = signal({name: '', age: 5});
    const f = form(
      cat,
      (p) => {
        required(p.name, {
          message: 'required error',
        });
      },
      {
        injector: TestBed.inject(Injector),
      },
    );

    expect(f.name().errors()).toEqual([
      requiredError({message: 'required error', fieldTree: f.name}),
    ]);
    f.name().value.set('pirojok-the-cat');
    expect(f.name().errors()).toEqual([]);
  });

  it('supports custom condition', () => {
    const cat = signal({name: '', age: 5});
    const f = form(
      cat,
      (p) => {
        required(p.name, {
          when({valueOf}) {
            return valueOf(p.age) > 10;
          },
        });
      },
      {
        injector: TestBed.inject(Injector),
      },
    );

    expect(f.name().errors()).toEqual([]);
    f.age().value.set(15);
    expect(f.name().errors()).toEqual([requiredError({fieldTree: f.name})]);
  });

  it('supports returning custom plain error, and wraps it as custom', () => {
    const cat = signal({name: 'meow', age: 5});
    const f = form(
      cat,
      (p) => {
        required(p.name, {
          error: () => {
            return {kind: 'pirojok-the-error'};
          },
        });
      },
      {
        injector: TestBed.inject(Injector),
      },
    );

    expect(f.name().errors()).toEqual([]);
    f.name().value.set('');
    expect(f.name().errors()).toEqual([{kind: 'pirojok-the-error', fieldTree: f.name}]);
  });
});
