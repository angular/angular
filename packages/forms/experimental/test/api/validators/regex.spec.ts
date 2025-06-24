/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {REGEX, form, regex} from '../../../public_api';

fdescribe('regex validator', () => {
  it('validates whether a value matches the regex', () => {
    const cat = signal({name: 'pelmeni-the-cat'});
    const f = form(
      cat,
      (p) => {
        regex(p.name, /pir.*jok/);
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f.name().errors()).toEqual([
      jasmine.objectContaining({
        kind: 'regex',
      }),
    ]);
  });

  it('supports custom error', () => {
    const cat = signal({name: 'pelmeni-the-cat'});
    const f = form(
      cat,
      (p) => {
        regex(p.name, /pir.*jok/, {errors: () => ({kind: 'custom'})}); // Provide custom error
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f.name().errors()).toEqual([
      jasmine.objectContaining({
        kind: 'custom',
      }),
    ]);
  });

  describe('metadata', () => {
    it('sets the metadata', () => {
      const cat = signal({name: 'pelmeni-the-cat'});
      const regExp = /pir.*jok/;
      const f = form(
        cat,
        (p) => {
          regex(p.name, regExp);
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f.name().metadata(REGEX)()).toEqual([regExp]); // Expect RegExp object
    });

    it('merges the metadata in an array', () => {
      const cat = signal({name: 'pelmeni-the-cat'});
      const regExp1 = /pir.*jok/;
      const regExp2 = /pelmeni/;
      const f = form(
        cat,
        (p) => {
          regex(p.name, regExp1);
          regex(p.name, regExp2);
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f.name().metadata(REGEX)()).toEqual([regExp1, regExp2]); // Expect array of RegExp objects
    });
  });

  describe('dynamic values', () => {
    it('updates validation result as the regex changes', () => {
      const regexSignal = signal<RegExp | undefined>(/pir.*jok/); // Signal of RegExp
      const cat = signal({name: 'pelmeni-the-cat'});
      const f = form(
        cat,
        (p) => {
          regex(p.name, regexSignal);
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f.name().errors()).toEqual([
        jasmine.objectContaining({
          kind: 'regex',
        }),
      ]);

      regexSignal.set(/p.*/);
      expect(f.name().errors()).toEqual([]);
      regexSignal.set(/meow/);
      expect(f.name().errors()).toEqual([
        jasmine.objectContaining({
          kind: 'regex',
        }),
      ]);

      regexSignal.set(undefined);
      expect(f.name().errors()).toEqual([]);
    });
  });
});
