/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {getSupportedApis} from './supported-apis';

describe('supported-apis', () => {
  describe('getSupportedApis', () => {
    it('should return supported APIs', () => {
      const supported = getSupportedApis();

      expect(supported).toBeTruthy();
    });
  });
});
