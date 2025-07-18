/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injector, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {ValidationError} from '@angular/forms/experimental/src/api/validation_errors';
import {form, required} from '../../../../public_api';

describe('required validator', () => {
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

    expect(f.name().errors()).toEqual([ValidationError.required()]);
    f.name().value.set('pirojok-the-cat');
    expect(f.name().errors()).toEqual([]);
  });

  it('supports custom errors', () => {
    const cat = signal({name: '', age: 5});
    const f = form(
      cat,
      (p) => {
        required(p.name, {
          error: (ctx) => ValidationError.custom({kind: `required-${ctx.valueOf(p.age)}`}),
        });
      },
      {
        injector: TestBed.inject(Injector),
      },
    );

    expect(f.name().errors()).toEqual([ValidationError.custom({kind: 'required-5'})]);
    f.name().value.set('pirojok-the-cat');
    expect(f.name().errors()).toEqual([]);
  });

  it('supports custom emptyPredicate', () => {
    const cat = signal({name: ''});
    const f = form(
      cat,
      (p) => {
        required(p.name, {
          emptyPredicate(value) {
            return value === 'empty';
          },
        });
      },
      {
        injector: TestBed.inject(Injector),
      },
    );

    expect(f.name().errors()).toEqual([]);
    f.name().value.set('empty');
    expect(f.name().errors()).toEqual([ValidationError.required()]);
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
    expect(f.name().errors()).toEqual([ValidationError.required()]);
  });
});
