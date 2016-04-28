import {
  AsyncTestCompleter,
  beforeEach,
  ddescribe,
  describe,
  el,
  expect,
  iit,
  inject,
  it,
  xit,
  TestComponentBuilder
} from 'angular2/testing_internal';

import {escapeSingleQuoteString} from 'angular2/src/compiler/output/abstract_emitter';

export function main() {
  describe('AbstractEmitter', () => {
    describe('escapeSingleQuoteString', () => {
      it('should escape single quotes',
         () => { expect(escapeSingleQuoteString(`'`, false)).toEqual(`'\\''`); });

      it('should escape backslash',
         () => { expect(escapeSingleQuoteString('\\', false)).toEqual(`'\\\\'`); });

      it('should escape newlines',
         () => { expect(escapeSingleQuoteString('\n', false)).toEqual(`'\\n'`); });

      it('should escape carriage returns',
         () => { expect(escapeSingleQuoteString('\r', false)).toEqual(`'\\r'`); });

      it('should escape $', () => { expect(escapeSingleQuoteString('$', true)).toEqual(`'\\$'`); });
      it('should not escape $',
         () => { expect(escapeSingleQuoteString('$', false)).toEqual(`'$'`); });
    });

  });
}
