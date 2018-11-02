/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {StaticSymbol} from '../aot/static_symbol';
import * as o from '../output/output_ast';
import {OutputContext} from '../util';

/**
 * Convert an object map with `Expression` values into a `LiteralMapExpr`.
 */
export function mapToMapExpression(map: {[key: string]: o.Expression}): o.LiteralMapExpr {
  const result = Object.keys(map).map(key => ({key, value: map[key], quoted: false}));
  return o.literalMap(result);
}

/**
 * Convert metadata into an `Expression` in the given `OutputContext`.
 *
 * This operation will handle arrays, references to symbols, or literal `null` or `undefined`.
 */
export function convertMetaToOutput(meta: any, ctx: OutputContext): o.Expression {
  if (Array.isArray(meta)) {
    return o.literalArr(meta.map(entry => convertMetaToOutput(entry, ctx)));
  }
  if (meta instanceof StaticSymbol) {
    return ctx.importExpr(meta);
  }
  if (meta == null) {
    return o.literal(meta);
  }

  throw new Error(`Internal error: Unsupported or unknown metadata: ${meta}`);
}

export function typeWithParameters(type: o.Expression, numParams: number): o.ExpressionType {
  let params: o.Type[]|null = null;
  if (numParams > 0) {
    params = [];
    for (let i = 0; i < numParams; i++) {
      params.push(o.DYNAMIC_TYPE);
    }
  }
  return o.expressionType(type, null, params);
}

export interface R3Reference {
  value: o.Expression;
  type: o.Expression;
}
