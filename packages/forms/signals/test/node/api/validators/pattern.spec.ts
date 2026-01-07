/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injector, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {form, pattern, patternError} from '../../../../public_api';

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

    expect(f.name().errors()).toEqual([patternError(/pir.*jok/, {fieldTree: f.name})]);
  });

  it('supports custom error', () => {
    const cat = signal({name: 'pelmeni-the-cat'});
    const f = form(
      cat,
      (p) => {
        pattern(p.name, /pir.*jok/, {error: {kind: 'invalid-pattern'}});
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f.name().errors()).toEqual([{kind: 'invalid-pattern', fieldTree: f.name}]);
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
      patternError(/pir.*jok/, {message: 'pattern error', fieldTree: f.name}),
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

      expect(f.name().pattern()).toEqual([/pir.*jok/]);
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

      expect(f.name().pattern()).toEqual([/pir.*jok/, /pelmeni/]);
    });

    it('validates multiple patterns independently (AND logic)', () => {
      const model = signal('abc123');
      const f = form(
        model,
        (p) => {
          pattern(p, /abc/); // matches
          pattern(p, /\d+/); // matches
        },
        {injector: TestBed.inject(Injector)},
      );

      // Both patterns match, so no errors
      expect(f().pattern()).toEqual([/abc/, /\d+/]);
      expect(f().errors()).toEqual([]);
    });

    it('validates multiple patterns independently - partial match produces errors', () => {
      const model = signal('abc');
      const f = form(
        model,
        (p) => {
          pattern(p, /abc/); // matches
          pattern(p, /\d+/); // does NOT match
        },
        {injector: TestBed.inject(Injector)},
      );

      // Only one pattern matches, so we get an error from the non-matching one
      expect(f().pattern()).toEqual([/abc/, /\d+/]);
      expect(f().errors()).toEqual([patternError(/\d+/, {fieldTree: f})]);
    });

    it('validates multiple patterns - no match produces multiple errors', () => {
      const model = signal('xyz');
      const f = form(
        model,
        (p) => {
          pattern(p, /abc/); // does NOT match
          pattern(p, /\d+/); // does NOT match
        },
        {injector: TestBed.inject(Injector)},
      );

      // No patterns match, so we get errors from both
      expect(f().pattern()).toEqual([/abc/, /\d+/]);
      expect(f().errors()).toEqual([
        patternError(/abc/, {fieldTree: f}),
        patternError(/\d+/, {fieldTree: f}),
      ]);
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
      expect(f.name().pattern()).toEqual([]);
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

      expect(f.name().errors()).toEqual([patternError(/pir.*jok/, {fieldTree: f.name})]);

      patternSignal.set(/p.*/);
      expect(f.name().errors()).toEqual([]);
      patternSignal.set(/meow/);
      expect(f.name().errors()).toEqual([patternError(/meow/, {fieldTree: f.name})]);

      patternSignal.set(undefined);

      expect(f.name().errors()).toEqual([]);
    });
  });
});
