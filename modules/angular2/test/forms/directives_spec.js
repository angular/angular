import {ddescribe, describe, it, iit, xit, expect, beforeEach, afterEach, el,
  AsyncTestCompleter, inject} from 'angular2/test_lib';
import {ControlGroup, ControlDirective, ControlGroupDirective} from 'angular2/forms';

export function main() {
  describe("Form Directives", () => {
    describe("Control", () => {
      it("should throw when the group is not found and the control is not set", () => {
        var c = new ControlDirective(null);
        expect(() => {
          c.controlOrName = 'login';
        }).toThrowError(new RegExp('No control group found for "login"'));
      });

      it("should throw when cannot find the control in the group", () => {
        var emptyGroup = new ControlGroupDirective(null);
        emptyGroup.controlOrName = new ControlGroup({});

        var c = new ControlDirective(emptyGroup);
        expect(() => {
          c.controlOrName = 'login';
        }).toThrowError(new RegExp('Cannot find control "login"'));
      });
    });
  });
}
