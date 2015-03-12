import {describe, it, expect} from 'angular2/test_lib';

class Foo {}

export function main() {
  describe('instanceof', function() {
    it('should work', function() {
      expect(new Foo() instanceof Foo);
    });
  });
}
