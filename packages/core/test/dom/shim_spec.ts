/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// This isn't used for anything, but for some reason Bazel won't
// serve the file if there isn't at least one import.
import '@angular/core/testing';

{
  describe('Shim', () => {
    it('should provide correct function.name ', () => {
      const functionWithoutName = identity(() => function(_: any /** TODO #9100 */) {});
      function foo(_: any /** TODO #9100 */) {}

      expect((<any>functionWithoutName).name).toBeFalsy();
      expect((<any>foo).name).toEqual('foo');
    });
  });
}

function identity(a: any /** TODO #9100 */) {
  return a;
}
