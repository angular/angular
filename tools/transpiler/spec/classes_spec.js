import {ddescribe, describe, it, expect} from 'test_lib/test_lib';
import {CONST} from './fixtures/annotations';

class Foo {
  a;
  b;

  constructor(a, b) {
    this.a = a;
    this.b = b;
  }

  sum() {
    return this.a + this.b;
  }
}

class SubFoo extends Foo {
  c;

  constructor(a, b) {
    this.c = 3;
    super(a, b);
  }
}

@CONST
class ConstClass {}

class Const {
  a;

  @CONST
  constructor(a:number) {
    this.a = a;
  }
}

class SubConst extends Const {
  b;

  @CONST
  constructor(a:number, b:number) {
    super(a);
    this.b = b;
  }
}

class HasGetters {
  get getter():string {
    return 'getter';
  }

  static get staticGetter():string {
    return 'getter';
  }
}

class WithFields {
  name: string;
  static id: number;
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

    it('@CONST on class without constructor should generate const constructor', function () {
      var constClass = new ConstClass();
      expect(constClass).not.toBe(null);
    });

    describe('inheritance', function() {
      it('should support super call', function () {
        var subFoo = new SubFoo(1, 2);
        expect(subFoo.a).toBe(1);
        expect(subFoo.b).toBe(2);
        expect(subFoo.c).toBe(3);
      });
    });

    describe("getters", function () {
      it("should call instance getters", function () {
        var obj = new HasGetters();
        expect(obj.getter).toEqual('getter');
      });

      it("should call static getters", function () {
        expect(HasGetters.staticGetter).toEqual('getter');
      });
    });

    describe('fields', function() {
      it('should work', function() {
        var obj = new WithFields();
        obj.name = 'Vojta';
        WithFields.id = 12;
      });
    });
  });

}
