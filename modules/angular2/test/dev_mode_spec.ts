import {
  AsyncTestCompleter,
  beforeEach,
  ddescribe,
  describe,
  expect,
  iit,
  inject,
  it,
  xdescribe,
  xit
} from 'angular2/testing_internal';

import {assertionsEnabled} from 'angular2/src/facade/lang';

export function main() {
  describe('dev mode', () => {
    it('is enabled in our tests by default', () => { expect(assertionsEnabled()).toBe(true); });
  });
}
