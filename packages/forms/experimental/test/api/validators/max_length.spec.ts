/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector, signal} from '@angular/core';
import {form} from '../../../src/api/structure';
import {maxLength} from '../../../src/api/validators';
import {MAX_LENGTH} from '../../../src/api/metadata';
import {TestBed} from '@angular/core/testing';

describe('maxLength validator', () => {
  it('returns maxLength error when the length is larger for strings', () => {
    const data = signal({text: 'abcde'});
    const f = form(
      data,
      (p) => {
        maxLength(p.text, 3);
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f.text.$state.errors()).toEqual([{kind: 'maxLength'}]);
  });

  it('returns maxLength error when the length is larger for arrays', () => {
    const data = signal({list: [1, 2, 3, 4, 5]});
    const f = form(
      data,
      (p) => {
        maxLength(p.list, 3);
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f.list.$state.errors()).toEqual([{kind: 'maxLength'}]);
  });


  it('is inclusive (no error if length equals maxLength)', () => {
    const data = signal({text: 'abcd'});
    const f = form(
      data,
      (p) => {
        maxLength(p.text, 4);
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f.text.$state.errors()).toEqual([]);
  });

  it('returns no errors when the length is smaller', () => {
    const data = signal({text: 'abc'});
    const f = form(
      data,
      (p) => {
        maxLength(p.text, 5);
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f.text.$state.errors()).toEqual([]);
  });

  it('returns custom errors when provided', () => {
    const data = signal({text: 'abcdef'});
    const f = form(
      data,
      (p) => {
        maxLength(p.text, 5, {
          errors: ({value}) => {
            return {
              kind: 'special-maxLength',
              message: `Length is ${value().length}`
            };
          },
        });
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f.text.$state.errors()).toEqual([
      {
        kind: 'special-maxLength',
        message: 'Length is 6',
      },
    ]);
  });

  describe('metadata', () => {
    it('stores the metadata on maxLength', () => {
      const data = signal({text: 'abcdef'});
      const f = form(
        data,
        (p) => {
          maxLength(p.text, 5, {
            errors: ({value}) => {
              return {
                kind: 'special-maxLength',
                message: `Length is ${value().length}`
              };
            },
          });
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f.text.$state.metadata(MAX_LENGTH)()).toBe(5);
    });

    it('merges two maxLengths preferring the smaller option', () => {
      const data = signal({text: 'abcdefghijklmno'});
      const f = form(
        data,
        (p) => {
          maxLength(p.text, 10);
          maxLength(p.text, 5);
        },
        {injector: TestBed.inject(Injector)},
      );

      f.text.$state.value.set('abcdefghijklmno');
      expect(f.text.$state.errors()).toEqual([{kind: 'maxLength'}, {kind: 'maxLength'}]);

      f.text.$state.value.set('abcdefg');
      expect(f.text.$state.errors()).toEqual([{kind: 'maxLength'}]);

      f.text.$state.value.set('abc');
      expect(f.text.$state.errors()).toEqual([]);

      expect(f.text.$state.metadata(MAX_LENGTH)()).toBe(5);
    });

    it('merges two maxLengths _dynamically_ preferring the smaller option', () => {
      const data = signal({text: 'abcdefghijklmno'});
      const maxLengthSignal = signal(10);
      const f = form(
        data,
        (p) => {
          maxLength(p.text, maxLengthSignal);
          maxLength(p.text, 5);
        },
        {injector: TestBed.inject(Injector)},
      );

      f.text.$state.value.set('abcdefghijklmno');
      expect(f.text.$state.errors()).toEqual([{kind: 'maxLength'}, {kind: 'maxLength'}]);

      f.text.$state.value.set('abcdefg');
      expect(f.text.$state.errors()).toEqual([{kind: 'maxLength'}]);

      f.text.$state.value.set('abc');
      expect(f.text.$state.errors()).toEqual([]);

      maxLengthSignal.set(2);

      expect(f.text.$state.errors()).toEqual([{kind: 'maxLength'}]);
      expect(f.text.$state.metadata(MAX_LENGTH)()).toBe(2);
    });
  });

  describe('dynamic values', () => {
    it('handles dynamic maxLength value', () => {
      const data = signal({text: 'abcdef'});
      const dynamicMaxLength = signal(5);
      const f = form(
        data,
        (p) => {
          maxLength(p.text, dynamicMaxLength);
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f.text.$state.errors()).toEqual([{kind: 'maxLength'}]);
      dynamicMaxLength.set(7);
      expect(f.text.$state.errors()).toEqual([]);
    });

    it('handles dynamic maxLength value based on other field', () => {
      const data = signal({text: 'longtextvalue', category: 'A'});
      const f = form(
        data,
        (p) => {
          maxLength(p.text, ({valueOf}) => {
            return valueOf(p.category) === 'A' ? 8 : 15;
          });
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f.text.$state.errors()).toEqual([{kind: 'maxLength'}]);

      f.category.$state.value.set('B');
      expect(f.text.$state.errors()).toEqual([]);
    });
  });
});
