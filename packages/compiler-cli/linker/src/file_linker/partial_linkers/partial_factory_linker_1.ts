/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {compileFactoryFunction, ConstantPool, FactoryTarget, R3DeclareDependencyMetadata, R3DeclareFactoryMetadata, R3DependencyMetadata, R3FactoryMetadata, R3PartialDeclaration} from '@angular/compiler';
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

  return {
    name: typeName,
    type: wrapReference(typeExpr.getOpaque()),
    internalType: metaObj.getOpaque('type'),
    typeArgumentCount: 0,
    target: parseEnum(metaObj.getValue('target'), FactoryTarget),
    deps: getDeps(metaObj, 'deps'),
  };
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

function getDep<TExpression>(depObj: AstObject<R3DeclareDependencyMetadata, TExpression>):
    R3DependencyMetadata {
  const isAttribute = depObj.has('attribute') && depObj.getBoolean('attribute');
  const token = depObj.getOpaque('token');
  // Normally `attribute` is a string literal and so its `attributeNameType` is the same string
  // literal. If the `attribute` is some other expression, the `attributeNameType` would be the
  // `unknown` type. It is not possible to generate this when linking, since it only deals with JS
  // and not typings. When linking the existence of the `attributeNameType` only acts as a marker to
  // change the injection instruction that is generated, so we just pass the literal string
  // `"unknown"`.
  const attributeNameType = isAttribute ? o.literal('unknown') : null;
  const dep: R3DependencyMetadata = {
    token,
    attributeNameType,
    host: depObj.has('host') && depObj.getBoolean('host'),
    optional: depObj.has('optional') && depObj.getBoolean('optional'),
    self: depObj.has('self') && depObj.getBoolean('self'),
    skipSelf: depObj.has('skipSelf') && depObj.getBoolean('skipSelf'),
  };
  return dep;
}
