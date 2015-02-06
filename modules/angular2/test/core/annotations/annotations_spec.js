import {ddescribe, describe, it, iit, expect, beforeEach} from 'angular2/test_lib';
import {Directive, onChange} from 'angular2/src/core/annotations/annotations';

export function main() {
  describe("Directive", () => {
    describe("lifecycle", () => {
      it("should be false when no lifecycle specified", () => {
        var d = new Directive();
        expect(d.hasLifecycleHook(onChange)).toBe(false);
      });

      it("should be false when the lifecycle does not contain the hook", () => {
        var d = new Directive({lifecycle:[]});
        expect(d.hasLifecycleHook(onChange)).toBe(false);
      });

      it("should be true otherwise", () => {
        var d = new Directive({lifecycle:[onChange]});
        expect(d.hasLifecycleHook(onChange)).toBe(true);
      });
    });
  });
}
