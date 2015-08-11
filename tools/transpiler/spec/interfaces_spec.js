import {ddescribe, describe, it, iit, expect} from 'angular2/test_lib';
import {IMPLEMENTS} from './fixtures/annotations';

class Interface1 {
  one(){}
}
class Interface2 {
  two(){}
}

@IMPLEMENTS(Interface1, Interface2)
class SomeClass {
  one(){}
  two(){}
}

export function main() {
  describe('interfaces', function() {
    it('should work', function () {
      var s = new SomeClass();
      expect(s).toImplement(Interface1);
      expect(s).toImplement(Interface2);
    });
  });

}
