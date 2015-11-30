library angular2.test.core.facade.lang_spec;

import "package:angular2/testing_internal.dart"
    show describe, it, expect, beforeEach, ddescribe, iit, xit, el;
import "package:angular2/src/facade/lang.dart"
    show isPresent, RegExpWrapper, RegExpMatcherWrapper, StringWrapper;

main() {
  describe("RegExp", () {
    it("should expose the index for each match", () {
      var re = new RegExp(r'(!)');
      var matcher = RegExpWrapper.matcher(re, "0!23!567!!");
      var indexes = [];
      var m;
      while (isPresent(m = RegExpMatcherWrapper.next(matcher))) {
        indexes.add(m.index);
        expect(m[0]).toEqual("!");
        expect(m[1]).toEqual("!");
        expect(m.length).toBe(2);
      }
      expect(indexes).toEqual([1, 4, 8, 9]);
    });
    it("should reset before it is reused", () {
      var re = new RegExp(r'^[' + "'" + r'"]');
      var str = "'";
      expect(RegExpWrapper.test(re, str)).toEqual(true);
      // If not reset, the second attempt to test results in false
      expect(RegExpWrapper.test(re, str)).toEqual(true);
    });
  });
  describe("const", () {
    it("should support const expressions both in TS and Dart", () {
      const numbers = const [1, 2, 3];
      expect(numbers).toEqual([1, 2, 3]);
    });
  });
  describe("String", () {
    var s;
    describe("slice", () {
      beforeEach(() {
        s = "abcdefghij";
      });
      it("should return the whole string if neither start nor end are specified",
          () {
        expect(StringWrapper.slice(s)).toEqual("abcdefghij");
      });
      it("should return up to the end if end is not specified", () {
        expect(StringWrapper.slice(s, 1)).toEqual("bcdefghij");
      });
      it("should support negative start", () {
        expect(StringWrapper.slice(s, -1)).toEqual("j");
      });
      it("should support negative end", () {
        expect(StringWrapper.slice(s, -3, -1)).toEqual("hi");
      });
      it("should return empty string if start is greater than end", () {
        expect(StringWrapper.slice(s, 4, 2)).toEqual("");
        expect(StringWrapper.slice(s, -2, -4)).toEqual("");
      });
    });
  });
}
