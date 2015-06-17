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
import {AbstractBindingError} from 'angular2/di';

export function main() {
  describe('exceptions', () => {
    it('should have the proper message when thrown', () => {
      try {
        throw new AbstractBindingError('foo', () => { return 'message'; });
      } catch (e) {
        expect(e.stack.split('\n')[0]).toBe('Error: message');
      }
    });
  });
}
