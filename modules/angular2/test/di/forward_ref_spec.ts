import {
  AsyncTestCompleter,
  beforeEach,
  ddescribe,
  describe,
  expect,
  iit,
  inject,
  it,
  xit,
} from 'angular2/test_lib';
import {forwardRef, resolveForwardRef} from 'angular2/di';
import {Type} from 'angular2/src/facade/lang';

export function main() {
  describe("forwardRef", function() {
    it('should wrap and unwrap the reference', () => {
      var ref = forwardRef(() => String);
      expect(ref instanceof Type).toBe(true);
      expect(resolveForwardRef(ref)).toBe(String);
    });
  });
}
