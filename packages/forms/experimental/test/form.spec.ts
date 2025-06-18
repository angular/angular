/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {inject, InjectionToken, Injector, runInInjectionContext, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {form, validate} from '../public_api';

describe('form', () => {
  describe('injection context', () => {
    it('throws when there is no injection context', () => {
      const model = signal(123);
      expect(() => form(model)).toThrowError();
    });

    it('is not present in rules', () => {
      const injector = TestBed.inject(Injector);

      const model = signal(123);
      const f = form(
        model,
        (p) => {
          validate(p, () => {
            expect(() => {
              inject(Injector);
            }).toThrow();
            return undefined;
          });
        },
        {injector},
      );

      // Make sure the validation runs
      f().valid();
    });

    it('uses provided provided injection context to run the form', () => {
      const injector = TestBed.inject(Injector);

      const model = signal(123);
      form(
        model,
        () => {
          expect(inject(Injector)).toBe(injector);
        },
        {injector},
      );
    });

    it('uses provided provided injection context over the one it is run in', () => {
      const injector = TestBed.inject(Injector);
      const injector2 = Injector.create({providers: [], parent: injector});

      const model = signal(123);

      runInInjectionContext(injector2, () => {
        form(
          model,
          () => {
            expect(inject(Injector)).toBe(injector);
          },
          {injector: injector},
        );
      });
    });
  });
});
