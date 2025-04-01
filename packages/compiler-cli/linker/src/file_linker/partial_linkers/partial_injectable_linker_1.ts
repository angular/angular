/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {
  compileInjectable,
  ConstantPool,
  createMayBeForwardRefExpression,
  ForwardRefHandling,
  outputAst as o,
  R3DeclareInjectableMetadata,
  R3InjectableMetadata,
  R3PartialDeclaration,
} from '@angular/compiler';

import {AstObject} from '../../ast/ast_value';
import {FatalLinkerError} from '../../fatal_linker_error';

import {LinkedDefinition, PartialLinker} from './partial_linker';
import {extractForwardRef, getDependency, wrapReference} from './util';

/**
 * A `PartialLinker` that is designed to process `ɵɵngDeclareInjectable()` call expressions.
 */
export class PartialInjectableLinkerVersion1<TExpression> implements PartialLinker<TExpression> {
  linkPartialDeclaration(
    constantPool: ConstantPool,
    metaObj: AstObject<R3PartialDeclaration, TExpression>,
  ): LinkedDefinition {
    const meta = toR3InjectableMeta(metaObj);
    return compileInjectable(meta, /* resolveForwardRefs */ false);
  }
}

/**
 * Derives the `R3InjectableMetadata` structure from the AST object.
 */
export function toR3InjectableMeta<TExpression>(
  metaObj: AstObject<R3DeclareInjectableMetadata, TExpression>,
): R3InjectableMetadata {
  const typeExpr = metaObj.getValue('type');
  const typeName = typeExpr.getSymbolName();
  if (typeName === null) {
    throw new FatalLinkerError(
      typeExpr.expression,
      'Unsupported type, its name could not be determined',
    );
  }

  const meta: R3InjectableMetadata = {
    name: typeName,
    type: wrapReference(typeExpr.getOpaque()),
    typeArgumentCount: 0,
    providedIn: metaObj.has('providedIn')
      ? extractForwardRef(metaObj.getValue('providedIn'))
      : createMayBeForwardRefExpression(o.literal(null), ForwardRefHandling.None),
  };

  if (metaObj.has('useClass')) {
    meta.useClass = extractForwardRef(metaObj.getValue('useClass'));
  }
  if (metaObj.has('useFactory')) {
    meta.useFactory = metaObj.getOpaque('useFactory');
  }
  if (metaObj.has('useExisting')) {
    meta.useExisting = extractForwardRef(metaObj.getValue('useExisting'));
  }
  if (metaObj.has('useValue')) {
    meta.useValue = extractForwardRef(metaObj.getValue('useValue'));
  }

  if (metaObj.has('deps')) {
    meta.deps = metaObj.getArray('deps').map((dep) => getDependency(dep.getObject()));
  }

  return meta;
}
