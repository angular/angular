/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {describe, expect, it} from '@angular/core/testing/src/testing_internal';

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
