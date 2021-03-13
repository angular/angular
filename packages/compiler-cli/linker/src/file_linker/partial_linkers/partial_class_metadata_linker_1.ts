/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {compileClassMetadata, ConstantPool, R3ClassMetadata, R3DeclareClassMetadata, R3PartialDeclaration} from '@angular/compiler';
import * as o from '@angular/compiler/src/output/output_ast';

import {AstObject} from '../../ast/ast_value';

import {PartialLinker} from './partial_linker';

/**
 * A `PartialLinker` that is designed to process `ɵɵngDeclareClassMetadata()` call expressions.
 */
export class PartialClassMetadataLinkerVersion1<TExpression> implements PartialLinker<TExpression> {
  linkPartialDeclaration(
      constantPool: ConstantPool,
      metaObj: AstObject<R3PartialDeclaration, TExpression>): o.Expression {
    const meta = toR3ClassMetadata(metaObj);
    return compileClassMetadata(meta);
  }
}

/**
 * Derives the `R3ClassMetadata` structure from the AST object.
 */
export function toR3ClassMetadata<TExpression>(
    metaObj: AstObject<R3DeclareClassMetadata, TExpression>): R3ClassMetadata {
  return {
    type: metaObj.getOpaque('type'),
    decorators: metaObj.getOpaque('decorators'),
    ctorParameters: metaObj.has('ctorParameters') ? metaObj.getOpaque('ctorParameters') : null,
    propDecorators: metaObj.has('propDecorators') ? metaObj.getOpaque('propDecorators') : null,
  };
}
