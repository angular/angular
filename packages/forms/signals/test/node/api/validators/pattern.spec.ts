/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injector, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {PATTERN, form, pattern} from '../../../../public_api';
import {customError, patternError} from '../../../../src/api/validation_errors';

describe('pattern validator', () => {
  it('validates whether a value matches the pattern', () => {
    const cat = signal({name: 'pelmeni-the-cat'});
    const f = form(
      cat,
      (p) => {
        pattern(p.name, /pir.*jok/);
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f.name().errors()).toEqual([patternError(/pir.*jok/, {field: f.name})]);
  });

  it('supports custom error', () => {
    const cat = signal({name: 'pelmeni-the-cat'});
    const f = form(
      cat,
      (p) => {
        pattern(p.name, /pir.*jok/, {error: customError()});
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f.name().errors()).toEqual([customError({field: f.name})]);
  });

  it('supports custom error message', () => {
    const cat = signal({name: 'pelmeni-the-cat'});
    const f = form(
      cat,
      (p) => {
        pattern(p.name, /pir.*jok/, {message: 'pattern error'});
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f.name().errors()).toEqual([
      patternError(/pir.*jok/, {message: 'pattern error', field: f.name}),
    ]);
  });

  it('should treat empty value as valid', () => {
    const model = signal('');
    const f = form(
      model,
      (p) => {
        pattern(p, /^hi$/);
      },
      {
        injector: TestBed.inject(Injector),
      },
    );

    expect(f().errors()).toEqual([]);
  });

  describe('custom properties', () => {
    it('sets the PATTERN property', () => {
      const cat = signal({name: 'pelmeni-the-cat'});
      const f = form(
        cat,
        (p) => {
          pattern(p.name, /pir.*jok/);
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f.name().property(PATTERN)()).toEqual([/pir.*jok/]);
    });

    it('merges the PATTERN property in an array', () => {
      const cat = signal({name: 'pelmeni-the-cat'});
      const f = form(
        cat,
        (p) => {
          pattern(p.name, /pir.*jok/);
          pattern(p.name, /pelmeni/);
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f.name().property(PATTERN)()).toEqual([/pir.*jok/, /pelmeni/]);
    });

    it('PATTERN property defaults to empty list', () => {
      const cat = signal({name: 'pelmeni-the-cat'});
      const f = form(
        cat,
        (p) => {
          pattern(p.name, () => undefined);
        },
        {injector: TestBed.inject(Injector)},
      );
      expect(f.name().property(PATTERN)()).toEqual([]);
    });
  });

  describe('dynamic values', () => {
    it('updates validation result as the pattern changes', () => {
      const patternSignal = signal<RegExp | undefined>(/pir.*jok/);
      const cat = signal({name: 'pelmeni-the-cat'});
      const f = form(
        cat,
        (p) => {
          pattern(p.name, () => patternSignal());
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f.name().errors()).toEqual([patternError(/pir.*jok/, {field: f.name})]);

      patternSignal.set(/p.*/);
      expect(f.name().errors()).toEqual([]);
      patternSignal.set(/meow/);
      expect(f.name().errors()).toEqual([patternError(/meow/, {field: f.name})]);

      patternSignal.set(undefined);

      expect(f.name().errors()).toEqual([]);
    });
  });
});
