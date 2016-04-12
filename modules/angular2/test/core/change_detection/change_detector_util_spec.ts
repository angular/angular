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

import {ChangeDetectionUtil} from 'angular2/src/core/change_detection/change_detection_util';

export function main() {
  describe("ChangeDetectionUtil", () => {
    describe("devModeEqual", () => {
      it("should do the deep comparison of iterables", () => {
        expect(ChangeDetectionUtil.devModeEqual([['one']], [['one']])).toBe(true);
        expect(ChangeDetectionUtil.devModeEqual(['one'], ['one', 'two'])).toBe(false);
        expect(ChangeDetectionUtil.devModeEqual(['one', 'two'], ['one'])).toBe(false);
        expect(ChangeDetectionUtil.devModeEqual(['one'], 'one')).toBe(false);
        expect(ChangeDetectionUtil.devModeEqual(['one'], new Object())).toBe(false);
        expect(ChangeDetectionUtil.devModeEqual('one', ['one'])).toBe(false);
        expect(ChangeDetectionUtil.devModeEqual(new Object(), ['one'])).toBe(false);
      });

      it("should compare primitive numbers", () => {
        expect(ChangeDetectionUtil.devModeEqual(1, 1)).toBe(true);
        expect(ChangeDetectionUtil.devModeEqual(1, 2)).toBe(false);
        expect(ChangeDetectionUtil.devModeEqual(new Object(), 2)).toBe(false);
        expect(ChangeDetectionUtil.devModeEqual(1, new Object())).toBe(false);
      });

      it("should compare primitive strings", () => {
        expect(ChangeDetectionUtil.devModeEqual('one', 'one')).toBe(true);
        expect(ChangeDetectionUtil.devModeEqual('one', 'two')).toBe(false);
        expect(ChangeDetectionUtil.devModeEqual(new Object(), 'one')).toBe(false);
        expect(ChangeDetectionUtil.devModeEqual('one', new Object())).toBe(false);
      });

      it("should compare primitive booleans", () => {
        expect(ChangeDetectionUtil.devModeEqual(true, true)).toBe(true);
        expect(ChangeDetectionUtil.devModeEqual(true, false)).toBe(false);
        expect(ChangeDetectionUtil.devModeEqual(new Object(), true)).toBe(false);
        expect(ChangeDetectionUtil.devModeEqual(true, new Object())).toBe(false);
      });

      it("should compare null", () => {
        expect(ChangeDetectionUtil.devModeEqual(null, null)).toBe(true);
        expect(ChangeDetectionUtil.devModeEqual(null, 1)).toBe(false);
        expect(ChangeDetectionUtil.devModeEqual(new Object(), null)).toBe(false);
        expect(ChangeDetectionUtil.devModeEqual(null, new Object())).toBe(false);
      });

      it("should return true for other objects", () => {
        expect(ChangeDetectionUtil.devModeEqual(new Object(), new Object())).toBe(true);
      });
    });
  });
}
