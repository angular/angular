/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injector, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {apply, applyEach, applyWhen, FieldPath, form, schema, validate} from '../../public_api';
import {ValidationError} from '../../src/api/validation_errors';

describe('path', () => {
  describe('Active path', () => {
    it('Disallows using parent paths for applyWhen', () => {
      const data = signal({first: '', needLastName: false, last: ''});

      form(
        data,
        (path) => {
          applyWhen(
            path,
            ({value}) => value().needLastName,
            (/* UNUSED */) => {
              expect(() => {
                validate(path.last, ({value}) =>
                  value().length > 0 ? undefined : ValidationError.required(),
                );
              }).toThrowError();
            },
          );
        },
        {injector: TestBed.inject(Injector)},
      );
    });

    it('Disallows using parent paths for apply', () => {
      const data = signal({first: '', needLastName: false, last: ''});

      form(
        data,
        (path) => {
          apply(path, () => {
            expect(() => {
              validate(path.last, () => {
                return ValidationError.custom();
              });
            }).toThrowError();
          });
        },
        {injector: TestBed.inject(Injector)},
      );
    });

    it('Disallows using the same path', () => {
      const data = signal({first: '', needLastName: false, last: ''});

      form(
        data,
        (path) => {
          apply(path, () => {
            expect(() => {
              validate(path, () => {
                return ValidationError.custom();
              });
            }).toThrowError();
          });
        },
        {injector: TestBed.inject(Injector)},
      );
    });

    it('Disallows using parent paths for apply', () => {
      const data = signal({
        needLastName: false,
        items: [{first: '', last: ''}],
      });

      form(
        data,
        (path) => {
          applyEach(path.items, () => {
            expect(() => {
              validate(path.needLastName, () => {
                return ValidationError.custom();
              });
            }).toThrowError();
          });
        },
        {injector: TestBed.inject(Injector)},
      );
    });
  });

  it('should forward optional typing on value, not path', () => {
    interface Model {
      field?: string;
    }

    schema<Model>((p) => {
      // The `?` is forwarded to the path's value, and not the path itself.
      p.field satisfies FieldPath<string | undefined>;
    });
  });
});
