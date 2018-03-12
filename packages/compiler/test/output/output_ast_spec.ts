/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
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
            o.variable('test').set(o.NULL_EXPR).toDeclStmt(o.importType(ref1, [o.importType(
                                                                                  ref2) !]));

        expect(o.collectExternalReferences([stmt])).toEqual([ref1, ref2]);
      });
    });

    describe('comments', () => {
      it('different JSDocCommentStmt should not be equivalent', () => {
        const comment1 = new o.JSDocCommentStmt([{text: 'text'}]);
        const comment2 = new o.JSDocCommentStmt([{text: 'text2'}]);
        const comment3 = new o.JSDocCommentStmt([{tagName: o.JSDocTagName.Desc, text: 'text2'}]);
        const comment4 = new o.JSDocCommentStmt([{text: 'text2'}, {text: 'text3'}]);

        expect(comment1.isEquivalent(comment2)).toBeFalsy();
        expect(comment1.isEquivalent(comment3)).toBeFalsy();
        expect(comment1.isEquivalent(comment4)).toBeFalsy();
        expect(comment2.isEquivalent(comment3)).toBeFalsy();
        expect(comment2.isEquivalent(comment4)).toBeFalsy();
        expect(comment3.isEquivalent(comment4)).toBeFalsy();
        expect(comment1.isEquivalent(comment1)).toBeTruthy();
      });
    });
  });
}
