/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ɵɵngDeclarePipe} from '@angular/core';
import {PipeDef} from '../../../src/render3';

describe('Pipe declaration jit compilation', () => {
  it('should compile a named Pipe declaration', () => {
    const def = ɵɵngDeclarePipe({type: TestClass, name: 'foo'}) as PipeDef<TestClass>;

    expect(def.type).toBe(TestClass);
    expect(def.name).toEqual('foo');
    expect(def.pure).toEqual(true);
  });

  it('should compile an impure Pipe declaration', () => {
    const def = ɵɵngDeclarePipe({type: TestClass, name: 'foo', pure: false}) as PipeDef<TestClass>;

    expect(def.type).toBe(TestClass);
    expect(def.name).toEqual('foo');
    expect(def.pure).toEqual(false);
  });
});

class TestClass {}
