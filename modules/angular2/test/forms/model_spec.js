import {ddescribe, describe, it, iit, xit, expect, beforeEach, afterEach, el} from 'angular2/test_lib';
import {ControlGroup, Control} from 'angular2/forms';

export function main() {
  describe("ControlGroup", () => {
    describe("value", () => {
      it("should be the reduced value of the child controls", () => {
        var g = new ControlGroup({
          "one": new Control("111"),
          "two": new Control("222")
        });
        expect(g.value).toEqual({"one": "111", "two": "222"})
      });

      it("should be empty when there are no child controls", () => {
        var g = new ControlGroup({});
        expect(g.value).toEqual({})
      });
    });
  });
}