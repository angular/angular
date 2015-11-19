library angular2.test.common.pipes.lowercase_pipe_spec;

import "package:angular2/testing_internal.dart"
    show ddescribe, describe, it, iit, xit, expect, beforeEach, afterEach;
import "package:angular2/common.dart" show LowerCasePipe;

main() {
  describe("LowerCasePipe", () {
    var upper;
    var lower;
    var pipe;
    beforeEach(() {
      lower = "something";
      upper = "SOMETHING";
      pipe = new LowerCasePipe();
    });
    describe("transform", () {
      it("should return lowercase", () {
        var val = pipe.transform(upper);
        expect(val).toEqual(lower);
      });
      it("should lowercase when there is a new value", () {
        var val = pipe.transform(upper);
        expect(val).toEqual(lower);
        var val2 = pipe.transform("WAT");
        expect(val2).toEqual("wat");
      });
      it("should not support other objects", () {
        expect(() => pipe.transform(new Object())).toThrowError();
      });
    });
  });
}
