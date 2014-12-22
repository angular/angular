import {ddescribe, describe, it, expect, IS_DARTIUM} from 'test_lib/test_lib';
import {IMPLEMENTS} from './fixtures/annotations';

class Interface1 {}
class Interface2 {}

@IMPLEMENTS(Interface1, Interface2)
class SomeClass {}

export function main() {
  describe('interfaces', function() {
    //TODO: remvoe when interfaces are supported in AtScript
    if (IS_DARTIUM) {
      it('should work', function () {
        var s = new SomeClass();
        expect(s instanceof Interface1).toBeTrue();
        expect(s instanceof Interface2).toBeTrue();
      });
    }
  });

}
