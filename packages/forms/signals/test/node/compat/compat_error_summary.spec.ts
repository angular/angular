/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injector, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {FormControl, Validators} from '@angular/forms';
import {compatForm} from '../../../compat/public_api';
import {form, required} from '../../../public_api';

// Repro specs for `FormControl` errors in `errorSummary()`. Each spec asserts the expected behavior,
// so it fails while the bug exists. Specs whose names start with `control:` check the test setup and
// pass today.
describe('compatForm() errorSummary', () => {
  function createCompatForm() {
    return compatForm(
      signal({name: new FormControl('', {nonNullable: true, validators: Validators.required})}),
      {injector: TestBed.inject(Injector)},
    );
  }

  it('includes FormControl errors in the root errorSummary()', () => {
    const f = createCompatForm();

    expect(
      f
        .name()
        .errors()
        .map((e) => e.kind),
    )
      .withContext('control: compat field errors()')
      .toEqual(['required']);
    expect(f().invalid()).withContext('control: root invalid()').toBeTrue();
    expect(
      f()
        .errorSummary()
        .map((e) => e.kind),
    )
      .withContext('root errorSummary()')
      .toEqual(['required']);
  });

  it('sets fieldTree on FormControl errors', () => {
    const f = createCompatForm();
    const [error] = f.name().errors();

    expect(error?.fieldTree as unknown)
      .withContext('fieldTree of the compat field error')
      .toBe(f.name);
  });

  it('control: sets fieldTree on a plain field error', () => {
    const f = form(signal({name: ''}), (p) => required(p.name), {
      injector: TestBed.inject(Injector),
    });
    const [error] = f.name().errors();

    expect(error?.fieldTree as unknown)
      .withContext('fieldTree of the plain field error')
      .toBe(f.name);
  });
});
