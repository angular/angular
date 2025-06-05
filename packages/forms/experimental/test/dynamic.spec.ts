/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector, signal} from '@angular/core';
import {form} from '../public_api';
import {TestBed} from '@angular/core/testing';

const noop = () => {};

describe('dynamic data patterns', () => {
  it('returns `undefined` for declared fields with an undefined value', () => {
    const model = signal({data: undefined as string | undefined});
    const f = form(model, noop, {injector: TestBed.inject(Injector)});
    expect(f.data).toBe(undefined);

    // @ts-expect-error: 2722
    expect(() => f.data()).toThrow();
  });

  it('supports non-null assertions for declared fields with a potentially undefined value', () => {
    const model = signal({data: 'test' as string | undefined});
    const f = form(model, noop, {injector: TestBed.inject(Injector)});

    expect(f.data).not.toBeUndefined();
    expect(f.data!().value()).toBe('test');

    // Asserts that the type of `value()` is indeed `string` and excludes `undefined`.
    let value: string = f.data!().value();
  });
});
