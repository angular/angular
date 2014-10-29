import {describe, it, iit, expect} from 'test_lib/test_lib';

class TestObj {
  constructor(prop) {
    this.prop = prop;
  }
}

export function main() {
  describe("test_lib", function () {
    describe("equality", function () {
      it("should structurally compare objects", function () {
        var expected = new TestObj(new TestObj({"one" : [1,2]}));
        var actual = new TestObj(new TestObj({"one" : [1,2]}));
        var falseActual = new TestObj(new TestObj({"one" : [1,3]}));

        expect(actual).toEqual(expected);
        expect(falseActual).not.toEqual(expected);
      });
    });
  });
}