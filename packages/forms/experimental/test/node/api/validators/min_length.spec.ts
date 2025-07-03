/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {MIN_LENGTH, form, minLength} from '../../../../public_api';

describe('minLength validator', () => {
  it('returns minLength error when the length is smaller for strings', () => {
    const data = signal({text: 'abc'});
    const f = form(
      data,
      (p) => {
        minLength(p.text, 5);
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f.text().errors()).toEqual([{kind: 'ng:minlength', minlength: 5}]);
  });

  it('returns minLength error when the length is smaller for arrays', () => {
    const data = signal({list: [1, 2, 3]});
    const f = form(
      data,
      (p) => {
        minLength(p.list, 5);
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f.list().errors()).toEqual([{kind: 'ng:minlength', minlength: 5}]);
  });

  it('is inclusive (no error if length equals minLength)', () => {
    const data = signal({text: 'abcd'});
    const f = form(
      data,
      (p) => {
        minLength(p.text, 4);
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f.text().errors()).toEqual([]);
  });

  it('returns no errors when the length is larger', () => {
    const data = signal({text: 'abcdefghij'});
    const f = form(
      data,
      (p) => {
        minLength(p.text, 5);
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f.text().errors()).toEqual([]);
  });

  it('returns custom errors when provided', () => {
    const data = signal({text: 'ab'});
    const f = form(
      data,
      (p) => {
        minLength(p.text, 5, {
          errors: ({value}) => {
            return {
              kind: 'custom:special-minLength',
              message: `Length is ${value().length}`,
            };
          },
        });
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f.text().errors()).toEqual([
      {
        kind: 'custom:special-minLength',
        message: 'Length is 2',
      },
    ]);
  });

  describe('metadata', () => {
    it('stores the metadata on minLength', () => {
      const data = signal({text: 'ab'});
      const f = form(
        data,
        (p) => {
          minLength(p.text, 5, {
            errors: ({value}) => {
              return {
                kind: 'custom:special-minLength',
                message: `Length is ${value().length}`,
              };
            },
          });
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f.text().metadata(MIN_LENGTH)()).toBe(5);
    });

    it('merges two minLengths preferring the larger option', () => {
      const data = signal({text: 'ab'});
      const f = form(
        data,
        (p) => {
          minLength(p.text, 5);
          minLength(p.text, 10);
        },
        {injector: TestBed.inject(Injector)},
      );

      f.text().value.set('ab');
      expect(f.text().errors()).toEqual([
        {kind: 'ng:minlength', minlength: 5},
        {kind: 'ng:minlength', minlength: 10},
      ]);

      f.text().value.set('abcdefg');
      expect(f.text().errors()).toEqual([{kind: 'ng:minlength', minlength: 10}]);

      f.text().value.set('abcdefghijklmno');
      expect(f.text().errors()).toEqual([]);

      expect(f.text().metadata(MIN_LENGTH)()).toBe(10);
    });

    it('merges two minLengths _dynamically_ preferring the larger option', () => {
      const data = signal({text: 'ab'});
      const minLengthSignal = signal(5);
      const f = form(
        data,
        (p) => {
          minLength(p.text, minLengthSignal);
          minLength(p.text, 10);
        },
        {injector: TestBed.inject(Injector)},
      );

      f.text().value.set('ab');
      expect(f.text().errors()).toEqual([
        {kind: 'ng:minlength', minlength: 5},
        {kind: 'ng:minlength', minlength: 10},
      ]);

      f.text().value.set('abcdefg');
      expect(f.text().errors()).toEqual([{kind: 'ng:minlength', minlength: 10}]);

      f.text().value.set('abcdefghijklmno');
      expect(f.text().errors()).toEqual([]);

      minLengthSignal.set(20);

      expect(f.text().errors()).toEqual([{kind: 'ng:minlength', minlength: 20}]);
      expect(f.text().metadata(MIN_LENGTH)()).toBe(20);
    });
  });

  describe('dynamic values', () => {
    it('handles dynamic minLength value', () => {
      const data = signal({text: 'abcd'});
      const dynamicMinLength = signal(5);
      const f = form(
        data,
        (p) => {
          minLength(p.text, dynamicMinLength);
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f.text().errors()).toEqual([{kind: 'ng:minlength', minlength: 5}]);
      dynamicMinLength.set(3);
      expect(f.text().errors()).toEqual([]);
    });

    it('disables validation on undefined value', () => {
      const data = signal({text: 'abcd'});
      const dynamicMinLength = signal<number | undefined>(5);
      const f = form(
        data,
        (p) => {
          minLength(p.text, dynamicMinLength);
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f.text().errors()).toEqual([{kind: 'ng:minlength', minlength: 5}]);
      dynamicMinLength.set(undefined);
      expect(f.text().errors()).toEqual([]);
    });

    it('handles dynamic minLength value based on other field', () => {
      const data = signal({text: 'short', category: 'A'});
      const f = form(
        data,
        (p) => {
          minLength(p.text, ({valueOf}) => {
            return valueOf(p.category) === 'A' ? 8 : 3;
          });
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f.text().errors()).toEqual([{kind: 'ng:minlength', minlength: 8}]);

      f.category().value.set('B');
      expect(f.text().errors()).toEqual([]);
    });
  });
});
