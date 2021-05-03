/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as o from '../../src/output/output_ast';

{
  describe('OutputAst', () => {
    describe('collectExternalReferences', () => {
      it('should find expressions of variable types', () => {
        const ref1 = new o.ExternalReference('aModule', 'name1');
        const ref2 = new o.ExternalReference('aModule', 'name2');
        const stmt =
            o.variable('test').set(o.NULL_EXPR).toDeclStmt(o.importType(ref1, [o.importType(ref2)!
            ]));

        expect(o.collectExternalReferences([stmt])).toEqual([ref1, ref2]);
      });
    });
  });
}
