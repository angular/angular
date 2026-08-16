/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injector, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {compare, compareError, form} from '../../../../public_api';

describe('compare validator', () => {
  it('returns compare error when values do not match', () => {
    const cat = signal({tagId: '12345', confirmTagId: 'abcde'});
    const f = form(
      cat,
      (p) => {
        compare(p.confirmTagId, p.tagId);
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f.confirmTagId().errors()).toEqual([compareError({fieldTree: f.confirmTagId})]);
    f.confirmTagId().value.set('12345');
    expect(f.confirmTagId().errors()).toEqual([]);
  });

  describe('custom errors', () => {
    it('returns custom errors when provided', () => {
      const cat = signal({tagId: '12345', confirmTagId: 'abcde', stage: 2});
      const f = form(
        cat,
        (p) => {
          compare(p.confirmTagId, p.tagId, {
            error: (ctx) => ({kind: `compare-${ctx.valueOf(p.stage)}`}),
          });
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f.confirmTagId().errors()).toEqual([{kind: 'compare-2', fieldTree: f.confirmTagId}]);
      f.confirmTagId().value.set('12345');
      expect(f.confirmTagId().errors()).toEqual([]);
    });

    it('supports custom error messages', () => {
      const cat = signal({tagId: '12345', confirmTagId: 'abcde'});
      const f = form(
        cat,
        (p) => {
          compare(p.confirmTagId, p.tagId, {
            message: 'compare error!!',
          });
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f.confirmTagId().errors()).toEqual([
        compareError({message: 'compare error!!', fieldTree: f.confirmTagId}),
      ]);
      f.confirmTagId().value.set('12345');
      expect(f.confirmTagId().errors()).toEqual([]);
    });
  });

  describe('dynamic rules', () => {
    it('supports custom condition via when', () => {
      const cat = signal({tagId: '12345', confirmTagId: 'abcde', check: false});
      const f = form(
        cat,
        (p) => {
          compare(p.confirmTagId, p.tagId, {
            when({valueOf}) {
              return valueOf(p.check);
            },
          });
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f.confirmTagId().errors()).toEqual([]);
      f.check().value.set(true);
      expect(f.confirmTagId().errors()).toEqual([compareError({fieldTree: f.confirmTagId})]);
    });
  });
});
