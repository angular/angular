import {ddescribe, describe, it, iit, xit, expect, beforeEach, afterEach, el} from 'angular2/test_lib';
import {ControlGroup, Control} from 'angular2/forms';
import * as validations from 'angular2/forms';

export function main() {
  describe("Control", () => {
    describe("validator", () => {
      it("should run validator with the initial value", () => {
        var c = new Control("value", validations.required);
        expect(c.valid).toEqual(true);
      });

      it("should rerun the validator when the value changes", () => {
        var c = new Control("value", validations.required);
        c.updateValue(null);
        expect(c.valid).toEqual(false);
      });

      it("should return errors", () => {
        var c = new Control(null, validations.required);
        expect(c.errors).toEqual({"required" : true});
      });
    });
  });

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

    describe("validator", () => {
      it("should run the validator with the initial value", () => {
        var g = new ControlGroup({
          "one": new Control(null, validations.required)
        });

        expect(g.valid).toEqual(false);

        expect(g.errors).toEqual({"one": {"required" : true}});
      });

      it("should run the validator with the value changes", () => {
        var c = new Control(null, validations.required);
        var g = new ControlGroup({"one": c});

        c.updateValue("some value");

        expect(g.valid).toEqual(true);
        expect(g.errors).toEqual(null);
      });
    });
  });
}