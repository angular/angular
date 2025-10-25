/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injector, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {email, form} from '../../../../public_api';
import {customError, emailError} from '../../../../src/api/validation_errors';

describe('email validator', () => {
  it('returns requiredTrue error when the value is false', () => {
    const cat = signal({name: 'pirojok-the-cat', email: 'cat@cat.meow'});
    const f = form(
      cat,
      (p) => {
        email(p.email);
      },
      {
        injector: TestBed.inject(Injector),
      },
    );

    expect(f.email().errors()).toEqual([]);
    f.email().value.set('not-real-email');
    expect(f.email().errors()).toEqual([emailError({field: f.email})]);
  });

  it('supports custom errors', () => {
    const cat = signal({name: 'pirojok-the-cat', email: 'error'});
    const f = form(
      cat,
      (p) => {
        email(p.email, {
          error: (ctx) => customError({kind: `special-email-${ctx.valueOf(p.name)}`}),
        });
      },
      {
        injector: TestBed.inject(Injector),
      },
    );

    expect(f.email().errors()).toEqual([
      customError({
        kind: 'special-email-pirojok-the-cat',
        field: f.email,
      }),
    ]);
  });

  it('supports custom error message', () => {
    const cat = signal({name: 'pirojok-the-cat', email: 'error'});
    const f = form(
      cat,
      (p) => {
        email(p.email, {
          message: 'email error',
        });
      },
      {
        injector: TestBed.inject(Injector),
      },
    );

    expect(f.email().errors()).toEqual([
      emailError({
        message: 'email error',
        field: f.email,
      }),
    ]);
  });

  it('should treat empty value as valid', () => {
    const model = signal('');
    const f = form(
      model,
      (p) => {
        email(p);
      },
      {
        injector: TestBed.inject(Injector),
      },
    );

    expect(f().errors()).toEqual([]);
  });
});
