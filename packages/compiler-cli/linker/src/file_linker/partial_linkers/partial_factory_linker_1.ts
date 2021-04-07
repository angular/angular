/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {compileFactoryFunction, ConstantPool, FactoryTarget, R3DeclareFactoryMetadata, R3DependencyMetadata, R3FactoryMetadata, R3PartialDeclaration} from '@angular/compiler';
import * as o from '@angular/compiler/src/output/output_ast';

import {AstObject} from '../../ast/ast_value';
import {FatalLinkerError} from '../../fatal_linker_error';

import {PartialLinker} from './partial_linker';
import {getDependency, parseEnum, wrapReference} from './util';

/**
 * A `PartialLinker` that is designed to process `ɵɵngDeclareFactory()` call expressions.
 */
export class PartialFactoryLinkerVersion1<TExpression> implements PartialLinker<TExpression> {
  linkPartialDeclaration(
      constantPool: ConstantPool,
      metaObj: AstObject<R3PartialDeclaration, TExpression>): o.Expression {
    const meta = toR3FactoryMeta(metaObj);
    const def = compileFactoryFunction(meta);
    return def.expression;
  }
}

/**
 * Derives the `R3FactoryMetadata` structure from the AST object.
 */
export function toR3FactoryMeta<TExpression>(
    metaObj: AstObject<R3DeclareFactoryMetadata, TExpression>): R3FactoryMetadata {
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
    typeArgumentCount: 0,
    target: parseEnum(metaObj.getValue('target'), FactoryTarget),
    deps: getDependencies(metaObj, 'deps'),
  };
}

function getDependencies<TExpression>(
    metaObj: AstObject<R3DeclareFactoryMetadata, TExpression>,
    propName: keyof R3DeclareFactoryMetadata): R3DependencyMetadata[]|null|'invalid' {
  if (!metaObj.has(propName)) {
    return null;
  }
  const deps = metaObj.getValue(propName);
  if (deps.isArray()) {
    return deps.getArray().map(dep => getDependency(dep.getObject()));
  }
  if (deps.isString()) {
    return 'invalid';
  }
  return null;
}
