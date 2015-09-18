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

import {IS_DART} from '../../platform';
import {escapeSingleQuoteString, escapeDoubleQuoteString} from 'angular2/src/core/compiler/util';

export function main() {
  describe('util', () => {
    describe('escapeSingleQuoteString', () => {
      it('should escape single quotes',
         () => { expect(escapeSingleQuoteString(`'`)).toEqual(`'\\''`); });

      it('should escape backslash',
         () => { expect(escapeSingleQuoteString('\\')).toEqual(`'\\\\'`); });

      it('should escape newlines',
         () => { expect(escapeSingleQuoteString('\n')).toEqual(`'\\n'`); });

      if (IS_DART) {
        it('should escape $', () => { expect(escapeSingleQuoteString('$')).toEqual(`'\\$'`); });
      } else {
        it('should not escape $', () => { expect(escapeSingleQuoteString('$')).toEqual(`'$'`); });
      }
    });

    describe('escapeDoubleQuoteString', () => {
      it('should escape double quotes',
         () => { expect(escapeDoubleQuoteString(`"`)).toEqual(`"\\""`); });

      it('should escape backslash',
         () => { expect(escapeDoubleQuoteString('\\')).toEqual(`"\\\\"`); });

      it('should escape newlines',
         () => { expect(escapeDoubleQuoteString('\n')).toEqual(`"\\n"`); });

      if (IS_DART) {
        it('should escape $', () => { expect(escapeDoubleQuoteString('$')).toEqual(`"\\$"`); });
      } else {
        it('should not escape $', () => { expect(escapeDoubleQuoteString('$')).toEqual(`"$"`); });
      }
    });

  });
}
