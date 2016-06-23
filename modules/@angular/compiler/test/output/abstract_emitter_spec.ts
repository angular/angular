/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {beforeEach, ddescribe, describe, expect, iit, inject, it, xit,} from '@angular/core/testing/testing_internal';

import {escapeSingleQuoteString} from '@angular/compiler/src/output/abstract_emitter';

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
