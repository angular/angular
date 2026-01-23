/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// This isn't used for anything, but for some reason Bazel won't
// serve the file if there isn't at least one import.
import '../../testing';

describe('Shim', () => {
  it('should provide correct function.name ', () => {
    const functionWithoutName = identity(() => function () {});
    function foo() {}

    expect(functionWithoutName.name).toBeFalsy();
    expect(foo.name).toEqual('foo');
  });
});

function identity<T>(a: T): T {
  return a;
}
