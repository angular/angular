/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ApplicationRef, Injector, resource, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {form, submit, validateAsync} from '@angular/forms/signals';
import {timeout} from '@angular/private/testing';

// Specs named `control:` check the harness and pass today. The others fail until a debounced async
// validator reports `pending` as soon as the value changes.
describe('validateAsync debounce window', () => {
  /** Builds a form whose async validator has settled on an error for 'INVALID'. */
  async function settledOnInvalid(withDebounce: boolean) {
    const f = form(
      signal('INVALID'),
      (p) => {
        validateAsync(p, {
          params: ({value}) => value(),
          debounce: withDebounce ? 50 : undefined,
          factory: (params) => resource({params, loader: async ({params}) => params}),
          onSuccess: (result) => (result === 'INVALID' ? {kind: 'invalid'} : undefined),
          onError: () => undefined,
        });
      },
      {injector: TestBed.inject(Injector)},
    );
    await TestBed.inject(ApplicationRef).whenStable();
    return f;
  }

  for (const withDebounce of [true, false]) {
    const label = withDebounce ? 'with debounce' : 'control: without debounce';

    it(`${label}: a value change is pending at once and submit() isn't blocked`, async () => {
      const f = await settledOnInvalid(withDebounce);
      expect(f().invalid()).withContext('precondition: settled on INVALID').toBeTrue();

      f().value.set('VALID');
      const state = {pending: f().pending(), invalid: f().invalid()};
      let actionRan = false;
      const submitted = submit(f, async () => {
        actionRan = true;
      });

      expect(state)
        .withContext('state read synchronously after value.set()')
        .toEqual({pending: true, invalid: false});
      expect(actionRan).withContext('submit() ran the action for the new VALID value').toBeTrue();

      await submitted;
      await timeout(60);
      await TestBed.inject(ApplicationRef).whenStable();
    });
  }
});
