/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


import {ValueTransformer, visitValue} from '../util';

import * as o from './output_ast';

export const QUOTED_KEYS = '$quoted$';

export function convertValueToOutputAst(value: any, type: o.Type | null = null): o.Expression {
  return visitValue(value, new _ValueOutputAstTransformer(), type);
}

class _ValueOutputAstTransformer implements ValueTransformer {
  visitArray(arr: any[], type: o.Type): o.Expression {
    return o.literalArr(arr.map(value => visitValue(value, this, null)), type);
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

  visitPrimitive(value: any, type: o.Type): o.Expression { return o.literal(value, type); }

  visitOther(value: any, type: o.Type): o.Expression {
    if (value instanceof o.Expression) {
      return value;
    } else {
      return o.importExpr({reference: value});
    }
  }
}
