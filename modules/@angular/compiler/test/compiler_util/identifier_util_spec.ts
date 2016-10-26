/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {createInlineArray} from '../../src/compiler_util/identifier_util';
import {Identifiers, resolveIdentifier} from '../../src/identifiers';
import * as o from '../../src/output/output_ast';

export function main() {
  describe('createInlineArray', () => {

    function check(argCount: number, expectedIdentifier: any) {
      const args = createArgs(argCount);
      expect(createInlineArray(args))
          .toEqual(o.importExpr(resolveIdentifier(expectedIdentifier)).instantiate([
            <o.Expression>o.literal(argCount)
          ].concat(args)));
    }

    function createArgs(count: number): o.Expression[] {
      const result: o.Expression[] = [];
      for (var i = 0; i < count; i++) {
        result.push(o.NULL_EXPR);
      }
      return result;
    }

    it('should work for arrays of length 0', () => {
      expect(createInlineArray([
      ])).toEqual(o.importExpr(resolveIdentifier(Identifiers.EMPTY_INLINE_ARRAY)));
    });

    it('should work for arrays of length 1 - 2', () => {
      check(1, Identifiers.inlineArrays[0]);
      check(2, Identifiers.inlineArrays[1]);
    });

    it('should work for arrays of length 3 - 4', () => {
      for (var i = 3; i <= 4; i++) {
        check(i, Identifiers.inlineArrays[2]);
      }
    });

    it('should work for arrays of length 5 - 8', () => {
      for (var i = 5; i <= 8; i++) {
        check(i, Identifiers.inlineArrays[3]);
      }
    });

    it('should work for arrays of length 9 - 16', () => {
      for (var i = 9; i <= 16; i++) {
        check(i, Identifiers.inlineArrays[4]);
      }
    });

    it('should work for arrays of length > 16',
       () => { check(17, Identifiers.InlineArrayDynamic); });
  });
}
