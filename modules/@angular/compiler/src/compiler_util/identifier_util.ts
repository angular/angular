/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CompileTokenMetadata} from '../compile_metadata';
import {isPresent} from '../facade/lang';
import {IdentifierSpec, Identifiers, createEnumIdentifier, createIdentifier} from '../identifiers';
import * as o from '../output/output_ast';

export function createDiTokenExpression(token: CompileTokenMetadata): o.Expression {
  if (isPresent(token.value)) {
    return o.literal(token.value);
  } else {
    return o.importExpr(token.identifier);
  }
}

export function createInlineArray(values: o.Expression[]): o.Expression {
  if (values.length === 0) {
    return o.importExpr(createIdentifier(Identifiers.EMPTY_INLINE_ARRAY));
  }
  const log2 = Math.log(values.length) / Math.log(2);
  const index = Math.ceil(log2);
  const identifierSpec = index < Identifiers.inlineArrays.length ? Identifiers.inlineArrays[index] :
                                                                   Identifiers.InlineArrayDynamic;
  const identifier = createIdentifier(identifierSpec);
  return o.importExpr(identifier).instantiate([
    <o.Expression>o.literal(values.length)
  ].concat(values));
}

export function createPureProxy(
    fn: o.Expression, argCount: number, pureProxyProp: o.ReadPropExpr,
    builder: {fields: o.ClassField[], ctorStmts: {push: (stmt: o.Statement) => void}}) {
  builder.fields.push(new o.ClassField(pureProxyProp.name, null));
  const pureProxyId =
      argCount < Identifiers.pureProxies.length ? Identifiers.pureProxies[argCount] : null;
  if (!pureProxyId) {
    throw new Error(`Unsupported number of argument for pure functions: ${argCount}`);
  }
  builder.ctorStmts.push(o.THIS_EXPR.prop(pureProxyProp.name)
                             .set(o.importExpr(createIdentifier(pureProxyId)).callFn([fn]))
                             .toStmt());
}

export function createEnumExpression(enumType: IdentifierSpec, enumValue: any): o.Expression {
  const enumName =
      Object.keys(enumType.runtime).find((propName) => enumType.runtime[propName] === enumValue);
  if (!enumName) {
    throw new Error(`Unknown enum value ${enumValue} in ${enumType.name}`);
  }
  return o.importExpr(createEnumIdentifier(enumType, enumName));
}
