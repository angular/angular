/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {compileFactoryFunction, ConstantPool, R3DeclareFactoryMetadata, R3DependencyMetadata, R3FactoryMetadata, R3FactoryTarget, R3PartialDeclaration, R3ResolvedDependencyType} from '@angular/compiler';
import * as o from '@angular/compiler/src/output/output_ast';

import {AstObject} from '../../ast/ast_value';
import {FatalLinkerError} from '../../fatal_linker_error';

import {PartialLinker} from './partial_linker';
import {parseEnum, wrapReference} from './util';

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

  const deps = getDeps(metaObj, 'deps');

  const meta: R3FactoryMetadata = {
    name: typeName,
    type: wrapReference(typeExpr.getOpaque()),
    internalType: metaObj.getOpaque('type'),
    typeArgumentCount: 0,
    target: parseEnum(metaObj.getValue('target'), R3FactoryTarget),
    deps,
  };

  return meta;
}

function getDeps<TExpression>(
    metaObj: AstObject<R3DeclareFactoryMetadata, TExpression>,
    propName: keyof R3DeclareFactoryMetadata): R3DependencyMetadata[]|null|'invalid' {
  if (!metaObj.has(propName)) {
    return null;
  }
  const deps = metaObj.getValue(propName);
  if (deps.isArray()) {
    return deps.getArray().map(dep => getDep(dep.getObject()));
  }
  if (deps.isString()) {
    return 'invalid';
  }
  return null;
}

function getDep<TExpression>(dep: AstObject<R3DependencyMetadata, TExpression>):
    R3DependencyMetadata {
  return {
    token: dep.getOpaque('token'),
    attribute: null,
    resolved: parseEnum(dep.getValue('resolved'), R3ResolvedDependencyType),
    host: dep.has('host') && dep.getBoolean('host'),
    optional: dep.has('optional') && dep.getBoolean('optional'),
    self: dep.has('self') && dep.getBoolean('self'),
    skipSelf: dep.has('skipSelf') && dep.getBoolean('skipSelf'),
  };
}
