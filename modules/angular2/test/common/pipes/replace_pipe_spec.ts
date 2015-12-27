import {
  ddescribe,
  describe,
  it,
  iit,
  xit,
  expect,
  beforeEach,
  afterEach,
  browserDetection,
  inject,
  TestComponentBuilder,
  AsyncTestCompleter
} from 'angular2/testing_internal';

import {Component} from 'angular2/core';
import {ReplacePipe} from 'angular2/common';

export function main() {
  describe("ReplacePipe", () => {
    var num: number;
    var str;
    var pipe;

    beforeEach(() => {
      num = 42;
      str = 'Douglas Adams';
      pipe = new ReplacePipe();
    });

    describe("supportedInput", () => {

      it("should support strings", () => { expect(pipe.supportedInput(str)).toBe(true); });
      it("should support numbers", () => { expect(pipe.supportedInput(num)).toBe(true); });

      it("should not support other objects", () => {
        expect(pipe.supportedInput({})).toBe(false);
        expect(pipe.supportedInput(null)).toBe(false);
      });
    });

    describe("supportedPattern", () => {

      it("should support strings", () => { expect(pipe.supportedPattern(str)).toBe(true); });
      it("should support regular expressions",
         () => { expect(pipe.supportedPattern(new RegExp(str))).toBe(true); });

      it("should not support other objects", () => {
        expect(pipe.supportedPattern({})).toBe(false);
        expect(pipe.supportedPattern(null)).toBe(false);
      });
    });

    describe("supportedReplacement", () => {

      it("should support strings", () => { expect(pipe.supportedReplacement(str)).toBe(true); });
      it("should support functions",
         () => { expect(pipe.supportedReplacement(x => x + '1')).toBe(true); });

      it("should not support other objects", () => {
        expect(pipe.supportedReplacement({})).toBe(false);
        expect(pipe.supportedReplacement(null)).toBe(false);
      });
    });

    describe("transform", () => {

      it("should return a new string with the pattern replaced", () => {
        var result1 = pipe.transform(str, ["Douglas", "Hugh"]);
        var result2 = pipe.transform(str, [new RegExp("a", "g"), "_"]);
        var result3 = pipe.transform(str, ["a", "_", "gi"]);
        var result4 = pipe.transform(str, ["Adams", x => x + "!"]);
        var result5 = pipe.transform(num, ["2", "4"]);

        expect(result1).toEqual("Hugh Adams");
        expect(result2).toEqual("Dougl_s Ad_ms");
        expect(result3).toEqual("Dougl_s _d_ms");
        expect(result4).toEqual("Douglas Adams!");
        expect(result5).toEqual("44");
      });

    });

  });
}
