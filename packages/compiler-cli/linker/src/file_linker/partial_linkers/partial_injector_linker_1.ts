/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {compileInjector, ConstantPool, R3DeclareInjectorMetadata, R3InjectorMetadata, R3PartialDeclaration} from '@angular/compiler';
import * as o from '@angular/compiler/src/output/output_ast';

import {AstObject} from '../../ast/ast_value';
import {FatalLinkerError} from '../../fatal_linker_error';

import {PartialLinker} from './partial_linker';
import {wrapReference} from './util';

/**
 * A `PartialLinker` that is designed to process `ɵɵngDeclareInjector()` call expressions.
 */
export class PartialInjectorLinkerVersion1<TExpression> implements PartialLinker<TExpression> {
  linkPartialDeclaration(
      constantPool: ConstantPool,
      metaObj: AstObject<R3PartialDeclaration, TExpression>): o.Expression {
    const meta = toR3InjectorMeta(metaObj);
    const def = compileInjector(meta);
    return def.expression;
  }
}

/**
 * Derives the `R3InjectorMetadata` structure from the AST object.
 */
export function toR3InjectorMeta<TExpression>(
    metaObj: AstObject<R3DeclareInjectorMetadata, TExpression>): R3InjectorMetadata {
  const typeExpr = metaObj.getValue('type');
  const typeName = typeExpr.getSymbolName();
  if (typeName === null) {
    throw new FatalLinkerError(
        typeExpr.expression, 'Unsupported type, its name could not be determined');
  }

  return {
    name: typeName,
    type: wrapReference(typeExpr.getOpaque()),
    internalType: metaObj.getOpaque('type'),
    providers: metaObj.has('providers') ? metaObj.getOpaque('providers') : null,
    imports: metaObj.has('imports') ? metaObj.getArray('imports').map(i => i.getOpaque()) : [],
  };
}
