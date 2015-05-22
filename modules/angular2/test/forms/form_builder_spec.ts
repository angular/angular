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
} from 'angular2/test_lib';
import {Control, FormBuilder, Validators} from 'angular2/forms';

export function main() {
  describe("Form Builder", () => {
    var b;

    beforeEach(() => { b = new FormBuilder(); });

    it("should create controls from a value", () => {
      var g = b.group({"login": "some value"});

      expect(g.controls["login"].value).toEqual("some value");
    });

    it("should create controls from an array", () => {
      var g = b.group({"login": ["some value"], "password": ["some value", Validators.required]});

      expect(g.controls["login"].value).toEqual("some value");
      expect(g.controls["password"].value).toEqual("some value");
      expect(g.controls["password"].validator).toEqual(Validators.required);
    });

    it("should use controls", () => {
      var g = b.group({"login": b.control("some value", Validators.required)});

      expect(g.controls["login"].value).toEqual("some value");
      expect(g.controls["login"].validator).toBe(Validators.required);
    });

    it("should create groups with optional controls", () => {
      var g = b.group({"login": "some value"}, {"optionals": {"login": false}});

      expect(g.contains("login")).toEqual(false);
    });

    it("should create groups with a custom validator", () => {
      var g = b.group({"login": "some value"}, {"validator": Validators.nullValidator});

      expect(g.validator).toBe(Validators.nullValidator);
    });

    it("should use default validators when no validators are provided", () => {
      var g = b.group({"login": "some value"});
      expect(g.controls["login"].validator).toBe(Validators.nullValidator);
      expect(g.validator).toBe(Validators.group);
    });

    it("should create control arrays", () => {
      var c = b.control("three");
      var a = b.array(["one", ["two", Validators.required], c, b.array(['four'])]);

      expect(a.value).toEqual(['one', 'two', 'three', ['four']]);
    });
  });
}
