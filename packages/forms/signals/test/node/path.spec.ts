/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injector, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {
  apply,
  applyEach,
  applyWhen,
  customError,
  form,
  requiredError,
  validate,
} from '../../public_api';

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
                  value().length > 0 ? undefined : requiredError(),
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
                return customError();
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
                return customError();
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
                return customError();
              });
            }).toThrowError();
          });
        },
        {injector: TestBed.inject(Injector)},
      );
    });
  });
});
