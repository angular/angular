/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {PropertyBinding} from '../src/component_info';

{
  describe('PropertyBinding', () => {
    it('should process a simple binding', () => {
      const binding = new PropertyBinding('someBinding', 'someBinding');
      expect(binding.prop).toEqual('someBinding');
      expect(binding.attr).toEqual('someBinding');
      expect(binding.bracketAttr).toEqual('[someBinding]');
      expect(binding.bracketParenAttr).toEqual('[(someBinding)]');
      expect(binding.parenAttr).toEqual('(someBinding)');
      expect(binding.onAttr).toEqual('onSomeBinding');
      expect(binding.bindAttr).toEqual('bindSomeBinding');
      expect(binding.bindonAttr).toEqual('bindonSomeBinding');
    });

    it('should process a two-part binding', () => {
      const binding = new PropertyBinding('someProp', 'someAttr');
      expect(binding.prop).toEqual('someProp');
      expect(binding.attr).toEqual('someAttr');
      expect(binding.bracketAttr).toEqual('[someAttr]');
      expect(binding.bracketParenAttr).toEqual('[(someAttr)]');
      expect(binding.parenAttr).toEqual('(someAttr)');
      expect(binding.onAttr).toEqual('onSomeAttr');
      expect(binding.bindAttr).toEqual('bindSomeAttr');
      expect(binding.bindonAttr).toEqual('bindonSomeAttr');
    });
  });
}
