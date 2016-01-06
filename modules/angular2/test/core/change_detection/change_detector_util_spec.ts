import {
  ddescribe,
  describe,
  it,
  iit,
  xit,
  expect,
  beforeEach,
  afterEach
} from 'angular2/testing_internal';

import {devModeEqual} from 'angular2/src/core/change_detection/change_detection_util';

export function main() {
  describe("ChangeDetectionUtil", () => {
    describe("devModeEqual", () => {
      it("should do the deep comparison of iterables", () => {
        expect(devModeEqual([['one']], [['one']])).toBe(true);
        expect(devModeEqual(['one'], ['one', 'two'])).toBe(false);
        expect(devModeEqual(['one', 'two'], ['one'])).toBe(false);
        expect(devModeEqual(['one'], 'one')).toBe(false);
        expect(devModeEqual(['one'], new Object())).toBe(false);
        expect(devModeEqual('one', ['one'])).toBe(false);
        expect(devModeEqual(new Object(), ['one'])).toBe(false);
      });

      it("should compare primitive numbers", () => {
        expect(devModeEqual(1, 1)).toBe(true);
        expect(devModeEqual(1, 2)).toBe(false);
        expect(devModeEqual(new Object(), 2)).toBe(false);
        expect(devModeEqual(1, new Object())).toBe(false);
      });

      it("should compare primitive strings", () => {
        expect(devModeEqual('one', 'one')).toBe(true);
        expect(devModeEqual('one', 'two')).toBe(false);
        expect(devModeEqual(new Object(), 'one')).toBe(false);
        expect(devModeEqual('one', new Object())).toBe(false);
      });

      it("should compare primitive booleans", () => {
        expect(devModeEqual(true, true)).toBe(true);
        expect(devModeEqual(true, false)).toBe(false);
        expect(devModeEqual(new Object(), true)).toBe(false);
        expect(devModeEqual(true, new Object())).toBe(false);
      });

      it("should compare null", () => {
        expect(devModeEqual(null, null)).toBe(true);
        expect(devModeEqual(null, 1)).toBe(false);
        expect(devModeEqual(new Object(), null)).toBe(false);
        expect(devModeEqual(null, new Object())).toBe(false);
      });

      it("should return true for other objects",
         () => { expect(devModeEqual(new Object(), new Object())).toBe(true); });
    });
  });
}
