/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CompileTokenMetadata} from '../compile_metadata';
import {isPresent} from '../facade/lang';
import {Identifiers, resolveIdentifier} from '../identifiers';
import * as o from '../output/output_ast';

export function createDiTokenExpression(token: CompileTokenMetadata): o.Expression {
  if (isPresent(token.value)) {
    return o.literal(token.value);
  } else if (token.identifierIsInstance) {
    return o.importExpr(token.identifier)
        .instantiate([], o.importType(token.identifier, [], [o.TypeModifier.Const]));
  } else {
    return o.importExpr(token.identifier);
  }
}

export function createFastArray(values: o.Expression[]): o.Expression {
  if (values.length === 0) {
    return o.importExpr(resolveIdentifier(Identifiers.EMPTY_FAST_ARRAY));
  }
  const index = Math.ceil(values.length / 2) - 1;
  const identifierSpec = index < Identifiers.fastArrays.length ? Identifiers.fastArrays[index] :
                                                                 Identifiers.FastArrayDynamic;
  const identifier = resolveIdentifier(identifierSpec);
  return o.importExpr(identifier).instantiate([
    <o.Expression>o.literal(values.length)
  ].concat(values));
}
