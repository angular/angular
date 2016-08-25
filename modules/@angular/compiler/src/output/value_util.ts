/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


import {CompileIdentifierMetadata} from '../compile_metadata';
import {StringMapWrapper} from '../facade/collection';
import {ValueTransformer, visitValue} from '../util';

import * as o from './output_ast';

export function convertValueToOutputAst(value: any, type: o.Type = null): o.Expression {
  return visitValue(value, new _ValueOutputAstTransformer(), type);
}

class _ValueOutputAstTransformer implements ValueTransformer {
  visitArray(arr: any[], type: o.Type): o.Expression {
    return o.literalArr(arr.map(value => visitValue(value, this, null)), type);
  }

  visitStringMap(map: {[key: string]: any}, type: o.MapType): o.Expression {
    var entries: Array<string|o.Expression>[] = [];
    StringMapWrapper.forEach(map, (value: any, key: string) => {
      entries.push([key, visitValue(value, this, null)]);
    });
    return o.literalMap(entries, type);
  }

  visitPrimitive(value: any, type: o.Type): o.Expression { return o.literal(value, type); }

  visitOther(value: any, type: o.Type): o.Expression {
    if (value instanceof CompileIdentifierMetadata) {
      return o.importExpr(value);
    } else if (value instanceof o.Expression) {
      return value;
    } else {
      throw new Error(`Illegal state: Don't now how to compile value ${value}`);
    }
  }
}
