/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injector, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {form, url, urlError} from '../../../../public_api';

describe('url validator', () => {
  it('returns url error when the value is not a valid URL', () => {
    const cat = signal({website: 'invalid-url'});
    const f = form(
      cat,
      (p) => {
        url(p.website);
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f.website().errors()).toEqual([urlError({fieldTree: f.website})]);
    f.website().value.set('https://angular.dev');
    expect(f.website().errors()).toEqual([]);
  });

  describe('custom errors', () => {
    it('returns custom errors when provided', () => {
      const cat = signal({website: 'invalid-url', category: 'famous'});
      const f = form(
        cat,
        (p) => {
          url(p.website, {
            error: (ctx) => ({kind: `url-${ctx.valueOf(p.category)}`}),
          });
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f.website().errors()).toEqual([{kind: 'url-famous', fieldTree: f.website}]);
      f.website().value.set('https://angular.dev');
      expect(f.website().errors()).toEqual([]);
    });

    it('supports custom error messages', () => {
      const cat = signal({website: 'invalid-url'});
      const f = form(
        cat,
        (p) => {
          url(p.website, {
            message: 'url error!!',
          });
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f.website().errors()).toEqual([
        urlError({message: 'url error!!', fieldTree: f.website}),
      ]);
      f.website().value.set('https://angular.dev');
      expect(f.website().errors()).toEqual([]);
    });
  });

  describe('dynamic rules', () => {
    it('supports custom condition via when', () => {
      const cat = signal({website: 'invalid-url', active: false});
      const f = form(
        cat,
        (p) => {
          url(p.website, {
            when({valueOf}) {
              return valueOf(p.active);
            },
          });
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f.website().errors()).toEqual([]);
      f.active().value.set(true);
      expect(f.website().errors()).toEqual([urlError({fieldTree: f.website})]);
    });
  });
});
