/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {MissingTranslationStrategy} from '@angular/core';
import {CompilerConfig, preserveWhitespacesDefault} from '../src/config';

{
  describe('compiler config', () => {
    it('should set missing translation strategy', () => {
      const config = new CompilerConfig({missingTranslation: MissingTranslationStrategy.Error});
      expect(config.missingTranslation).toEqual(MissingTranslationStrategy.Error);
    });
  });

  describe('preserveWhitespacesDefault', () => {
    it('should return the default `false` setting when no preserveWhitespacesOption are provided',
       () => {
         expect(preserveWhitespacesDefault(null)).toEqual(false);
       });
    it('should return the preserveWhitespacesOption when provided as a parameter', () => {
      expect(preserveWhitespacesDefault(true)).toEqual(true);
      expect(preserveWhitespacesDefault(false)).toEqual(false);
    });
  });
}
