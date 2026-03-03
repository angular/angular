/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injector, signal} from '@angular/core';
import {form} from '../../../../src/api/structure';

import {TestBed} from '@angular/core/testing';
import {validate} from '../../../../src/api/rules';
import {minError, ValidationError} from '../../../../public_api';
import {FieldValidator, PathKind} from '../../../../src/api/types';
import Root = PathKind.Root;

describe('validation errors', () => {
  it('supports returning a a plain object ', () => {
    const cat = signal('meow');

    const f = form(
      cat,
      (p) => {
        validate(p, () => {
          return {kind: 'i am a custom error'};
        });
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f().errors()[0]).toEqual({kind: 'i am a custom error', fieldTree: f});
  });

  it('supports returning a list of errors', () => {
    const cat = signal('meow');

    const f = form(
      cat,
      (p) => {
        validate(p, () => {
          return [
            {
              kind: 'pirojok-the-error',
            },
            {kind: 'meow'},
            minError(4),
          ];
        });
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f().errors()[0]).toEqual({kind: 'pirojok-the-error', fieldTree: f});
    expect(f().errors()[1]).toEqual({kind: 'meow', fieldTree: f});
    expect(f().errors()[2]).toEqual(jasmine.objectContaining({kind: 'min'}));
  });

  it('supports creating dynamic list of errors with explicit type', () => {
    const cat = signal('meow');

    const f = form(
      cat,
      (p) => {
        validate(p, () => {
          const array: ValidationError[] = [];

          array.push({
            kind: 'custom',
          });

          array.push(minError(5));

          return array;
        });
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f().errors()[0]).toEqual({kind: 'custom', fieldTree: f});
    expect(f().errors()[1]).toEqual(jasmine.objectContaining({kind: 'min'}));
  });

  it('supports custom errors', () => {
    class PirojokError implements ValidationError {
      readonly kind = 'pirojok-the-error';

      constructor(readonly flavor: string) {}
    }

    function createPirojokError(flavor: string) {
      return new PirojokError(flavor);
    }

    const cat = signal({password: 'pirojok-the-password'});

    const f = form(
      cat,
      (p) => {
        validate(p.password, () => {
          return createPirojokError('cherry');
        });
      },
      {injector: TestBed.inject(Injector)},
    );

    const error = f.password().errors()[0]!;
    expect(error).toBeInstanceOf(PirojokError);
    if (error instanceof PirojokError) {
      expect(error.flavor).toBe('cherry');
    } else {
      fail('this should not happen');
    }
  });

  describe('type tests', () => {
    it('field on a validation result is not allowed', () => {
      //  fieldTree on a validation result is not allowed
      const TBD: FieldValidator<string, Root> = () => ({
        kind: '3',
        dsdsd: 4,
        // @ts-expect-error
        fieldTree: 3,
      });
    });

    it('does not allow returning an error containing a field from a validator', () => {
      const cat = signal('meow');

      const f = form(
        cat,
        (p) => {
          // @ts-expect-error
          validate(p, () => {
            return {kind: 'i am a custom error', fieldTree: {}};
          });
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f().errors()).toEqual([{kind: 'i am a custom error', fieldTree: {}}]);
    });

    it('allows returning ValidationError from a validator', () => {
      const cat = signal('meow');

      const f = form(
        cat,
        (p) => {
          validate(p, () => {
            return {kind: 'custom'};
          });
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f().errors()[0]).toEqual({kind: 'custom', fieldTree: f});
    });

    it('disallows pushing an error containing a field to a list of ValidationErrors', () => {
      const cat = signal('meow');

      form(
        cat,
        (p) => {
          validate(p, () => {
            const array: ValidationError[] = [];

            array.push({
              kind: 'custom',
              // @ts-expect-error
              fieldTree: {},
            });

            return array;
          });
        },
        {injector: TestBed.inject(Injector)},
      );
    });
  });
});
