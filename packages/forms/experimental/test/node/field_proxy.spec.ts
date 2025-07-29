/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injector, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {form} from '../../public_api';

describe('Field proxy', () => {
  it('should not forward methods through the proxy', () => {
    const f = form(signal(new Date()), {injector: TestBed.inject(Injector)});
    // @ts-expect-error
    expect(f.getDate).toBe(undefined as any);
  });

  it('should allow spreading field arrays', () => {
    const f = form(signal([0, 1, 2]), {injector: TestBed.inject(Injector)});
    expect([...f].map((i) => i().value())).toEqual([0, 1, 2]);
  });

  it('should not allow mutation of the field structure', () => {
    const f = form(signal({arr: [0, 1]}), {injector: TestBed.inject(Injector)});
    // Just to have an expectation, really this test is just to check the typings below.
    expect(f).toBeDefined();
    // @ts-expect-error
    f.arr = f.arr;
    // @ts-expect-error
    f.arr[0] = f.arr[0];
  });
});
