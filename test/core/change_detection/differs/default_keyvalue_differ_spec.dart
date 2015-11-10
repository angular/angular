library angular2.test.core.change_detection.differs.default_keyvalue_differ_spec;

import "package:angular2/testing_internal.dart"
    show ddescribe, describe, it, iit, xit, expect, beforeEach, afterEach;
import "package:angular2/src/core/change_detection/differs/default_keyvalue_differ.dart"
    show DefaultKeyValueDiffer, DefaultKeyValueDifferFactory;
import "package:angular2/src/facade/lang.dart" show NumberWrapper, isJsObject;
import "../../../core/change_detection/util.dart" show kvChangesAsString;

// todo(vicb): Update the code & tests for object equality
main() {
  describe("keyvalue differ", () {
    describe("DefaultKeyValueDiffer", () {
      var differ;
      Map<dynamic, dynamic> m;
      beforeEach(() {
        differ = new DefaultKeyValueDiffer();
        m = new Map();
      });
      afterEach(() {
        differ = null;
      });
      it("should detect additions", () {
        differ.check(m);
        m["a"] = 1;
        differ.check(m);
        expect(differ.toString()).toEqual(
            kvChangesAsString(map: ["a[null->1]"], additions: ["a[null->1]"]));
        m["b"] = 2;
        differ.check(m);
        expect(differ.toString()).toEqual(kvChangesAsString(
            map: ["a", "b[null->2]"],
            previous: ["a"],
            additions: ["b[null->2]"]));
      });
      it("should handle changing key/values correctly", () {
        m[1] = 10;
        m[2] = 20;
        differ.check(m);
        m[2] = 10;
        m[1] = 20;
        differ.check(m);
        expect(differ.toString()).toEqual(kvChangesAsString(
            map: ["1[10->20]", "2[20->10]"],
            previous: ["1[10->20]", "2[20->10]"],
            changes: ["1[10->20]", "2[20->10]"]));
      });
      it("should expose previous and current value", () {
        var previous, current;
        m[1] = 10;
        differ.check(m);
        m[1] = 20;
        differ.check(m);
        differ.forEachChangedItem((record) {
          previous = record.previousValue;
          current = record.currentValue;
        });
        expect(previous).toEqual(10);
        expect(current).toEqual(20);
      });
      it("should do basic map watching", () {
        differ.check(m);
        m["a"] = "A";
        differ.check(m);
        expect(differ.toString()).toEqual(
            kvChangesAsString(map: ["a[null->A]"], additions: ["a[null->A]"]));
        m["b"] = "B";
        differ.check(m);
        expect(differ.toString()).toEqual(kvChangesAsString(
            map: ["a", "b[null->B]"],
            previous: ["a"],
            additions: ["b[null->B]"]));
        m["b"] = "BB";
        m["d"] = "D";
        differ.check(m);
        expect(differ.toString()).toEqual(kvChangesAsString(
            map: ["a", "b[B->BB]", "d[null->D]"],
            previous: ["a", "b[B->BB]"],
            additions: ["d[null->D]"],
            changes: ["b[B->BB]"]));
        (m.containsKey("b") && (m.remove("b") != null || true));
        differ.check(m);
        expect(differ.toString()).toEqual(kvChangesAsString(
            map: ["a", "d"],
            previous: ["a", "b[BB->null]", "d"],
            removals: ["b[BB->null]"]));
        m.clear();
        differ.check(m);
        expect(differ.toString()).toEqual(kvChangesAsString(
            previous: ["a[A->null]", "d[D->null]"],
            removals: ["a[A->null]", "d[D->null]"]));
      });
      it("should test string by value rather than by reference (DART)", () {
        m["foo"] = "bar";
        differ.check(m);
        var f = "f";
        var oo = "oo";
        var b = "b";
        var ar = "ar";
        m[f + oo] = b + ar;
        differ.check(m);
        expect(differ.toString())
            .toEqual(kvChangesAsString(map: ["foo"], previous: ["foo"]));
      });
      it("should not see a NaN value as a change (JS)", () {
        m["foo"] = NumberWrapper.NaN;
        differ.check(m);
        differ.check(m);
        expect(differ.toString())
            .toEqual(kvChangesAsString(map: ["foo"], previous: ["foo"]));
      });
      // JS specific tests (JS Objects)
      if (isJsObject({})) {
        describe("JsObject changes", () {
          it("should support JS Object", () {
            var f = new DefaultKeyValueDifferFactory();
            expect(f.supports({})).toBeTruthy();
            expect(f.supports("not supported")).toBeFalsy();
            expect(f.supports(0)).toBeFalsy();
            expect(f.supports(null)).toBeFalsy();
          });
          it("should do basic object watching", () {
            var m = {};
            differ.check(m);
            m["a"] = "A";
            differ.check(m);
            expect(differ.toString()).toEqual(kvChangesAsString(
                map: ["a[null->A]"], additions: ["a[null->A]"]));
            m["b"] = "B";
            differ.check(m);
            expect(differ.toString()).toEqual(kvChangesAsString(
                map: ["a", "b[null->B]"],
                previous: ["a"],
                additions: ["b[null->B]"]));
            m["b"] = "BB";
            m["d"] = "D";
            differ.check(m);
            expect(differ.toString()).toEqual(kvChangesAsString(
                map: ["a", "b[B->BB]", "d[null->D]"],
                previous: ["a", "b[B->BB]"],
                additions: ["d[null->D]"],
                changes: ["b[B->BB]"]));
            m = {};
            m["a"] = "A";
            m["d"] = "D";
            differ.check(m);
            expect(differ.toString()).toEqual(kvChangesAsString(
                map: ["a", "d"],
                previous: ["a", "b[BB->null]", "d"],
                removals: ["b[BB->null]"]));
            m = {};
            differ.check(m);
            expect(differ.toString()).toEqual(kvChangesAsString(
                previous: ["a[A->null]", "d[D->null]"],
                removals: ["a[A->null]", "d[D->null]"]));
          });
        });
        describe("diff", () {
          it("should return self when there is a change", () {
            m["a"] = "A";
            expect(differ.diff(m)).toBe(differ);
          });
          it("should return null when there is no change", () {
            m["a"] = "A";
            differ.diff(m);
            expect(differ.diff(m)).toEqual(null);
          });
          it("should treat null as an empty list", () {
            m["a"] = "A";
            differ.diff(m);
            expect(differ.diff(null).toString()).toEqual(kvChangesAsString(
                previous: ["a[A->null]"], removals: ["a[A->null]"]));
          });
          it("should throw when given an invalid collection", () {
            expect(() => differ.diff("invalid"))
                .toThrowErrorWith("Error trying to diff 'invalid'");
          });
        });
      }
    });
  });
}
