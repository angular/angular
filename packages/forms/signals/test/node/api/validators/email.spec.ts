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
import {emailError} from '../../../../src/api/rules/validation/validation_errors';

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
    expect(f.email().errors()).toEqual([emailError({fieldTree: f.email})]);
  });

  it('supports custom errors', () => {
    const cat = signal({name: 'pirojok-the-cat', email: 'error'});
    const f = form(
      cat,
      (p) => {
        email(p.email, {
          error: (ctx) => ({kind: `special-email-${ctx.valueOf(p.name)}`}),
        });
      },
      {
        injector: TestBed.inject(Injector),
      },
    );

    expect(f.email().errors()).toEqual([
      {
        kind: 'special-email-pirojok-the-cat',
        fieldTree: f.email,
      },
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
        fieldTree: f.email,
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

  it('should treat null and undefined values as valid', () => {
    const model = signal<string | null | undefined>(null);
    const f = form(
      model,
      (p) => {
        email(p);
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f().errors()).toEqual([]);
    model.set(undefined);
    expect(f().errors()).toEqual([]);
    model.set('invalid-email');
    expect(f().errors()).toEqual([emailError({fieldTree: f})]);
    model.set('valid@example.com');
    expect(f().errors()).toEqual([]);
    model.set(null);
    expect(f().errors()).toEqual([]);
  });

  it('supports nullable fields in a model', () => {
    interface UserModel {
      email: string | null;
    }
    const model = signal<UserModel>({email: null});
    const f = form(
      model,
      (p) => {
        email(p.email);
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f.email().errors()).toEqual([]);

    f.email().value.set('bad');
    expect(f.email().errors()).toEqual([emailError({fieldTree: f.email})]);

    f.email().value.set('good@example.com');
    expect(f.email().errors()).toEqual([]);

    f.email().value.set(null);
    expect(f.email().errors()).toEqual([]);
  });
});
