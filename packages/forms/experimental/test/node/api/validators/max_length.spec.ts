/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injector, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {NgValidationError} from '@angular/forms/experimental/src/api/validation_errors';
import {MAX_LENGTH, form, maxLength} from '../../../../public_api';

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

    expect(f.text().errors() as NgValidationError[]).toEqual([{kind: 'maxlength', maxlength: 3}]);
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

    expect(f.list().errors() as NgValidationError[]).toEqual([{kind: 'maxlength', maxlength: 3}]);
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

    expect(f.text().errors()).toEqual([]);
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

    expect(f.text().errors()).toEqual([]);
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
              message: `Length is ${value().length}`,
            };
          },
        });
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f.text().errors()).toEqual([
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
                message: `Length is ${value().length}`,
              };
            },
          });
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f.text().metadata(MAX_LENGTH)()).toBe(5);
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

      f.text().value.set('abcdefghijklmno');
      expect(f.text().errors() as NgValidationError[]).toEqual([
        {kind: 'maxlength', maxlength: 10},
        {kind: 'maxlength', maxlength: 5},
      ]);

      f.text().value.set('abcdefg');
      expect(f.text().errors() as NgValidationError[]).toEqual([{kind: 'maxlength', maxlength: 5}]);

      f.text().value.set('abc');
      expect(f.text().errors()).toEqual([]);

      expect(f.text().metadata(MAX_LENGTH)()).toBe(5);
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

      f.text().value.set('abcdefghijklmno');
      expect(f.text().errors() as NgValidationError[]).toEqual([
        {kind: 'maxlength', maxlength: 10},
        {kind: 'maxlength', maxlength: 5},
      ]);

      f.text().value.set('abcdefg');
      expect(f.text().errors() as NgValidationError[]).toEqual([{kind: 'maxlength', maxlength: 5}]);

      f.text().value.set('abc');
      expect(f.text().errors()).toEqual([]);

      maxLengthSignal.set(2);

      expect(f.text().errors() as NgValidationError[]).toEqual([{kind: 'maxlength', maxlength: 2}]);
      expect(f.text().metadata(MAX_LENGTH)()).toBe(2);
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

      expect(f.text().errors() as NgValidationError[]).toEqual([{kind: 'maxlength', maxlength: 5}]);
      dynamicMaxLength.set(7);
      expect(f.text().errors()).toEqual([]);
    });
    it('disables validation on undefined value', () => {
      const data = signal({text: 'abcdef'});
      const dynamicMaxLength = signal<number | undefined>(5);
      const f = form(
        data,
        (p) => {
          maxLength(p.text, dynamicMaxLength);
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f.text().errors() as NgValidationError[]).toEqual([{kind: 'maxlength', maxlength: 5}]);
      dynamicMaxLength.set(undefined);
      expect(f.text().errors()).toEqual([]);
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

      expect(f.text().errors() as NgValidationError[]).toEqual([{kind: 'maxlength', maxlength: 8}]);

      f.category().value.set('B');
      expect(f.text().errors()).toEqual([]);
    });
  });
});
