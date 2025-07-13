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
import {PATTERN, form, pattern} from '../../../../public_api';

describe('pattern validator', () => {
  it('validates whether a value matches the string pattern', () => {
    const cat = signal({name: 'pelmeni-the-cat'});
    const f = form(
      cat,
      (p) => {
        pattern(p.name, 'pir.*jok');
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f.name().errors()).toEqual([ValidationError.pattern('pir.*jok')]);
  });

  it('supports custom error', () => {
    const cat = signal({name: 'pelmeni-the-cat'});
    const f = form(
      cat,
      (p) => {
        pattern(p.name, 'pir.*jok', {errors: () => ValidationError.custom()});
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f.name().errors()).toEqual([ValidationError.custom()]);
  });

  describe('metadata', () => {
    it('sets the metadata', () => {
      const cat = signal({name: 'pelmeni-the-cat'});
      const f = form(
        cat,
        (p) => {
          pattern(p.name, 'pir.*jok');
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f.name().metadata(PATTERN)()).toEqual(['pir.*jok']);
    });

    it('merges the metadata in an array', () => {
      const cat = signal({name: 'pelmeni-the-cat'});
      const f = form(
        cat,
        (p) => {
          pattern(p.name, 'pir.*jok');
          pattern(p.name, 'pelmeni');
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f.name().metadata(PATTERN)()).toEqual(['pir.*jok', 'pelmeni']);
    });
  });

  describe('dynamic values', () => {
    it('updates validation result as the string pattern changes', () => {
      const patternSignal = signal<string | undefined>('pir.*jok');
      const cat = signal({name: 'pelmeni-the-cat'});
      const f = form(
        cat,
        (p) => {
          pattern(p.name, patternSignal);
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f.name().errors()).toEqual([ValidationError.pattern('pir.*jok')]);

      patternSignal.set('p.*');
      expect(f.name().errors()).toEqual([]);
      patternSignal.set('meow');
      expect(f.name().errors()).toEqual([ValidationError.pattern('meow')]);

      patternSignal.set(undefined);

      expect(f.name().errors()).toEqual([]);
    });
  });
});
