/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {LinkerOptions} from '../../..';
import {PartialComponentLinkerVersion1} from '../../../src/file_linker/partial_linkers/partial_component_linker_1';
import {PartialDirectiveLinkerVersion1} from '../../../src/file_linker/partial_linkers/partial_directive_linker_1';
import {PartialLinkerSelector} from '../../../src/file_linker/partial_linkers/partial_linker_selector';

describe('PartialLinkerSelector', () => {
  const options: LinkerOptions = {
    i18nNormalizeLineEndingsInICUs: true,
    enableI18nLegacyMessageIdFormat: false,
    i18nUseExternalIds: false,
  };

  describe('supportsDeclaration()', () => {
    it('should return true if there is at least one linker that matches the given function name',
       () => {
         const selector = new PartialLinkerSelector(options);
         expect(selector.supportsDeclaration('ɵɵngDeclareDirective')).toBe(true);
         expect(selector.supportsDeclaration('ɵɵngDeclareComponent')).toBe(true);
         expect(selector.supportsDeclaration('$foo')).toBe(false);
       });
  });

  describe('getLinker()', () => {
    it('should return the linker that matches the name and version number', () => {
      const selector = new PartialLinkerSelector(options);
      expect(selector.getLinker('ɵɵngDeclareDirective', 1))
          .toBeInstanceOf(PartialDirectiveLinkerVersion1);
      expect(selector.getLinker('ɵɵngDeclareComponent', 1))
          .toBeInstanceOf(PartialComponentLinkerVersion1);
    });

    it('should throw an error if there is no linker that matches the given name or version', () => {
      const selector = new PartialLinkerSelector(options);
      expect(() => selector.getLinker('$foo', 1))
          .toThrowError('Unknown partial declaration function $foo.');
      expect(() => selector.getLinker('ɵɵngDeclareDirective', 2))
          .toThrowError('Unsupported partial declaration version 2 for ɵɵngDeclareDirective.');
    });
  });
});
