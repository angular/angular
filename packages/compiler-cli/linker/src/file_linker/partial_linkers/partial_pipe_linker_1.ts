/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {
  compilePipeFromMetadata,
  ConstantPool,
  outputAst as o,
  R3DeclarePipeMetadata,
  R3PartialDeclaration,
  R3PipeMetadata,
} from '@angular/compiler';

import {AstObject} from '../../ast/ast_value';
import {FatalLinkerError} from '../../fatal_linker_error';

import {LinkedDefinition, PartialLinker} from './partial_linker';
import {getDefaultStandaloneValue, wrapReference} from './util';

/**
 * A `PartialLinker` that is designed to process `ɵɵngDeclarePipe()` call expressions.
 */
export class PartialPipeLinkerVersion1<TExpression> implements PartialLinker<TExpression> {
  constructor() {}

  linkPartialDeclaration(
    constantPool: ConstantPool,
    metaObj: AstObject<R3PartialDeclaration, TExpression>,
    version: string,
  ): LinkedDefinition {
    const meta = toR3PipeMeta(metaObj, version);
    return compilePipeFromMetadata(meta);
  }
}

/**
 * Derives the `R3PipeMetadata` structure from the AST object.
 */
export function toR3PipeMeta<TExpression>(
  metaObj: AstObject<R3DeclarePipeMetadata, TExpression>,
  version: string,
): R3PipeMetadata {
  const typeExpr = metaObj.getValue('type');
  const typeName = typeExpr.getSymbolName();
  if (typeName === null) {
    throw new FatalLinkerError(
      typeExpr.expression,
      'Unsupported type, its name could not be determined',
    );
  }

  const pure = metaObj.has('pure') ? metaObj.getBoolean('pure') : true;
  const isStandalone = metaObj.has('isStandalone')
    ? metaObj.getBoolean('isStandalone')
    : getDefaultStandaloneValue(version);

  return {
    name: typeName,
    type: wrapReference(typeExpr.getOpaque()),
    typeArgumentCount: 0,
    deps: null,
    pipeName: metaObj.getString('name'),
    pure,
    isStandalone,
  };
}
