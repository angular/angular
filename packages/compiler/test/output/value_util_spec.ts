/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as o from '../../src/output/output_ast';
import {convertValueToOutputAst} from '../../src/output/value_util';

describe('convertValueToOutputAst', () => {
  it('should convert all array elements, including undefined', () => {
    const ctx = null;
    const value = new Array(3).concat('foo');
    const expr = convertValueToOutputAst(ctx!, value) as o.LiteralArrayExpr;
    expect(expr instanceof o.LiteralArrayExpr).toBe(true);
    expect(expr.entries.length).toBe(4);
    for (let i = 0; i < 4; ++i) {
      expect(expr.entries[i] instanceof o.Expression).toBe(true);
    }
  });
});
