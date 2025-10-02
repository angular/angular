/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injector, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {customError, form, numeric, numericError} from '../../../../public_api';
import {FLOAT_REGEXP} from '../../../../src/api/validators/util';

describe('numeric validator', () => {
  it('should validate integer', () => {
    const model = signal('123');
    const f = form(
      model,
      (p) => {
        numeric(p);
      },
      {
        injector: TestBed.inject(Injector),
      },
    );

    expect(f().errors()).toEqual([]);

    model.set('123.45');
    expect(f().errors()).toEqual([numericError({field: f})]);

    model.set('abc');
    expect(f().errors()).toEqual([numericError({field: f})]);
  });

  it('should validate floating point number', () => {
    const model = signal('123.45');
    const f = form(
      model,
      (p) => {
        numeric(p, {float: true});
      },
      {
        injector: TestBed.inject(Injector),
      },
    );

    expect(f().errors()).toEqual([]);

    model.set('123');
    expect(f().errors()).toEqual([]);

    model.set('abc');
    expect(f().errors()).toEqual([numericError({float: true, pattern: FLOAT_REGEXP, field: f})]);
  });

  it('should validate with custom pattern', () => {
    const model = signal('1,234.56');
    const f = form(
      model,
      (p) => {
        numeric(p, {float: true, pattern: /^\d{1,3}(,\d{3})*(\.\d{2})?$/});
      },
      {
        injector: TestBed.inject(Injector),
      },
    );

    expect(f().errors()).toEqual([]);

    model.set('1,234.5678');
    expect(f().errors()).toEqual([
      numericError({float: true, pattern: /^\d{1,3}(,\d{3})*(\.\d{2})?$/, field: f}),
    ]);
  });

  it('should support custom error message', () => {
    const model = signal('abc');
    const f = form(
      model,
      (p) => {
        numeric(p, {message: 'custom message'});
      },
      {
        injector: TestBed.inject(Injector),
      },
    );

    expect(f().errors()).toEqual([
      numericError({
        message: 'custom message',
        field: f,
      }),
    ]);
  });

  it('should support custom error', () => {
    const model = signal('abc');
    const f = form(
      model,
      (p) => {
        numeric(p, {error: customError({kind: 'customNumericError'})});
      },
      {
        injector: TestBed.inject(Injector),
      },
    );

    expect(f().errors()).toEqual([customError({kind: 'customNumericError', field: f})]);
  });

  it('should treat empty value as valid', () => {
    const model = signal('');
    const f = form(
      model,
      (p) => {
        numeric(p);
      },
      {
        injector: TestBed.inject(Injector),
      },
    );

    expect(f().errors()).toEqual([]);
  });
});
