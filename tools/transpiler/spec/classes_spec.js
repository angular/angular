import {describe, it, expect} from 'test_lib/test_lib';
import {CONST} from './fixtures/annotations';

// Constructor
// Define fields
class Foo {
  constructor(a, b) {
    this.a = a;
    this.b = b;
  }

  sum() {
    return this.a + this.b;
  }
}

class SubFoo extends Foo {
  constructor(a, b) {
    this.c = 3;
    super(a, b);
  }
}

class Const {
  @CONST
  constructor(a:number) {
    this.a = a;
  }
}

class SubConst extends Const {
  @CONST
  constructor(a:number, b:number) {
    super(a);
    this.b = b;
  }
}

export function main() {
  describe('classes', function() {
    it('should work', function() {
      var foo = new Foo(2, 3);

      expect(foo.a).toBe(2);
      expect(foo.b).toBe(3);
      expect(foo.sum()).toBe(5);
    });

    it('@CONST should be transpiled to a const constructor', function() {
      var subConst = new SubConst(1, 2);
      expect(subConst.a).toBe(1);
      expect(subConst.b).toBe(2);
    });

    describe('inheritance', function() {
      it('should support super call', function () {
        var subFoo = new SubFoo(1, 2);
        expect(subFoo.a).toBe(1);
        expect(subFoo.b).toBe(2);
        expect(subFoo.c).toBe(3);
      });
    });
  });

}
