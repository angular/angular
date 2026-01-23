/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {
  compileInjector,
  ConstantPool,
  outputAst as o,
  R3DeclareInjectorMetadata,
  R3InjectorMetadata,
  R3PartialDeclaration,
} from '@angular/compiler';

import {AstObject} from '../../ast/ast_value';
import {FatalLinkerError} from '../../fatal_linker_error';

import {LinkedDefinition, PartialLinker} from './partial_linker';
import {wrapReference} from './util';

/**
 * A `PartialLinker` that is designed to process `ɵɵngDeclareInjector()` call expressions.
 */
export class PartialInjectorLinkerVersion1<TExpression> implements PartialLinker<TExpression> {
  linkPartialDeclaration(
    constantPool: ConstantPool,
    metaObj: AstObject<R3PartialDeclaration, TExpression>,
  ): LinkedDefinition {
    const meta = toR3InjectorMeta(metaObj);
    return compileInjector(meta);
  }
}

/**
 * Derives the `R3InjectorMetadata` structure from the AST object.
 */
export function toR3InjectorMeta<TExpression>(
  metaObj: AstObject<R3DeclareInjectorMetadata, TExpression>,
): R3InjectorMetadata {
  const typeExpr = metaObj.getValue('type');
  const typeName = typeExpr.getSymbolName();
  if (typeName === null) {
    throw new FatalLinkerError(
      typeExpr.expression,
      'Unsupported type, its name could not be determined',
    );
  }

  return {
    name: typeName,
    type: wrapReference(typeExpr.getOpaque()),
    providers: metaObj.has('providers') ? metaObj.getOpaque('providers') : null,
    imports: metaObj.has('imports') ? metaObj.getArray('imports').map((i) => i.getOpaque()) : [],
  };
}
