/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as o from '../../../src/output/output_ast';
import * as ir from '../../../src/template/pipeline/ir';

describe('template pipeline IR expressions', () => {
  describe('ReadTemporaryExpr', () => {
    const read = (xref: number) => new ir.ReadTemporaryExpr(xref as ir.XrefId);

    it('is equivalent to a read of the same temporary', () => {
      expect(read(1).isEquivalent(read(1))).toBeTrue();
    });

    it('is not equivalent to a read of a different temporary', () => {
      expect(read(1).isEquivalent(read(2))).toBeFalse();
    });

    it('is not equivalent to an unrelated expression', () => {
      expect(read(1).isEquivalent(o.NULL_EXPR)).toBeFalse();
    });
  });
});
