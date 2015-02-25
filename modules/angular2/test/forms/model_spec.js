import {ddescribe, describe, it, iit, xit, expect, beforeEach, afterEach, el} from 'angular2/test_lib';
import {ControlGroup, Control, OptionalControl} from 'angular2/forms';
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
      it("should run the validator with the initial value (valid)", () => {
        var g = new ControlGroup({
          "one": new Control('value', validations.required)
        });

        expect(g.valid).toEqual(true);

        expect(g.errors).toEqual(null);
      });

      it("should run the validator with the initial value (invalid)", () => {
        var one = new Control(null, validations.required);
        var g = new ControlGroup({"one": one});

        expect(g.valid).toEqual(false);

        expect(g.errors).toEqual({"required": [one]});
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

  describe("OptionalControl", () => {
    it("should read properties from the wrapped component", () => {
      var wrapperControl = new Control("value", validations.required);
      var c = new OptionalControl(wrapperControl, true);

      expect(c.value).toEqual('value');
      expect(c.status).toEqual('VALID');
      expect(c.validator).toEqual(validations.required);
    });

    it("should update the wrapped component", () => {
      var wrappedControl = new Control("value");
      var c = new OptionalControl(wrappedControl, true);

      c.validator = validations.required;
      c.updateValue("newValue");


      expect(wrappedControl.validator).toEqual(validations.required);
      expect(wrappedControl.value).toEqual('newValue');
    });

    it("should not include an inactive component into the group value", () => {
      var group = new ControlGroup({
        "required" : new Control("requiredValue"),
        "optional" : new OptionalControl(new Control("optionalValue"), false)
      });

      expect(group.value).toEqual({"required" : "requiredValue"});

      group.controls["optional"].cond = true;

      expect(group.value).toEqual({"required" : "requiredValue", "optional" : "optionalValue"});
    });

    it("should not run validations on an inactive component", () => {
      var group = new ControlGroup({
        "required" : new Control("requiredValue", validations.required),
        "optional" : new OptionalControl(new Control("", validations.required), false)
      });

      expect(group.valid).toEqual(true);

      group.controls["optional"].cond = true;

      expect(group.valid).toEqual(false);
    });
  });

}