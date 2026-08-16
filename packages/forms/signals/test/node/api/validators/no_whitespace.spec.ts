/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injector, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {form, noWhitespace, noWhitespaceError} from '../../../../public_api';

describe('noWhitespace validator', () => {
  it('returns whitespace error when value contains invalid whitespace', () => {
    const cat = signal({name: '  '});
    const f = form(
      cat,
      (p) => {
        noWhitespace(p.name);
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f.name().errors()).toEqual([
      noWhitespaceError({
        fieldTree: f.name,
        isBlank: true,
        isUntrimmed: true,
      }),
    ]);
    f.name().value.set('pirojok-the-cat');
    expect(f.name().errors()).toEqual([]);
  });

  describe('whitespace breakdown flags (isBlank & isUntrimmed)', () => {
    it('sets both isBlank and isUntrimmed to true for pure whitespace strings', () => {
      const user = signal({bio: '   '});
      const f = form(
        user,
        (p) => {
          noWhitespace(p.bio);
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f.bio().errors()).toEqual([
        noWhitespaceError({
          fieldTree: f.bio,
          isBlank: true,
          isUntrimmed: true,
        }),
      ]);
    });

    it('sets isUntrimmed to true and isBlank to false for padded strings with text', () => {
      const user = signal({bio: '  hello world  '});
      const f = form(
        user,
        (p) => {
          noWhitespace(p.bio);
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f.bio().errors()).toEqual([
        noWhitespaceError({
          fieldTree: f.bio,
          isBlank: false,
          isUntrimmed: true,
        }),
      ]);
    });

    it('returns no error for valid trimmed strings', () => {
      const user = signal({bio: 'hello world'});
      const f = form(
        user,
        (p) => {
          noWhitespace(p.bio);
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f.bio().errors()).toEqual([]);
    });
  });

  describe('custom errors', () => {
    it('returns custom errors when provided', () => {
      const cat = signal({name: '  ', breed: 'persian'});
      const f = form(
        cat,
        (p) => {
          noWhitespace(p.name, {
            error: (ctx) => ({kind: `whitespace-${ctx.valueOf(p.breed)}`}),
          });
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f.name().errors()).toEqual([{kind: 'whitespace-persian', fieldTree: f.name}]);
      f.name().value.set('pirojok-the-cat');
      expect(f.name().errors()).toEqual([]);
    });

    it('supports custom error messages', () => {
      const cat = signal({name: '  '});
      const f = form(
        cat,
        (p) => {
          noWhitespace(p.name, {
            message: 'whitespace error!!',
          });
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f.name().errors()).toEqual([
        noWhitespaceError({
          message: 'whitespace error!!',
          fieldTree: f.name,
          isBlank: true,
          isUntrimmed: true,
        }),
      ]);
      f.name().value.set('pirojok-the-cat');
      expect(f.name().errors()).toEqual([]);
    });
  });

  describe('dynamic rules', () => {
    it('supports custom condition via when', () => {
      const cat = signal({name: '  ', strict: false});
      const f = form(
        cat,
        (p) => {
          noWhitespace(p.name, {
            when({valueOf}) {
              return valueOf(p.strict);
            },
          });
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f.name().errors()).toEqual([]);
      f.strict().value.set(true);
      expect(f.name().errors()).toEqual([
        noWhitespaceError({
          fieldTree: f.name,
          isBlank: true,
          isUntrimmed: true,
        }),
      ]);
    });
  });
});
