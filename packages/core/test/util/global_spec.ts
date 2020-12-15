/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {global} from '../../src/util/global';

{
  describe('global', () => {
    it('should be global this value', () => {
      const _global = new Function('return this')();
      expect(global).toBe(_global);
    });

    if (typeof globalThis !== 'undefined') {
      it('should use globalThis as global reference', () => {
        expect(global).toBe(globalThis);
      });
    }
  });
}
