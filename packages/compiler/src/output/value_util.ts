/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


import {OutputContext, ValueTransformer, visitValue} from '../util';

import * as o from './output_ast';

export const QUOTED_KEYS = '$quoted$';

export function convertValueToOutputAst(
    ctx: OutputContext, value: any, type: o.Type|null = null): o.Expression {
  return visitValue(value, new _ValueOutputAstTransformer(ctx), type);
}

class _ValueOutputAstTransformer implements ValueTransformer {
  constructor(private ctx: OutputContext) {}
  visitArray(arr: any[], type: o.Type): o.Expression {
    const values: o.Expression[] = [];
    // Note Array.map() must not be used to convert the values because it will
    // skip over empty elements in arrays constructed using `new Array(length)`,
    // resulting in `undefined` elements. This breaks the type guarantee that
    // all values in `o.LiteralArrayExpr` are of type `o.Expression`.
    // See test case in `value_util_spec.ts`.
    for (let i = 0; i < arr.length; ++i) {
      values.push(visitValue(arr[i], this, null /* context */));
    }
    return o.literalArr(values, type);
  }

  visitStringMap(map: {[key: string]: any}, type: o.MapType): o.Expression {
    const entries: o.LiteralMapEntry[] = [];
    const quotedSet = new Set<string>(map && map[QUOTED_KEYS]);
    Object.keys(map).forEach(key => {
      entries.push(
          new o.LiteralMapEntry(key, visitValue(map[key], this, null), quotedSet.has(key)));
    });
    return new o.LiteralMapExpr(entries, type);
  }

  visitPrimitive(value: any, type: o.Type): o.Expression {
    return o.literal(value, type);
  }

  visitOther(value: any, type: o.Type): o.Expression {
    if (value instanceof o.Expression) {
      return value;
    } else {
      return this.ctx.importExpr(value);
    }
  }
}
