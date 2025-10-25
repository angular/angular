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
import {customError, requiredError} from '../../../../src/api/validation_errors';

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

    expect(f.name().errors()).toEqual([requiredError({field: f.name})]);
    f.name().value.set('pirojok-the-cat');
    expect(f.name().errors()).toEqual([]);
  });

  it('supports custom errors', () => {
    const cat = signal({name: '', age: 5});
    const f = form(
      cat,
      (p) => {
        required(p.name, {
          error: (ctx) => customError({kind: `required-${ctx.valueOf(p.age)}`}),
        });
      },
      {
        injector: TestBed.inject(Injector),
      },
    );

    expect(f.name().errors()).toEqual([customError({kind: 'required-5', field: f.name})]);
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

    expect(f.name().errors()).toEqual([requiredError({message: 'required error', field: f.name})]);
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
    expect(f.name().errors()).toEqual([requiredError({field: f.name})]);
  });
});
