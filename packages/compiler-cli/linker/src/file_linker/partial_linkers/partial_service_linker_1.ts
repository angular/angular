/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {
  compileService,
  ConstantPool,
  R3DeclareServiceMetadata,
  R3PartialDeclaration,
  R3ServiceMetadata,
} from '@angular/compiler';

import {AstObject} from '../../ast/ast_value';
import {FatalLinkerError} from '../../fatal_linker_error';

import {LinkedDefinition, PartialLinker} from './partial_linker';
import {wrapReference} from './util';

/**
 * A `PartialLinker` that is designed to process `ɵɵngDeclareService()` call expressions.
 */
export class PartialServiceLinkerVersion1<TExpression> implements PartialLinker<TExpression> {
  linkPartialDeclaration(
    constantPool: ConstantPool,
    metaObj: AstObject<R3PartialDeclaration, TExpression>,
  ): LinkedDefinition {
    const meta = toR3ServiceMeta(metaObj);
    return compileService(meta, /* resolveForwardRefs */ false);
  }
}

/**
 * Derives the `R3ServiceMetadata` structure from the AST object.
 */
export function toR3ServiceMeta<TExpression>(
  metaObj: AstObject<R3DeclareServiceMetadata, TExpression>,
): R3ServiceMetadata {
  const typeExpr = metaObj.getValue('type');
  const typeName = typeExpr.getSymbolName();
  if (typeName === null) {
    throw new FatalLinkerError(
      typeExpr.expression,
      'Unsupported type, its name could not be determined',
    );
  }

  const meta: R3ServiceMetadata = {
    name: typeName,
    type: wrapReference(typeExpr.getOpaque()),
    typeArgumentCount: 0,
    autoProvided: metaObj.has('autoProvided') ? metaObj.getBoolean('autoProvided') : undefined,
    factory: metaObj.has('factory') ? metaObj.getOpaque('factory') : undefined,
  };

  return meta;
}
