/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ɵɵngDeclarePipe} from '../../../src/core';
import {PipeDef} from '../../../src/render3';

describe('Pipe declaration jit compilation', () => {
  it('should compile a named Pipe declaration', () => {
    const def = ɵɵngDeclarePipe({
      type: TestClass,
      name: 'foo',
      version: '18.0.0',
    }) as PipeDef<TestClass>;

    expect(def.type).toBe(TestClass);
    expect(def.name).toEqual('foo');
    expect(def.pure).toEqual(true);
    expect(def.standalone).toEqual(false);
  });

  it('should compile an impure Pipe declaration', () => {
    const def = ɵɵngDeclarePipe({
      type: TestClass,
      name: 'foo',
      pure: false,
      version: '18.0.0',
    }) as PipeDef<TestClass>;

    expect(def.type).toBe(TestClass);
    expect(def.name).toEqual('foo');
    expect(def.pure).toEqual(false);
  });

  it('should compile 0.0.0 pipe as standalone', () => {
    const def = ɵɵngDeclarePipe({
      type: TestClass,
      name: 'foo',
      version: '0.0.0-PLACEHOLDER',
    }) as PipeDef<TestClass>;

    expect(def.type).toBe(TestClass);
    expect(def.name).toEqual('foo');
    expect(def.standalone).toEqual(true);
  });

  it('should compile v19+ pipe as standalone', () => {
    const def = ɵɵngDeclarePipe({
      type: TestClass,
      name: 'foo',
      version: '19.0.0',
    }) as PipeDef<TestClass>;

    expect(def.type).toBe(TestClass);
    expect(def.name).toEqual('foo');
    expect(def.standalone).toEqual(true);
  });
});

class TestClass {}
