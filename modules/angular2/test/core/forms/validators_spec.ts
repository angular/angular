import {
  ddescribe,
  describe,
  it,
  iit,
  xit,
  expect,
  beforeEach,
  afterEach,
  el
} from 'angular2/testing_internal';
import {ControlGroup, Control, Validators, AbstractControl, ControlArray} from 'angular2/core';

export function main() {
  function validator(key: string, error: any) {
    return function(c: AbstractControl) {
      var r = {};
      r[key] = error;
      return r;
    }
  }

  describe("Validators", () => {
    describe("required", () => {
      it("should error on an empty string",
         () => { expect(Validators.required(new Control(""))).toEqual({"required": true}); });

      it("should error on null",
         () => { expect(Validators.required(new Control(null))).toEqual({"required": true}); });

      it("should not error on a non-empty string",
         () => { expect(Validators.required(new Control("not empty"))).toEqual(null); });
    });

    describe("minLength", () => {
      it("should not error on an empty string",
         () => { expect(Validators.minLength(2)(new Control(""))).toEqual(null); });

      it("should not error on null",
         () => { expect(Validators.minLength(2)(new Control(null))).toEqual(null); });

      it("should not error on valid strings",
         () => { expect(Validators.minLength(2)(new Control("aa"))).toEqual(null); });

      it("should error on short strings", () => {
        expect(Validators.minLength(2)(new Control("a")))
            .toEqual({"minlength": {"requiredLength": 2, "actualLength": 1}});
      });
    });

    describe("maxLength", () => {
      it("should not error on an empty string",
         () => { expect(Validators.maxLength(2)(new Control(""))).toEqual(null); });

      it("should not error on null",
         () => { expect(Validators.maxLength(2)(new Control(null))).toEqual(null); });

      it("should not error on valid strings",
         () => { expect(Validators.maxLength(2)(new Control("aa"))).toEqual(null); });

      it("should error on short strings", () => {
        expect(Validators.maxLength(2)(new Control("aaa")))
            .toEqual({"maxlength": {"requiredLength": 2, "actualLength": 3}});
      });
    });

    describe("compose", () => {
      it("should return a null validator when given null",
         () => { expect(Validators.compose(null)).toBe(Validators.nullValidator); });

      it("should collect errors from all the validators", () => {
        var c = Validators.compose([validator("a", true), validator("b", true)]);
        expect(c(new Control(""))).toEqual({"a": true, "b": true});
      });

      it("should run validators left to right", () => {
        var c = Validators.compose([validator("a", 1), validator("a", 2)]);
        expect(c(new Control(""))).toEqual({"a": 2});
      });

      it("should return null when no errors", () => {
        var c = Validators.compose([Validators.nullValidator, Validators.nullValidator]);
        expect(c(new Control(""))).toEqual(null);
      });
    });

    describe("controlGroupValidator", () => {
      it("should collect errors from the child controls", () => {
        var one = new Control("one", validator("a", true));
        var two = new Control("two", validator("b", true));
        var g = new ControlGroup({"one": one, "two": two});

        expect(Validators.group(g)).toEqual({"controls": {"a": [one], "b": [two]}});
      });

      it("should not include controls that have no errors", () => {
        var one = new Control("one", validator("a", true));
        var two = new Control("two");
        var g = new ControlGroup({"one": one, "two": two});

        expect(Validators.group(g)).toEqual({"controls": {"a": [one]}});
      });

      it("should return null when no errors", () => {
        var g = new ControlGroup({"one": new Control("one")});

        expect(Validators.group(g)).toEqual(null);
      });

      it("should return control errors mixed with group errors", () => {
        var one = new Control("one", validator("a", true));
        var g = new ControlGroup({"one": one}, null,
                                 Validators.compose([validator("b", true), Validators.group]));

        expect(g.validator(g)).toEqual({"controls": {"a": [one]}, "b": true});
      });
    });

    describe("controlArrayValidator", () => {
      it("should collect errors from the child controls", () => {
        var one = new Control("one", validator("a", true));
        var two = new Control("two", validator("b", true));
        var a = new ControlArray([one, two]);

        expect(Validators.array(a)).toEqual({"controls": {"a": [one], "b": [two]}});
      });

      it("should not include controls that have no errors", () => {
        var one = new Control("one", validator("a", true));
        var two = new Control("two");
        var a = new ControlArray([one, two]);

        expect(Validators.array(a)).toEqual({"controls": {"a": [one]}});
      });

      it("should return null when no errors", () => {
        var a = new ControlArray([new Control("one")]);

        expect(Validators.array(a)).toEqual(null);
      });

      it("should return control errors mixed with group errors", () => {
        var one = new Control("one", validator("a", true));
        var a =
            new ControlArray([one], Validators.compose([validator("b", true), Validators.array]));

        expect(a.validator(a)).toEqual({"controls": {"a": [one]}, "b": true});
      });
    });
  });
}
