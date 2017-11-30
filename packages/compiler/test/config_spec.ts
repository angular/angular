/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {MissingTranslationStrategy} from '@angular/core';
import {CompilerConfig} from '../src/config';

export function main() {
  describe('compiler config', () => {
    it('should set missing translation strategy', () => {
      const config = new CompilerConfig({missingTranslation: MissingTranslationStrategy.Error});
      expect(config.missingTranslation).toEqual(MissingTranslationStrategy.Error);
    });
  });
}
