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
} from 'angular2/test_lib';

import {escapeSingleQuoteString, escapeDoubleQuoteString} from 'angular2/src/compiler/util';

export function main() {
  describe('util', () => {
    describe('escapeSingleQuoteString', () => {
      it('should escape single quotes',
         () => { expect(escapeSingleQuoteString(`'`)).toEqual(`'\\''`); });

      it('should escape backslash',
         () => { expect(escapeSingleQuoteString('\\')).toEqual(`'\\\\'`); });

      it('should escape newlines',
         () => { expect(escapeSingleQuoteString('\n')).toEqual(`'\\n'`); });
    });

    describe('escapeDoubleQuoteString', () => {
      it('should escape double quotes',
         () => { expect(escapeDoubleQuoteString(`"`)).toEqual(`"\\""`); });

      it('should escape backslash',
         () => { expect(escapeDoubleQuoteString('\\')).toEqual(`"\\\\"`); });

      it('should escape newlines',
         () => { expect(escapeDoubleQuoteString('\n')).toEqual(`"\\n"`); });
    });

  });
}