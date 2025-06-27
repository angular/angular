/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {sanitizeObject} from './serialization-utils';

describe('sanitizeObject', () => {
  it('should not change valid object', () => {
    const foo = {
      bar: 'bar',
      baz: 42,
      qux: true,
      quux: null,
      corge: undefined,
      grault: [1, 2, 3],
      garply: {a: 'a', b: 'b'},
    };

    expect(sanitizeObject(foo)).toEqual({
      bar: 'bar',
      baz: 42,
      qux: true,
      quux: null,
      corge: undefined,
      grault: [1, 2, 3],
      garply: {a: 'a', b: 'b'},
    });
  });

  it('should remove function', () => {
    const foo = {
      bar: 'bar',
      baz: () => 'baz',
    };

    expect(sanitizeObject(foo)).toEqual({
      bar: 'bar',
      baz: '[Non-serializable data]',
    });
  });

  it('should strip cyclic references', () => {
    const bar: any = {foo: null};
    const foo = {
      bar: bar,
    };
    bar.foo = foo;

    expect(sanitizeObject(foo)).toEqual({
      bar: '[Non-serializable data]',
    });
  });
});
