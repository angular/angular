import {ddescribe, describe, it, iit, xit, expect, beforeEach, afterEach, el} from 'angular2/test_lib';
import {ControlGroup, Control, required, compose, controlGroupValidator} from 'angular2/forms';

export function main() {
  function validator(key:string, error:any){
    return function(c:Control) {
      var r = {};
      r[key] = error;
      return r;
    }
  }

  describe("Validators", () => {
    describe("required", () => {
      it("should error on an empty string", () => {
        expect(required(new Control(""))).toEqual({"required" : true});
      });

      it("should error on null", () => {
        expect(required(new Control(null))).toEqual({"required" : true});
      });

      it("should not error on a non-empty string", () => {
        expect(required(new Control("not empty"))).toEqual(null);
      });
    });

    describe("compose", () => {
      it("should collect errors from all the validators", () => {
        var c = compose([validator("a", true), validator("b", true)]);
        expect(c(new Control(""))).toEqual({"a" : true, "b" : true});
      });

      it("should run validators left to right", () => {
        var c = compose([validator("a", 1), validator("a", 2)]);
        expect(c(new Control(""))).toEqual({"a" : 2});
      });
    });

    describe("controlGroupValidator", () => {
      it("should collect errors from the child controls", () => {
        var g = new ControlGroup({
          "one" : new Control("one", validator("a", true)),
          "two" : new Control("two", validator("b", true))
        });

        expect(controlGroupValidator(g)).toEqual({
          "one" : {"a" : true},
          "two" : {"b" : true}
        });
      });

      it("should not include keys for controls that have no errors", () => {
        var g = new ControlGroup({
          "one" : new Control("one", validator("a", true)),
          "two" : new Control("one")
        });

        expect(controlGroupValidator(g)).toEqual({
          "one" : {"a" : true}
        });
      });

      it("should return null when no errors", () => {
        var g = new ControlGroup({
          "one" : new Control("one")
        });

        expect(controlGroupValidator(g)).toEqual(null);
      });
    });
  });
}