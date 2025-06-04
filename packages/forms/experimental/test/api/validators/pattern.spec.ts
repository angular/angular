/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {PATTERN} from '@angular/forms/experimental';
import {pattern} from '@angular/forms/experimental/src/api/validators/pattern';
import {form} from '../../../src/api/structure';

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

    expect(f.name().errors()).toEqual([
      jasmine.objectContaining({
        kind: 'pattern',
      }),
    ]);
  });

  it('supports custom error', () => {
    const cat = signal({name: 'pelmeni-the-cat'});
    const f = form(
      cat,
      (p) => {
        pattern(p.name, 'pir.*jok');
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f.name().errors()).toEqual([
      jasmine.objectContaining({
        kind: 'pattern',
      }),
    ]);
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
});
