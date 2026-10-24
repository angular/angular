/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injector, resource, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {
  applyEach,
  debounce,
  form,
  min,
  required,
  type SchemaOrSchemaFn,
  validate,
  validateAsync,
} from '@angular/forms/signals';

// These specs fail until a field creates its injector only when a managed metadata key needs one.
describe('field injector allocation', () => {
  const N = 50;

  const strings = () => Array.from({length: N}, () => 'x');
  const numbers = () => Array.from({length: N}, () => 1);

  it(`creates injectors only for fields with managed metadata keys (${N} items per rule)`, () => {
    const injector = TestBed.inject(Injector);
    const create = spyOn(Injector, 'create').and.callThrough();

    /** Counts `Injector.create` calls while creating a form and reading all of its items. */
    function injectorsFor<T>(items: T[], schemaFn: SchemaOrSchemaFn<T[]>): number {
      create.calls.reset();
      const f = form(signal(items), schemaFn, {injector}) as any;
      for (let i = 0; i < items.length; i++) {
        f[i]();
      }
      return create.calls.count();
    }

    const counts = {
      noRule: injectorsFor(strings(), () => {}),
      validateOnly: injectorsFor(strings(), (p) => {
        applyEach(p, (item) => {
          validate(item, () => undefined);
        });
      }),
      required: injectorsFor(strings(), (p) => {
        applyEach(p, (item) => {
          required(item);
        });
      }),
      min: injectorsFor(numbers(), (p) => {
        applyEach(p, (item) => {
          min(item, 0);
        });
      }),
      debounce: injectorsFor(strings(), (p) => {
        applyEach(p, (item) => {
          debounce(item, 100);
        });
      }),
      validateAsync: injectorsFor(strings(), (p) => {
        applyEach(p, (item) => {
          validateAsync(item, {
            params: ({value}) => value(),
            factory: (params) => resource({params, loader: async () => undefined}),
            onSuccess: () => undefined,
            onError: () => undefined,
          });
        });
      }),
    };

    // Only a managed key, which `validateAsync()` uses, needs an injection context.
    expect(counts).toEqual({
      noRule: 0,
      validateOnly: 0,
      required: 0,
      min: 0,
      debounce: 0,
      validateAsync: N,
    });
  });

  it(`creates no injectors to destroy ${N} removed fields that never had one`, () => {
    const model = signal(strings());
    const f = form(model, {injector: TestBed.inject(Injector)});
    for (let i = 0; i < N; i++) {
      f[i]();
    }
    TestBed.tick();

    const create = spyOn(Injector, 'create').and.callThrough();
    model.set([]);
    TestBed.tick();
    expect(create.calls.count())
      .withContext('Injector.create calls while the cleanup sweep destroys the removed items')
      .toBe(0);
  });
});
