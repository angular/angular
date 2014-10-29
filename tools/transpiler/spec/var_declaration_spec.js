import {ddescribe, describe, it, expect} from 'test_lib/test_lib';

export function main() {
  describe('const declaration', function() {
    it('should not break in dart', function() {
      // const in dart denotes a compile-time constant, which the rvalue is not. 
      // if transpilation changed const -> final for variable declarations, this
      // should work as expected.
      var id = (x) => x;

      const a = id('');
      const b:string= id('');
      // We cannot check the semantics of const forbidding reassignment, because
      // this is a compile-time error in traceur.

      var c = id('');
      var d:string = id('');

      let e = id('');
      let f:string = id('');
    });
  });
}
