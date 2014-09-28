import {describe, it, expect} from 'test_lib/test_lib';

import {Foo, Bar} from './foo';
// TODO: Does not work, as dart does not support renaming imports
// import {Foo as F} from './fixtures/foo';
import * as fooModule from './foo';

import * as exportModule from './export';

import {Type} from 'facade/lang';

export function main() {
  describe('imports', function() {
    it('should work', function() {
      expect(Foo).toBe('FOO');
      expect(Bar).toBe('BAR');
      // TODO: Does not work
      // assert(F == 'FOO');
      expect(fooModule.Foo).toBe('FOO');
      expect(fooModule.Bar).toBe('BAR');

      expect(exportModule.Foo).toBe('FOO');
      expect(exportModule.Bar).toBe('BAR');

      expect(Type).toBeTruthy();
    });
  });
}
