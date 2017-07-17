/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {EmitterVisitorContext} from '@angular/compiler/src/output/abstract_emitter';
import * as o from '@angular/compiler/src/output/output_ast';
import {JitEmitterVisitor} from '@angular/compiler/src/output/output_jit';

const anotherModuleUrl = 'somePackage/someOtherPath';

export function main() {
  describe('Output JIT', () => {
    describe('regression', () => {
      it('should generate unique argument names', () => {
        const externalIds = new Array(10).fill(1).map(
            (_, index) =>
                new o.ExternalReference(anotherModuleUrl, `id_${index}_`, {name: `id_${index}_`}));
        const externalIds1 = new Array(10).fill(1).map(
            (_, index) => new o.ExternalReference(
                anotherModuleUrl, `id_${index}_1`, {name: `id_${index}_1`}));
        const ctx = EmitterVisitorContext.createRoot();
        const converter = new JitEmitterVisitor();
        converter.visitAllStatements(
            [o.literalArr([...externalIds1, ...externalIds].map(id => o.importExpr(id))).toStmt()],
            ctx);
        const args = converter.getArgs();
        expect(Object.keys(args).length).toBe(20);
      });
    });
  })
}